import { useController } from 'react-hook-form'
import { ComponentProps, forwardRef } from 'react'
import { useApiRequest } from '../form/Form'
import classNames from 'classnames'
import styled from 'styled-components'
import { InputFrame, InputGeneric } from './InputFrame'

type InputTextProps = InputGeneric & ComponentProps<'input'>

const InputLabel = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.2s ease;

  input:not(:placeholder-shown) + &,
  input:focus + & {
    transform: scale(0.75) translateY(-0.5em);
  }
`

export const InputText = ({ name, disabled, ...props }: InputTextProps) => {
  const {
    field: { ref, value, ...field },
    fieldState: { invalid },
  } = useController({ name })
  const { isLoading } = useApiRequest()

  return (
    <InputTextPure
      ref={ref}
      {...field}
      {...props}
      name={name}
      value={value ?? props?.value ?? ''}
      isError={invalid}
      disabled={isLoading || disabled}
    />
  )
}

export const InputTextPure = forwardRef<
  HTMLInputElement,
  Omit<InputTextProps, 'name'> & { isError?: boolean; name?: string }
>(function InnerPureInput(
  {
    name,
    label,
    innerClassName,
    className,
    disabled,
    icon,
    isError,
    value,
    ...props
  },
  ref,
) {
  return (
    <InputFrame {...{ name, className, icon }} isError={!!isError}>
      <input
        ref={ref}
        {...props}
        name={name}
        value={value ?? ''}
        className={classNames(
          'w-full outline-none px-4 pb-1 pt-5 text-gray-500',
          innerClassName,
        )}
        placeholder=" "
        disabled={disabled}
      />
      <InputLabel className="ml-4 my-3 opacity-70">{label}</InputLabel>
    </InputFrame>
  )
})
