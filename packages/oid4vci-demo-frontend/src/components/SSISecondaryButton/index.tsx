import React from 'react'

import {useEcosystem} from "../../ecosystem/ecosystem"
import {SSISecondaryButtonConfig} from "../../ecosystem/ecosystem-config"

export interface IProps {
    style?: React.CSSProperties,
    className?: string,
    disabled?: boolean,
    caption: string,
    color?: string
    onClick?: () => void
}

const SSISecondaryButton: React.FC<IProps> = (props: IProps) => {
    const ecosystem = useEcosystem()
    const config = ecosystem.getComponentConfig('SSISecondaryButton') as SSISecondaryButtonConfig;
    const mainContainerStyle = config.styles.mainContainer;
    const { caption, disabled = false, onClick, style} = props
    const color = props.color ?? '#FBFBFB'
  return (
      <button style={{
                height: 42,
                width: 300,
                borderRadius: 6,
                background: `${props.style?.backgroundColor ?? mainContainerStyle.backgroundColor ?? 'transparent'}`,
                border: `1px solid ${color}`,
                ...style,
                ...(disabled && { opacity: 0.4 }),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',

              }}
              onClick={onClick}
              disabled={disabled}
      >
        <text
            className={"poppins-normal-16"}
            style={{color: color}}
        >
          {caption}
        </text>
      </button>
  )
}

export default SSISecondaryButton;
