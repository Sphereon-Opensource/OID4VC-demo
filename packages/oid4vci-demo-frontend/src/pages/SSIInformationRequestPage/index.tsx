import React, {useCallback, useEffect, useState} from 'react'
import {useTranslation} from "react-i18next"
import {
    AdditionalClaims,
    ICredentialSubject,
    IVerifiableCredential,
    IVerifiablePresentation,
    W3CVerifiableCredential,
    W3CVerifiablePresentation
} from "@sphereon/ssi-types"
import '../../css/typography.css'
import {DataFormElement, DataFormRow, SSIInformationRequestPageConfig} from "../../ecosystem/ecosystem-config"
import SSIPrimaryButton from "../../components/SSIPrimaryButton"
import {useLocation} from "react-router-dom"
import {Buffer} from 'buffer'
import {useMediaQuery} from "react-responsive"
import {NonMobile} from "../../index"
import {extractRequiredKeys, transformFormConfigToEmptyObject} from "../../utils/ObjectUtils"
import Form from "../../components/Form"
import {FormData} from "../../types"
import {useFlowRouter} from "../../router/flow-router"
import {useEcosystem} from "../../ecosystem/ecosystem"

type State = {
    data?: any
}

function getInitialState(form: DataFormRow[] | undefined) {
  if (!form) {
    return {
      firstName: '',
      lastName: '',
      emailAddress: ''
    }
  }
  return transformFormConfigToEmptyObject(form)
}

function isPayloadValid(payload: FormData, form?: DataFormRow[]) {
  let requiredFields =  Object.keys(payload) // FIXME this should be configurable
  if (form) {
    requiredFields = extractRequiredKeys(form)
  }
  for (let field of requiredFields) {
    if (!payload[field] || payload[field]!.toString().trim() === '') {
      return false;
    }
  }
  return true;
}

const SSIInformationRequestPage: React.FC = () => {
    const flowRouter = useFlowRouter<SSIInformationRequestPageConfig>()
    const pageConfig = flowRouter.getPageConfig();
    const location = useLocation();
    const credentialName = useEcosystem().getGeneralConfig().credentialName
    const state: State | undefined = location.state;
    const {t} = useTranslation()
    const [payload, setPayload] = useState<FormData>(getInitialState(pageConfig.form))
    const [initComplete, setInitComplete] = useState<boolean>(false)
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})

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
        const handleCredentialSubject = (cs: ICredentialSubject & AdditionalClaims, form?: DataFormRow[]): FormData => {
            if (!form) {
                if (!cs.firstName && !cs.lastName && !cs.emailAddress) {
                    return {} as Record<string, string>;
                }

                return {
                    firstName: cs.firstName,
                    lastName: cs.lastName,
                    emailAddress: cs.emailAddress
                } as Record<string, string>;
            }
            const payload = transformFormConfigToEmptyObject(form);
            for (const payloadKey in payload) {
                if (payloadKey in cs) {
                    // TODO: since this code is based on the manual flow, we have to revisit it for the wallet flow
                    payload[payloadKey] = cs[payloadKey];
                }
            }
            return payload;
        }

        const handleCredential = async (vc: W3CVerifiableCredential): Promise<FormData[]> => {
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
              return (verifiableCredential.credentialSubject as (ICredentialSubject & AdditionalClaims)[]).map(cs => handleCredentialSubject(cs, pageConfig.form));
            }
            return [handleCredentialSubject(verifiableCredential.credentialSubject, pageConfig.form)]
        }

        const handleVP = async (vp: W3CVerifiablePresentation): Promise<FormData[]> => {
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

        const handleVPToken = async (vpToken?: W3CVerifiablePresentation | W3CVerifiablePresentation[]): Promise<FormData[]> => {
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
        setInitComplete(true)
    }, [state?.data?.vp_token])

    useEffect(() => {
        if (state?.data?.vp_token) {
            processVPToken().catch(console.log)
        } else {
            setInitComplete(true)
        }
    }, []);

    const onFormValueChange = async (formData: FormData): Promise<void> => {
        setPayload(formData)
    }

	function determineWidth() {
        if(pageConfig.leftPaneWidth && pageConfig.leftPaneWidth.includes('%')) {
            return '100%'
        }
        return isTabletOrMobile ? '50%' : '40%'
    }

    return (
        <div style={{display: 'flex',  height: "100vh", width: '100vw',  ...(isTabletOrMobile && { overflowX: "hidden", ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) })}}>
            <NonMobile>
                <div id={"photo"} style={{
                    display: 'flex',
                    width: pageConfig.leftPaneWidth ?? '60%',
                    height: isTabletOrMobile ? '100%': '100vh',
                    flexDirection: 'column',
                    alignItems: 'center',
                    ...((pageConfig.photo) && { background: `url(${pageConfig.photo}) 0% 0% / cover`}),
                    ...(pageConfig.backgroundColor && { backgroundColor: pageConfig.backgroundColor }),
                    ...(pageConfig.logo && { justifyContent: 'center' })
                }}>
                    { pageConfig.logo &&
                        <img
                            src={pageConfig.logo.src}
                            alt={pageConfig.logo.alt}
                            width={pageConfig.logo.width}
                            height={pageConfig.logo.height}
                        />
                    }
                    { pageConfig.text_top_of_image &&
                         <text
                             className={"poppins-medium-36"}
                             style={{maxWidth: 735, color: '#FBFBFB', marginTop: "auto", marginBottom: 120}}
                         >
                             {t(`${pageConfig.text_top_of_image}`)}
                         </text>
                    }
                </div>
            </NonMobile>
            <div style={{
                display: 'flex',
                flexGrow: 1,
                width: determineWidth(),
                alignItems: 'center',
                flexDirection: 'column',
                ...(isTabletOrMobile && { gap: 24, ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) }),
                ...(!isTabletOrMobile && { justifyContent: 'center', backgroundColor: '#FFFFFF' }),
            }}>
                {(isTabletOrMobile && pageConfig.mobile?.logo) &&
                    <img
                        src={pageConfig.mobile.logo.src}
                        alt={pageConfig.mobile.logo.alt}
                        width={pageConfig.mobile.logo?.width ?? 150}
                        height={pageConfig.mobile.logo?.height ?? 150}
                    />
                }
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
                            {t(pageConfig.sharing_data_right_pane_title)}
                        </text>
                        <text
                            className={"poppins-normal-14"}
                            style={{maxWidth: 313, textAlign: 'center'}}
                        >
                            {t(pageConfig.sharing_data_right_pane_paragraph ?? 'sharing_data_right_pane_paragraph', {credentialName})}
                        </text>
                    </div>
                    <div/>
                    {initComplete && ( // We should not render the form until handleVPToken's result came back
                        <Form
                            form={pageConfig.form.map((row: DataFormRow) =>
                                row.map((field: DataFormElement) => {
                                    return ({
                                        ...field,
                                        readonly: (!!field.defaultValue || !!payload[field.id]) && !!state?.data?.vp_token,
                                        defaultValue: payload[field.id] as string
                                    })
                                }))}
                            onChange={onFormValueChange}
                        />
                    )}
                    <div>
                        <SSIPrimaryButton
                            caption={t(pageConfig.primaryButtonResourceId ?? 'label_continue')}
                            style={{width: 327}}
                            disabled={!isPayloadValid(payload, pageConfig.form)}
                            onClick={async () => await flowRouter.nextStep({payload})}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SSIInformationRequestPage;
