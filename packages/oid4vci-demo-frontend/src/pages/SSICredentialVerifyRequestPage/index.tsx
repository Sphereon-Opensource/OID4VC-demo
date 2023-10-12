import React, {useState} from 'react'
import {Text} from "../../components/Text"
import style from '../../components/Text/Text.module.css'
import DeepLink from "../../components/DeepLink"
import {useTranslation} from "react-i18next"
import {AuthorizationResponsePayload} from "@sphereon/did-auth-siop"
import MemoizedAuthenticationQR from '../../components/AuthenticationQR'
import SSIPrimaryButton from "../../components/SSIPrimaryButton"
import {useMediaQuery} from "react-responsive"
import {Mobile, MobileOS, NonMobile} from "../../index"
import {useFlowRouter} from "../../router/flow-router"
import {useEcosystem} from "../../ecosystem/ecosystem"
import {SSICredentialVerifyRequestPageConfig} from "../../ecosystem/ecosystem-config"
import {useLocation} from "react-router-dom"

export default function SSICredentialVerifyRequestPage(): React.ReactElement | null {
    const ecosystem = useEcosystem()
    const flowRouter = useFlowRouter<SSICredentialVerifyRequestPageConfig>()
    const pageConfig = flowRouter.getPageConfig()
    const {t} = useTranslation()
    const credentialName = useEcosystem().getGeneralConfig().credentialName
    const [deepLink, setDeepLink] = useState<string>('')
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const onSignInComplete = async (data: AuthorizationResponsePayload) => {
        console.debug('onSignInComplete')
        const state = {
            data: {
                vp_token: data.vp_token
            }
        };
        console.debug('calling pageRouter.next')
        await flowRouter.nextStep(state)
    }

    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: '60%',
                    height: '100%',
                    flexDirection: 'column',
                    ...(pageConfig.photoLeft && { background: `url(${pageConfig.photoLeft}) 0% 0% / cover`}),
                    ...(pageConfig.backgroundColor && { backgroundColor: pageConfig.backgroundColor }),
                    ...(pageConfig.logo && { justifyContent: 'center', alignItems: 'center' })
                }}>
                    { pageConfig.logo &&
                        <img
                            src={pageConfig.logo.src}
                            alt={pageConfig.logo.alt}
                            width={pageConfig.logo.width}
                            height={pageConfig.logo.height}
                        />
                    }
                </div>
            </NonMobile>
            <div style={{
                display: 'flex',
                width: `${isTabletOrMobile ? '100%' : '40%'}`,
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                ...(isTabletOrMobile && { gap: 24, ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) }),
                ...(!isTabletOrMobile && { justifyContent: 'center', backgroundColor: '#FFFFFF' }),
            }}>
                {(isTabletOrMobile && pageConfig?.logo) &&
                    <img
                        src={pageConfig.mobile?.logo?.src}
                        alt={pageConfig.mobile?.logo?.alt}
                        width={pageConfig.mobile?.logo?.width ?? 150}
                        height={pageConfig.mobile?.logo?.height ?? 150}
                    />
                }
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '60%'
                }}>
                    <Text style={{textAlign: 'center'}}
                          className={style.pReduceLineSpace}
                          title={t('credential_verify_request_right_pane_top_title', {credentialName}).split('\n')}
                          lines={t('credential_verify_request_right_pane_top_paragraph', {credentialName}).split('\n')}/>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '50vh',
                        marginBottom: isTabletOrMobile ? 40 : '25%',
                        marginTop: isTabletOrMobile ? 20 : '25%',
                        alignItems: 'center'
                    }}>
                        <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', marginBottom: 0}}>
                            {/*Whether the QR code is shown (mobile) is handled in the component itself */}
                            {<MemoizedAuthenticationQR ecosystem={ecosystem}
                                                       vpDefinitionId={flowRouter.getVpDefinitionId()}
                                                       onAuthRequestRetrieved={console.log}
                                                       onSignInComplete={onSignInComplete}
                                                       setQrCodeData={setDeepLink}/>}
                        </div>
                        <MobileOS>
                            <div style={{gap: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden'}}>
                                { pageConfig.mobile?.image &&
                                    <img src={pageConfig.mobile?.image} alt="success" style={{overflow: 'hidden'}}/>
                                }
                                <DeepLink style={{flexGrow: 1}} link={deepLink}/>
                            </div>
                        </MobileOS>
                    </div>
                    <div style={{marginTop: "20"}}>
                    <Mobile><Text style={{flexGrow: 1}} className={`${style.pReduceLineSpace} poppins-semi-bold-16`}
                                  lines={t('credential_verify_request_right_pane_bottom_paragraph_mobile').split('\n')}/></Mobile>
                    <NonMobile><Text style={{flexGrow: 1}} className={`${style.pReduceLineSpace} poppins-semi-bold-16`}
                                     lines={t('credential_verify_request_right_pane_bottom_paragraph').split('\n')}/></NonMobile>
                    {pageConfig.enableRightPaneButton && (
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <SSIPrimaryButton
                                caption={t('credential_verify_request_right_pane_button_caption')}
                                onClick={async () => {
                                    await flowRouter.goToStep(pageConfig.rightPaneButtonStepId ?? 'infoRequest')
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

