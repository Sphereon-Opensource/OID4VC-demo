import React from 'react'
import {Text} from "../../components/Text"
import {useTranslation} from "react-i18next"
import SSIPrimaryButton from "../../components/SSIPrimaryButton"
import {useMediaQuery} from "react-responsive"
import {NonMobile} from "../../index"
import SSIWalletQRCode from "../../components/SSIWalletQRCode"
import {useFlowRouter} from "../../router/flow-router"
import {SphereonWalletPageConfig} from "../../ecosystem/ecosystem-config"


const SphereonWalletPage: React.FC = () => {
    const flowRouter = useFlowRouter<SphereonWalletPageConfig>()
    const config = flowRouter.getPageConfig()
    const {t} = useTranslation()
    const isNarrowScreen = useMediaQuery({query: '(max-width: 767px)'})
    const sphereonWalletQRCodes = config.rightPane.sphereonWalletQRCodes

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
                          lines={config.rightPane.paragraphResourceId ? t(config.rightPane.paragraphResourceId).split('\n') : []}/>
                    <div style={{
                        flexGrow: 1,
                        display: 'contents',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: 8,
                            marginBottom: 16,
                            alignItems: 'center'
                        }}>
                            {
                                sphereonWalletQRCodes.map((sphereonWalletQRCode, index) => (
                                    <SSIWalletQRCode
                                        key={index}
                                        image={sphereonWalletQRCode.image}
                                        className="poppins-semi-bold-14"
                                        text={sphereonWalletQRCode.qrTextResourceId ? t(sphereonWalletQRCode.qrTextResourceId) as string : ''}
                                        style={sphereonWalletQRCode.style}
                                        button={{
                                            style: sphereonWalletQRCode.button?.style,
                                            caption: t(sphereonWalletQRCode.buttonCaptionResourceId),
                                            color: sphereonWalletQRCode.button?.color,
                                            onClick: () => window.open(sphereonWalletQRCode.downloadUrl, sphereonWalletQRCode.target ?? '_self')
                                        }}
                                    />
                                ))
                            }
                        </div>
                        <img src={config.rightPane.image} alt="phone"/>
                    </div>
                    <div style={{
                        marginTop: "8px",
                        marginBottom: isNarrowScreen ? 40 : '20%',
                    }}>
                        {config.rightPane.enablePrimaryButton && (
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                <SSIPrimaryButton
                                    caption={t(config.rightPane.primaryButtonResourceId ?? 'label_continue')}
                                    onClick={async () => {
                                        if (config.rightPane.primaryButtonStepId) {
                                            await flowRouter.goToStep(config.rightPane.primaryButtonStepId)
                                        } else {
                                            await flowRouter.nextStep()
                                        }
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


export default SphereonWalletPage
