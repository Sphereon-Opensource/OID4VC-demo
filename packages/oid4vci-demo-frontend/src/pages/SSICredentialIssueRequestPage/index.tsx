import React, {ReactElement, useEffect, useState} from 'react'
import {Text} from "../../components/Text"
import style from '../../components/Text/Text.module.css'
import {useTranslation} from "react-i18next"
import {useLocation} from 'react-router-dom'
import {QRData, QRRenderingProps, QRType, URIData} from '@sphereon/ssi-sdk.qr-code-generator'
import {IssueStatus, IssueStatusResponse} from "@sphereon/oid4vci-common"
import DeepLinkButton from "../../components/DeepLinkButton"
import {MobileOS, NonMobile, NonMobileOS} from '../..'
import {useMediaQuery} from "react-responsive"
import {useFlowRouter} from "../../router/flow-router"
import {useEcosystem} from "../../ecosystem/ecosystem"
import {SSICredentialIssueRequestPageConfig} from "../../ecosystem/ecosystem-config"
import InputField from "../../components/InputField";
import SSIPrimaryButton from "../../components/SSIPrimaryButton";
import styles from "../../components/DeepLinkButton/DeepLinkButton.module.css";
import {FormFieldValue} from "../../types";


type State = {
    uri: string,
    preAuthCode: string,
}

