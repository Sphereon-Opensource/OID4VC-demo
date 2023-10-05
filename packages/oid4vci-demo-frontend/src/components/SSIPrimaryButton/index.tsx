import React from 'react';
import {getCurrentEcosystemPageOrComponentConfig, SSIPrimaryButtonConfig} from "../../ecosystem-config";

export interface IButtonProps {
    style?: React.CSSProperties,
    className?: string,
    disabled?: boolean,
    caption: string,
    onClick?: () => void
}

const SSIPrimaryButton: React.FC<IButtonProps> = (props: IButtonProps) => {
const config = getCurrentEcosystemPageOrComponentConfig('SSIPrimaryButton') as SSIPrimaryButtonConfig;
const mainContainerStyle = config.styles.mainContainer;
    const {caption, disabled = false, onClick, style} = props
    // TODO text
    return (
        <button style={{
            height: 42,
            width: 300,
            borderRadius: 6,
            background: `${mainContainerStyle.backgroundColor}`,
            ...style,
            ...(disabled && {opacity: 0.4}),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderWidth: 0
        }}
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
