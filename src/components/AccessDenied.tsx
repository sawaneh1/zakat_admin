import { ShieldExclamationIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

interface AccessDeniedProps {
  message?: string
}

export default function AccessDenied({ message }: AccessDeniedProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldExclamationIcon className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">
          {message || 'You do not have permission to access this page. Contact your administrator if you believe this is an error.'}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
