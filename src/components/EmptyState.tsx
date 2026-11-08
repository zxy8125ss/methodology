import React from 'react'

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center card bg-white">
      <div className="text-4xl mb-3 select-none">{icon}</div>
      <h3 className="text-base font-bold text-stone-900 mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs text-stone-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary text-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
