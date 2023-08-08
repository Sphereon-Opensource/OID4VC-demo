import React from 'react';
import {NavigateOptions, useNavigate} from 'react-router-dom';
import SSICardView from '../../components/SSICardView';
import {ButtonType} from '../../types';
import {useTranslation} from 'react-i18next';
import {
    getCurrentEcosystemGeneralConfig,
    getCurrentEcosystemPageOrComponentConfig,
    SSILandingPageConfig
} from "../../ecosystem-config";
import {useMediaQuery} from "react-responsive";

const SSILandingPage: React.FC = () => {
    const {t} = useTranslation()
    const navigate = useNavigate();
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})

    const onManualIdentificationClick = async (): Promise<void> => {
      const params = {isManualIdentification: true}
      navigate('/information/request', params as NavigateOptions);
    }

    const onWalletIdentificationClick = async (): Promise<void> => {
        navigate({pathname: '/credentials/verify/request'});
    }

    const config = getCurrentEcosystemPageOrComponentConfig('SSILandingPage') as SSILandingPageConfig
    const generalConfig = getCurrentEcosystemGeneralConfig()
    const mainContainerStyle = config.styles!.mainContainer
    const leftCardViewConfig = config.styles!.leftCardView
    const rightCardViewConfig = config.styles!.rightCardView
    const optionalLeftCardViewProps = {
        ...(leftCardViewConfig.textColor && {textColor: leftCardViewConfig.textColor}),
        ...(leftCardViewConfig.backgroundColor && {backgroundColor: leftCardViewConfig.backgroundColor})
    }
    const optionalRightCardViewProps = {
        ...(rightCardViewConfig.textColor && {textColor: rightCardViewConfig.textColor}),
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
                maxWidth: 810,
                justifyContent: 'space-between',
                flexDirection: `${isTabletOrMobile ? 'column' : 'row'}`,
                display: 'flex',
                width: '100%'
            }}>
                <SSICardView
                    title={t('onboarding_left_card_title')}
                    message={t('onboarding_left_card_paragraph', {credentialName: generalConfig.credentialName})}
                    image={{
                        src: `${config.photoLeft}`,
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
                        src: `${config.photoRight}`,
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
                style={{marginTop: 116}}
                src={config.logo.src}
                alt={config.logo.alt}
                width={config.logo.width}
                height={config.logo.height}
            />
        </div>
    );
};

export default SSILandingPage;
