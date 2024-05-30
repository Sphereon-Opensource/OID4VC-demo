import React, {useEffect, useState} from 'react'
import {CredentialMiniCardView} from '@sphereon/ui-components.ssi-react'
import {useTranslation} from 'react-i18next'
import {Mobile, NonMobile} from "../../index"
import {useMediaQuery} from "react-responsive"
import {useFlowRouter} from "../../router/flow-router"
import {SSIPresentationsLandingPageConfig} from "../../ecosystem/ecosystem-config"
import {useEcosystem} from "../../ecosystem/ecosystem";
import {PresentationDefinitionItem} from "@sphereon/ssi-sdk.data-store";
import {ImageProperties} from "../../types";

type PDWithBranding = PresentationDefinitionItem & {
    branding: { backgroundColor?: string, backgroundImage?: string, logo?: ImageProperties }
}

const SSIPresentationsLandingPage: React.FC = () => {
    const {t} = useTranslation()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const flowRouter = useFlowRouter<SSIPresentationsLandingPageConfig>()
    const pageConfig= flowRouter.getPageConfig()
    const [presentationDefinitions, setPresentationDefinitions] = useState<Array<PDWithBranding>>([])
    const ecosystem = useEcosystem()

    useEffect((): void => {
        ecosystem.getAgent().pdmGetDefinitions()
            .then((pds) => {

                const pdWithBrandingMap = pds.map(pd => {
                    const ssiPDCardConfig = pageConfig.presentationDefinitions
                        .find(value => value.id === pd.definitionId)
                    const pdWithBranding: PDWithBranding = {
                        ...pd,
                        branding: {
                            ...(ssiPDCardConfig && {
                                backgroundColor: ssiPDCardConfig.backgroundColor,
                                backgroundImage: ssiPDCardConfig.backgroundImage,
                                logo: ssiPDCardConfig.logo
                            })
                        }
                    };
                    return pdWithBranding
                })
                setPresentationDefinitions(pdWithBrandingMap);
            })
    }, []);

    const handlePresentationDefinitionClick = async (pdDefinitionItem: PresentationDefinitionItem)=> {
        await flowRouter.nextStep({pd: pdDefinitionItem.definitionPayload})
    }

    return (
        <div style={{
            display: 'flex',
            alignContent: 'center',
            flex: 1,
            height: '100vh',
        }}>
            <NonMobile>
                <div id={"photo"} style={{
                    display: 'flex',
                    width: pageConfig.leftPaneWidth ?? 'auto',
                    height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                    flexDirection: 'column',
                    alignItems: 'center',
                    ...(pageConfig.backgroundColor && {backgroundColor: pageConfig.backgroundColor}),
                    ...(pageConfig.logo && {justifyContent: pageConfig.logo.justifyContent ??'center'})
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
                width: isTabletOrMobile ? '100%' : '65%',
                height: isTabletOrMobile ? '90%' : '60%',
                display: 'grid'
            }}>
                <div style={{
                    margin: 'auto',
                    gap: isTabletOrMobile ? 28 : 65,
                    flexDirection: 'column',
                    display: 'flex',
                    width: '70%',
                    height: '60%',
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
                            <span style={{fontSize: '11px'}} dangerouslySetInnerHTML={{ __html: t(pageConfig.text) ?? ''}}></span>
                        </Mobile>
                        <NonMobile>
                            <span style={{fontWeight: '600', fontSize: '32px'}}>{t(pageConfig.pageTitle)}</span><br/>
                            <span style={{fontSize: '20px'}} dangerouslySetInnerHTML={{ __html: t(pageConfig.text) ?? ''}} ></span>
                        </NonMobile>
                    </div>
                    {presentationDefinitions.map(pdItem => (
                        <div onClick={() => handlePresentationDefinitionClick(pdItem)}>
                            <Mobile>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-evenly',
                                    alignContent: 'space-between',
                                    cursor: 'pointer'
                                }}>
                                    <CredentialMiniCardView
                                        backgroundImage={{uri: pdItem.branding?.backgroundImage}}
                                        backgroundColor={pdItem.branding?.backgroundColor}
                                        logo={{
                                            uri: pdItem.branding?.logo?.src,
                                            ...((pdItem.branding?.logo?.height && pdItem.branding?.logo?.width) && {
                                                dimensions: {
                                                    height: pdItem.branding?.logo?.height,
                                                    width: pdItem.branding?.logo?.width,
                                                }
                                            }),
                                            style: {
                                                height: 10
                                            }
                                        }}
                                    />
                                    <div style={{width: 200, paddingLeft: '5px'}}>
                                        <span style={{fontSize: '14px', fontWeight: '600'}}>{pdItem.definitionPayload.name}</span><br/>
                                        <span style={{fontSize: '10px'}}>{pdItem.definitionPayload.purpose}</span>
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
                                        backgroundColor={pdItem.branding?.backgroundColor}
                                        backgroundImage={{
                                            uri: pdItem.branding?.backgroundImage
                                        }}
                                        logo={{
                                            uri: pdItem.branding?.logo?.src,
                                            ...((pdItem.branding?.logo?.height && pdItem.branding?.logo?.width) && {
                                                dimensions: {
                                                    height: pdItem.branding?.logo?.height,
                                                    width: pdItem.branding?.logo?.width,
                                                }
                                            }),
                                            style: {
                                                height: 32
                                            }
                                        }}
                                    />
                                    <div style={{width: '450px', textAlign: 'left', paddingLeft: '3%'}}>
                                                                           <span style={{
                                                                               fontSize: '30px',
                                                                               fontWeight: '600',
                                                                               color: '#303030'
                                                                           }}>{pdItem.definitionPayload.name}</span><br/>
                                        <span style={{fontSize: '18px', color: '#303030',}}>{pdItem.definitionPayload.purpose}</span>
                                    </div>
                                </div>
                            </NonMobile>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SSIPresentationsLandingPage;
