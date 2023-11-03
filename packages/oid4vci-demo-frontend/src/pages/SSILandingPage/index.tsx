import React from 'react'
import {ButtonType} from '../../types'
import {useTranslation} from 'react-i18next'
import {useMediaQuery} from "react-responsive"
import {useFlowRouter} from "../../router/flow-router"
import {SSILandingPageConfig} from "../../ecosystem/ecosystem-config"
import {useEcosystem} from "../../ecosystem/ecosystem"
import SSICardView from "../../components/SSICardView"

const SSILandingPage: React.FC = () => {
    const {t} = useTranslation()
    const flowRouter = useFlowRouter<SSILandingPageConfig>()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const pageConfig = flowRouter.getPageConfig()
    const generalConfig = useEcosystem().getGeneralConfig()
    const mainContainerStyle = pageConfig.styles!.mainContainer
    const leftCardViewConfig = pageConfig.styles!.leftCardView
    const rightCardViewConfig = pageConfig.styles!.rightCardView
    const optionalLeftCardViewProps = {
        ...(leftCardViewConfig.textColor && {textColor: leftCardViewConfig.textColor}),
        ...(leftCardViewConfig.backgroundColor && {backgroundColor: leftCardViewConfig.backgroundColor})
    }
    const optionalRightCardViewProps = {
        ...(rightCardViewConfig.textColor && {textColor: rightCardViewConfig.textColor}),
    }

    const onManualIdentificationClick = async (): Promise<void> => {
        await flowRouter.goToStep('infoRequest')
    }

    const onWalletIdentificationClick = async (): Promise<void> => {
      const nextId = flowRouter.getNextId();
      await flowRouter.goToStep(nextId || 'verifyRequest');
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100vh',
            backgroundColor: mainContainerStyle.backgroundColor,
            flexDirection: 'column'
        }}>
            <div style={{
                maxWidth: isTabletOrMobile ? 405 : 810,
                justifyContent: 'space-between',
                alignContent: 'center',
                flexDirection: `${isTabletOrMobile ? 'column' : 'row'}`,
                display: 'flex',
                width: '100%'
            }}>
                <SSICardView
                    title={t('onboarding_left_card_title')}
                    message={t('onboarding_left_card_paragraph', {credentialName: generalConfig.credentialName})}
                    image={{
                        src: `${pageConfig.photoLeft}`,
                        alt: 'manually'
                    }}
                    button={{
                        caption: t('onboarding_left_card_button_caption'),
                        onClick: onManualIdentificationClick,
                        type: ButtonType.SECONDARY,
                    }}
                    {...optionalLeftCardViewProps}
                />

                <SSICardView
                    title={t('onboarding_right_card_title')}
                    message={t('onboarding_right_card_paragraph', {credentialName: generalConfig.credentialName})}
                    image={{
                        src: `${pageConfig.photoRight}`,
                        alt: 'wallet'
                    }}
                    button={{
                        caption: t('onboarding_right_card_button_caption'),
                        onClick: onWalletIdentificationClick,
                        type: `${rightCardViewConfig.buttonType}` as ButtonType,
                    }}
                    {...optionalRightCardViewProps}
                />

            </div>
            <img
                style={{marginTop: isTabletOrMobile ? 10 : 116}}
                src={pageConfig.logo.src}
                alt={pageConfig.logo.alt}
                width={pageConfig.logo.width}
                height={pageConfig.logo.height}
            />
        </div>
    );
};

export default SSILandingPage;
