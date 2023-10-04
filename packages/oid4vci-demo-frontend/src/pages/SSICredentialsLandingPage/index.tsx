import React from 'react';
import { useNavigate } from 'react-router-dom';
import SSICardView from '../../components/SSICardView';
import {ButtonType} from '../../types';
import {useTranslation} from 'react-i18next';
import {
    getCurrentEcosystemPageOrComponentConfig,
    SSICredentialCardConfig,
    SSICredentialsLandingPageConfig
} from "../../ecosystem-config";
import {useMediaQuery} from "react-responsive";

const SSICredentialsLandingPage: React.FC = () => {
    const {t} = useTranslation()
    const navigate = useNavigate();
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})

    const config = getCurrentEcosystemPageOrComponentConfig('SSICredentialsLandingPage') as SSICredentialsLandingPageConfig

    const onCredentialCardClick = async (value: SSICredentialCardConfig): Promise<void> => {
        navigate(`/credentials/${value.name}`);
    }
    return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100vh',
                // backgroundColor: mainContainerStyle.backgroundColor,
                flexDirection: 'column'
            }}>
                <img
                        style={{marginTop: 116}}
                        src={config.logo?.src}
                        alt={config.logo?.alt ?? 'logo'}
                        width={config.logo?.width ?? 100}
                        height={config.logo?.height ?? 100}
                />
                <div style={{
                    maxWidth: 810,
                    justifyContent: 'space-between',
                    flexDirection: `${isTabletOrMobile ? 'column' : 'row'}`,
                    display: 'flex',
                    width: '100%'
                }}>
                    {config.credentials.map(value => (
                            <SSICardView
                                    title={value.name}
                                    message={value.description?? ''}
                                    image={{
                                        src: `${config.logo?.src}`,
                                        alt: value.name
                                    }}
                                    button={{
                                        caption: t('onboarding_left_card_button_caption'),
                                        onClick: () => onCredentialCardClick(value),
                                        type: ButtonType.SECONDARY,
                                    }}
                            />
                    ))}
                </div>
            </div>
    );
};

export default SSICredentialsLandingPage;
