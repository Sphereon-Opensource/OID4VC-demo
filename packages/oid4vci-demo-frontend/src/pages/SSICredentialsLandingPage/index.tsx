import React, {ReactElement} from 'react';
import { SSIMiniCardView } from '@sphereon/ui-components.ssi-react';
import {useTranslation} from 'react-i18next';
import {
    getCurrentEcosystemPageOrComponentConfig,
    SSICredentialCardConfig,
    SSICredentialsLandingPageConfig
} from "../../ecosystem-config";
import {Mobile, NonMobile} from "../../index";

function handleCredentialClick(value: SSICredentialCardConfig) {
    window.location.href = value.route
}

const SSICredentialsLandingPage: React.FC = () => {
    const {t} = useTranslation()

    const config: SSICredentialsLandingPageConfig = getCurrentEcosystemPageOrComponentConfig('SSICredentialsLandingPage') as SSICredentialsLandingPageConfig
    return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                alignContent: 'center',
                flex: 1,
                height: '100vh',
            }}>

                <NonMobile>
                    <div id={"photo"} style={{
                        display: 'flex',
                        width: '60%',
                        height: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        ...(config.backgroundColor && { backgroundColor: config.backgroundColor }),
                        ...(config.logo && { justifyContent: 'center' })
                    }}>
                        { config.logo &&
                            <img
                                src={config.logo.src}
                                alt={config.logo.alt}
                                width={config.logo.width}
                                height={config.logo.height}
                            />
                        }
                    </div>
                </NonMobile>
                <div style={{
                    maxWidth: 810,
                    justifyContent: 'space-around',
                    alignContent: 'space-around',
                    flexDirection: 'column',
                    display: 'flex',
                    width: '70%',
                    height: '70%'
                }}>
                    <Mobile>
                        <img
                                src={config.mobile?.logo?.src ?? 'wallets/sphereon_logo.png'}
                                alt={config.mobile?.logo?.alt ?? 'logo'}
                                width={config.mobile?.logo?.width ?? 100}
                                height={config.mobile?.logo?.height ?? 100}
                        />

                    </Mobile>
                    <div style={{display: 'flex', textAlign: 'center', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '300px', marginLeft: 'auto', marginRight: 'auto'}}>
                        <span style={{fontWeight: '600', fontSize: '24px'}}>{t(config.pageTitle)}</span><br/>
                        <span style={{fontSize: '11px'}}>{t(config.text)}</span>
                    </div>
                    {config.credentials.map(value => (
                            <div onClick={()=>handleCredentialClick(value)}>
                                <Mobile>
                                    <div style={{display: 'flex', justifyContent: 'space-evenly', alignContent: 'space-between'}}>
                                         <SSIMiniCardView
                                             style={{
                                                 ...(value.backgroundImage && {background: `url(${value.backgroundImage})`, backgroundSize: 'cover'})
                                             }}
                                             logo={{
                                                 uri: value.logo?.src as string
                                             }}
                                         />
                                        <div style={{width: 200, paddingLeft: '5px'}}>
                                            <span style={{fontSize: '14px', fontWeight: '600'}}>{value.name}</span><br/>
                                            <span style={{fontSize: '10px'}}>{value.description}</span>
                                        </div>
                                    </div>
                                </Mobile>
                                <NonMobile>
                                    <div style={{display: 'flex', textAlign: 'center', alignItems: 'center', justifyContent: 'center'}}>
                                        <SSIMiniCardView
                                                backgroundImage={{uri: value.backgroundImage}}
                                                logo={{
                                                    uri: value.logo?.src,
                                                    ...((value.logo?.height && value.logo?.width) && {
                                                        dimensions: {
                                                            height: value.logo?.height,
                                                            width: value.logo?.width,
                                                        }
                                                    })

                                                }}
                                        />
                                        <div style={{ width: '350px', textAlign: 'left', paddingLeft: '2%'}}>
                                            <span style={{fontSize: '22px', fontWeight: '600', color: '#303030'}}>{value.name}</span><br/>
                                            <span style={{fontSize: '14px', color: '#303030', }}>{value.description}</span>
                                        </div>
                                    </div>
                                </NonMobile>
                            </div>
                    ))}
                </div>
            </div>
    );
};

export default SSICredentialsLandingPage;
