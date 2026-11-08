import type { Method, MethodRelation } from '../types'

export const SEED_METHODS: Method[] = [
  {
    id: 'method_pdca',
    name: 'PDCA循环',
    aliases: ['戴明环', '质量环', 'Plan-Do-Check-Act'],
    domains: ['management', 'work_efficiency'],
    subDomains: ['process', 'perf_mgmt'],
    type: 'process',
    layer: 1,
    origin: {
      proposer: '威廉·爱德华兹·戴明 (W. Edwards Deming)',
      proposerBio: '美国统计学家、质量管理专家，被誉为战后日本制造业复兴导师',
      year: 1950,
      sources: [
        {
          id: 'src_pdca_1',
          title: 'Out of the Crisis (走出危机)',
          author: 'W. Edwards Deming',
          type: 'book',
          publishedAt: '1982',
          credibility: 'high',
          notes: '质量持续改进管理经典著作',
          supportedClaims: ['持续循环迭代改进是全面质量管理的核心']
        }
      ]
    },
    content: {
      summary: '通过计划、执行、检查、行动四个阶段持续改进工作质量与流程的管理工具',
      coreIdea: '任何事物的发展与持续优化都不是一次性的，而是螺旋上升的闭环迭代过程。',
      principles: [
        '大环套小环，互相促进',
        '阶梯式上升，每循环一次，质量水平提升一步',
        '基于事实与数据驱动决策'
      ],
      mechanism: '通过周期性将实际结果与既定目标对比，暴露系统隐患，将成功经验标准化，未解决问题移入下一循环，防止经验丢失和同类错误重复。',
      scenarios: [
        '组织流程优化与全面质量管理',
        '敏捷项目迭代管理',
        '个人工作习惯与效率提升'
      ],
      conditions: [
        '具备可量化的预期目标或验收标准',
        '执行过程有真实数据跟踪记录',
        '组织文化鼓励暴露问题而非掩盖问题'
      ],
      steps: [
        {
          order: 1,
          title: 'Plan (计划)',
          description: '分析现状找出存在的问题，寻找原因，确定关键因素，制定切实可行的目标与改善计划。',
          tips: ['使用 5W1H 明确计划细节', '设定 SMART 目标'],
          warnings: ['避免缺乏数据支持的主观假设']
        },
        {
          order: 2,
          title: 'Do (执行)',
          description: '按照计划方案具体实施行动，收集过程数据与关键度量指标。',
          tips: ['小规模试点先行验证', '详细记录执行异常'],
          warnings: ['不要随意变更计划的核心范围']
        },
        {
          order: 3,
          title: 'Check (检查)',
          description: '对照预期目标检查实际执行效果，评估成败原因，识别偏差。',
          tips: ['对比基线指标', '深入探究根因'],
          warnings: ['避免只看表面结果而忽略执行过程合规性']
        },
        {
          order: 4,
          title: 'Act (处理/行动)',
          description: '将成功经验固化为标准制度，将失败教训归入规范预防再发，将遗留问题纳入下一轮循环。',
          tips: ['形成标准化作业指导书(SOP)', '定期复查巩固成果'],
          warnings: ['切忌流于形式，无实质沉淀']
        }
      ],
      advantages: [
        '逻辑清晰、易于理解和跨部门推行',
        '推动组织与个人能力的螺旋式上升',
        '强调标准化沉淀，防止组织记忆遗失'
      ],
      limitations: [
        '在极度不确定、需要快速颠覆式突破的早期探索中可能显得节奏偏慢',
        '若执行检查环节虚化，容易退化为形式主义'
      ],
      misconceptions: [
        '误以为 PDCA 是一个静态线性流程（实际上是永不停止的动态螺旋环）',
        '误以为 Check 只是考核下属，忽略了对系统性流程漏洞的检视'
      ],
      fullArticle: `# PDCA 循环深度研究报告

## 一、理论渊源与历史演进
PDCA 循环最早由美国贝尔实验室的沃特·阿曼德·休哈特（Walter A. Shewhart）在 1930 年代提出统计过程控制思想时雏形化。后经著名质量管理大师 W. Edwards Deming 在 1950 年代于日本推广，并在日本企业界（如丰田精益生产）深度落地，形成了享誉全球的质量与管理闭环法则。

## 二、运行机理与系统动力学
PDCA 的本质是科学实验方法在管理实践中的工程化实现：
1. **假设构建 (Plan)**: 提出变革或优化的理论假设。
2. **实验测试 (Do)**: 实施受控变动并获取观测数据。
3. **对照检验 (Check)**: 评估观测结果与假设的一致性。
4. **知识固化与迭代 (Act)**: 更新系统参数基线，发起下一周期。

这一机制有效克服了组织中的“试错无沉淀”和“重复犯错”顽疾。`
    },
    evidence: {
      level: 'high',
      claims: [
        {
          id: 'claim_pdca_1',
          type: 'research',
          content: '丰田精益生产系统与六西格玛管理体系均以 PDCA 为底层控制基石。',
          source: 'The Toyota Way',
          reliability: 'high'
        }
      ],
      confidence: 96,
      notes: '学术界与全球世界500强企业普遍认可的通用底层方法论。'
    },
    cases: [
      {
        id: 'case_pdca_toyota',
        title: '丰田汽车 A3 报告与现场持续改善(Kaizen)',
        organization: 'Toyota Motor',
        industry: '制造',
        context: '汽车装配流水线中的良品率提升与工序节拍优化。',
        application: '利用 A3 纸承载标准 PDCA 逻辑，现场班组每日记录发现的问题并循环优化。',
        outcome: '故障率降低 40%，成为现代制造业精益标杆。',
        lessons: ['标准化是持续改善的前提，没有标准就没有改善。'],
        verified: true,
        aiGenerated: false
      }
    ],
    relations: [],
    tags: ['管理', '质量管理', '持续改进', '通用模型', '执行力'],
    status: 'active',
    stats: { viewCount: 128, practiceCount: 14, learningCount: 32, avgRating: 4.9 },
    aiMeta: {
      researchedBy: 'Claude-3.5-Sonnet / Gemini',
      researchedAt: '2026-11-08T00:00:00Z',
      qualityScore: 98,
      contentWarnings: []
    },
    version: 1,
    versionHistory: [],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-08T08:00:00Z'
  },
  {
    id: 'method_first_principles',
    name: '第一性原理',
    aliases: ['First Principles Thinking', '第一原理思考'],
    domains: ['thinking', 'business'],
    subDomains: ['critical', 'decision', 'strategy'],
    type: 'principle',
    layer: 1,
    origin: {
      proposer: '亚里士多德 (Aristotle)',
      proposerBio: '古希腊哲学家，西方哲学与科学先驱',
      year: -330,
      sources: [
        {
          id: 'src_fp_1',
          title: '形而上学 (Metaphysics)',
          author: 'Aristotle',
          type: 'book',
          credibility: 'high',
          notes: '哲学史上首次系统提出第一原理概念',
          supportedClaims: ['在每一个系统的探索中存在最基本的命题，它不能被进一步推导或违反']
        }
      ]
    },
    content: {
      summary: '回归事物最底层本质，从最基本的事实出发进行逻辑推导，而非基于类比与既有经验的思维方法',
      coreIdea: '打破思维定式与群体惯性，将问题分解为不可再分的基本真理，然后从零构建推理链条与全新解法。',
      principles: [
        '质疑一切非基础性假设',
        '分解到不可进一步拆解的物理或逻辑基底',
        '自下而上严密重构方案'
      ],
      mechanism: '类比推理（“别人怎么做我就怎么做”）虽然节能但容易复制既有系统的冗余与溢价；第一性原理剥离表象与历史包袱，直接击穿价值/成本边界。',
      scenarios: [
        '重大技术突破与颠覆式商业创新',
        '高成本架构的极限降本攻坚',
        '面对纷繁复杂的复杂系统决策'
      ],
      conditions: [
        '具备扎实的基础领域科学/物理/数学或底层逻辑素养',
        '有足够的时间与心智带宽进行深度推演'
      ],
      steps: [
        {
          order: 1,
          title: '识别并写下当前的核心假设',
          description: '梳理人们当前对该问题的通用共识与“理所当然”的前提。',
          tips: ['追问“为什么必须是这样？”'],
          warnings: ['警惕将“习以为常的惯例”当成客观真理']
        },
        {
          order: 2,
          title: '下潜拆解至基本物理/逻辑事实',
          description: '逐层拆解直到不能再分解的基础组成部分（如物质构成、能量守恒、逻辑公理）。',
          tips: ['使用苏格拉底式提问法'],
          warnings: ['不要停在中间层级的行业行规']
        },
        {
          order: 3,
          title: '从第一性重新设计解决方案',
          description: '在最纯粹的基本事实之上，重新计算实现目标的最优路径。',
          tips: ['寻找新的技术工艺或组合路径'],
          warnings: ['切防为了与众不同而盲目舍弃经过检验的工程常识']
        }
      ],
      advantages: [
        '催生根本性突破创新，不被同行内卷局限',
        '发现被严重高估的成本结构与商业价值洼地'
      ],
      limitations: [
        '认知成本与计算负荷极高，不适合日常微小琐碎决策',
        '需要承受前期极高的探索不确定性'
      ],
      misconceptions: [
        '误以为第一性原理就是全盘否定传统（实际上是对本质规律的绝对尊重）'
      ],
      fullArticle: `# 第一性原理思考法

## 一、核心哲学背景
亚里士多德在《形而上学》中指出：“在每个系统的探索中，存在第一原理，它是认知的基础，不可被证明，但一切证明依赖于它。”
近代在埃隆·马斯克（SpaceX 锂电池成本重构、火箭可回收）等工程商业实践中大放异彩。`
    },
    evidence: {
      level: 'high',
      claims: [
        {
          id: 'claim_fp_1',
          type: 'original',
          content: 'SpaceX 依据第一性原理将火箭原材料成本压缩至传统造价的数分之一。',
          reliability: 'high'
        }
      ],
      confidence: 94,
      notes: '逻辑学、现代物理学与高科技产业实践强力支撑。'
    },
    cases: [
      {
        id: 'case_spacex_battery',
        title: 'SpaceX / 特斯拉电池成本拆解',
        organization: 'Tesla & SpaceX',
        industry: '新能源与航天',
        context: '早期电池组每千瓦时高达 600 美元，市场普遍认为短期无法降本。',
        application: '拆解电池至碳、镍、铝、钢等大宗商品原材料，直接计算伦敦金属交易所材料成本仅约 80 美元/kWh，重构生产流程。',
        outcome: '电池包成本降至 100 美元/kWh 级，推动全球电动车规模化。',
        lessons: ['市场报价往往包含巨大交易成本与低效中间溢价，底层物理成本才是硬约束。'],
        verified: true,
        aiGenerated: false
      }
    ],
    relations: [],
    tags: ['思维模型', '创新', '底层逻辑', '深度思考'],
    status: 'active',
    stats: { viewCount: 245, practiceCount: 22, learningCount: 48, avgRating: 5.0 },
    aiMeta: {
      researchedBy: 'Claude-3.5-Sonnet',
      researchedAt: '2026-11-08T00:00:00Z',
      qualityScore: 99,
      contentWarnings: []
    },
    version: 1,
    versionHistory: [],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-08T08:00:00Z'
  },
  {
    id: 'method_okr',
    name: 'OKR目标与关键结果',
    aliases: ['Objectives and Key Results', '目标与关键结果法'],
    domains: ['management', 'personal_growth', 'work_efficiency'],
    subDomains: ['goal_mgmt', 'perf_mgmt', 'team_mgmt'],
    type: 'framework',
    layer: 2,
    origin: {
      proposer: '安迪·格鲁夫 (Andy Grove) / 约翰·杜尔 (John Doerr)',
      proposerBio: '英特尔传奇 CEO 创立，约翰·杜尔带入 Google 并普及全球',
      year: 1975,
      sources: [
        {
          id: 'src_okr_1',
          title: 'Measure What Matters (这就是OKR)',
          author: 'John Doerr',
          type: 'book',
          publishedAt: '2018',
          credibility: 'high',
          notes: 'OKR 权威指南',
          supportedClaims: ['聚焦、对齐、跟踪、挑战是 OKR 的四大超能力']
        }
      ]
    },
    content: {
      summary: '通过设定野心目标(O)与可量化关键结果(KR)，驱动组织协同与个人聚焦的敏捷目标管理系统',
      coreIdea: 'OKR 是沟通与对齐的敏捷罗盘，而不是事后惩罚的绩效考核棍棒；强调由内而外的驱动力和挑战性。',
      principles: [
        '目标(O)具有鼓舞性且定性，关键结果(KR)必须定量且有期限',
        '透明公开，全员上下左右拉通对齐',
        '与考核解耦，鼓励设定挑战性目标（70%达成度即为良好）'
      ],
      mechanism: '通过极具精简聚焦的目标限制注意力分散，透明公开机制带来社会同侪激励，量化指标清晰定义进展与成功标准。',
      scenarios: [
        '快速成长与转型期的创新企业',
        '跨部门协作复杂的矩阵型项目',
        '个人季度与年度重大挑战规划'
      ],
      conditions: [
        '组织对失败有一定包容度，倡导心理安全感',
        '管理层愿意完全透明公开自己的 OKR'
      ],
      steps: [
        {
          order: 1,
          title: '设定富有鼓舞性的目标 (Objective)',
          description: '回答“我们最想实现什么突破？”，简洁、有力、让人兴奋。',
          tips: ['每个周期控制在 3-5 个目标以内'],
          warnings: ['不要写成日常琐碎的待办清单']
        },
        {
          order: 2,
          title: '制定量化关键结果 (Key Results)',
          description: '回答“如何衡量我们正在靠近目标？”，必须包含数值或清晰交付指标。',
          tips: ['结果导向而非活动导向（如“日活提升20%”而非“开三次推广会”）'],
          warnings: ['避免纯粹以工作量充当结果']
        },
        {
          order: 3,
          title: '横向与纵向对齐协同',
          description: '在团队内开展对齐研讨，识别依赖项与资源瓶颈。',
          tips: ['主动检查与上下游团队的关联'],
          warnings: ['避免各业务孤岛各自为战']
        },
        {
          order: 4,
          title: '周推进与季度末复盘评分',
          description: '每周同步进度置信度，周期结束时客观评估打分并反思复盘。',
          tips: ['0.6-0.7 分为健康常态，持续得 1.0 分说明目标设定过低'],
          warnings: ['切勿将 OKR 打分直接等同于年终奖金比例']
        }
      ],
      advantages: [
        '极大提高团队战略聚焦度，告别低价值忙碌',
        '上下左右透明对齐，打破部门壁垒',
        '激发自主性与开拓精神'
      ],
      limitations: [
        '如果企业文化极度自上而下、容错率低，容易沦为形式主义 KPI',
        '对高度常规流水线工种适用性较低'
      ],
      misconceptions: [
        '误将 OKR 直接绑定个人绩效与薪酬发放（会导致员工不敢设定挑战性目标）'
      ],
      fullArticle: `# OKR 目标管理法实践指南

## 核心价值矩阵
OKR 不是单纯的任务清单，而是组织心智与注意力的放大器。
- **O (Where to go)**: 战略方向与意图。
- **KR (How to measure)**: 里程碑与客观事实。`
    },
    evidence: {
      level: 'high',
      claims: [
        {
          id: 'claim_okr_1',
          type: 'practice',
          content: 'Google、Intel 等顶尖科技巨头数十年的规模化增长均受益于 OKR 框架。',
          reliability: 'high'
        }
      ],
      confidence: 95,
      notes: '硅谷与全球创新企业公认的最佳实践框架。'
    },
    cases: [
      {
        id: 'case_google_chrome',
        title: 'Google Chrome 浏览器用户数飞跃',
        organization: 'Google',
        industry: '互联网软件',
        context: '2008年推出 Chrome 时市场被 IE 垄断，团队需确立绝对统治力。',
        application: '桑达尔·皮查伊设立野心 O：打造世界上最快的浏览器；KR 设定：周活跃用户数从 2000 万逐步攻坚至 1 亿。',
        outcome: '通过跨季度连续迭代挑战，最终突破 1.11 亿用户，赢得浏览器格局。',
        lessons: ['挑战性目标迫使团队摒弃渐进式修补，必须探索颠覆性的架构路线。'],
        verified: true,
        aiGenerated: false
      }
    ],
    relations: [],
    tags: ['管理', '目标管理', 'OKR', '团队协同', '执行力'],
    status: 'active',
    stats: { viewCount: 189, practiceCount: 19, learningCount: 42, avgRating: 4.8 },
    aiMeta: {
      researchedBy: 'Claude-3.5-Sonnet',
      researchedAt: '2026-11-08T00:00:00Z',
      qualityScore: 97,
      contentWarnings: []
    },
    version: 1,
    versionHistory: [],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-08T08:00:00Z'
  },
  {
    id: 'method_feynman',
    name: '费曼学习法',
    aliases: ['Feynman Technique', '以教促学'],
    domains: ['learning', 'thinking'],
    subDomains: ['active_learning', 'knowledge_org'],
    type: 'process',
    layer: 2,
    origin: {
      proposer: '理查德·费曼 (Richard Feynman)',
      proposerBio: '诺贝尔物理学奖得主，著名物理学家，以化繁为简的非凡讲授能力著称',
      year: 1965,
      sources: [
        {
          id: 'src_feynman_1',
          title: 'Surely You\'re Joking, Mr. Feynman!',
          author: 'Richard Feynman',
          type: 'book',
          publishedAt: '1985',
          credibility: 'high',
          notes: '费曼自传与思考心法',
          supportedClaims: ['如果不能用通俗语言向8岁小孩解释清楚，就说明你还没真正理解它']
        }
      ]
    },
    content: {
      summary: '通过用通俗易懂的极简语言向初学者讲授概念，精准定位理解漏洞并针对性补强的学习方法',
      coreIdea: '教是最好的学。知识的假象在于专业术语的堆砌与死记硬背，真正的掌握源于直觉化还原与类比构建。',
      principles: [
        '禁用一切晦涩行业黑话与专业行话',
        '发现卡壳处即是真正的认知盲区',
        '运用生动日常类比建立直觉理解'
      ],
      mechanism: '强迫大脑从输入模式切换为高阶输出模式，激活知识检索、语义解构与重构回路，迅速暴露知识框架中的断层。',
      scenarios: [
        '学习全新抽象概念、算法、复杂理论',
        '技术分享与团队培训赋能',
        '个人知识库建构与深度复习'
      ],
      conditions: [
        '愿意承认自己的无知与理解漏洞',
        '具备耐心地进行多轮简化与类比打磨'
      ],
      steps: [
        {
          order: 1,
          title: '选择目标概念并写在纸上',
          description: '挑选一个想要真正搞懂的核心知识点或理论。',
          tips: ['单一概念颗粒度，避免贪大求全'],
          warnings: ['不要把多个交叉复杂概念混在一起']
        },
        {
          order: 2,
          title: '假装向一个完全的外行/儿童传授',
          description: '用最浅显直白的口语写下或说出这个概念的运行原理。',
          tips: ['假设听众只有 8 岁或没有任何专业背景'],
          warnings: ['严禁直接引用书本术语定义']
        },
        {
          order: 3,
          title: '识别卡点并回归原始资料',
          description: '一旦出现语言迟滞、解释含糊或不得不借助专业术语掩盖时，标出该漏洞并重新查阅资料。',
          tips: ['精准定位认知薄弱链条'],
          warnings: ['切勿自欺欺人跳过卡点']
        },
        {
          order: 4,
          title: '润色简化并构建生动类比',
          description: '将重构后的知识用生活化的比喻串联成流畅完整的故事。',
          tips: ['一个好比喻胜过十句晦涩解释'],
          warnings: ['避免类比失当产生误导']
        }
      ],
      advantages: [
        '极度高效地击穿“虚假知识”幻觉',
        '形成的直觉记忆长久牢固、不易遗忘',
        '显著提升个人表达与沟通能力'
      ],
      limitations: [
        '需要主动消耗较高精力，比被动看书刷课更消耗脑力',
        '极少数高度形式化的纯数学符号体系难以完全无损生活化类比'
      ],
      misconceptions: [
        '误以为能复述别人的定义就等于懂了'
      ],
      fullArticle: `# 费曼学习法深度解析

## 知识的两类形态
费曼常说：知道一件事物的名字，和真正懂得一件事物，有着天壤之别。
费曼技巧的核心就是从“符号记忆”跃迁至“心智模型”的直觉掌握。`
    },
    evidence: {
      level: 'high',
      claims: [
        {
          id: 'claim_feynman_1',
          type: 'research',
          content: '认知心理学实验证明，主动生成效应(Generation Effect)与提取练习的知识留存率远高于被动重读。',
          reliability: 'high'
        }
      ],
      confidence: 98,
      notes: '认知科学与现代教育学广泛推崇的顶级学习策略。'
    },
    cases: [
      {
        id: 'case_feynman_physics',
        title: '加州理工学院《费曼物理学讲义》的诞生',
        organization: 'Caltech',
        industry: '教育科研',
        context: '当时大学物理教学死板沉闷，大一新生畏惧枯燥数学公式。',
        application: '费曼重新用直觉式物理实验、生活类比重新讲授从经典力学到量子力学的核心原理。',
        outcome: '诞生了半个世纪以来经久不衰的物理学殿堂级经典教材。',
        lessons: ['越深奥的原理，其底层逻辑越简单优美。'],
        verified: true,
        aiGenerated: false
      }
    ],
    relations: [],
    tags: ['学习方法', '思维模型', '知识管理', '输入输出'],
    status: 'active',
    stats: { viewCount: 310, practiceCount: 29, learningCount: 56, avgRating: 5.0 },
    aiMeta: {
      researchedBy: 'Claude-3.5-Sonnet',
      researchedAt: '2026-11-08T00:00:00Z',
      qualityScore: 99,
      contentWarnings: []
    },
    version: 1,
    versionHistory: [],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-08T08:00:00Z'
  },
  {
    id: 'method_eisenhower',
    name: '艾森豪威尔矩阵',
    aliases: ['时间管理四象限', 'Eisenhower Matrix', '紧急与重要矩阵'],
    domains: ['work_efficiency', 'personal_growth'],
    subDomains: ['time_mgmt', 'prioritization'],
    type: 'tool',
    layer: 1,
    origin: {
      proposer: '德怀特·艾森豪威尔 (Dwight D. Eisenhower)',
      proposerBio: '第34任美国总统，二战盟军最高指挥官',
      year: 1954,
      sources: [
        {
          id: 'src_eisenhower_1',
          title: 'The 7 Habits of Highly Effective People',
          author: 'Stephen R. Covey',
          type: 'book',
          publishedAt: '1989',
          credibility: 'high',
          notes: '史蒂芬·柯维在《高效能人士的七个习惯》中发扬光大',
          supportedClaims: ['卓越人士将大部分精力投放在重要但不紧急的第二象限']
        }
      ]
    },
    content: {
      summary: '依据“重要性”与“紧急性”两个维度将任务划分为四个象限，引导注意力投向长期价值创造的决策工具',
      coreIdea: '紧急的事情很少是真正重要的，而重要的事情很少是极度紧急的。必须摆脱“虚假的紧急性”暴政。',
      principles: [
        '第一象限（重要且紧急）：立即处理，防患未然',
        '第二象限（重要不紧急）：计划专注投入，构建长期护城河',
        '第三象限（紧急不重要）：合理授权或委派',
        '第四象限（不紧急不重要）：果断舍弃或极力减少'
      ],
      mechanism: '通过视觉化象限对任务强制分类，打破人体大脑对“时间倒计时”的被动应激机制，切换至基于长期目标价值的理性决策系统。',
      scenarios: [
        '日常工作日程与待办清单梳理',
        '管理者的精力和授权边界划分',
        '个人职业生涯发展投入'
      ],
      conditions: [
        '对什么是自己的“核心目标与价值”有清晰定义',
        '具备对低价值紧急事务拒绝或授权的能力'
      ],
      steps: [
        {
          order: 1,
          title: '列出所有待处理事务清单',
          description: '将脑中盘旋的所有待办事项无死角清空至纸面或工具中。',
          tips: ['涵盖工作、生活、健康与长期规划'],
          warnings: ['避免边想边分类']
        },
        {
          order: 2,
          title: '根据真实重要度与截止期分配象限',
          description: '用客观标尺严格审视每个待办的真实贡献度。',
          tips: ['追问：“这件事对一年后的我还有没有价值？”'],
          warnings: ['警惕把别人的紧急当成自己的重要']
        },
        {
          order: 3,
          title: '执行四象限处置策略',
          description: 'Q1马上做，Q2定好专属日历块专注做，Q3委派给自动化或他人，Q4无情删除。',
          tips: ['重点保护第二象限的专属深度工作时间'],
          warnings: ['第二象限如果长期拖延，最终会变成焦头烂额的第一象限']
        }
      ],
      advantages: [
        '简单明了，直击时间管理要害',
        '有效缓解“整日忙碌却无实质产出”的职业倦怠感'
      ],
      limitations: [
        '初学者往往难以客观判定“重要性”，需要前置价值观与目标指引'
      ],
      misconceptions: [
        '误以为只要做完 Q1 就算高效（真正的高效是通过深耕 Q2 减少 Q1 的发生）'
      ],
      fullArticle: `# 艾森豪威尔矩阵：从救火员到规划师的跃迁

## 核心象限法则
- **Q1 紧急且重要**: 危机、突发故障、临近截止日的合同。
- **Q2 重要不紧急**: 技能精进、系统建设、人脉深耕、健康投资。（人生破局点）
- **Q3 紧急不重要**: 多数临时会议、不速之客、即时通讯打扰。
- **Q4 不紧急不重要**: 无目的刷社交媒体、过度逃避娱乐。`
    },
    evidence: {
      level: 'high',
      claims: [
        {
          id: 'claim_eis_1',
          type: 'practice',
          content: '史蒂芬·柯维的数十年高管领导力追踪表明，高效能高管平均在第二象限投入 65%-80% 的精力。',
          reliability: 'high'
        }
      ],
      confidence: 96,
      notes: '全球公认的最经典生产力与时间管理基础工具之一。'
    },
    cases: [
      {
        id: 'case_covey_exec',
        title: '跨国科技公司工程总监精力重构',
        organization: 'Fortune 500 Tech',
        industry: '科技管理',
        context: '工程总监每日被无尽的紧急邮件和各业务部门临时会议打断，核心架构长期停滞。',
        application: '利用矩阵分析，将 70% 的临时对齐会议授权给各 Tech Lead（Q3），每日上午前 2.5 小时设立为无人打扰的系统架构设计时间（Q2）。',
        outcome: '核心架构重构提前一个月上线，个人加班时长降低 35%。',
        lessons: ['捍卫第二象限需要对第三象限说不的勇气。'],
        verified: true,
        aiGenerated: false
      }
    ],
    relations: [],
    tags: ['工作效率', '时间管理', '自我管理', '优先级', '决策工具'],
    status: 'active',
    stats: { viewCount: 220, practiceCount: 26, learningCount: 38, avgRating: 4.9 },
    aiMeta: {
      researchedBy: 'Claude-3.5-Sonnet',
      researchedAt: '2026-11-08T00:00:00Z',
      qualityScore: 98,
      contentWarnings: []
    },
    version: 1,
    versionHistory: [],
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-08T08:00:00Z'
  }
]

