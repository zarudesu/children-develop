import { Skeleton } from './Skeleton'

interface LoadingOverlayProps {
  title?: string
  description?: string
}

export function LoadingOverlay({
  title = 'Создаём ваш материал...',
  description = 'Генерируем PDF с выбранными параметрами'
}: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg z-50 flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-md">
        {/* Spinner */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">
            {title}
          </h3>
          <p className="text-gray-600">
            {description}
          </p>

          {/* Skeleton Lines */}
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 mx-auto" width="80%" />
            <Skeleton className="h-4 mx-auto" width="70%" />
            <Skeleton className="h-4 mx-auto" width="60%" />
          </div>
        </div>

        {/* Bouncing Dots */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span>Это займёт несколько секунд</span>
        </div>
      </div>
    </div>
  )
}
