import React from 'react'
import {ButtonType, IButton, ImageProperties} from '../../types'
import SSIPrimaryButton from '../SSIPrimaryButton'
import SSISecondaryButton from '../SSISecondaryButton'
import {NonMobile} from "../../index"
import {useMediaQuery} from "react-responsive"
import {useEcosystem} from "../../ecosystem/ecosystem"
import {SSICardViewConfig} from "../../ecosystem/ecosystem-config"

interface IProps {
    image: ImageProperties
    backgroundColor?: string
    button: IButton
    title: string,
    message: string,
    textColor?: string
    disabled?: boolean
}

const SSICardView: React.FC<IProps> = (props: IProps) => {
    const ecosystem = useEcosystem()
    const config = ecosystem.getComponentConfig<SSICardViewConfig>('SSICardView')
    const mainContainerStyle = config.styles.mainContainer
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const {
        backgroundColor = props.backgroundColor ? props.backgroundColor : mainContainerStyle.backgroundColor,
        disabled = false,
        image,
        textColor = mainContainerStyle.textColor,
        button,
        title,
        message
    } = props;

    return (
        <div style={{
            borderRadius: 25,
            background: backgroundColor,
            maxWidth: 400,
            maxHeight: isTabletOrMobile ? 300 : 700,
            marginBottom: 20
        }}>
            <div style={{
                marginLeft: 37,
                marginRight: 37,
                marginTop: 76,
                marginBottom: 48,
                alignItems: 'center',
                flexDirection: 'column',
                display: 'flex',
            }}>
                <NonMobile>
                    <img
                        style={{marginBottom: 58}}
                        src={props.image.src}
                        alt={props.image.alt}
                    />
                </NonMobile>
                <p className={"inter-normal-24"}
                   style={{color: textColor, textAlign: 'center', marginBottom: 17, ...(disabled && {opacity: 0.4})}}
                >
                    {title}
                </p>
                <p
                    className={"poppins-normal-14"}
                    style={{
                        maxWidth: 313,
                        color: textColor,
                        marginBottom: isTabletOrMobile ? 20 : 123,
                        textAlign: 'center', ...(disabled && {opacity: 0.4})
                    }}
                >
                    {message.split('\r\n')}
                </p>
                {button.type === ButtonType.PRIMARY
                    ? <SSIPrimaryButton
                        caption={button.caption}
                        onClick={button.onClick}
                    />
                    : <SSISecondaryButton
                        caption={button.caption}
                        onClick={button.onClick}
                    />
                }
            </div>
        </div>
    );
};

export default SSICardView;
