import React from 'react'
import { Text } from '../../components/Text'
import style from '../../components/Text/Text.module.css'
import { Trans, useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import SSIPrimaryButton from '../../components/SSIPrimaryButton'
import { NonMobile } from '../..'
import { useMediaQuery } from 'react-responsive'
import { useFlowRouter } from '../../router/flow-router'
import { SSIInformationSharedSuccessPageConfig } from '../../ecosystem/ecosystem-config'
import { useEcosystem } from '../../ecosystem/ecosystem'

type State = {
    payload: {
        [x: string]: string
    }
    isManualIdentification: boolean
}

const SSIInformationSuccessPage: React.FC = () => {
    const flowRouter = useFlowRouter<SSIInformationSharedSuccessPageConfig>()
    const location = useLocation();
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const state: State | undefined = location.state;
    const pageConfig = flowRouter.getPageConfig()
    const generalConfig = useEcosystem().getGeneralConfig()
    const {t} = useTranslation()
    const firstName = state?.payload?.['firstName'] ?? ''
    const onIssueCredential = async (): Promise<void> => await flowRouter.nextStep({
        payload: state?.payload,
        credentialType: generalConfig.issueCredentialType
  })
    return (
        <div style={{display: 'flex', flexDirection: 'row', height: '100vh', userSelect: 'none'}}>
            <NonMobile>
                {state?.isManualIdentification
                    ? <SSIInformationSharedSuccessPageLeftPanel/>
                    : <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            ...(pageConfig.photoLeft && {
                                background: `url(${pageConfig.photoLeft})`,
                                backgroundSize: 'cover',
                            }),
                            width: pageConfig.leftPaneWidth ?? 'auto',
                            height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                            alignItems: 'center',
                            ...(pageConfig.backgroundColor && { backgroundColor: pageConfig.backgroundColor }),
                            ...(pageConfig.logo && { justifyContent: 'center' })
                        }}
                    >
                        { pageConfig.logo &&
                            <img
                                src={pageConfig.logo.src}
                                alt={pageConfig.logo.alt}
                                width={pageConfig.logo.width}
                                height={pageConfig.logo.height}
                            />
                        }
                        {pageConfig.sideImage &&
                            <img
                                src={pageConfig.sideImage?.src}
                                alt={pageConfig.sideImage?.alt}
                                width={pageConfig.sideImage?.width}
                                height={pageConfig.sideImage?.height}
                            />
                        }
                        {(pageConfig.textLeft) && (
                            <div style={{marginTop: 'auto', marginBottom: 153}}>
                                <Text
                                    className={`${style.text} poppins-medium-36`}
                                    lines={t(pageConfig.textLeft).split('\n')}
                                />
                            </div>
                        )}
                    </div>
                }
            </NonMobile>
            <div style={{
                display: 'flex',
                width: `${(isTabletOrMobile || pageConfig.sideImage || pageConfig.logo) ? '100%' : '40%'}`,
                height: '100%',
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '70%',
                    marginTop: '6%',
                }}>
                    <Trans>
                        <Text
                            style={{
                                whiteSpace: 'pre-line',
                                flexGrow: 1,
                                textAlign: 'center'
                            }}
                            title={t(pageConfig.topTitle ?? 'sharing_data_success_right_pane_title', {firstName}).split('\n')}
                            lines={t(`${pageConfig.topDescription ?? (pageConfig.textRight && !state?.isManualIdentification? 'sharing_data_success_right_pane_paragraph_short': 'sharing_data_success_right_pane_paragraph')}`, {downloadUrl: generalConfig.downloadUrl}).split('\r\n')}
                        />
                    </Trans>
                    <div style={{
                        width: '342px',
                        height: '397px',
                        flexGrow: 1
                    }}>
                        <img
                            src={pageConfig.photoRight}
                            alt="success"
                        />
                    </div>
                    <div style={{
                        width: '100%',
                        alignSelf: 'flex-end',
                    }}>
                        <SSIPrimaryButton
                            caption={t(pageConfig.buttonCaption ?? 'label_next')}
                            style={{width: '100%'}}
                            onClick={async () => await onIssueCredential()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const SSIInformationSharedSuccessPageLeftPanel: React.FC = () => {
    const ecosystem = useEcosystem()
    const flowRouter = useFlowRouter<SSIInformationSharedSuccessPageConfig>()
    const pageConfig = flowRouter.getPageConfig()
    const location = useLocation();
    const state = location.state;
    const {t} = useTranslation()
    if (ecosystem.getEcosystemId() !== 'sphereon') {
        return (<NonMobile>
                    <div id={"photo"} style={{
                        display: 'flex',
                        width: pageConfig.leftPaneWidth ?? 'auto',
                        height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                        flexDirection: 'column',
                        alignItems: 'center',
                        ...((pageConfig.photoLeft || pageConfig.photoLeftManual) && { background: `url(${state?.isManualIdentification? `${pageConfig.photoLeftManual}` : `${pageConfig.photoLeft}`}) 0% 0% / cover`}),
                        ...(pageConfig.backgroundColor && { backgroundColor: pageConfig.backgroundColor }),
                        ...(pageConfig.logo && { justifyContent: 'center' })
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
        )
    }
    return (<div style={{
        maxHeight: "fit-content",
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'url("/mobile_store_background.svg")',
        backgroundSize: 'cover',
        backgroundColor: '#202537'
    }}
    >
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{
                display: 'flex',
                flex: 1,
                aspectRatio: 1.732710280373832,
                marginLeft: 77,
                marginRight: 77,
                background: 'url("/phone_perspective.svg")',
                backgroundSize: 'cover',
            }}/>
        </div>
        <div style={{
            marginTop: 'auto',
            marginBottom: 74,
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <p
                className={"inter-normal-24 normal-400"}
                style={{
                    color: '#FBFBFB',
                    height: 39,
                    marginBottom: 17,
                }}
            >
                {t('sharing_data_success_get_mobile_app_message')}
            </p>
            <div style={{display: 'flex', flexDirection: 'row', margin: 'auto'}}>
                <a href="https://play.google.com/store/apps/details?id=com.sphereon.ssi.wallet"
                   target="_blank"
                   style={{
                       background: 'url("/google_play.svg")',
                       height: 60,
                       width: 203,
                       marginRight: 9
                   }}
                />
                <a href="https://apps.apple.com/nl/app/sphereon-wallet/id1661096796"
                   target="_blank"
                   style={{
                       background: 'url("/apple_store.svg")',
                       height: 60,
                       width: 203
                   }}/>
            </div>
        </div>
    </div>)
}

export default SSIInformationSuccessPage;
