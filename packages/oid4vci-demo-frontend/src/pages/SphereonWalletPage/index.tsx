import React, {ReactElement, useEffect, useState} from 'react'
import {Text} from "../../components/Text"
import style from '../../components/Text/Text.module.css'
import DeepLink from "../../components/DeepLink"
import {useTranslation} from "react-i18next"
import {useLocation, useNavigate} from "react-router-dom"
import MemoizedAuthenticationQR from '../../components/AuthenticationQR'
import {
    getCurrentEcosystemGeneralConfig,
    getCurrentEcosystemPageOrComponentConfig, SphereonWalletPageConfig
} from "../../ecosystem-config"
import SSIPrimaryButton from "../../components/SSIPrimaryButton"
import {useMediaQuery} from "react-responsive"
import {Mobile, MobileOS, NonMobile} from "../../index"
import {Sequencer} from "../../router/sequencer"
import SSIWalletQRCode from "../../components/SSIWalletQRCode"
import {ImageProperties} from "../../types"

export default function SphereonWalletPage(): React.ReactElement | null {
    const location = useLocation()
    const navigate = useNavigate()
    const config = getCurrentEcosystemPageOrComponentConfig('downloadSphereonWallet') as SphereonWalletPageConfig
    const {t} = useTranslation()
    const credentialName = getCurrentEcosystemGeneralConfig().credentialName
    const [sequencer] = useState<Sequencer>(new Sequencer())
    const [deepLink, setDeepLink] = useState<string>('')
    const isNarrowScreen = useMediaQuery({query: '(max-width: 767px)'})

    useEffect(() => {
        sequencer.setCurrentRoute(location.pathname, navigate)
    })

    const sphereonWalletQRCode = config.rightPane.sphereonWalletQRCode
    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: config.leftPane.width ?? '30%',
                    height: '100%',
                    flexDirection: 'column',
                    ...(config.leftPane.image && {background: `url(${config.leftPane.image}) 0% 0% / cover`}),
                    ...(config.leftPane.backgroundColor && {backgroundColor: config.leftPane.backgroundColor}),
                    ...(config.leftPane.logo && {justifyContent: 'center', alignItems: 'center'})
                }}>
                    {config.leftPane.logo &&
                        <img
                            src={config.leftPane.logo.src}
                            alt={config.leftPane.logo.alt}
                            width={config.leftPane.logo.width}
                            height={config.leftPane.logo.height}
                        />
                    }
                </div>
            </NonMobile>
            <div style={{
                display: 'flex',
                width: `${isNarrowScreen ? '100%' : (config.rightPane.width ?? '40%')}`,
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                ...(isNarrowScreen && {gap: 24, ...(config.leftPane.mobile?.backgroundColor && {backgroundColor: config.leftPane.mobile.backgroundColor})}),
                ...(!isNarrowScreen && {justifyContent: 'center', backgroundColor: '#FFFFFF'}),
            }}>
                {(isNarrowScreen && config?.leftPane.logo) &&
                    <img
                        src={config.leftPane.mobile?.logo?.src}
                        alt={config.leftPane.mobile?.logo?.alt}
                        width={config.leftPane.mobile?.logo?.width ?? 150}
                        height={config.leftPane.mobile?.logo?.height ?? 150}
                    />
                }
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '70%',
                    textAlign: 'center'
                }}>
                    <Text className="inter-normal-24 poppins-normal-16"
                          style={{
                              whiteSpace: 'pre-line',
                              flexGrow: 1
                          }}
                          title={t('sphereon_wallet_right_pane_title').split('\n')}
                          lines={t('sphereon_wallet_right_pane_paragraph').split('\n')}/>
                    <div style={{
                        flexGrow: 1,
                        display: 'contents',
                        alignItems: 'center'
                    }}>
                        <img src={config.rightPane.image} alt="phone"/>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: 8,
                        alignItems: 'center'
                    }}>
                        <SSIWalletQRCode
                            image={sphereonWalletQRCode.enableQR ? sphereonWalletQRCode.image : {} as ImageProperties}
                            className="poppins-semi-bold-14"
                            text={t('sphereon_wallet_right_pane_sphereon_qrcode_text') as string}
                            style={sphereonWalletQRCode.style}
                            button={{
                                style: sphereonWalletQRCode.button.style,
                                caption: t('sphereon_wallet_right_pane_sphereon_qrcode_button_caption'),
                                color: sphereonWalletQRCode.button.color,
                                onClick: () => window.location.href = sphereonWalletQRCode.downloadUrl
                            }}
                        />
                    </div>
                    <div style={{
                        marginTop: "8px",
                        marginBottom: isNarrowScreen ? 40 : '20%',
                    }}>
                        {config.rightPane.enableNextButton && (
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <SSIPrimaryButton
                                    caption={t('sphereon_wallet_right_pane_button_caption')}
                                    style={sphereonWalletQRCode.button.style}
                                    onClick={async () => {
                                        sequencer.goToStep(config.rightPane.nextButtonStepId ?? 'infoRequest')
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

