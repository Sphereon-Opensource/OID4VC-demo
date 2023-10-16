import React from "react"
import {Text} from "../../components/Text"
import SSIPrimaryButton from "../../components/SSIPrimaryButton"
import {getCurrentEcosystemGeneralConfig, SSIDownloadPageConfig} from "../../ecosystem-config"
import {useTranslation} from "react-i18next"
import SSIWalletQRCode from "../../components/SSIWalletQRCode"
import {NonMobile} from "../../index"
import {useMediaQuery} from "react-responsive"
import {useFlowRouter} from "../../router/flow-router"

const SSIDownloadPage: React.FC = () => {
    const flowRouter = useFlowRouter<SSIDownloadPageConfig>()
    const config = flowRouter.getPageConfig()
    const generalConfig = getCurrentEcosystemGeneralConfig()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const {t} = useTranslation()

    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: config.leftPane.width ?? '60%',
                    height: '100%',
                    background: 'linear-gradient(315deg, #FFF 0%, #E6E6E6 100%)',
                    backgroundSize: 'cover',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        alignItems: "center",
                        justifyContent: "space-around",
                        height: '93%',
                        paddingLeft: '10%'
                    }}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text*/}
                        <img {...config.leftPane.leftPhone.logo} />
                        {/* eslint-disable-next-line jsx-a11y/alt-text*/}
                        <img {...config.leftPane.leftPhone.image} />
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        alignItems: "center",
                        justifyContent: "space-around",
                        height: '93%',
                        paddingRight: '10%'
                    }}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text*/}
                        <img {...config.leftPane.rightPhone.logo}/>
                        {/* eslint-disable-next-line jsx-a11y/alt-text*/}
                        <img {...config.leftPane.rightPhone.image}/>
                    </div>
                </div>
            </NonMobile>
            <div style={{
                display: 'flex',
                width: `${isTabletOrMobile ? '100%' : '40%'}`,
                height: '100%',
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    height: '75%',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <Text
                        className='inter-normal-24 poppins-normal-16'
                        style={{
                            whiteSpace: 'pre-line',
                            flexGrow: 1
                        }}
                        title={t('download_app_right_pane_title').split('\n')}
                        lines={t('download_app_right_pane_paragraph').split('\n')}/>
                    <div style={{
                        width: '90%',
                        height: '397px',
                        flexGrow: 1
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-around"
                        }}>
                            <SSIWalletQRCode
                                image={config.rightPane.paradymWalletQRCode.image}
                                className='poppins-semi-bold-14'
                                text={t('download_app_right_pane_paradym_qrcode_text') as string}
                                style={config.rightPane.paradymWalletQRCode.style}
                                button={{
                                    style: config.rightPane.paradymWalletQRCode.button.style,
                                    caption: t('download_app_right_pane_paradym_qrcode_button_caption'),
                                    color: config.rightPane.paradymWalletQRCode.button.color,
                                    onClick: () => window.location.href = config.rightPane.paradymWalletQRCode.downloadUrl
                                }}
                            />
                            <SSIWalletQRCode
                                image={config.rightPane.sphereonWalletQRCode.image}
                                className='poppins-semi-bold-14'
                                text={t('download_app_right_pane_sphereon_qrcode_text') as string}
                                style={config.rightPane.sphereonWalletQRCode.style}
                                button={{
                                    style: config.rightPane.sphereonWalletQRCode.button.style,
                                    caption: t('download_app_right_pane_sphereon_qrcode_button_caption'),
                                    color: config.rightPane.sphereonWalletQRCode.button.color,
                                    onClick: () => window.location.href = config.rightPane.sphereonWalletQRCode.downloadUrl
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <SSIPrimaryButton
                            caption={t('download_app_right_pane_button_caption')}
                            style={{width: '327px'}}
                            onClick={async () => window.location.href = generalConfig.downloadUrl ?? 'https://sphereon.com'}
                        />
                    </div>
                </div>
            </div>
        </div>)
}

export default SSIDownloadPage
