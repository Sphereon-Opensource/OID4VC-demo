import React, {useState} from 'react'
import {Text} from "../../components/Text"
import style from '../../components/Text/Text.module.css'
import DeepLinkButton from "../../components/DeepLinkButton"
import {useTranslation} from "react-i18next"
import {AuthorizationResponsePayload} from "@sphereon/did-auth-siop"
import MemoizedAuthenticationQR from '../../components/AuthenticationQR'
import SSIPrimaryButton from "../../components/SSIPrimaryButton"
import {useMediaQuery} from "react-responsive"
import {Mobile, MobileOS, NonMobile, NonMobileOS} from "../../index"
import {useFlowRouter} from "../../router/flow-router"
import {useEcosystem} from "../../ecosystem/ecosystem"
import {SSICredentialVerifyRequestPageConfig} from "../../ecosystem/ecosystem-config"
import {useLocation} from "react-router-dom";
import InputField from "../../components/InputField";
import {FormFieldValue} from "../../types";
import styles from "../../components/DeepLinkButton/DeepLinkButton.module.css";

export default function SSICredentialVerifyRequestPage(): React.ReactElement | null {
    const ecosystem = useEcosystem()
    const flowRouter = useFlowRouter<SSICredentialVerifyRequestPageConfig>()
    const pageConfig = flowRouter.getPageConfig()
    const {t} = useTranslation()
    const credentialName = useEcosystem().getGeneralConfig().credentialName
    const [deepLink, setDeepLink] = useState<string>('')
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const [webWalletAddressValue, setWebWalletAddressValue] = useState<string>();

    const location = useLocation();
    const state = location.state
    const {pd} = state

    const onWebWalletAddressChange = (value: FormFieldValue) => {
        setWebWalletAddressValue(('' + value).trim());
    };

    const onWebWalletAddressClick = (): void => {
        if (!webWalletAddressValue) {
            throw new Error('Web wallet address must not be empty');
        }

        window.location.href = mergeQueryParams(webWalletAddressValue, deepLink.toString());
    };


    const onSignInComplete = async (data: AuthorizationResponsePayload): Promise<void> => {
        const state = {
            data: {
                vp_token: data.vp_token
            }
        };
        await flowRouter.nextStep(state)
    }

    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: pageConfig.leftPaneWidth ?? 'auto',
                    height: pageConfig.leftPaneWidth ? '100%' : 'auto',
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
          <div style={{
              ...(pageConfig.rightPaneGrid?.style),
              display: 'flex',
              flexDirection: 'column',
              alignItems: "center",
              flexGrow: 1,
              gap: 50,
              ...(isTabletOrMobile && { gap: 24, ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) }),
          }}>
              {(isTabletOrMobile && pageConfig?.mobile?.logo) &&
                  <img
                      src={`${pageConfig.mobile?.logo?.src}`}
                      alt={`${pageConfig.mobile?.logo?.alt}`}
                      width={pageConfig.mobile?.logo?.width ?? 150}
                      height={pageConfig.mobile?.logo?.height ?? 150}
                  />
              }
            {!!pageConfig.rightPaneLeftPane?.qrCode?.topTitle && (<div style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: isTabletOrMobile ? 'auto' : '5%',
                maxHeight: '300px'
              }}>
                <Text style={{ textAlign: 'center' }}
                      className={style.pReduceLineSpace}
                      h2Style={pageConfig.rightPaneLeftPane.qrCode.topTitle.h2Style}
                      pStyle={pageConfig.rightPaneLeftPane.qrCode.topTitle.pStyle}
                      title={pageConfig.rightPaneLeftPane.qrCode.topTitle.value ? t(pageConfig.rightPaneLeftPane.qrCode.topTitle.value).split('\n')
                          : t('credential_verify_request_right_pane_top_title', {credentialName}).split('\n')}

                      lines={pageConfig.rightPaneLeftPane.qrCode.topDescription ? t(pageConfig.rightPaneLeftPane.qrCode.topDescription, {credentialName, purpose: pd.purpose}).split('\n')
                          : t('credential_verify_request_right_pane_top_paragraph', {credentialName}).split('\n')}/>
              </div>)}
            {!(!!pageConfig.rightPaneLeftPane?.qrCode?.topTitle) && <div style={{
                    display: 'flex',
                    flexGrow: 1,
                    flexDirection: 'column',
                    maxHeight: 300,
                    textAlign: 'center',
                }}
              >
                  <div
                      style={{
                          marginTop: 'auto',
                          fontSize: 72,// FIXME design says 48, but 48 is way to small for some reason so upping the size here
                          fontWeight: 600,
                          color: "#424242",
                      }}
                  >
                      {t('ssi_welcome_label')}
                  </div>
              </div>
              }
              <div style={{maxHeight: 356, width: '100%', display: 'flex', flexDirection: 'row', flexGrow: 1, ...(!!pageConfig.rightPaneLeftPane?.qrCode?.topTitle && { marginBottom: '31%'}), ...(isTabletOrMobile && pageConfig.mobile?.qrCode?.rootContainer?.style)}}>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, ...(isTabletOrMobile && { gap: 24, ...(pageConfig.mobile?.qrCode?.container?.style) })}}>
                    <div style={{...(isTabletOrMobile && { textAlign: 'center' })}}>
                          <NonMobileOS>
                              <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', ...(!!pageConfig.rightPaneLeftPane?.qrCode?.topTitle && { height: '100%', marginTop: '4%'})}}>
                                  {/*Whether the QR code is shown (mobile) is handled in the component itself */}
                                  {<MemoizedAuthenticationQR ecosystem={ecosystem}
                                                             fgColor={pageConfig.rightPaneLeftPane?.qrCode?.fgColor ?? 'rgba(50, 57, 72, 1)'}
                                                             width={pageConfig.rightPaneLeftPane?.qrCode?.width ?? 300}
                                                             vpDefinitionId={pd.id ?? flowRouter.getVpDefinitionId()}
                                                             onAuthRequestRetrieved={console.log}
                                                             onSignInComplete={onSignInComplete}
                                                             setQrCodeData={setDeepLink}/>}
                              </div>
                              <div style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  verticalAlign: 'bottom',
                                  alignItems: 'flex-end',
                                  justifyContent: 'center'
                              }}>
                                  <InputField
                                      label={t('web_wallet_address')!}
                                      type={'text'}
                                      inlineStyle={{marginRight: '4px'}}
                                      labelStyle={{textAlign: 'left'}}
                                      onChange={async (value: FormFieldValue): Promise<void> => onWebWalletAddressChange(value)}
                                  />
                                  <SSIPrimaryButton
                                      caption={t('go')}
                                      style={{width: 87, ...styles}}
                                      onClick={onWebWalletAddressClick}
                                      disabled={webWalletAddressValue === undefined
                                          || webWalletAddressValue.length === 0
                                          || !urlRegex.test(webWalletAddressValue)}/>
                              </div>
                          </NonMobileOS>
                          <MobileOS>
                              {<MemoizedAuthenticationQR ecosystem={ecosystem}
                                                         vpDefinitionId={pd.id ?? flowRouter.getVpDefinitionId()}
                                                         onAuthRequestRetrieved={console.log}
                                                         onSignInComplete={onSignInComplete}
                                                         setQrCodeData={setDeepLink}/>}
                              <div style={{gap: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden'}}>
                                  { pageConfig.mobile?.image &&
                                      <img src={`${pageConfig.mobile?.image}`} alt="success" style={{overflow: 'hidden'}}/>
                                  }
                                  <DeepLinkButton style={{flexGrow: 1}} link={deepLink}/>
                              </div>
                          </MobileOS>
                          <Mobile>
                              <div style={{ display: 'none', ...(pageConfig.mobile?.qrCode?.bottomText?.style) }}></div>
                              <Text style={{flexGrow: 1}} className={`${style.pReduceLineSpace} ${ pageConfig.mobile?.qrCode?.bottomText?.className ?? 'poppins-semi-bold-16' }`}
                                    pStyle={pageConfig.mobile?.qrCode?.bottomText?.pStyle}
                                    lines={t(pageConfig.mobile?.qrCode?.bottomText?.paragraph ?? 'credential_verify_request_right_pane_bottom_paragraph_mobile').split('\n')}
                              />
                          </Mobile>
                          <NonMobile>
                              <Text style={{flexGrow: 1, color: `${pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.fontColor}`, ...(!!pageConfig.rightPaneLeftPane?.qrCode?.topTitle && { marginTop: '12%' })}}
                                    pStyle={pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.pStyle}
                                    className={`${style.pReduceLineSpace} ${pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.className ?? 'poppins-semi-bold-16'}`}
                                    title={pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.credential_verify_request_right_pane_bottom_title ? t(`${pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.credential_verify_request_right_pane_bottom_title}`).split('\n') : []}
                                    lines={t(`${pageConfig.rightPaneLeftPane?.qrCode?.bottomText?.credential_verify_request_right_pane_bottom_paragraph}`).split('\n')}
                              />
                          </NonMobile>
                      </div>
                  </div>
                  {(pageConfig.mostRightPanel && !isTabletOrMobile) &&
                      <div style={{display: 'flex', flexDirection: 'row', flexGrow: 1, maxWidth: 350}}>
                          {pageConfig.mostRightPanel?.separator &&
                              <img src={`${pageConfig.mostRightPanel?.separator?.logo?.src}` }
                                   alt={`${pageConfig.mostRightPanel?.separator?.logo?.alt}` }
                                   width={`${pageConfig.mostRightPanel?.separator?.logo?.width}`}
                                   height={`${pageConfig.mostRightPanel?.separator?.logo?.height}`}
                              />
                          }
                          <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center', paddingTop: 55, gap: 65}}>
                              {pageConfig.mostRightPanel &&
                                  <img
                                      src={`${pageConfig.mostRightPanel?.logo?.src}`}
                                      alt={`${pageConfig.mostRightPanel?.logo?.alt}`}
                                      width={`${pageConfig.mostRightPanel?.logo?.width}`}
                                      height={`${pageConfig.mostRightPanel?.logo?.height}`}
                                  />
                              }
                              <SSIPrimaryButton
                                  caption={t('ssi_download_app_button')}
                                  style={{
                                      backgroundColor: '#312B78',
                                      color: '#FFFFFF',
                                      height: 32,
                                  }}
                                  onClick={async (): Promise<void> => {
                                      if (pageConfig.downloadAppStepId) {
                                          await flowRouter.goToStep(pageConfig.downloadAppStepId)
                                      }
                                  }}
                              />
                          </div>
                      </div>
                  }
              </div>
        </div>
      </div>
    )
}

const urlRegex = /^(https?:\/\/)(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost|([a-z\d]([a-z\d-]*[a-z\d])?\.local)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

function mergeQueryParams(url1: string, url2: string) {
    if (!urlRegex.test(url1)) {
        throw new Error('Web wallet address must be a valid https:// url');
    }
    // Extract the base URL and any existing query parameters from webWalletAddressValue
    const webWalletUrl = new URL(url1);
    const walletParams = new URLSearchParams(webWalletUrl.search);

    // Extract the query parameters from qrData.object
    const queryParamsStartIndex = url2.indexOf('?');
    const qrParams = new URLSearchParams(url2.substring(queryParamsStartIndex));

    // Merge parameters: qrParams will overwrite existing params in walletParams
    qrParams.forEach((value, key) => {
        walletParams.set(key, value);
    });

    webWalletUrl.search = walletParams.toString();
    return webWalletUrl.toString();
}
