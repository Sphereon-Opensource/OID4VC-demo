// noinspection JSUnusedGlobalSymbols
export interface ClaimPayloadCommonOpts {
    [x: string]: any;
}
export declare enum AuthorizationRequestStateStatus {
    CREATED = "created",
    SENT = "sent",
    RECEIVED = "received",
    VERIFIED = "verified",
    ERROR = "error"
}
export declare enum AuthorizationResponseStateStatus {
    CREATED = "created",
    SENT = "sent",
    RECEIVED = "received",
    VERIFIED = "verified",
    ERROR = "error"
}

export interface GenerateAuthRequestURIResponse {
    correlationId: string;
    definitionId: string;
    authRequestURI: string;
    authStatusURI: string;
}


export interface AuthStatusResponse {
    status: AuthorizationRequestStateStatus | AuthorizationResponseStateStatus;
    correlationId: string;

    error?: string
    definitionId: string;
    lastUpdated: number;
}

export class StateMapping {
    redirectUrl?: string
    stateId?: string
    requestorDID?: string
    sessionId?: string
    pollCount?: number
    authRequestCreated: boolean = false
    authResponse?: AuthResponse
    claims?: ClaimPayloadCommonOpts
}

export class AuthResponse {
    constructor(kvkNummer: string) { //, kvkNummer: string
        this.kvkNummer = kvkNummer;
        // this.userName = userName;
    }

    naam: string
    kvkNummer: string
    rechtsvorm: string
    straatnaam?: string
    aanduidingBijHuisnummer?: string
    huisnummer: string
    huisnummerToevoeging?: string
    huisletter?: string
    postbusnummer?: string
    postcode: string
    plaats: string
    bagId?: string
    datumAkteOprichting: string
    token?: string
}
