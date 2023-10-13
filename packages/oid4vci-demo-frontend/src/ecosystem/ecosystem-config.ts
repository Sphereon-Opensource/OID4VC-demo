import {ImageProperties} from "../types"
import {CSSProperties} from "react"
import {IProps} from "../components/SSISecondaryButton"


export interface VCIConfig {
    general: EcosystemGeneralConfig
    pages: VCIConfigPages
    routes: VCIConfigRoute[]
    components: VCIConfigComponents
}


export interface ComponentConfig {
}

export interface PageConfig {
    vpDefinitionId?: string
}

export interface SSICredentialVerifyRequestPageConfig extends PageConfig {
    leftPaneWidth?: string
    photoLeft?: string
    photoRight: string
    backgroundColor?: string
    logo?: ImageProperties
    enableRightPaneButton?: boolean
    rightPaneButtonStepId?: string
    bottomParagraph?: string
    mobile?: {
        logo?: ImageProperties
        backgroundColor?: string
        image?: string
    },
}

export interface SSICredentialIssuedSuccessPageConfig extends PageConfig {
    leftPaneWidth?: string
    photoLeft: string
    photoRight: string
    rightPaneButtonStepId?: string
}

export interface SSICredentialsLandingPageConfig extends PageConfig {
    logo?: ImageProperties
    mobile?: {
        logo?: ImageProperties
    }
    backgroundColor?: string
    pageTitle: string
    text: string
    credentials: SSICredentialCardConfig[]
}

export interface SSIInformationSharedSuccessPageConfig extends PageConfig {
    leftPaneWidth?: string
    photoLeft?: string
    photoLeftManual?: string
    leftTextHideManual?: boolean
    textLeft?: string
    photoRight: string
    textRight?: string
    mobile?: {
        logo: ImageProperties
    },
    backgroundColor?: string
    logo?: ImageProperties
}

export interface SSICredentialIssueRequestPageConfig extends PageConfig {
    leftPaneWidth?: string
    photoManual?: string
    photoWallet?: string
    textLeft?: string
    backgroundColor?: string
    logo?: ImageProperties
    title?: string
    topParagraph?: string
    bottomParagraph?: string
    mobile?: {
        logo?: ImageProperties
        backgroundColor?: string
        image?: string
        bottomParagraph?: string
    },
}

export interface SSIInformationRequestPageConfig extends PageConfig {
    leftPaneWidth?: string
    photo?: string
    photoManual?: string
    text_top_of_image?: string
    sharing_data_right_pane_title: string
    sharing_data_right_pane_paragraph?: string
    primaryButtonResourceId?: string
    primaryButtonManualResourceId?: string
    form?: DataFormRow[]
    mobile?: {
        logo?: ImageProperties
        backgroundColor?: string,
    },
    backgroundColor?: string
    logo?: ImageProperties
    title?: string
    topParagraph?: string
}

export type DataFormRow = DataFormElement[];

export interface DataFormElement {
    id: string;
    title: string;
    key: string;
    type: DataFormInputType;
    required: boolean;
    defaultValue?: string
}

type DataFormInputType = 'string' | 'date';

export interface SSIDownloadPageConfig extends PageConfig {
    rightPane: {
        paradymWalletQRCode: {
            style: CSSProperties,
            image: ImageProperties & { style: CSSProperties }
            button: IProps & { style: CSSProperties }
            downloadUrl: string
        },
        sphereonWalletQRCode: {
            style: CSSProperties,
            image: ImageProperties & { style: CSSProperties }
            button: IProps & { style: CSSProperties }
            downloadUrl: string
        }
    }
    leftPane: {
        width?: string
        leftPhone: {
            logo: ImageProperties
            image: ImageProperties
        }
        rightPhone: {
            logo: ImageProperties
            image: ImageProperties
        }
    }
}

export interface SphereonWalletPageConfig extends PageConfig {
    leftPane: {
        image?: string
        backgroundColor?: string
        width?: string
        logo?: ImageProperties,
        mobile?: {
            logo?: ImageProperties
            backgroundColor?: string
            image?: string
        },
    }
    rightPane: {
        image: string
        width?: string
        backgroundColor?: string
        sphereonWalletQRCode: {
            style: CSSProperties,
            image: ImageProperties & { style: CSSProperties }
            button: IProps & { style: CSSProperties }
            downloadUrl: string
        }
        enablePrimaryButton? : boolean
        primaryButtonResourceId? : string
        primaryButtonStepId? : string
        paragraphResourceId? : string
        qrTextResourceId? : string
    }
}

