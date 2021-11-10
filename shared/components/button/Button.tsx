import { ComponentProps } from 'react'
import classNames from 'classnames'

const BUTTON_COLORS = {
  blue: 'bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white shadow-md',
  'blue-link':
    'bg-blue-500 text-blue-500 bg-opacity-10 hover:bg-opacity-20 focus:bg-opacity-20',
  red: 'bg-red-500 hover:bg-red-600 focus:bg-red-600 text-white shadow-md',
  'red-link':
    'bg-red-500 text-red-500 bg-opacity-10 hover:bg-opacity-20 focus:bg-opacity-20',
  light: 'bg-gray-800 bg-opacity-5 hover:bg-opacity-20 focus:bg-opacity-20',
}

export interface ButtonProps extends ComponentProps<'button'> {
  color?: keyof typeof BUTTON_COLORS
  hasIcon?: boolean
}

const Button = ({
  color = 'blue',
  type = 'button',
  children,
  className,
  disabled,
  hasIcon,
  ...props
}: ButtonProps) => (
  <button
    className={classNames(
      'py-2 font-bold rounded-lg transition-all flex justify-center items-center disabled:opacity-50',
      BUTTON_COLORS[color],
      className,
      hasIcon ? 'px-2' : 'px-6',
      disabled && 'pointer-events-none',
    )}
    {...{ type, disabled }}
    {...props}
  >
    {children}
  </button>
)

export default Button