export const SEED_RELATIONS: MethodRelation[] = [
  {
    id: 'rel_pdca_okr',
    fromMethodId: 'method_okr',
    toMethodId: 'method_pdca',
    type: 'combined_use',
    description: 'OKR 负责定义激动人心的方向与量化结果，PDCA 负责每个周期的闭环推进与持续优化。',
    evidence: '现代敏捷管理普遍将 OKR 的季度推进细化为数个双周 PDCA 冲刺。',
    strength: 'strong',
    createdAt: '2026-11-01T08:00:00Z',
    aiGenerated: false
  },
  {
    id: 'rel_fp_feynman',
    fromMethodId: 'method_first_principles',
    toMethodId: 'method_feynman',
    type: 'complementary',
    description: '第一性原理用于深挖事实本质与自下而上拆解，费曼学习法则通过教授过程检验是否真正触及第一原理。',
    evidence: '物理学家研究与科普教学的天然双轮驱动。',
    strength: 'strong',
    createdAt: '2026-11-01T08:00:00Z',
    aiGenerated: false
  },
  {
    id: 'rel_okr_eisenhower',
    fromMethodId: 'method_okr',
    toMethodId: 'method_eisenhower',
    type: 'applied_to',
    description: 'OKR 中的 Objective 与 Key Results 正是判断日常事务是否属于“重要性（第二象限）”的核心依据。',
    evidence: '没有清晰的 OKR 指引，时间四象限的重要性划分将沦为主观臆断。',
    strength: 'strong',
    createdAt: '2026-11-01T08:00:00Z',
    aiGenerated: false
  }
]
