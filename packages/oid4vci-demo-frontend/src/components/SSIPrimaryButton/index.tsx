import React from 'react'
import {useEcosystem} from "../../ecosystem/ecosystem"
import {SSIPrimaryButtonConfig} from "../../ecosystem/ecosystem-config"

export interface IButtonProps {
    style?: React.CSSProperties,
    className?: string,
    disabled?: boolean,
    caption: string,
    color?: string
    onClick?: () => void
}

const SSIPrimaryButton: React.FC<IButtonProps> = (props: IButtonProps) => {
    const ecosystem = useEcosystem()
    const config = ecosystem.getComponentConfig<SSIPrimaryButtonConfig>('SSIPrimaryButton')
    const mainContainerStyle = config.styles.mainContainer;
    const buttonStyle = config.styles.button
    const {caption, disabled = false, onClick, style} = props
    const color = props.color ?? '#FBFBFB'

    const buildStyle = (): React.CSSProperties => {
        const mergedStyle: React.CSSProperties = {
            ...buttonStyle,
            ...style,
            ...(disabled && {opacity: 0.4}),
            borderRadius: 6,
            borderWidth: 0,
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


    // TODO text
    return (
        <button style={buildStyle()}
                onClick={onClick}
                disabled={disabled}
        >
            <text
                className={"poppins-normal-16"}
                style={{color: '#FBFBFB'}}
            >
                {caption}
            </text>
        </button>
    )
}

export default SSIPrimaryButton;
