import React from 'react'
import {CredentialMiniCardView} from '@sphereon/ui-components.ssi-react'
import {useTranslation} from 'react-i18next'
import {Mobile, NonMobile} from "../../index"
import {useMediaQuery} from "react-responsive"
import {useFlowRouter} from "../../router/flow-router"
import {SSICredentialCardConfig, SSICredentialsLandingPageConfig} from "../../ecosystem/ecosystem-config"


const SSICredentialsLandingPage: React.FC = () => {
    const {t} = useTranslation()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const flowRouter = useFlowRouter<SSICredentialsLandingPageConfig>()
    const pageConfig = flowRouter.getPageConfig()

    const handleCredentialClick = async (config: SSICredentialCardConfig)=> {
        if(config.route) {
            window.location.href = config.route
        } else {
            await flowRouter.nextStep({payload: {selectedCredentialId: config.id}})
        }
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
                        ...(pageConfig.photoLeft && { background: `url(${pageConfig.photoLeft}) 0% 0% / contain no-repeat`}),
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
                    margin: 'auto',
                    gap: isTabletOrMobile ? 28 : 65,
                    flexDirection: 'column',
                    display: 'flex',
                    width: '70%',
                    height: '83%',
                    alignItems: 'center'
                }}>
                    <Mobile>
                        <img
                            style={{marginBottom: 30}}
                            src={pageConfig.mobile?.logo?.src ?? 'wallets/sphereon_logo.png'}
                            alt={pageConfig.mobile?.logo?.alt ?? 'logo'}
                            width={pageConfig.mobile?.logo?.width ?? 100}
                            height={pageConfig.mobile?.logo?.height ?? 100}
                        />
                    </Mobile>
                    <div style={{
                        display: 'flex',
                        alignSelf: 'stretch',
                        textAlign: isTabletOrMobile ? 'left' : 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        width: `${isTabletOrMobile ? '300px' : '620px'}`,
                        margin: 'auto'
                    }}>
                        <Mobile>
                            <span style={{fontWeight: '600', fontSize: '24px', width: '100%'}}>{t(pageConfig.pageTitle)}</span><br/>
                            <span style={{fontSize: '11px'}} dangerouslySetInnerHTML={{__html: t(pageConfig.text) ?? ''}}></span>
                        </Mobile>
                        <NonMobile>
                            <span style={{fontWeight: '600', fontSize: '32px'}}>{t(pageConfig.pageTitle)}</span><br/>
                            <span style={{fontSize: '20px'}} dangerouslySetInnerHTML={{__html: t(pageConfig.text) ?? ''}}></span>
                        </NonMobile>
                    </div>
                    <div style={{
                        width: isTabletOrMobile ? '100%' : '100%',
                        height: isTabletOrMobile ? '90%' : '90%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-evenly',
                        overflow: 'auto',
                        gap: '20px',
                    }}>

                        {pageConfig.credentials.map(value => (
                            <div onClick={() => handleCredentialClick(value)}>
                                <Mobile>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-evenly',
                                        alignContent: 'space-between',
                                        cursor: 'pointer'
                                    }}>
                                        <CredentialMiniCardView
                                            backgroundImage={{uri: value.backgroundImage}}
                                            backgroundColor={value.backgroundColor}
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
                                        <div style={{width: 200, paddingLeft: '5px'}}>
                                            <span style={{fontSize: '10px'}}>{value.description}</span><br/>
                                            <span style={{fontSize: '14px', fontWeight: '600'}}>{value.name}</span>
                                        </div>
                                    </div>
                                </Mobile>
                                <NonMobile>
                                    <div style={{
                                        display: 'flex',
                                        textAlign: 'center',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}>
                                        <CredentialMiniCardView
                                            style={{width: 140, height: 90}}
                                            backgroundColor={value.backgroundColor}
                                            backgroundImage={{
                                                uri: value.backgroundImage
                                            }}
                                            logo={{
                                                uri: value.logo?.src,
                                                ...((value.logo?.height && value.logo?.width) && {
                                                    dimensions: {
                                                        height: value.logo?.height,
                                                        width: value.logo?.width,
                                                    }
                                                }),
                                                style: {
                                                    height: value.logo?.height,
                                                }

                                            }}
                                        />
                                        <div style={{width: '50%', textAlign: 'left', paddingLeft: '3%'}}>
                                            <span style={{fontSize: '18px', color: '#303030',}}>{value.description}</span><br/>
                                            <span style={{
                                                fontSize: '30px',
                                                fontWeight: '500',
                                                color: '#303030'
                                            }}>{value.name}</span>
                                        </div>
                                    </div>
                                </NonMobile>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SSICredentialsLandingPage;
