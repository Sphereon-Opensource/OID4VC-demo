import React, {ReactElement, useEffect, useState} from 'react'
import {Text} from "../../components/Text"
import style from '../../components/Text/Text.module.css'
import {useTranslation} from "react-i18next"
import {useLocation} from 'react-router-dom'
import {QRData, QRRenderingProps, QRType, URIData} from '@sphereon/ssi-sdk.qr-code-generator'
import {IssueStatus, IssueStatusResponse} from "@sphereon/oid4vci-common"
import DeepLinkButton from "../../components/DeepLinkButton"
import {Mobile, MobileOS, NonMobile, NonMobileOS} from '../..'
import {useMediaQuery} from "react-responsive"
import {useFlowRouter} from "../../router/flow-router"
import {useEcosystem} from "../../ecosystem/ecosystem"
import {SSICredentialIssueRequestPageConfig} from "../../ecosystem/ecosystem-config"

type State = {
    uri: string,
    preAuthCode: string,
}

const SSICredentialIssueRequestPage: React.FC = () => {
    const location = useLocation()
    const ecosystem = useEcosystem()
    const flowRouter = useFlowRouter<SSICredentialIssueRequestPageConfig>()
    const pageConfig = flowRouter.getPageConfig()
    const generalConfig = ecosystem.getGeneralConfig()
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const state: State | undefined = location.state
    const [qrCode, setQrCode] = useState<ReactElement>()

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

    function determineWidth() {
        if (pageConfig.leftPaneWidth && pageConfig.leftPaneWidth.includes('%')) {
            return '100%'
        }
        if (isTabletOrMobile && pageConfig.mobile?.rightPaneWidth) {
          return pageConfig.mobile?.rightPaneWidth
        }
        return isTabletOrMobile ? pageConfig.mobile?.width ?? '50%' : '40%'
    }

    const {t} = useTranslation()


    return (
        <div style={{display: 'flex', height: (isTabletOrMobile ? '100%' : '100vh'), width: '100%'}}>
            <NonMobile>
                <div style={{
                    display: 'flex',
                    width: pageConfig.leftPaneWidth ?? '60%',
                    height: '100%',
                    flexDirection: 'column',
                    alignItems: 'center',
                    ...((pageConfig.photoWallet) && {background: `url(${pageConfig.photoWallet}) 0% 0% / cover`}),
                    ...(pageConfig.backgroundColor && {backgroundColor: pageConfig.backgroundColor}),
                    ...(pageConfig.logo && {justifyContent: 'center'})
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
                width: determineWidth(),
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
                    ...(!!pageConfig.rightPaneHeight && { height: pageConfig.rightPaneHeight }),
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
                        marginBottom: isTabletOrMobile ? 40 : '15%',
                        marginTop: isTabletOrMobile ? 20 : '15%',
                        alignItems: 'center'
                    }}>
                        <NonMobileOS>
                            <div style={{flexGrow: 1, marginBottom: 34}}>
                                {qrCode}
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
                                    <img src={pageConfig.mobile?.image} alt="success" style={{overflow: 'hidden'}}/>
                                }
                                <DeepLinkButton style={{flexGrow: 1, marginTop: '20px'}} link={state?.uri!}/>
                            </div>
                        </MobileOS>
                    </div>
                    <div style={{marginTop: "20px"}}>
                        <NonMobileOS>
                            <Text
                                style={{flexGrow: 1, maxWidth: 378}}
                                pStyle={pageConfig.mobile?.qrCode?.bottomText?.pStyle}
                                className={`${style.pReduceLineSpace} ${pageConfig.qrCode?.bottomText?.className ?? 'poppins-semi-bold-16'}`}
                                lines={pageConfig.bottomParagraph ? t(pageConfig.bottomParagraph).split('\n') : []} // FIXME DPP-84
                            />
                        </NonMobileOS>
                        <MobileOS>
                            <Text
                                style={{flexGrow: 1, marginLeft: 24, marginRight: 24}}
                                pStyle={pageConfig.qrCode?.bottomText?.pStyle}
                                className={`${style.pReduceLineSpace} ${pageConfig.mobile?.qrCode?.bottomText?.className ?? 'poppins-semi-bold-16'}`}
                                lines={t(pageConfig.mobile?.bottomParagraph ? pageConfig.mobile.bottomParagraph : 'credentials_right_pane_bottom_paragraph_mobile').split('\n')}
                            />
                        </MobileOS>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SSICredentialIssueRequestPage
