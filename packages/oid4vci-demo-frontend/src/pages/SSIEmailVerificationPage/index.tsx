import React, {ReactElement} from 'react'
import {useMediaQuery} from 'react-responsive'
import {useTranslation} from 'react-i18next'
import {useFlowRouter} from '../../router/flow-router'
import {SSIVerifyEmailPageConfig} from '../../ecosystem/ecosystem-config'
import {NonMobile} from '../../index'
import style from './index.module.css'
import SSIPrimaryButton from "../../components/SSIPrimaryButton"
import VerificationCodeField from "../../components/VerificationCodeField"


const SSIEmailVerificationPage: React.FC = (): ReactElement => {
    const {t} = useTranslation()
    const flowRouter = useFlowRouter<SSIVerifyEmailPageConfig>()
    const pageConfig = flowRouter.getPageConfig()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})

    return <div style={{
        display: 'flex',
        height: "100vh",
        width: '100vw', ...(isTabletOrMobile && {overflowX: "hidden", ...(pageConfig.mobile?.backgroundColor && {backgroundColor: pageConfig.mobile.backgroundColor})})
    }}>
        <NonMobile>
            <div id={"photo"}
                 style={{
                     display: 'flex',
                     width: pageConfig.leftPaneWidth ?? 'auto',
                     height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                     flexDirection: 'column',
                     alignItems: 'center',
                     ...(pageConfig.backgroundColor && {backgroundColor: pageConfig.backgroundColor}),
                     ...(pageConfig.logo && {justifyContent: pageConfig.logo.justifyContent ?? 'center'})
                 }}
            >
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
        <div className={style.rightPanel}
             style={{
                 ...(isTabletOrMobile && {gap: 24, ...(pageConfig.mobile?.backgroundColor && {backgroundColor: pageConfig.mobile.backgroundColor})}),
                 ...(!isTabletOrMobile && {justifyContent: 'center', backgroundColor: '#FFFFFF'})
             }}>
            <div className={style.contentContainer}>
                <div className={style.captionContainer}>
                    <div className={style.mainTitle}>{t(pageConfig.rightPaneTitle)}</div>
                    <div className={style.description}>{t(pageConfig.rightPaneParagraph)}</div>
                </div>
                <div className={style.bottomWrapper}>
                    <div className={style.verificationContainer}>
                        <div className={style.subTitle}>{t(pageConfig.verifyDigitsTitle)}</div>
                        <div className={style.spacer}></div>
                        <VerificationCodeField length={pageConfig.numberOfDigits ?? 5}
                                               onComplete={async () => pageConfig.primaryButtonStepId
                                                   ? await flowRouter.goToStep(pageConfig.primaryButtonStepId)
                                                   : await flowRouter.nextStep()
                                               }/>
                    </div>
                    <SSIPrimaryButton
                        caption={t(pageConfig.primaryButtonResourceId ?? 'label_continue')}
                        style={{width: 327}}
                        onClick={async () => pageConfig.primaryButtonStepId
                            ? await flowRouter.goToStep(pageConfig.primaryButtonStepId)
                            : await flowRouter.nextStep()}
                    />
                </div>
            </div>
        </div>
    </div>
}

export default SSIEmailVerificationPage
