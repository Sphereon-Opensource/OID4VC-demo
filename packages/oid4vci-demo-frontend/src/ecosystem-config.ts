import {ImageProperties, VCIEcosystem} from "./types";
import dbc from "./configs/dbc.json";
import energy_shr from "./configs/energy_shr.json";
import fmdm from "./configs/fmdm.json";
import sphereon from "./configs/sphereon.json";
import triall from "./configs/triall.json";
import {CSSProperties} from "react";
import {IProps} from "./components/SSISecondaryButton";

export function getCurrentEcosystem(): VCIEcosystem {
    switch (process.env.REACT_APP_ENVIRONMENT) {
        case VCIEcosystem.fmdm:
            return VCIEcosystem.fmdm;
        case VCIEcosystem.dbc:
            return VCIEcosystem.dbc;
        case VCIEcosystem.triall:
            return VCIEcosystem.triall;
        case VCIEcosystem.energy_shr:
            return VCIEcosystem.energy_shr;
        default:
            return VCIEcosystem.sphereon;
    }
}

interface VCIConfig {
    general: EcosystemGeneralConfig
    pages: VCIConfigPages
    components: VCIConfigComponents
}

export function getCurrentEcosystemConfig(): VCIConfig {
    switch (getCurrentEcosystem()) {
        case VCIEcosystem.triall:
            return triall as VCIConfig;
        case VCIEcosystem.fmdm:
            return fmdm as VCIConfig;
        case VCIEcosystem.dbc:
            return dbc as VCIConfig;
        case VCIEcosystem.energy_shr:
            return energy_shr as VCIConfig;
        default:
            return sphereon as VCIConfig;
    }
}

export function getCurrentEcosystemPageOrComponentConfig(pageOrComponent: string): PageOrComponentConfig {
    switch (getCurrentEcosystem()) {
        case VCIEcosystem.fmdm:
            return getEcosystemPageOrComponentConfig(pageOrComponent, fmdm as VCIConfig);
        case VCIEcosystem.dbc:
            return getEcosystemPageOrComponentConfig(pageOrComponent, dbc as VCIConfig);
        case VCIEcosystem.triall:
            return getEcosystemPageOrComponentConfig(pageOrComponent, triall as VCIConfig);
      case VCIEcosystem.energy_shr:
        return getEcosystemPageOrComponentConfig(pageOrComponent, energy_shr as VCIConfig);
        default:
            return getEcosystemPageOrComponentConfig(pageOrComponent, sphereon as VCIConfig)
    }
}

export function getCurrentEcosystemGeneralConfig(config?: VCIConfig): EcosystemGeneralConfig {
    if (!config) {
        config = getCurrentEcosystemConfig()
    }
    return config.general
}

function getEcosystemPageOrComponentConfig(pageOrComponent: string, config?: VCIConfig): PageOrComponentConfig {
    if (!config) {
        config = getCurrentEcosystemConfig()
    }
    if (pageOrComponent in config.pages) {
        return config.pages[pageOrComponent as keyof VCIConfigPages]
    } else if (pageOrComponent in config.components) {
        return config.components[pageOrComponent as keyof VCIConfigComponents]
    }
    throw new Error("config for this page/component doesn't exist")
}

export interface PageOrComponentConfig {
}

export interface SSICredentialVerifyRequestPageConfig extends PageOrComponentConfig {
    photoLeft: string
    photoRight: string
}

export interface SSICredentialIssuedSuccessPageConfig extends PageOrComponentConfig {
    photoLeft: string
    photoRight: string
}

export interface SSIInformationSharedSuccessPageConfig extends PageOrComponentConfig {
    photoLeft: string
    photoLeftManual: string
    leftTextHideManual?: boolean
    textLeft?: string
    photoRight: string
    textRight?: string
}

export interface SSICredentialIssueRequestPageConfig extends PageOrComponentConfig {
    photoManual: string
    photoWallet: string
}

export interface SSIInformationRequestPageConfig extends PageOrComponentConfig {
    photo: string
    photoManual: string
    text_top_of_image: string
    sharing_data_right_pane_title: string
}

export interface SSIDownloadPageConfig extends PageOrComponentConfig {
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

export interface SSILandingPageConfig extends PageOrComponentConfig {
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

export interface SSISelectCredentialPageConfig extends PageOrComponentConfig {
    logo: ImageProperties,
    styles: {
        mainContainer: {
            backgroundColor: string
            textGradient: string
        },
    }
}

export interface SSICardConfig extends PageOrComponentConfig {
}

export interface SSIDeepLinkConfig extends PageOrComponentConfig {
}

export interface SSICardViewConfig extends PageOrComponentConfig {
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

export interface SSIPrimaryButtonConfig extends PageOrComponentConfig {
    styles: {
        mainContainer: {
            backgroundColor: string
        }
    }
}

export interface SSISecondaryButtonConfig extends PageOrComponentConfig {
    styles: {
        mainContainer: {
            color: string
        }
    }
}

export interface EcosystemGeneralConfig {
    baseUrl?: string
    verifierUrl?: string
    verifierUrlCaption?: string
    downloadUrl?: string
    credentialName: string
    issueCredentialType: string
}

export interface SSITextConfig extends PageOrComponentConfig {
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
}

export interface VCIConfigComponents {
    DeepLink: SSIDeepLinkConfig
    SSICardView: SSICardViewConfig
    SSIPrimaryButton: SSIPrimaryButtonConfig
    SSISecondaryButton: SSISecondaryButtonConfig
    Text: SSITextConfig
}

