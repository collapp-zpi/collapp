import { Tooltip as Tippy } from 'react-tippy'
import 'react-tippy/dist/tippy.css'
import { ComponentProps, ReactNode } from 'react'

interface TooltipProps extends ComponentProps<'div'> {
  value: string
  className?: string
  children: ReactNode
}

export const Tooltip = ({
  value,
  children,
  className,
  ...props
}: TooltipProps) => (
  <Tippy title={value} duration={250} animateFill className={className}>
    <div className="inline-block" {...props}>
      {children}
    </div>
  </Tippy>
)
