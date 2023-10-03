import {ImageProperties} from "./types";
import dbc from "./configs/dbc.json";
import energy_shr from "./configs/energy_shr.json";
import fmdm from "./configs/fmdm.json";
import notary from "./configs/notary.json";
import sphereon from "./configs/sphereon.json";
import triall from "./configs/triall.json";
import coc from "./configs/coc.json";
import {CSSProperties} from "react";
import {IProps} from "./components/SSISecondaryButton";

interface VCIConfig {
    general: EcosystemGeneralConfig
    pages: VCIConfigPages
    components: VCIConfigComponents
}

//todo: (VDX-251) come up with a plan to remove this part and resolve the config automatically based on the REACT_APP_ENVIRONMENT value
export function getCurrentEcosystemConfig(): VCIConfig {
  const ecosystem = process.env.REACT_APP_ENVIRONMENT ?? 'sphereon';
  switch (ecosystem) {
    case 'dbc':
      return dbc as VCIConfig;
    case 'energy_shr':
      return energy_shr as VCIConfig;
    case 'fmdm':
      return fmdm as VCIConfig;
    case 'notary':
      return notary as VCIConfig;
    case 'triall':
      return triall as VCIConfig;
    case 'coc':
      return coc as VCIConfig;
    default:
      return sphereon as VCIConfig;
  }
}

export function getCurrentEcosystemPageOrComponentConfig(pageOrComponent: string): PageOrComponentConfig {
    const config = getCurrentEcosystemConfig()
    return getEcosystemPageOrComponentConfig(pageOrComponent, config);
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
    photoLeft?: string
    photoRight: string
    backgroundColor?: string
    logo?: ImageProperties
    bottomParagraph?: string
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
    photoManual?: string
    photoWallet?: string
    textLeft?: string
    backgroundColor?: string
    logo?: ImageProperties
    title?: string
    topParagraph?: string
    bottomParagraph?: string
}

export interface SSIInformationRequestPageConfig extends PageOrComponentConfig {
    photo?: string
    photoManual?: string
    text_top_of_image?: string
    sharing_data_right_pane_title: string
    sharing_data_right_pane_paragraph?: string
    form?: DataFormRow[]
    mobile?: {
      logo: ImageProperties
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
}

type DataFormInputType = 'string' | 'date';

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
}

export interface VCIConfigComponents {
    DeepLink: SSIDeepLinkConfig
    SSICardView: SSICardViewConfig
    SSIPrimaryButton: SSIPrimaryButtonConfig
    SSISecondaryButton: SSISecondaryButtonConfig
    Text: SSITextConfig
}

