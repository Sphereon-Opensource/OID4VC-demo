import {ImageProperties} from "./types"
import {CSSProperties} from "react"
import {IProps} from "./components/SSISecondaryButton"

interface VCIConfig {
    general: EcosystemGeneralConfig
    pages: VCIConfigPages
    routes: VCIConfigRoute[]
    components: VCIConfigComponents
}

export function getCurrentEcosystemConfig(): VCIConfig {
    const ecosystem = process.env.REACT_APP_ENVIRONMENT ?? 'sphereon'
    return require(`./configs/${ecosystem}.json`)
}

export function getCurrentEcosystemGeneralConfig(config?: VCIConfig): EcosystemGeneralConfig {
    if (!config) {
        config = getCurrentEcosystemConfig()
    }
    return config.general
}

export function getCurrentEcosystemComponentConfig(component: string, config?: VCIConfig): ComponentConfig {
    if (!config) {
        config = getCurrentEcosystemConfig()
    }
    if (component in config.components) {
        return config.components[component as keyof VCIConfigComponents]
    }
    throw new Error(`config for ${component} doesn't exist`)
}

export function hasCurrentEcosystemPageConfig(stepId: string, config?: VCIConfig): boolean {
    if (!config) {
        config = getCurrentEcosystemConfig()
    }
    return stepId in config.pages;
}

export function getCurrentEcosystemPageConfig(stepId: string, config?: VCIConfig): PageConfig | undefined{
    if (!config) {
        config = getCurrentEcosystemConfig()
    }
    if (stepId in config.pages) {
        return config.pages[stepId as keyof VCIConfigPages]
    }
    throw new Error(`Page config for step ${stepId} doesn't exist`)
}

export function getEcosystemRoutes(config?: VCIConfig): VCIConfigRoute[] {
    if (!config) {
        config = getCurrentEcosystemConfig()
    }
    if (!config.routes) {
        throw new Error('The routes element is missing in the ecosystem json')
    }
    if (config.routes.length === 0) {
        throw new Error('The routes element in the ecosystem json is missing "route" child-elements')
    }
    return config.routes
}

export interface ComponentConfig {
}

export interface PageConfig {
}

export interface SSICredentialVerifyRequestPageConfig extends PageConfig {
    photoLeft?: string
    photoRight: string
    backgroundColor?: string
    logo?: ImageProperties
    enableRightPaneButton? : boolean
    rightPaneButtonStepId? : string
    bottomParagraph?: string
    mobile?: {
        logo?: ImageProperties
        backgroundColor?: string
        image?: string
    },
}

export interface SSICredentialIssuedSuccessPageConfig extends PageConfig {
    photoLeft: string
    photoRight: string
    rightPaneButtonStepId? : string
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
    photo?: string
    photoManual?: string
    text_top_of_image?: string
    sharing_data_right_pane_title: string
    sharing_data_right_pane_paragraph?: string
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
    baseUrl?: string
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

