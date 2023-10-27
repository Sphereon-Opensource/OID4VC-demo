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

  function determineWidth() {
    if(pageConfig.leftPaneWidth && pageConfig.leftPaneWidth.includes('%')) {
      return pageConfig.rightPaneLeftPane?.width ?? '100%'
    }
    return isTabletOrMobile ? '100%' : '40%'
  }

    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: pageConfig.leftPaneWidth ?? '60%',
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
                            width={`${pageConfig.logo.width}`}
                            height={`${pageConfig.logo.height}`}
                        />
                    }
                </div>
            </NonMobile>
          <div style={{ ...(pageConfig.rightPaneGrid?.style),
            display: pageConfig.rightPaneGrid?.style?.display ?? 'grid',
            gridTemplateColumns: pageConfig.rightPaneGrid?.style?.gridTemplateColumns ?? 'repeat(3, 1fr)',
            gridTemplateRows: pageConfig.rightPaneGrid?.style?.gridTemplateRows ?? 'auto'
          }}>
            <Text lines={['']} title={[t('ssi_welcome_label')]} className={pageConfig.rightPaneLeftPane?.welcomeLabel?.className} style={{
              ...(pageConfig.rightPaneLeftPane?.welcomeLabel?.style),
              display: pageConfig.rightPaneLeftPane?.welcomeLabel?.style?.display ?? 'none'
            }} />
            <div style={{
                gridColumn: `${pageConfig.rightPaneLeftPane?.grid?.gridColumn ?? '2'}`,
                gridRow: `${pageConfig.rightPaneLeftPane?.grid?.gridRow ?? '2'}`,
                display: 'flex',
                width: determineWidth(),
                height: `${pageConfig.rightPaneLeftPane?.grid?.height ?? '100%'}`,
                flexDirection: 'column',
                alignItems: 'center',
                ...(isTabletOrMobile && { gap: 24, ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) }),
                ...(!isTabletOrMobile && { justifyContent: 'center', backgroundColor: '#FFFFFF' }),
            }}>
                {(isTabletOrMobile && pageConfig?.logo) &&
                    <img
                        src={`${pageConfig.mobile?.logo?.src}`}
                        alt={`${pageConfig.mobile?.logo?.alt}`}
                        width={pageConfig.mobile?.logo?.width ?? 150}
                        height={pageConfig.mobile?.logo?.height ?? 150}
                    />
                }
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: `${pageConfig.rightPaneLeftPane?.qrCode?.pane?.height ?? '60%'}`
                }}>
                    <Text style={{...pageConfig.rightPaneLeftPane?.qrCode?.topTitle?.style, textAlign: 'center'}}
                          className={style.pReduceLineSpace}
                          title={t('credential_verify_request_right_pane_top_title', {credentialName}).split('\n')}
                          lines={t('credential_verify_request_right_pane_top_paragraph', {credentialName}).split('\n')}/>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '50vh',
                        marginBottom: `${isTabletOrMobile ? 40 : pageConfig.rightPaneLeftPane?.qrCode?.marginBottom ?? '25%'}`,
                        marginTop: `${isTabletOrMobile ? 20 : pageConfig.rightPaneLeftPane?.qrCode?.marginTop ?? '25%'}`,
                        alignItems: 'center'
                    }}>
                        <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', marginBottom: 0}}>
                            {/*Whether the QR code is shown (mobile) is handled in the component itself */}
                            {<MemoizedAuthenticationQR ecosystem={ecosystem}
                                                       fgColor={'rgba(50, 57, 72, 1)'}
                                                       width={pageConfig.rightPaneLeftPane?.qrCode?.width ?? 300}
                                                       vpDefinitionId={flowRouter.getVpDefinitionId()}
                                                       onAuthRequestRetrieved={console.log}
                                                       onSignInComplete={onSignInComplete}
                                                       setQrCodeData={setDeepLink}/>}
                        </div>
                        <MobileOS>
                            <div style={{gap: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden'}}>
                                { pageConfig.mobile?.image &&
                                    <img src={`${pageConfig.mobile?.image}`} alt="success" style={{overflow: 'hidden'}}/>
                                }
                                <DeepLink style={{flexGrow: 1}} link={deepLink}/>
                            </div>
                        </MobileOS>
                    </div>
                    <div style={{marginTop: "20"}}>
                    <Mobile><Text style={{flexGrow: 1}} className={`${style.pReduceLineSpace} poppins-semi-bold-16`}
                                  lines={t('credential_verify_request_right_pane_bottom_paragraph_mobile').split('\n')}/></Mobile>
                    <NonMobile><Text style={{flexGrow: 1, color: `${pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.fontColor}` }}
                                     className={`${style.pReduceLineSpace} ${pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.className} poppins-semi-bold-16`}
                                     title={t(`${pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.credential_verify_request_right_pane_bottom_title}`).split('\n')}
                                     lines={t(`${pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.credential_verify_request_right_pane_bottom_paragraph}`).split('\n')}/></NonMobile>
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
            <NonMobile>
              <div style={{
                gridColumn: `${pageConfig.mostRightPanel?.grid?.gridColumn}`,
                gridRow: `${pageConfig.mostRightPanel?.grid?.gridRow}`,
                display: `${pageConfig.mostRightPanel ? 'flex': 'none'}`,
                width: '180%',
                height: '50%',
                justifyContent: "space-around"
              }}>
              <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                <img src={`${pageConfig.mostRightPanel?.separator?.logo?.src}` }
                     alt={`${pageConfig.mostRightPanel?.separator?.logo?.alt}` }
                     width={`${pageConfig.mostRightPanel?.separator?.logo?.width}`}
                     height={`${pageConfig.mostRightPanel?.separator?.logo?.height}`} />
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignContent: 'space-around',
                width: `${pageConfig.mostRightPanel?.width}`,
                height: `${pageConfig.mostRightPanel?.height}`
              }}>
                <div style={{
                  height: '100%',
                  width: '100%',
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center"
                }}>
                <img
                    src={`${pageConfig.mostRightPanel?.logo?.src}`}
                    alt={`${pageConfig.mostRightPanel?.logo?.alt}`}
                    width={`${pageConfig.mostRightPanel?.logo?.width}`}
                    height={`${pageConfig.mostRightPanel?.logo?.height}`}
                />
                  <SSIPrimaryButton
                      caption={t('ssi_download_app_button')}
                      style={{
                          backgroundColor: '#312B78',
                          color: '#FFFFFF',
                          height: '32px',
                          margin: "15% auto 0 auto"
                      }}
                      onClick={async (): Promise<void> => {
                          if (pageConfig.downloadAppStepId) {
                              await flowRouter.goToStep(pageConfig.downloadAppStepId)
                          }
                      }}
                  />
                </div>
              </div>
              </div>
            </NonMobile>
        </div>
      </div>
    )
}

