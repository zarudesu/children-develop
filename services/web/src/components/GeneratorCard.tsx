import Link from 'next/link'
import { ComponentProps } from 'react'

interface GeneratorCardProps {
  title: string
  description: string
  icon: string
  href: ComponentProps<typeof Link>['href']
  difficulty: string[]
  ageGroups: string[]
  features: string[]
  isNew?: boolean
  isComingSoon?: boolean
}

export function GeneratorCard({
  title,
  description,
  icon,
  href,
  difficulty,
  ageGroups,
  features,
  isNew = false,
  isComingSoon = false
}: GeneratorCardProps) {
  const baseClassName = "group relative bg-white rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all duration-300"

  const cardContent = (
    <>
      {/* Badge */}
      {(isNew || isComingSoon) && (
        <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold ${
          isNew ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
        }`}>
          {isNew ? 'Новое' : 'Скоро'}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3 mb-4">
        {/* Difficulty */}
        <div>
          <span className="text-xs font-medium text-gray-500 mb-2 block">Сложность:</span>
          <div className="flex flex-wrap gap-2">
            {difficulty.map((level, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium"
              >
                {level}
              </span>
            ))}
          </div>
        </div>

        {/* Age Groups */}
        <div>
          <span className="text-xs font-medium text-gray-500 mb-2 block">Возраст:</span>
          <div className="flex flex-wrap gap-2">
            {ageGroups.map((age, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
              >
                {age}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <span className="text-xs font-medium text-gray-500 mb-2 block">Особенности:</span>
        <ul className="space-y-1">
          {features.slice(0, 3).map((feature, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
              {feature}
            </li>
          ))}
          {features.length > 3 && (
            <li className="text-xs text-gray-500 italic">
              +{features.length - 3} больше
            </li>
          )}
        </ul>
      </div>

      {/* CTA */}
      <div className="pt-4 border-t border-gray-100">
        {isComingSoon ? (
          <div className="w-full py-2 text-center text-gray-500 text-sm font-medium">
            В разработке
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Попробовать →</span>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  )

  if (isComingSoon) {
    return (
      <div className={`${baseClassName} opacity-60 cursor-not-allowed`}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={href} className={`${baseClassName} hover:border-blue-200 transform hover:scale-105`}>
      {cardContent}
    </Link>
  )
}