import { useController } from 'react-hook-form'
import { useState } from 'react'
import { useApiRequest } from '../form/Form'
import styled from 'styled-components'
import { InputFrame, InputGeneric } from './InputFrame'
import Select, { Props, SingleValue, StylesConfig } from 'react-select'
import classNames from 'classnames'

type OptionValue = {
  label: string
  value: string
}

type InputSelectProps<Value extends OptionValue> = InputGeneric &
  Props<Value> & {
    options: readonly Value[]
    value?: string | null
    onChange?: (value: Value | null) => void
    disabled?: boolean
  }

const InputLabel = styled.div<{ $minimized: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.2s ease;
  transform: ${({ $minimized }) =>
    $minimized && 'scale(0.75) translateY(-0.5em)'};

  div:focus-within > div > & {
    transform: scale(0.75) translateY(-0.5em);
  }
`

const styles = <T,>(): StylesConfig<T> => ({
  control: () => ({
    color: 'inherit',
    paddingBottom: '0.25rem',
    paddingTop: '1.25rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    display: 'flex',
    alignItems: 'center',
    // justifyContent: 'space-between',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: 0,
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    position: 'absolute',
    right: 0,
    top: '0.45rem',
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
})

export const InputSelect = <Value extends OptionValue>({
  name,
  label,
  innerClassName,
  className,
  disabled,
  icon,
  options,
  isClearable = true,
  ...props
}: InputSelectProps<Value>) => {
  const {
    field: { ref, value, onChange, ...field },
    fieldState: { invalid },
  } = useController({ name })
  const [isPlaceholderVisible, setPlaceholderVisible] = useState(false)
  const { isLoading } = useApiRequest()

  return (
    <InputFrame {...{ name, className, icon }} isError={invalid} overflow>
      <Select
        {...field}
        {...props}
        ref={ref}
        value={
          value === null
            ? null
            : options.find((item: Value) => item.value === value)
        }
        onChange={(data) =>
          onChange((data as SingleValue<Value>)?.value ?? null)
        }
        isDisabled={isLoading || disabled}
        onInputChange={(data) => setPlaceholderVisible(!!data)}
        isClearable={isClearable}
        placeholder=""
        options={options}
        styles={styles<Value>()}
        className={classNames(
          // 'w-full outline-none px-4 pb-1 pt-5 text-gray-500',
          'w-full outline-none text-gray-500',
          innerClassName,
        )}
      />
      <InputLabel
        className="ml-4 my-3 opacity-70"
        $minimized={isPlaceholderVisible || value != null}
      >
        {label}
      </InputLabel>
    </InputFrame>
  )
}
