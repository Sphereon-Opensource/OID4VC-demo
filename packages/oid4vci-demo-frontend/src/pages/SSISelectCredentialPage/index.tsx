import React, {ReactElement, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import ScrollContainer from "react-indiana-drag-scroll";
import {SSICardView} from '@sphereon/ui-components.ssi-react';
import {getCurrentEcosystemPageOrComponentConfig, SSILandingPageConfig} from '../../ecosystem-config';
import {MetadataClient} from '@sphereon/oid4vci-client';
import {
    CredentialsSupportedDisplay,
    EndpointMetadata,
    CredentialSupported
} from '@sphereon/oid4vci-common';
import {IBasicCredentialLocaleBranding, IBasicImageDimensions} from '@sphereon/ssi-sdk.data-store';
import {credentialLocaleBrandingFrom} from '../../utils/mapper/branding/OIDC4VCIBrandingMapper';
import {IOID4VCIClientCreateOfferUriResponse} from "@sphereon/ssi-sdk.oid4vci-issuer-rest-client";
import agent from '../../agent';
import {useTranslation} from "react-i18next";
import {useMediaQuery} from "react-responsive";
import inputStyle from './index.module.css';

const short = require('short-uuid');

type State = {
    firstName: string
    lastName: string
    emailAddress: string
    isManualIdentification: boolean
}

// TODO VDX-250 add branding for the different parties that use this demo. mainly the background color of this page

const SSISelectCredentialPage: React.FC = () => {
    const [endpointMetadata, setEndpointMetadata] = useState<EndpointMetadata>()
    const [supportedCredentials, setSupportedCredentials] = useState<Map<string, Array<IBasicCredentialLocaleBranding>>>(new Map())
    const [cardElements, setCardElements] = useState<Array<ReactElement>>([])
    const navigate = useNavigate();
    const location = useLocation();
    const state: State | undefined = location.state;
    const config: SSILandingPageConfig = getCurrentEcosystemPageOrComponentConfig('SSILandingPage') as SSILandingPageConfig
    const {t} = useTranslation()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})

    useEffect((): void => {
        MetadataClient.retrieveAllMetadata(process.env.REACT_APP_OID4VCI_AGENT_BASE_URL!).then(async (metadata: EndpointMetadata): Promise<void> => {
            setEndpointMetadata(metadata)

            const credentialBranding = new Map<string, Array<IBasicCredentialLocaleBranding>>();
            Promise.all(
                (metadata.issuerMetadata?.credentials_supported as CredentialSupported[]).map(async (metadata: CredentialSupported): Promise<void> => {
                    const localeBranding: Array<IBasicCredentialLocaleBranding> = await Promise.all(
                        (metadata.display ?? []).map(
                            async (display: CredentialsSupportedDisplay): Promise<IBasicCredentialLocaleBranding> =>
                                await credentialLocaleBrandingFrom(display)
                        ),
                    );

                    const credentialTypes: Array<string> =
                        metadata.types.length > 1
                            ? metadata.types.filter((type: string) => type !== 'VerifiableCredential')
                            : metadata.types.length === 0
                                ? ['VerifiableCredential']
                                : metadata.types;

                    credentialBranding.set(credentialTypes[0], localeBranding); // TODO for now taking the first type
                })).then(() => setSupportedCredentials(credentialBranding))
        })
    }, []);

    useEffect((): void => {
        const setCards = async (): Promise<void> => {
            const cardElements: Array<ReactElement> = []
            for (const [key, value] of supportedCredentials) {
                cardElements.push(
                    <div
                        key={short.generate()}
                        style={{cursor: 'pointer'}}
                        onClick={() => onSelectCredential(key)}
                    >
                        <SSICardView
                            header={{
                                credentialTitle: value[0].alias,
                                ...((value[0].logo && value[0].logo.uri) && {
                                    logo: {...value[0].logo,
                                        dimensions: await getImageDimensions(value[0].logo.uri)
                                    },
                                })
                            }}
                            body={{
                                issuerName: endpointMetadata?.issuerMetadata?.display?.[0]?.name
                            }}
                            footer={{
                                expirationDate: getExpirationDate(),
                            }}
                            display={{
                                backgroundColor: value[0].background?.color,
                                backgroundImage: value[0].background?.image,
                                textColor: value[0].text?.color,
                            }}
                        />
                    </div>
                )
            }

            setCardElements(cardElements)
        };

        void setCards()
    }, [supportedCredentials]);

    const onSelectCredential = async (credentialType: string): Promise<void> => {
        const shortUuid = short.generate()
        const uriData: IOID4VCIClientCreateOfferUriResponse = await agent.oid4vciClientCreateOfferUri({
            grants: {
                'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
                    'pre-authorized_code': shortUuid,
                    user_pin_required: false,
                },
            },
            credentialDataSupplierInput: {
                firstName: state?.firstName,
                lastName: state?.lastName,
                email: state?.emailAddress,
            },
            credentials: [credentialType],
        })

        const qrState = {
            uri: uriData.uri,
            preAuthCode: shortUuid,
            isManualIdentification: state?.isManualIdentification,
        };

        navigate('/credentials/issue/request', {state: qrState});
    }

    const getExpirationDate = (): number => {
        const currentDate: Date = new Date();
        const expirationDate: Date = new Date(currentDate);
        expirationDate.setDate(currentDate.getDate() + 30);

        return Math.floor(expirationDate.getTime() / 1000)
    }

    function getImageDimensions(uri: string): Promise<IBasicImageDimensions> {
        return new Promise((resolve): void => {
            const image: HTMLImageElement = new Image()
            image.onload = function (): void {
                resolve({ width: image.width, height: image.height })
            }
            image.src = uri
        })
    }


    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100vh', userSelect: 'none', backgroundColor: '#202537', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'row', gap: 13, marginTop: 244, whiteSpace: 'nowrap'}}>
                <p className={'inter-normal-48'} style={{color: '#FBFBFB'}}>{t('select_credential_title1')}</p>
                <p className={`${inputStyle.gradientText} inter-normal-48`}>{t('select_credential_title2')}</p>
                <p className={'inter-normal-48'} style={{color: '#FBFBFB'}}>{t('select_credential_title3')}</p>
                <p className={`${inputStyle.gradientText} inter-normal-48`}>{t('select_credential_title4')}</p>
            </div>

            <div style={{marginTop: 126}}>
                {/* FIXME type issue */}
                {/*// @ts-ignore*/}
                <ScrollContainer style={{maxWidth: 1031, paddingRight: 50, display: 'flex', cursor: 'grab'}}>
                    <div style={{ gap: 50, display: 'flex', flexDirection: isTabletOrMobile ? 'column' : 'row' }}>
                        {cardElements}
                    </div>
                </ScrollContainer>
            </div>
            <img
                style={{marginTop: 'auto', marginBottom: 85}}
                src={config.logo.src}
                alt={config.logo.alt}
                width={config.logo.width}
                height={config.logo.height}
            />
        </div>
    );
}

export default SSISelectCredentialPage;
