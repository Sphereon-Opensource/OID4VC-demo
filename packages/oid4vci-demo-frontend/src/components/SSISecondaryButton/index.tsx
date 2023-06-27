import React from 'react';

export interface IProps {
    style?: React.CSSProperties,
    className?: string,
    disabled?: boolean,
    caption: string,
    color?: string
    onClick?: () => void
}

const SSISecondaryButton: React.FC<IProps> = (props: IProps) => {
  const { caption, disabled = false, onClick, style , color = '#FBFBFB'} = props
  return (
      <button style={{
                height: 42,
                width: 300,
                borderRadius: 6,
                border: `1px solid ${color}`,
                ...style,
                ...(disabled && { opacity: 0.4 }),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'transparent'
              }}
              onClick={onClick}
              disabled={disabled}
      >
        <text
            className={"poppins-normal-16"}
            style={{color}}
        >
          {caption}
        </text>
      </button>
  )
}

export default SSISecondaryButton;
