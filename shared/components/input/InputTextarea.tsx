import { useController } from 'react-hook-form'
import { ComponentProps } from 'react'
import { useApiRequest } from '../form/Form'
import classNames from 'classnames'
import styled from 'styled-components'
import { InputFrame, InputGeneric } from './InputFrame'
import TextareaAutosize from 'react-textarea-autosize'

type InputTextareaProps = InputGeneric & ComponentProps<'textarea'>

const InputLabel = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.2s ease;

  textarea:not(:placeholder-shown) + &,
  textarea:focus + & {
    transform: scale(0.75) translateY(-0.6em);
  }
`

export const InputTextarea = ({
  name,
  label,
  innerClassName,
  className,
  disabled,
  icon,
  ...props
}: InputTextareaProps) => {
  const {
    field: { ref, ...field },
    fieldState: { invalid },
  } = useController({ name })
  const { isLoading } = useApiRequest()

  return (
    <InputFrame {...{ name, className, icon }} isError={invalid}>
      <TextareaAutosize
        ref={ref}
        {...field}
        {...props}
        value={field?.value ?? props?.value ?? ''}
        className={classNames(
          'w-full outline-none px-4 pb-1 mt-5 text-gray-500 resize-none',
          innerClassName,
        )}
        placeholder=" "
        disabled={isLoading || disabled}
      />
      <InputLabel className="ml-4 mt-3 opacity-70">{label}</InputLabel>
    </InputFrame>
  )
}
