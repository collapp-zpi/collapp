import classNames from 'classnames'

export const LogoSpinner = ({ size = 'w-16 h-16' }) => (
  <div className={classNames('relative m-auto', size)}>
    <svg
      className="w-full h-full absolute left-0 top-0 spinner-path"
      viewBox="0 0 500 500"
    >
      <path d="M87.036,322.31m0-144.62M212.724,50h149.2A50.038,50.038,0,0,1,412,100v50a50.038,50.038,0,0,1-50.076,50H212.2A125.057,125.057,0,0,0,87.036,322.31c-0.025,1.136-.035,2.256-0.028,3.4C87.407,394.554,143.775,450,212.724,450h149.2A50.038,50.038,0,0,0,412,400V350a50.038,50.038,0,0,0-50.076-50H212.2A125.057,125.057,0,0,1,87.036,177.69c-0.025-1.136-.035-2.256-0.028-3.4C87.407,105.446,143.775,50,212.724,50Z" />
      <path d="M87.036,322.31V177.69" />
    </svg>
    <svg className="w-full h-full relative" viewBox="0 0 500 500">
      <defs>
        <linearGradient
          id="collapp-spinner-gradient"
          x2="500"
          y2="500"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.3" stopColor="#6099d2" />
          <stop offset="0.5" stopColor="#9d64aa" />
          <stop offset="0.7" stopColor="#e175ae" />
        </linearGradient>
      </defs>
      <path
        className="spinner-moving"
        d="M87.036,322.31m0-144.62M212.724,50h149.2A50.038,50.038,0,0,1,412,100v50a50.038,50.038,0,0,1-50.076,50H212.2A125.057,125.057,0,0,0,87.036,322.31c-0.025,1.136-.035,2.256-0.028,3.4C87.407,394.554,143.775,450,212.724,450h149.2A50.038,50.038,0,0,0,412,400V350a50.038,50.038,0,0,0-50.076-50H212.2A125.057,125.057,0,0,1,87.036,177.69c-0.025-1.136-.035-2.256-0.028-3.4C87.407,105.446,143.775,50,212.724,50Z"
      />
    </svg>
  </div>
)
