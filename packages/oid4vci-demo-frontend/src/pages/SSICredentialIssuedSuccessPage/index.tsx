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
    const pageConfig = flowRouter.getPageConfig()
    const ecosystem = useEcosystem()
    const generalConfig: EcosystemGeneralConfig = ecosystem.getGeneralConfig();
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const {t} = useTranslation()

  function determineWidth() {
    if(pageConfig.leftPaneWidth && pageConfig.leftPaneWidth.includes('%')) {
      return '100%'
    }
    return isTabletOrMobile ? '100%' : '40%'
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
                display: 'flex',
                width: determineWidth(),
                height: '100%',
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: pageConfig.rightPaneTextHeight ?? '70%',
                    marginTop: pageConfig.rightPaneTextMarginTop ?? '6%',
                    marginBottom: pageConfig.rightPaneTextMarginBottom ?? 0
                }}>
                    <Text
                        style={{
                            whiteSpace: 'pre-line',
                            flexGrow: 1,
                            textAlign: 'center'
                        }}
                        title={t(pageConfig.rightPaneTitle ?? 'credentials_success_right_pane_title', {name: generalConfig.credentialName}).split('\n')}
                        lines={t(pageConfig.rightPaneParagraph ?? 'credentials_success_right_pane_paragraph', {credentialName: generalConfig.credentialName}).split('\r\n')}/>
                    <div style={{
                        width: '342px',
                        height: '397px',
                        flexGrow: 1
                    }}>
                        <img src={pageConfig.photoRight} alt={pageConfig.photoRight ? "success" : ""}/>
                    </div>
                    <div style={{display: 'flex',flexDirection: 'row'}}>
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
    )
}

export default SSICredentialIssuedSuccessPage;
