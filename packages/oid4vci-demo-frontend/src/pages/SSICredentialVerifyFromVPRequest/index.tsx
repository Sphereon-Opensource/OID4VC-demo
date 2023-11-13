import React, { useState } from 'react'
import { Text } from '../../components/Text'
import style from '../../components/Text/Text.module.css'
import DeepLinkButton from '../../components/DeepLinkButton'
import { useTranslation } from 'react-i18next'
import { AuthorizationResponsePayload } from '@sphereon/did-auth-siop'
import { useNavigate } from 'react-router-dom'
import MemoizedAuthenticationQR from '../../components/AuthenticationQR'
import SSIPrimaryButton from '../../components/SSIPrimaryButton'
import { useMediaQuery } from 'react-responsive'
import {MobileOS, NonMobile, NonMobileOS} from '../../index'
import { useFlowRouter } from '../../router/flow-router'
import { useEcosystem } from '../../ecosystem/ecosystem'
import { SSICredentialVerifyFromVPRequestPageConfig } from '../../ecosystem/ecosystem-config'

export interface QRCodePageProperties {
  setData: React.Dispatch<React.SetStateAction<AuthorizationResponsePayload | undefined>>
}

export default function SSICredentialVerifyFromVPRequestPage(): React.ReactElement | null {
  const ecosystem = useEcosystem()
  const flowRouter = useFlowRouter<SSICredentialVerifyFromVPRequestPageConfig>()
  const pageConfig = flowRouter.getPageConfig()
  const {t} = useTranslation()
  const credentialName = useEcosystem().getGeneralConfig().credentialName
  const navigate = useNavigate()
  const [deepLink, setDeepLink] = useState<string>('')
  const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})

  const onSignInComplete = (data: AuthorizationResponsePayload) => {
    const state = {
      data: {
        vp_token: data.vp_token
      }
    };

    navigate('/information/manual/request', {state});
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
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
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
              height: '70%',
              marginBottom: '25%',
              marginTop: '25%'
            }}>

                <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', marginBottom: 0}}>
                    <NonMobileOS>
                        <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            {/*Whether the QR code is shown (mobile) is handled in the component itself */}
                            {<MemoizedAuthenticationQR ecosystem={ecosystem}
                                                       fgColor={'rgba(50, 57, 72, 1)'}
                                                       width={pageConfig.rightPaneLeftPane?.qrCode?.width ?? 300}
                                                       vpDefinitionId={flowRouter.getVpDefinitionId()}
                                                       onAuthRequestRetrieved={console.log}
                                                       onSignInComplete={onSignInComplete}
                                                       setQrCodeData={setDeepLink}/>}
                        </div>
                    </NonMobileOS>
                    <MobileOS>
                        {<MemoizedAuthenticationQR ecosystem={ecosystem}
                                                   vpDefinitionId={flowRouter.getVpDefinitionId()}
                                                   onAuthRequestRetrieved={console.log}
                                                   onSignInComplete={onSignInComplete}
                                                   setQrCodeData={setDeepLink}/>}
                        <div style={{gap: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden'}}>
                            <DeepLinkButton style={{flexGrow: 1}} link={deepLink}/>
                        </div>
                    </MobileOS>
                </div>
                <div style={{
                    paddingTop: 40,
                    paddingBottom: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <SSIPrimaryButton
                        caption={t('credential_verify_request_right_pane_button_caption')}
                        onClick={async () => {
                            navigate('/information/manual/request')
                        }}
                    />
                    <Text style={{flexGrow: 1}} className={`${style.pReduceLineSpace} poppins-semi-bold-16`}
                          lines={t('credential_verify_request_right_pane_bottom_paragraph').split('\n')}/>
                </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
            }}>

            </div>
          </div>

        </div>
      </div>
  )
}

