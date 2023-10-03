import React, {ReactElement, useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import 'swiper/css'
import 'swiper/css/pagination'
import './index.module.css'
import {SSICardView} from '@sphereon/ui-components.ssi-react'
import {getCurrentEcosystemPageOrComponentConfig, SSISelectCredentialPageConfig} from '../../ecosystem-config'
import {MetadataClient} from '@sphereon/oid4vci-client'
import {
    CredentialsSupportedDisplay,
    CredentialSupported,
    EndpointMetadata,
    EndpointMetadataResult
} from '@sphereon/oid4vci-common'
import {IBasicCredentialLocaleBranding, IBasicImageDimensions} from '@sphereon/ssi-sdk.data-store'
import {credentialLocaleBrandingFrom} from '../../utils/mapper/branding/OIDC4VCIBrandingMapper'
import {IOID4VCIClientCreateOfferUriResponse} from "@sphereon/ssi-sdk.oid4vci-issuer-rest-client"
import agent from '../../agent'
import {useTranslation} from "react-i18next"
import {useMediaQuery} from "react-responsive"
import {Swiper, SwiperSlide} from 'swiper/react'
import {Pagination} from 'swiper'
import {Sequencer} from "../../router/sequencer"

const short = require('short-uuid')

type State = {
    firstName: string
    lastName: string
    emailAddress: string
    isManualIdentification: boolean
}

const SSISelectCredentialPage: React.FC = () => {
    const [endpointMetadata, setEndpointMetadata] = useState<EndpointMetadataResult>()
    const [supportedCredentials, setSupportedCredentials] = useState<Map<string, Array<IBasicCredentialLocaleBranding>>>(new Map())
    const [cardElements, setCardElements] = useState<Array<ReactElement>>([])
    const [sequencer] = useState<Sequencer>(new Sequencer(useNavigate()))
    const location = useLocation()
    const state: State | undefined = location.state
    const config: SSISelectCredentialPageConfig = getCurrentEcosystemPageOrComponentConfig('SSISelectCredentialPage') as SSISelectCredentialPageConfig
    const {t} = useTranslation()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})

    useEffect((): void => {
        MetadataClient.retrieveAllMetadata(process.env.REACT_APP_OID4VCI_AGENT_BASE_URL!).then(async (metadata: EndpointMetadataResult): Promise<void> => {
            setEndpointMetadata(metadata)

            if (!metadata.credentialIssuerMetadata) {
                return
            }

            const credentialBranding = new Map<string, Array<IBasicCredentialLocaleBranding>>()
            Promise.all(
                (metadata.credentialIssuerMetadata.credentials_supported as CredentialSupported[]).map(async (metadata: CredentialSupported): Promise<void> => {
                    const localeBranding: Array<IBasicCredentialLocaleBranding> = await Promise.all(
                        (metadata.display ?? []).map(
                            async (display: CredentialsSupportedDisplay): Promise<IBasicCredentialLocaleBranding> =>
                                await credentialLocaleBrandingFrom(display)
                        ),
                    )

                    const credentialTypes: Array<string> =
                        metadata.types.length > 1
                            ? metadata.types.filter((type: string) => type !== 'VerifiableCredential')
                            : metadata.types.length === 0
                                ? ['VerifiableCredential']
                                : metadata.types

                    credentialBranding.set(credentialTypes[0], localeBranding) // TODO for now taking the first type
                })).then(() => setSupportedCredentials(credentialBranding))
        })
    }, [])

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
                            <SSICardView
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
        }

        void setCards()
    }, [supportedCredentials])

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
        }

        await sequencer.next(qrState)
    }

    const getExpirationDate = (): number => {
        const currentDate: Date = new Date()
        const expirationDate: Date = new Date(currentDate)
        expirationDate.setDate(currentDate.getDate() + 30)

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
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                userSelect: 'none',
                backgroundColor: config.styles.mainContainer.backgroundColor,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                maxWidth: isTabletOrMobile ? 327 : 1075,
                gap: 13,
                marginTop: isTabletOrMobile ? 25 : 244,
                justifyContent: 'center'
            }}>
                <p className={'inter-normal-48'} style={{
                    color: '#FBFBFB',
                    alignContent: 'center',
                    textAlign: 'center'
                }}>{t('select_credential_title1') + ' '}
                    <span className={`inter-normal-48`}

                          style={{
                              background: config.styles.mainContainer.textGradient,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                          }}

                    >{t('select_credential_title2') + ' '}</span>
                    <span className={'inter-normal-48'}
                          style={{color: '#FBFBFB'}}>{t('select_credential_title3') + ' '}</span>
                    <span className={`inter-normal-48`}
                          style={{
                              background: config.styles.mainContainer.textGradient,
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
            <div className="swiper-sphereon-pagination"
                 style={{textAlign: 'center', margin: '20px', marginBottom: '50px'}}/>

            <img
                style={{marginTop: isTabletOrMobile ? 'initial' : 'auto', marginBottom: isTabletOrMobile ? 15 : 85}}
                src={config.logo.src}
                alt={config.logo.alt}
                width={config.logo.width}
                height={config.logo.height}
            />
        </div>
    )
}

export default SSISelectCredentialPage