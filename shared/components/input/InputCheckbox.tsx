import classNames from 'classnames'
import { FiCheck } from 'react-icons/fi'

interface InputCheckboxPure {
  checked: boolean
  onChange: () => void
  className: string
  disabled?: boolean
}

export const InputCheckboxPure = ({
  checked,
  onChange,
  className,
  disabled = false,
}: InputCheckboxPure) => (
  <label
    className={classNames(
      className,
      !disabled && 'cursor-pointer',
      'select-none',
    )}
  >
    <div
      className={classNames(
        'w-5 h-5 rounded-md transition-all relative text-white',
        checked ? 'bg-blue-500' : 'bg-gray-300',
        disabled && 'opacity-50',
      )}
    >
      <input
        type="checkbox"
        className="pointer-events-none hidden"
        {...{ checked, onChange, disabled }}
      />
      <FiCheck
        strokeWidth={4}
        className={classNames(
          'absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 transition-opacity',
          !checked && 'opacity-0',
        )}
      />
    </div>
  </label>
)