export interface SSILandingPageConfig extends PageConfig {
    photoRight: string
    photoLeft: string
    logo: ImageProperties,
    styles: {
        mainContainer: {
            backgroundColor: string
        },
        leftCardView: {
            textColor?: string
            backgroundColor: string
        },
        rightCardView: {
            textColor?: string
            buttonType: string
        }
    }
}

export interface SSISelectCredentialPageConfig extends PageConfig {
    logo: ImageProperties,
    styles: {
        mainContainer: {
            backgroundColor: string
            textGradient: string
        },
    }
}

export interface SSICardConfig extends ComponentConfig {
}

export interface SSICredentialCardConfig extends ComponentConfig {
    name: string
    route: string
    description?: string
    backgroundColor?: string
    backgroundImage?: string
    logo?: ImageProperties
}

export interface SSIDeepLinkConfig extends ComponentConfig {
}

export interface SSICardViewConfig extends ComponentConfig {
    styles: {
        mainContainer: {
            backgroundColor: string,
            textColor: string
        },
        secondaryButton: {
            backgroundColor: string
        }
    }
}

export interface SSIPrimaryButtonConfig extends ComponentConfig {
    styles: {
        mainContainer: {
            backgroundColor: string
        }
    }
}

export interface SSISecondaryButtonConfig extends ComponentConfig {
    styles: {
        mainContainer: {
            backgroundColor?: string
            color: string
        }
    }
}

export interface EcosystemGeneralConfig {
    agentVpBaseUrl?: string
    agentVciBaseUrl?: string
    authenticationEnabled?: boolean
    authenticationStaticToken?: string
    verifierUrl?: string
    backCaption?: string
    verifierUrlCaption?: string
    downloadUrl?: string
    credentialName: string
    issueCredentialType: string

}

export interface SSITextConfig extends ComponentConfig {
}

export interface VCIConfigPages {
    SSICredentialIssuedSuccessPage: SSICredentialIssuedSuccessPageConfig
    SSICredentialVerifyRequestPage: SSICredentialVerifyRequestPageConfig
    SSIInformationSharedSuccessPage: SSIInformationSharedSuccessPageConfig
    SSILandingPage: SSILandingPageConfig
    SSICredentialIssueRequestPage: SSICredentialIssueRequestPageConfig
    SSIInformationRequestPage: SSIInformationRequestPageConfig
    SSIDownloadPage: SSIDownloadPageConfig
    SSISelectCredentialPage: SSISelectCredentialPageConfig
    SSICredentialsLandingPage: SSICredentialsLandingPageConfig
}

export interface VCIConfigRoute {
    id?: string
    vpDefinitionId?: string
    steps: VCIConfigRouteStep[]
}

export enum VCIOperation {
    NAVIGATE = 'navigate',
    EXECUTE = 'execute'
}

export enum VCIAction {
    CREATE_CREDENTIAL_OFFER = 'create-credential-offer'
}

export interface VCIConfigRouteStep {
    id: string
    operation: VCIOperation
    nextId?: string
    isDefaultRoute?: boolean
}

export interface VCINavigationStep extends VCIConfigRouteStep {
    path: string
}

export interface VCIExecuteStep extends VCIConfigRouteStep {
    action: VCIAction
}

export interface VCIConfigComponents {
    DeepLink: SSIDeepLinkConfig
    SSICardView: SSICardViewConfig
    SSIPrimaryButton: SSIPrimaryButtonConfig
    SSISecondaryButton: SSISecondaryButtonConfig
    Text: SSITextConfig
}

export function getEcosystemRootConfig(ecosystemId: string): VCIConfig {
    return require(`../configs/${ecosystemId}.json`)
}

export function getEcosystemRoutes(config: VCIConfig): VCIConfigRoute[] {
    if (!config.routes) {
        throw new Error('The routes element is missing in the ecosystem json')
    }
    if (config.routes.length === 0) {
        throw new Error('The routes element in the ecosystem json is missing "route" child-elements')
    }
    return config.routes
}