const SSICredentialIssueRequestPage: React.FC = () => {

    const location = useLocation()
    const ecosystem = useEcosystem()
    const {t} = useTranslation()
    const flowRouter = useFlowRouter<SSICredentialIssueRequestPageConfig>()
    const pageConfig = flowRouter.getPageConfig()
    const generalConfig = ecosystem.getGeneralConfig()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const state: State | undefined = location.state
    const [qrCode, setQrCode] = useState<ReactElement>()
    const [webWalletAddressValue, setWebWalletAddressValue] = useState<string>();


    useEffect(() => {
        const intervalId = setInterval(() => {
            ecosystem.getAgent().oid4vciClientGetIssueStatus({id: state?.preAuthCode!})
                .then(async (status: IssueStatusResponse) => {
                    if (status.status === IssueStatus.CREDENTIAL_ISSUED) {
                        clearInterval(intervalId)
                        await flowRouter.nextStep()
                    } else if (status.status === IssueStatus.ERROR) {
                        // TODO: Add feedback to user
                        console.error(status.error)
                        clearInterval(intervalId)
                    }
                })
                .catch((error: Error) => {
                    clearInterval(intervalId)
                    console.error(`ERROR: ${error.message}`)
                })
        }, 1000)
    }, [])

    const qrData: QRData<QRType.URI, URIData> = {
        object: state?.uri!,
        type: QRType.URI,
        id: '567',
    }

    const renderingProps: QRRenderingProps = {
        bgColor: '#FBFBFB',
        fgColor: 'black',
        level: 'L',
        size: 330,
    }

    useEffect(() => {
        ecosystem.getAgent().qrURIElement({
            data: qrData,
            renderingProps
        }).then((qrCode: JSX.Element) => setQrCode(qrCode))
    }, [])

    function determineRightPaneWidth() {
        if (isTabletOrMobile && pageConfig.mobile?.rightPaneWidth) {
            return pageConfig.mobile?.rightPaneWidth
        }
        return isTabletOrMobile ? pageConfig.mobile?.width ?? '100%' : '100%'
    }

    const onWebWalletAddressChange = (value: FormFieldValue) => {
        setWebWalletAddressValue(('' + value).trim());
    };

    const onWebWalletAddressClick = (): void => {
        if (!webWalletAddressValue) {
            throw new Error('Web wallet address must not be empty');
        }

        window.location.href = mergeQueryParams(webWalletAddressValue, qrData.object.toString());
    };


    return (
        <div style={{display: 'flex', height: (isTabletOrMobile ? '100vh' : '100vh'), width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: pageConfig.leftPaneWidth ?? 'auto',
                    height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                    flexDirection: 'column',
                    alignItems: 'center',
                    ...((pageConfig.photoWallet) && {background: `url(${pageConfig.photoWallet}) 0% 0% / cover`}),
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
                    {(pageConfig.textLeft) && (
                        <p
                            className={"poppins-medium-36"}
                            style={{
                                maxWidth: 735,
                                color: '#FBFBFB',
                                marginTop: "auto",
                                marginBottom: 120
                            }} // TODO add this to all except knb_kvk
                        >
                            {t('common_left_pane_title')}
                        </p>
                    )}
                </div>
            </NonMobile>
            <div style={{
                display: 'flex',
                width: determineRightPaneWidth(),
                height: '100%',
                alignItems: 'center',
                flexDirection: 'column',
                ...(isTabletOrMobile && {gap: 24, ...(pageConfig.mobile?.backgroundColor && {backgroundColor: pageConfig.mobile.backgroundColor})}),
                ...(!isTabletOrMobile && {justifyContent: 'center', backgroundColor: '#FFFFFF'}),
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
                    ...(!!pageConfig.rightPaneHeight && {height: pageConfig.rightPaneHeight}),
                    ...(isTabletOrMobile && {height: '100%'}),
                    alignItems: 'center',
                }}>
                    <Text
                        style={{textAlign: 'center', ...(isTabletOrMobile && {marginRight: 24, marginLeft: 24})}}
                        className={style.pReduceLineSpace}
                        h2Style={pageConfig.qrCode?.topTitle?.h2Style}
                        pStyle={pageConfig.qrCode?.topTitle?.pStyle}
                        title={t(pageConfig.title ? pageConfig.title : 'qrcode_right_pane_top_title', {credentialName: generalConfig.credentialName}).split('\n')
                        }
                        lines={t(pageConfig.topParagraph ? pageConfig.topParagraph : 'qrcode_right_pane_top_paragraph', {credentialName: generalConfig.credentialName}).split('\n')
                        }
                    />
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: `${pageConfig?.qrCodeContainer?.height}` ?? '50vh',
                        marginBottom: isTabletOrMobile ? 40 : '4px%',
                        marginTop: isTabletOrMobile ? 20 : '15%',
                        alignItems: 'center'
                    }}>
                        <NonMobileOS>
                            <div style={{flexGrow: 1, marginBottom: 34}}>
                                {qrCode}
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                verticalAlign: 'bottom',
                                alignItems: 'flex-end'
                            }}>
                                <InputField
                                    label={t('web_wallet_address')!}
                                    type={'text'}
                                    inlineStyle={{marginRight: '4px'}}
                                    labelStyle={{textAlign: 'left'}}
                                    onChange={async (value: FormFieldValue): Promise<void> => onWebWalletAddressChange(value)}
                                />
                                <SSIPrimaryButton
                                    caption={t('go')}
                                    style={{width: 87, ...styles}}
                                    onClick={onWebWalletAddressClick}
                                    disabled={webWalletAddressValue === undefined
                                        || webWalletAddressValue.length === 0
                                        || !urlRegex.test(webWalletAddressValue)}/>
                            </div>
                        </NonMobileOS>
                        <MobileOS>
                            <div style={{
                                gap: 24,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                overflow: 'hidden'
                            }}>
                                {pageConfig.mobile?.image &&
                                    <img src={pageConfig.mobile?.image?.src}
                                         width={pageConfig.mobile?.image?.width}
                                         height={pageConfig.mobile?.image?.height} alt="success"
                                         style={{overflow: 'hidden'}}/>
                                }
                                <DeepLinkButton style={{flexGrow: 1, marginTop: '20px'}} link={state?.uri!}/>
                            </div>
                        </MobileOS>
                    </div>
                    <div style={{
                        marginTop: "20px",
                        textAlign: 'center', ...(isTabletOrMobile && {marginTop: 'inherit'})
                    }}>
                        <NonMobileOS>
                            <Text
                                style={{flexGrow: 1}}
                                pStyle={pageConfig.qrCode?.bottomText?.pStyle}
                                className={`${style.pReduceLineSpace} ${pageConfig.qrCode?.bottomText?.className ?? 'poppins-semi-bold-16'}`}
                                lines={pageConfig.bottomParagraph ? t(pageConfig.bottomParagraph).split('\n') : []} // FIXME DPP-84
                            />
                        </NonMobileOS>
                        <MobileOS>
                            <Text
                                style={{flexGrow: 1, marginLeft: 24, marginRight: 24, marginBottom: '10%'}}
                                pStyle={pageConfig.mobile?.bottomText?.pStyle}
                                className={`${style.pReduceLineSpace} ${pageConfig.mobile?.bottomText?.className ?? 'poppins-semi-bold-16'}`}
                                lines={t(pageConfig.mobile?.bottomText?.paragraph ? pageConfig.mobile?.bottomText?.paragraph : 'credentials_right_pane_bottom_paragraph_mobile').split('\n')}
                            />
                        </MobileOS>
                    </div>
                </div>
            </div>
        </div>
    )
}


const urlRegex = /^(https?:\/\/)(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost|([a-z\d]([a-z\d-]*[a-z\d])?\.local)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

function mergeQueryParams(url1: string, url2: string) {
    if (!urlRegex.test(url1)) {
        throw new Error('Web wallet address must be a valid https:// url');
    }
    // Extract the base URL and any existing query parameters from webWalletAddressValue
    const webWalletUrl = new URL(url1);
    const walletParams = new URLSearchParams(webWalletUrl.search);

    // Extract the query parameters from qrData.object
    const queryParamsStartIndex = url2.indexOf('?');
    const qrParams = new URLSearchParams(url2.substring(queryParamsStartIndex));

    // Merge parameters: qrParams will overwrite existing params in walletParams
    qrParams.forEach((value, key) => {
        walletParams.set(key, value);
    });

    webWalletUrl.search = walletParams.toString();
    return webWalletUrl.toString();
}

export default SSICredentialIssueRequestPage
