import { FiAlertTriangle } from 'react-icons/fi'
import { CgSpinner } from 'react-icons/cg'

export const ErrorInfo = ({
  error: {
    data: { message, statusCode },
  },
}: {
  error: {
    data: { message: string; statusCode: number }
  }
}) => (
  <div className="rounded-xl bg-red-100 border border-red-200 px-6 py-4 text-red-700 flex items-center">
    <FiAlertTriangle className="mr-3 text-xl" />
    <div>
      {message} [{statusCode}]
    </div>
    <CgSpinner className="animate-spin ml-auto text-xl" />
  </div>
)
