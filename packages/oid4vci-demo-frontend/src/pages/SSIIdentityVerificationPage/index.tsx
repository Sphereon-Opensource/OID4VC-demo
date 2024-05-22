import React, {ReactElement} from 'react';
import {useMediaQuery} from 'react-responsive';
import {useTranslation} from 'react-i18next';
import {useFlowRouter} from '../../router/flow-router';
import {SSIIdentityVerificationPageConfig} from '../../ecosystem/ecosystem-config';
import {NonMobile} from '../../index';
import style from './index.module.css'
import InputField from "../../components/InputField";
import SSIPrimaryButton from "../../components/SSIPrimaryButton";
import {useLocation} from "react-router-dom";

const SSIIdentityVerificationPage: React.FC = (): ReactElement => {
    const {t} = useTranslation()
    const flowRouter = useFlowRouter<SSIIdentityVerificationPageConfig>()
    const pageConfig = flowRouter.getPageConfig();
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const location = useLocation();
    const state = location.state

    const onContinue = async (): Promise<void> => {
        await flowRouter.nextStep(state)
    }

    return <div style={{display: 'flex',  height: "100vh", width: '100vw',  ...(isTabletOrMobile && { overflowX: "hidden", ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) })}}>
        <NonMobile>
            <div id={"photo"}
                 style={{
                    display: 'flex',
                     width: pageConfig.leftPaneWidth ?? 'auto',
                     height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                    flexDirection: 'column',
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
            </div>
        </NonMobile>
        <div className={style.rightPanel}
            style={{
            ...(isTabletOrMobile && { gap: 24, ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) }),
            ...(!isTabletOrMobile && { justifyContent: 'center', backgroundColor: '#FFFFFF' })
        }}>
            <div className={style.contentContainer}>
                <div className={style.caption}>{t(pageConfig.sharing_data_right_pane_title)}</div>
                <div
                    style={{
                        background: `url(/banqup_verify_identity_progress_bar.svg)`,
                        height: 81,
                        width: 613
                    }}
                />
                <div className={style.identityContainer}>
                    <div
                        style={{
                            background: `url(/banqup_verify_identity_id_card.svg)`,
                            height: 331,
                            width: 394
                        }}
                    />
                   <div className={style.identityInformationContainer}>
                       <p className={style.identityInformationCaption}>Recognized data:</p>
                       <div className={style.identityInformationFieldsContainer}>
                           <InputField
                               label={'Issuing country'}
                               type={'text'}
                               defaultValue={'Netherlands'}
                               readonly
                           />
                           <InputField
                               label={'ID number'}
                               type={'text'}
                               defaultValue={'SPECI2021'}
                               readonly
                           />
                           <InputField
                               label={'Expiry date'}
                               type={'text'}
                               defaultValue={'02-08-2031'}
                               readonly
                           />
                       </div>
                   </div>
                </div>
                <SSIPrimaryButton
                    caption={t('label_continue')}
                    onClick={onContinue}
                />
            </div>
        </div>
    </div>
}

export default SSIIdentityVerificationPage;
