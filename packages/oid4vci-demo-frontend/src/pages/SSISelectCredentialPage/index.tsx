import React, {ReactElement, useEffect, useState} from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import './index.module.css'
import { MetadataClient } from '@sphereon/oid4vci-client'
import { EndpointMetadataResult } from '@sphereon/oid4vci-common'
import { IBasicCredentialLocaleBranding, IBasicImageDimensions } from '@sphereon/ssi-sdk.data-store'
import { getCredentialBrandings } from '../../utils/mapper/branding/OIDC4VCIBrandingMapper'
import { useTranslation } from "react-i18next"
import { useMediaQuery } from "react-responsive"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper'
import {useFlowRouter} from "../../router/flow-router"
import {SSISelectCredentialPageConfig} from "../../ecosystem/ecosystem-config"
import {useEcosystem} from "../../ecosystem/ecosystem"
import {SSICredentialCardView} from "@sphereon/ui-components.ssi-react"
import {DEV_OVERRIDE_OID4VCI_AGENT_BASE_URL} from "../../environment"

const short = require('short-uuid');

type Payload = Record<string, string>

const SSISelectCredentialPage: React.FC = () => {
    const [endpointMetadata, setEndpointMetadata] = useState<EndpointMetadataResult>()
    const [supportedCredentials, setSupportedCredentials] = useState<Map<string, Array<IBasicCredentialLocaleBranding>>>(new Map())
    const [cardElements, setCardElements] = useState<Array<ReactElement>>([])
    const [payload] = useState<Payload>({})
    const [isManualIdentification] = useState<boolean>(false)
    const flowRouter = useFlowRouter<SSISelectCredentialPageConfig>()
    const pageConfig: SSISelectCredentialPageConfig = flowRouter.getPageConfig()
    const generalConfig = useEcosystem().getGeneralConfig()
    const {t} = useTranslation()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const issuerUrl = DEV_OVERRIDE_OID4VCI_AGENT_BASE_URL ?? generalConfig.oid4vciAgentBaseUrl ?? 'https://ssi.sphereon.com/issuer'

    useEffect((): void => {
        MetadataClient.retrieveAllMetadata(issuerUrl)
        .then(async (metadata: EndpointMetadataResult): Promise<void> => {
            setEndpointMetadata(metadata)
            if (!metadata.credentialIssuerMetadata) {
                return
            }
            getCredentialBrandings(metadata)
            .then((credentialBranding) => setSupportedCredentials(credentialBranding))
        })
    }, []);

    useEffect((): void => {
        const setCards = async (): Promise<void> => {
            const cardElements: Array<ReactElement> = []
            for (const [key, value] of supportedCredentials) {
                cardElements.push(
                    <SwiperSlide>
                        <div
                            key={short.generate()}
                            style={{cursor: 'pointer', width: '325px'}}
                            onClick={() => onSelectCredential(key)}
                        >
                            <SSICredentialCardView
                                header={{
                                    credentialTitle: value[0].alias,
                                    credentialSubtitle: value[0].description,
                                    ...((value[0].logo && value[0].logo.uri) && {
                                        logo: {
                                            ...value[0].logo,
                                            dimensions: await getImageDimensions(value[0].logo.uri)
                                        },
                                    })
                                }}
                                body={{
                                    issuerName: endpointMetadata?.credentialIssuerMetadata?.display?.[0]?.name
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
                    </SwiperSlide>
                )
            }

            setCardElements(cardElements)
        };

        void setCards()
    }, [supportedCredentials]);

    const onSelectCredential = async (credentialType: string): Promise<void> => await flowRouter.nextStep({
        payload,
        isManualIdentification,
        credentialType
    })

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
                resolve({width: image.width, height: image.height})
            }
            image.src = uri
        })
    }


    // @ts-ignore
    return (
        <div
            style={{display: 'flex', flexDirection: 'column', height: '100vh', userSelect: 'none', backgroundColor: pageConfig.styles.mainContainer.backgroundColor, alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'row', maxWidth: isTabletOrMobile ? 327 : 1075, gap: 13, marginTop: isTabletOrMobile ? 25: 244, justifyContent: 'center'}}>
                <p className={'inter-normal-48'} style={{color: '#FBFBFB', alignContent: 'center', textAlign: 'center'}}>{t('select_credential_title1') + ' '}
                <span className={`inter-normal-48`}

                   style={{
                       background: pageConfig.styles.mainContainer.textGradient,
                       backgroundClip: 'text',
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent',
                   }}

                >{t('select_credential_title2') + ' '}</span>
                <span className={'inter-normal-48'} style={{color: '#FBFBFB'}}>{t('select_credential_title3') + ' '}</span>
                <span className={`inter-normal-48`}
                   style={{
                       background: pageConfig.styles.mainContainer.textGradient,
                       backgroundClip: 'text',
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent',
                   }}

                >{t('select_credential_title4')}</span></p>
            </div>

            <div style={{width: '100%', maxWidth: isTabletOrMobile ? 327 : 1075, marginTop: 126}}>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={10}
                    /*navigation={true}*/
                    pagination={{
                        el: '.swiper-sphereon-pagination',
                        clickable: true,
                    }}
                    breakpoints={{
                        325: {
                            slidesPerView: 1,
                            spaceBetween: 0,
                        },
                        650: {
                            slidesPerView: 2,
                            spaceBetween: 10,
                        },
                        975: {
                            slidesPerView: 3,
                            spaceBetween: 40,
                        },
                    }}
                    modules={[Pagination/*, Navigation*/]}

                >
                    {cardElements}
                </Swiper>
            </div>
            <div className="swiper-sphereon-pagination" style={{textAlign: 'center', margin: '20px', marginBottom: '50px'}}/>

            <img
                style={{marginTop: isTabletOrMobile ? 'initial': 'auto', marginBottom: isTabletOrMobile ? 15: 85}}
                src={pageConfig.logo.src}
                alt={pageConfig.logo.alt}
                width={pageConfig.logo.width}
                height={pageConfig.logo.height}
            />
        </div>
    );
}

export default SSISelectCredentialPage
