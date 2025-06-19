import React from "react"
import {Text} from "../../components/Text"
import {useTranslation} from "react-i18next"
import SSIPrimaryButton from '../../components/SSIPrimaryButton'
import {NonMobile} from "../../index"
import {useMediaQuery} from "react-responsive"
import {useFlowRouter} from "../../router/flow-router"
import {useEcosystem} from "../../ecosystem/ecosystem"
import {EcosystemGeneralConfig, SSICredentialIssuedSuccessPageConfig} from "../../ecosystem/ecosystem-config"

const SSICredentialIssuedSuccessPage: React.FC = () => {
    const flowRouter = useFlowRouter<SSICredentialIssuedSuccessPageConfig>()
    const pageConfig: SSICredentialIssuedSuccessPageConfig = flowRouter.getPageConfig()
    const ecosystem = useEcosystem()
    const generalConfig: EcosystemGeneralConfig = ecosystem.getGeneralConfig();
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const {t} = useTranslation()

    function determineWidth() {
        if (pageConfig.leftPaneWidth && pageConfig.leftPaneWidth.includes('%')) {
            return '100%'
        }
        return isTabletOrMobile ? '50%' : '40%'
    }

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
                    <div id={"photo"} style={{
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
                    </div>
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
                                ...(pageConfig.rightPaneTextHeight && {height: pageConfig.rightPaneTextHeight}),
                                ...(pageConfig.rightPaneTextMarginTop && {marginTop: pageConfig.rightPaneTextMarginTop}),
                                ...(pageConfig.rightPaneTextMarginBottom && {marginBottom: pageConfig.rightPaneTextMarginBottom}),
                            }}
                        >
                            <Text
                                style={{
                                    whiteSpace: 'pre-line',
                                    textAlign: 'center',
                                    marginBottom: 12
                                }}
                                title={t(pageConfig.rightPaneTitle ?? 'credentials_success_right_pane_title', {name: generalConfig.credentialName}).split('\n')}
                                lines={t(pageConfig.rightPaneParagraph ?? 'credentials_success_right_pane_paragraph', {credentialName: generalConfig.credentialName}).split('\r\n')}
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
                                    alt={pageConfig.photoRight ? "success" : ""}
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
                                caption={t(pageConfig.rightPaneButtonCaption ?? 'credentials_success_right_pane_button_caption', {verifierUrlCaption: generalConfig.verifierUrlCaption ?? 'start'})}
                                style={{
                                    width: pageConfig.rightPaneButtonWidth ?? '300px',
                                    height: pageConfig.rightPaneButtonHeight ?? '42px'
                                }}
                                onClick={async () => {
                                    pageConfig.rightPaneButtonStepId && await flowRouter.goToStep(pageConfig.rightPaneButtonStepId)
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SSICredentialIssuedSuccessPage;
