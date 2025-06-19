import React from 'react'
import {Text} from '../../components/Text'
import {useTranslation} from 'react-i18next'
import {useLocation} from 'react-router-dom'
import SSIPrimaryButton from '../../components/SSIPrimaryButton'

import {NonMobile} from '../..'
import {useMediaQuery} from 'react-responsive'
import {useFlowRouter} from '../../router/flow-router'
import {SSIInformationSharedSuccessPageConfig} from '../../ecosystem/ecosystem-config'
import {useEcosystem} from '../../ecosystem/ecosystem'
import '../../css/typography.css'

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
    const pageConfig: SSIInformationSharedSuccessPageConfig = flowRouter.getPageConfig()
    const generalConfig = useEcosystem().getGeneralConfig()
    const {t} = useTranslation()
    const firstName = state?.payload?.['firstName'] ?? ''

    function determineWidth() {
        if (pageConfig.leftPaneWidth && pageConfig.leftPaneWidth.includes('%')) {
            return '100%'
        }
        return isTabletOrMobile ? '50%' : '40%'
    }

    const onIssueCredential = async (): Promise<void> => await flowRouter.nextStep({
        payload: state?.payload,
        credentialType: generalConfig.issueCredentialType
    })

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            background: '#E2E4FE',
            overflow: 'hidden',
        }}>
            <div style={{
                display: 'flex',
                alignContent: 'center',
                margin: '15px',
                flex: 1,
                backgroundColor: '#FBFBFB',
                borderRadius: '15px',
                borderTopLeftRadius: '15px',
                borderBottomLeftRadius: '15px',
                overflow: 'hidden',
            }}>
                <NonMobile>
                    {state?.isManualIdentification
                        ? <SSIInformationSharedSuccessPageLeftPanel/>
                        : <div id={"photo"} style={{
                            display: 'flex',
                            width: pageConfig.leftPaneWidth ?? 'auto',
                            height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                            flexDirection: 'column',
                            alignItems: 'center',
                            ...((pageConfig.photoLeft) && {background: `url(${pageConfig.photoLeft}) 0% 0% / cover`}),
                            ...(pageConfig.backgroundColor && {backgroundColor: pageConfig.backgroundColor}),
                            ...(pageConfig.logo && {justifyContent: pageConfig.logo.justifyContent ?? 'center'})
                        }}>
                            {pageConfig.logo &&
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
                                <p
                                    className={"poppins-medium-36"}
                                    style={{maxWidth: 735, color: '#FBFBFB', marginTop: "auto", marginBottom: 120, marginLeft: 20}}
                                >
                                    {t(pageConfig.textLeft)}
                                </p>
                            )}
                        </div>
                    }
                </NonMobile>
                <div style={{
                    display: 'flex',
                    flexGrow: 1,
                    width: determineWidth(),
                    alignItems: 'center',
                    flexDirection: 'column',
                    ...(isTabletOrMobile && {height: '100vh'}),
                    ...(isTabletOrMobile && {gap: 24}),
                    ...(!isTabletOrMobile && {justifyContent: 'center', backgroundColor: '#FFFFFF'}),
                }}>
                    {(isTabletOrMobile && pageConfig.mobile?.logo) &&
                        <img
                            src={pageConfig.mobile.logo.src}
                            alt={pageConfig.mobile.logo.alt}
                            width={pageConfig.mobile.logo?.width ?? 150}
                            height={pageConfig.mobile.logo?.height ?? 150}
                        />
                    }
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '83%',
                    }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    whiteSpace: 'pre-line',
                                    textAlign: 'center',
                                    marginBottom: 12
                                }}
                                title={t(pageConfig.topTitle ?? 'sharing_data_success_right_pane_title', {firstName}).split('\n')}
                                lines={t(`${pageConfig.topDescription ?? (pageConfig.textRight && !state?.isManualIdentification ? 'sharing_data_success_right_pane_paragraph_short' : 'sharing_data_success_right_pane_paragraph')}`, {downloadUrl: generalConfig.downloadUrl}).split('\r\n')}
                            />
                        </div>
                        <div style={{
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            width: '90%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '8px',
                            marginBottom: '8px',
                            paddingRight: '25px',
                            paddingLeft: '25px',
                        }}>
                            <div style={{
                                width: '342px',
                                height: '397px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <img
                                    src={pageConfig.photoRight}
                                    alt="success"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <SSIPrimaryButton
                                caption={t(pageConfig.buttonCaption ?? 'label_next')}
                                onClick={async () => await onIssueCredential()}
                            />
                        </div>
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
        return (
            <div id={"photo"} style={{
                display: 'flex',
                width: pageConfig.leftPaneWidth ?? 'auto',
                height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                flexDirection: 'column',
                alignItems: 'center',
                ...((pageConfig.photoLeft || pageConfig.photoLeftManual) && {background: `url(${state?.isManualIdentification ? `${pageConfig.photoLeftManual}` : `${pageConfig.photoLeft}`}) 0% 0% / cover`}),
                ...(pageConfig.backgroundColor && {backgroundColor: pageConfig.backgroundColor}),
                ...(pageConfig.logo && {justifyContent: pageConfig.logo.justifyContent ?? 'center'})
            }}>
                {pageConfig.logo &&
                    <img
                        src={pageConfig.logo.src}
                        alt={pageConfig.logo.alt}
                        width={pageConfig.logo.width}
                        height={pageConfig.logo.height}
                    />
                }
            </div>
        )
    }

    return (
        <div style={{
            maxHeight: "fit-content",
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'url("/mobile_store_background.svg")',
            backgroundSize: 'cover',
            backgroundColor: '#202537'
        }}>
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
        </div>
    )
}

export default SSIInformationSuccessPage;
