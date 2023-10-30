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
    const config = ecosystem.getComponentConfig<SSISecondaryButtonConfig>('SSISecondaryButton')
    const mainContainerStyle = config.styles.mainContainer
    const buttonStyle = config.styles.button
    const {
        caption,
        disabled = false,
        onClick,
        style,
        color = '#FBFBFB'
    } = props

    const buildStyle = (): React.CSSProperties => {
        const mergedStyle: React.CSSProperties = {
            ...buttonStyle,
            ...style,
            ...(disabled && {opacity: 0.4}),
            borderRadius: 6,
            background: `${props.style?.backgroundColor ?? mainContainerStyle.backgroundColor ?? 'transparent'}`,
            border: `1px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
        }

        if (!mergedStyle.width) {
            mergedStyle.width = 300
        }
        if (!mergedStyle.height) {
            mergedStyle.height = 42
        }
        return mergedStyle
    }

    return (
        <button
            style={buildStyle()}
            onClick={onClick}
            disabled={disabled}
        >
            <p className={"poppins-normal-16"}
               style={{color: color}}
            >
                {caption}
            </p>
        </button>
    )
}

export default SSISecondaryButton
