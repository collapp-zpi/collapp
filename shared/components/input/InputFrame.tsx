import { ErrorMessage } from '@hookform/error-message'
import { IconType } from 'react-icons'
import { ReactNode } from 'react'
import classNames from 'classnames'

export interface InputGeneric {
  name: string
  label?: string
  innerClassName?: string
  icon?: IconType
}

interface InputFrameProps {
  name?: string
  className?: string
  icon?: IconType
  children: ReactNode
  isError: boolean
  overflow?: boolean
}

export const InputFrame = ({
  name,
  className,
  overflow = false,
  icon: Icon,
  children,
  isError,
}: InputFrameProps) => (
  <div className={className}>
    <label>
      <div
        className={classNames(
          'focus-within:border-blue-400 focus-within:text-blue-500 transition-all border-2 bg-white rounded-lg flex',
          {
            'border-red-300': isError,
            'border-gray-200': !isError,
          },
          !overflow && 'overflow-hidden',
        )}
      >
        {!!Icon && (
          <div className="flex items-center h-12 justify-center p-3 opacity-70 -mr-4 z-10">
            <Icon size="1.3em" />
          </div>
        )}
        <div className="relative flex-grow flex">{children}</div>
      </div>
      {!!name && (
        <div className="text-red-400 ml-1 mt-0.5 text-sm">
          <ErrorMessage name={name} />
        </div>
      )}
    </label>
  </div>
)
