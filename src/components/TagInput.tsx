import React, { useState, useRef, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ value, onChange, placeholder = '输入标签后按 Enter 或逗号添加' }: TagInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const tag = raw.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1))
    } else {
      setInput(val)
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[42px] p-2 bg-white border border-[#EAE6DF] focus-within:border-[#CC785C] focus-within:ring-2 focus-within:ring-[#CC785C]/20 rounded-xl cursor-text transition-all shadow-soft"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FAF0EB] text-[#9E543C] border border-[#F0DED3] rounded-md text-xs font-serif font-medium"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(i) }}
            className="text-[#B8684D] hover:text-[#6B3827] transition-colors ml-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-xs sm:text-sm text-[#1F1E1B] placeholder-[#9E9A90]"
      />
    </div>
  )
}
