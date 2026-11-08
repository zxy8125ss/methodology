import { spawn } from 'child_process'
import http from 'http'
import fs from 'fs'
import path from 'path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = 'https://zxy8125ss.github.io/methodology/'
const PORT = 9333

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function run() {
  console.log('🚀 启动无头 Chrome 模拟 iPhone 17 (393x852)...')
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--window-size=393,852',
    '--hide-scrollbars',
    '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    URL
  ])

  let killed = false
  function cleanup() {
    if (!killed) {
      killed = true
      chrome.kill('SIGTERM')
    }
  }
  process.on('exit', cleanup)
  process.on('SIGINT', cleanup)

  // Wait for debug port
  let wsUrl = null
  for (let i = 0; i < 30; i++) {
    await wait(400)
    try {
      const tabs = await fetchJson(`http://127.0.0.1:${PORT}/json`)
      if (tabs && tabs.length > 0 && tabs[0].webSocketDebuggerUrl) {
        wsUrl = tabs[0].webSocketDebuggerUrl
        break
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('❌ 无法连接到 Chrome CDP 端口')
    cleanup()
    process.exit(1)
  }

  console.log('🔌 已建立 CDP WebSocket 连接:', wsUrl)
  const ws = new WebSocket(wsUrl)

  let idCounter = 1
  const pending = new Map()
  const consoleMessages = []
  const runtimeErrors = []

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(msg.error)
      else resolve(msg.result)
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => a.value || a.description || '').join(' ')
      consoleMessages.push({ type: msg.params.type, text })
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(msg.params.exceptionDetails)
    }
  }

  await new Promise(resolve => ws.onopen = resolve)

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }

  // Enable domains
  await send('Page.enable')
  await send('Runtime.enable')
  await send('DOM.enable')

  // 精准设置 iPhone 17 设备视口与触控仿真 (393 x 852, DPR 3, Mobile)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true,
    hasTouch: true
  })

  console.log('⏳ 正在通过 CDP 导航到目标 URL:', URL)
  await send('Page.navigate', { url: URL })
  await wait(4000)

  // 1. 检查控制台报错
  console.log('\n--- [第 1 项测试：控制台与运行时报错] ---')
  if (runtimeErrors.length > 0) {
    console.error('❌ 发现运行时异常:', runtimeErrors)
  } else {
    console.log('✅ 无任何未捕获的运行时 JS 异常 (Zero Uncaught Exceptions)')
  }

  if (consoleMessages.some(m => m.type === 'error')) {
    console.warn('⚠️ 存在 Console.error:', consoleMessages.filter(m => m.type === 'error'))
  } else {
    console.log('✅ 无任何 console.error 输出')
  }

  // 2. 检查横向溢出 (iPhone 17 屏幕宽度 393px)
  console.log('\n--- [第 2 项测试：移动端水平溢出与视口约束] ---')
  const overflowCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const bodyW = document.body.clientWidth;
        const scrollW = document.documentElement.scrollWidth;
        const overflowing = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
          if (el.scrollWidth > bodyW + 2) {
            overflowing.push({
              tag: el.tagName,
              className: el.className?.slice ? el.className.slice(0, 50) : '',
              scrollWidth: el.scrollWidth,
              clientWidth: bodyW
            });
          }
        }
        return { bodyW, scrollW, overflowing: overflowing.slice(0, 5) };
      })()
    `,
    returnByValue: true
  })
  console.log('视口与滚动宽度:', overflowCheck.result?.value)

  // 3. 检查底部 Tab Bar 状态与位置
  console.log('\n--- [第 3 项测试：底部 Tab Bar 贴底与尺寸] ---')
  const navCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nav = document.querySelector('nav.md\\\\:hidden');
        if (!nav) return { found: false };
        const rect = nav.getBoundingClientRect();
        return {
          found: true,
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          windowHeight: window.innerHeight,
          isAtBottom: rect.bottom <= window.innerHeight + 1,
          tabsCount: nav.querySelectorAll('a').length
        };
      })()
    `,
    returnByValue: true
  })
  console.log('移动端底部 Tab Bar 几何指标:', navCheck.result?.value)

  // 4. 试用：点击首页提示词胶囊并推演
  console.log('\n--- [第 4 项测试：首页提示词点击与推演响应] ---')
  const promptTest = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const firstPill = document.querySelector('section button.group');
        if (firstPill) {
          firstPill.click();
          return { clicked: true, text: firstPill.innerText.trim() };
        }
        return { clicked: false };
      })()
    `,
    returnByValue: true
  })
  console.log('点击提示词胶囊:', promptTest.result?.value)
  await wait(3000)

  // 检查是否跳转到了推演页且开始检索
  const searchState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const input = document.querySelector('input');
        const cards = document.querySelectorAll('.card, [class*="rounded-2xl bg-white"]');
        const report = document.querySelector('h3, [class*="font-serif"]');
        return {
          hash: window.location.hash,
          inputValue: input ? input.value : '',
          elementsFound: cards.length,
          hasAnalysisReport: document.body.innerText.includes('AI 方法论跨界推演报告') || document.body.innerText.includes('问题本质解构'),
          matchedTitles: Array.from(document.querySelectorAll('h4')).map(h => h.innerText.trim())
        };
      })()
    `,
    returnByValue: true
  })
  console.log('跳转后搜索推演状态:', searchState.result?.value)

  // 5. 试用：切换到方法论知识库页面 (#/library)
  console.log('\n--- [第 5 项测试：切换知识库与筛选器响应] ---')
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/library';`
  })
  await wait(1500)

  const libraryState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const methodCards = document.querySelectorAll('.group.relative.bg-white');
        const domainButtons = document.querySelectorAll('button');
        return {
          hash: window.location.hash,
          methodCardsCount: methodCards.length,
          buttonsCount: domainButtons.length
        };
      })()
    `,
    returnByValue: true
  })
  console.log('知识库卡片加载数量:', libraryState.result?.value)

  // 6. 试用：进入第一篇方法论详情页
  console.log('\n--- [第 6 项测试：进入方法论详情页与标签切换] ---')
  const detailClick = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const firstCard = document.querySelector('.group.relative.bg-white');
        if (firstCard) {
          firstCard.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()
    `,
    returnByValue: true
  })
  await wait(1500)

  const detailState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const h1 = document.querySelector('h1');
        const tabs = document.querySelectorAll('button');
        return {
          hash: window.location.hash,
          title: h1 ? h1.innerText.trim() : '',
          tabsCount: tabs.length
        };
      })()
    `,
    returnByValue: true
  })
  console.log('方法论详情页面信息:', detailState.result?.value)

  // 7. 试用：进入认知图谱页面 (#/graph)
  console.log('\n--- [第 7 项测试：进入认知图谱与 D3 渲染] ---')
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/graph';`
  })
  await wait(2000)

  const graphState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const svg = document.querySelector('svg');
        const circles = svg ? svg.querySelectorAll('circle').length : 0;
        const texts = svg ? svg.querySelectorAll('text').length : 0;
        return {
          hash: window.location.hash,
          svgFound: !!svg,
          nodesCount: circles,
          labelsCount: texts
        };
      })()
    `,
    returnByValue: true
  })
  console.log('认知图谱 D3 节点渲染数量:', graphState.result?.value)

  // 8. 试用：进入系统设置页面 (#/settings)
  console.log('\n--- [第 8 项测试：系统设置页面] ---')
  await send('Runtime.evaluate', {
    expression: `window.location.hash = '#/settings';`
  })
  await wait(1500)

  const settingsState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const h1 = document.querySelector('h1');
        const tabs = document.querySelectorAll('button');
        return {
          hash: window.location.hash,
          title: h1 ? h1.innerText.trim() : '',
          tabsCount: tabs.length
        };
      })()
    `,
    returnByValue: true
  })
  console.log('系统设置页面:', settingsState.result?.value)

  // 9. 截图保存
  const screenshot = await send('Page.captureScreenshot', { format: 'png' })
  const buffer = Buffer.from(screenshot.data, 'base64')
  fs.writeFileSync('/Users/doss/.gemini/antigravity/scratch/methodology/self_test_result.png', buffer)
  console.log('📸 测试全屏截图已保存至 self_test_result.png')

  cleanup()
  console.log('\n🎉 自测流程顺利完成！')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
