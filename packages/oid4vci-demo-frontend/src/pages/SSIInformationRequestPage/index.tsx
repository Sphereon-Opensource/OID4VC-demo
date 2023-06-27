import React, {ChangeEvent, useCallback, useEffect, useState} from 'react'
import inputStyle from './SSIInformationRequestPage.module.css';
import {useTranslation} from "react-i18next";
import {
    AdditionalClaims,
    ICredentialSubject,
    IVerifiableCredential,
    IVerifiablePresentation,
    W3CVerifiableCredential,
    W3CVerifiablePresentation
} from "@sphereon/ssi-types";

import '../../css/typography.css'
import {
    getCurrentEcosystemGeneralConfig,
    getCurrentEcosystemPageOrComponentConfig,
    SSIInformationRequestPageConfig
} from "../../ecosystem-config";
import SSIPrimaryButton from "../../components/SSIPrimaryButton";
import {useLocation, useNavigate} from "react-router-dom";
import {Buffer} from 'buffer';
import {useMediaQuery} from "react-responsive";
import {NonMobile} from "../../index";

interface Payload {
    firstName?: string
    lastName?: string
    emailAddress?: string
}

type State = {
    data?: any
}

const SSIInformationRequestPage: React.FC = () => {
    const config: SSIInformationRequestPageConfig = getCurrentEcosystemPageOrComponentConfig('SSIInformationRequestPage') as SSIInformationRequestPageConfig;
    const navigate = useNavigate();
    const location = useLocation();
    const state: State | undefined = location.state;
    const {t} = useTranslation()
    const [payload, setPayload] = useState<Payload>({
        firstName: '',
        lastName: '',
        emailAddress: ''
    })
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})


    const [isInvalidEmail, setIsInvalidEmail] = useState(false)
    const EMAIL_ADDRESS_VALIDATION_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    // Manually is only when all of them need to be filled by the user
    // None of them means that our wallet is used
    // Only Email is microsoft entra
    const [isManualIdentification] = useState<boolean>((!payload.firstName || payload.firstName === '') || (!payload.lastName || payload.lastName === '') || !payload.emailAddress || payload.emailAddress === '')

    const onEmailValidation = () => {
        if (payload.emailAddress && payload.emailAddress?.length !== 0) {
            setIsInvalidEmail(!EMAIL_ADDRESS_VALIDATION_REGEX.test(payload.emailAddress!))
        }
    }

    const processVPToken = useCallback(async () => {
        async function asyncFlatMap<T, O>(arr: T[], asyncFn: (t: T) => Promise<O[]>): Promise<O[]> {
            return Promise.all(flatten(await asyncMap(arr, asyncFn)))
        }

        function flatMap<T, O>(arr: T[], fn: (t: T) => O[]): O[] {
            return flatten(arr.map(fn))
        }

        function asyncMap<T, O>(arr: T[], asyncFn: (t: T) => Promise<O>): Promise<O[]> {
            return Promise.all(arr.map(asyncFn))
        }

        function flatten<T>(arr: T[][]): T[] {
            return ([] as T[]).concat(...arr);
        }

        const decodeBase64 = async (jwt: string, kid?: string): Promise<any> => {
            return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString())
        }
        const handleCredentialSubject = (cs: ICredentialSubject & AdditionalClaims): Payload => {
            if (!cs.firstName && !cs.lastName && !cs.emailAddress) {
                return {}
            }

            return {
                firstName: cs.firstName,
                lastName: cs.lastName,
                emailAddress: cs.emailAddress
            }
        }

        const handleCredential = async (vc: W3CVerifiableCredential): Promise<Payload[]> => {
            let verifiableCredential: IVerifiableCredential
            if (typeof vc === 'string') {
                verifiableCredential = (await decodeBase64(vc)).vc as IVerifiableCredential
            } else {
                verifiableCredential = vc as IVerifiableCredential
            }
            if (!verifiableCredential.credentialSubject) {
                return []
            }
            if (Array.isArray(verifiableCredential.credentialSubject)) {
                return verifiableCredential.credentialSubject.flatMap(handleCredentialSubject)
            }
            return [handleCredentialSubject(verifiableCredential.credentialSubject)]
        }

        const handleVP = async (vp: W3CVerifiablePresentation): Promise<Payload[]> => {
            let verifiablePresentation: IVerifiablePresentation
            if (typeof vp === 'string') {
                verifiablePresentation = (await decodeBase64(vp)).vp as IVerifiablePresentation
            } else {
                verifiablePresentation = vp as IVerifiablePresentation
            }
            if (!verifiablePresentation.verifiableCredential) {
                return []
            }
            if (Array.isArray(verifiablePresentation.verifiableCredential)) {
                return asyncFlatMap(verifiablePresentation.verifiableCredential, handleCredential)
            }
            return handleCredential(verifiablePresentation.verifiableCredential)
        }

        const handleVPToken = async (vpToken?: W3CVerifiablePresentation | W3CVerifiablePresentation[]): Promise<Payload[]> => {
            if (!vpToken) {
                return []
            }
            if (Array.isArray(vpToken)) {
                return asyncFlatMap(vpToken, handleVP)
            }
            return await handleVP(vpToken)
        }


        const payload = await handleVPToken(state?.data?.vp_token)
        if (payload.length) {
            const max = Math.max(...payload.map(p => Object.keys(p).length))
            const authPayload = payload.filter(p => Object.keys(p).length === max)[0]
            setPayload(authPayload)
        }
    }, [state?.data?.vp_token])

    useEffect(() => {
        if (state?.data?.vp_token) {
            processVPToken().catch(console.log)
        }
    }, []);

    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
            <NonMobile>
                <div id={"photo"} style={{
                    display: 'flex',
                    width: '60%',
                    height: '100%',
                    background: `url(${config.photo})`,
                    backgroundSize: 'cover',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <text
                        className={"poppins-medium-36"}
                        style={{maxWidth: 735, color: '#FBFBFB', marginTop: "auto", marginBottom: 120}}
                    >
                        {t(`${config.text_top_of_image}`)}
                    </text>
                </div>
            </NonMobile>
            <div style={{
                display: 'flex',
                width: isTabletOrMobile ? '100%' : '40%',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '63%',
                }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <text
                            className={"inter-normal-24"}
                            style={{marginBottom: 12}}
                        >
                            {t(config.sharing_data_right_pane_title)}
                        </text>
                        <text
                            className={"poppins-normal-14"}
                            style={{maxWidth: 313, textAlign: 'center'}}
                        >
                            {t('sharing_data_right_pane_paragraph', {credentialName: getCurrentEcosystemGeneralConfig().credentialName})}
                        </text>
                    </div>
                    <div/>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left',
                        width: '327px',
                        height: isManualIdentification ? '40%' : '186px',
                        gap: 23
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        }}>
                            <label className='poppins-normal-10' htmlFor="firstName">First name</label>
                            <input
                                id="firstName"
                                type="text"
                                placeholder='First name'
                                readOnly={!!payload.firstName && !!state?.data?.vp_token}
                                className={`${(!!payload.firstName && !!state?.data?.vp_token) ? '' : inputStyle.enabled}`}
                                defaultValue={payload.firstName}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setPayload({
                                    ...payload,
                                    firstName: event.target.value
                                })}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        }}>
                            <label className='poppins-normal-10' htmlFor="lastName">Last name</label>
                            <input
                                id="lastName"
                                type="text"
                                placeholder='Last name'
                                readOnly={!!payload?.lastName && !!state?.data?.vp_token}
                                className={`${(!!payload.lastName && !!state?.data?.vp_token) ? '' : inputStyle.enabled}`}
                                defaultValue={payload.lastName}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => setPayload({
                                    ...payload,
                                    lastName: event.target.value
                                })}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6
                        }}>
                            <label className='poppins-normal-10' htmlFor="email">Email address</label>
                            <input
                                style={{...(isInvalidEmail && {borderColor: 'red'})}}
                                id="email"
                                type="email"
                                placeholder='Email address'
                                readOnly={!!payload?.emailAddress && !!state?.data?.vp_token}
                                className={`${(!!payload.emailAddress && !!state?.data?.vp_token) ? '' : inputStyle.enabled}`}
                                defaultValue={payload.emailAddress}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    setIsInvalidEmail(false)
                                    setPayload({...payload, emailAddress: event.target.value})
                                }}
                                onBlur={onEmailValidation}
                            />
                        </div>
                    </div>
                    <div>
                        <SSIPrimaryButton
                            caption={isManualIdentification ? t('sharing_data_manually_right_pane_button_caption') : t('sharing_data_right_pane_button_caption')}
                            style={{width: 327}}
                            onClick={async () => {

                                const state = {
                                    ...payload,
                                    isManualIdentification
                                }

                                navigate('/information/success', {state});
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SSIInformationRequestPage;
