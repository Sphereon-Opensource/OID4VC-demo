// noinspection JSUnusedGlobalSymbols
import {ClaimPayloadCommonOpts} from "@sphereon/did-auth-siop";

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
