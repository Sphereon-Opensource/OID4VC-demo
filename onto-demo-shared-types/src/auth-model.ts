// noinspection JSUnusedGlobalSymbols
import { ClaimOpts } from "@sphereon/did-auth-siop/dist/main/types/SIOP.types";

export class QRVariables  {
  redirectUrl?: string
  requestorDID?: string
  claims?: ClaimOpts
}

export class StateMapping {
  redirectUrl?: string
  stateId?: string
  requestorDID?: string
  sessionId?:string
  pollCount?: number
  authRequestCreated: boolean = false
  authResponse? :AuthResponse
  claims?: ClaimOpts
}

export class AuthResponse {
  constructor(userDID: string) { //, userName: string
    this.userDID = userDID;
    // this.userName = userName;
  }
  userDID: string
  firstName?: string
  lastName?: string
  youtubeChannelName: string
  youtubeChannelId?: string
  youtubeChannelURL: string
  youtubeChannelImageURL: string
  token?: string
}
