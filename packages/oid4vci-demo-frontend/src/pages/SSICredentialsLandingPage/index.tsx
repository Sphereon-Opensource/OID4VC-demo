import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SSIMiniCardView } from '@sphereon/ui-components.ssi-react';
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

    const config: SSICredentialsLandingPageConfig = getCurrentEcosystemPageOrComponentConfig('SSICredentialsLandingPage') as SSICredentialsLandingPageConfig
    const onCredentialCardClick = async (value: SSICredentialCardConfig): Promise<void> => {
        navigate(`/credentials/${value.name}`);
    }
    console.log(config)
    return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100vh',
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
                            <SSIMiniCardView
                                    backgroundImage={{uri: value.backgroundImage as string}}
                                    logo={{uri: value.logo?.src as string}}
                            />
                    ))}
                </div>
            </div>
    );
};

export default SSICredentialsLandingPage;
