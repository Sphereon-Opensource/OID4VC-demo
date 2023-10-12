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

    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: '60%',
                    height: '100%',
                    background: `url(${pageConfig.photoLeft})`,
                    backgroundSize: 'cover',
                    flexDirection: 'column'
                }}>
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '70%',
                    marginTop: '6%'
                }}>
                    <Text
                        style={{
                            whiteSpace: 'pre-line',
                            flexGrow: 1,
                            textAlign: 'center'
                        }}
                        title={t('credentials_success_right_pane_title', {name: generalConfig.credentialName}).split('\n')}
                        lines={t('credentials_success_right_pane_paragraph', {credentialName: generalConfig.credentialName}).split('\r\n')}/>
                    <div style={{
                        width: '342px',
                        height: '397px',
                        flexGrow: 1
                    }}>
                        <img src={pageConfig.photoRight} alt="success"/>
                    </div>
                    <div style={{display: 'flex',flexDirection: 'row'}}>
                        <SSIPrimaryButton
                            caption={t('credentials_success_right_pane_button_caption', {verifierUrlCaption: generalConfig.verifierUrlCaption ?? 'start'})}
                            // style={{width: '250px'}}
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
