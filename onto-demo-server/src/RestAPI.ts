// noinspection JSUnusedGlobalSymbols

import * as dotenv from "dotenv-flow"
import express, {Response} from "express"
import cookieParser from "cookie-parser"
import uuid from "short-uuid"
import * as core from "express-serve-static-core";
import {
    AuthorizationRequestState, AuthorizationRequestStateStatus,
    AuthorizationResponseState, AuthorizationResponseStateStatus,
    PresentationDefinitionLocation,
    VerifiedAuthorizationResponse
} from '@sphereon/did-auth-siop'

import {Verifier} from "./Verifier";
import bodyParser from "body-parser"
import {DefinitionIds, getPresentationDefinition} from "./presentationDefinitions";
import {uriWithBase} from "./utils";
import {AuthStatusResponse, GenerateAuthRequestURIResponse} from "@sphereon/did-auth-siop-web-demo-shared";



export class RestAPI {
    public express: core.Express;
    private verifier: Verifier


    constructor() {
        dotenv.config()

        this.express = express()
        const port = process.env.PORT || 5000
        const secret = process.env.COOKIE_SIGNING_KEY
        this.express.use(bodyParser.urlencoded({extended: true}))
        this.express.use(bodyParser.json())
        this.express.use(cookieParser(secret))
        this.express.listen(port as number, "0.0.0.0", () => console.log(`Listening on port ${port}`))
        this.verifier = new Verifier(DefinitionIds.ENTRA_VERIFIED_ID_AND_SPHEREON)
        this.registerWebAppEndpoints()
        this.registerOpenID4VPEndpoints()
    }

    private static sendErrorResponse(response: Response, statusCode: number, message: string) {
        response.status(statusCode).send(message)
    }

    private registerWebAppEndpoints() {
        this.express.get("/webapp/definitions/:definitionId/auth-request-uri", (request, response) => {
            const definitionId = request.params.definitionId || this.verifier.definitionId
            const state: string = uuid.uuid()
            const nonce: string = uuid.uuid()
            const correlationId = uuid.uuid()
            const requestByReferenceURI = uriWithBase(`/ext/definitions/${definitionId}/auth-requests/${correlationId}`)
            const redirectURI = uriWithBase(`/ext/definitions/${definitionId}/auth-responses/${correlationId}`)
            this.verifier.rp.createAuthorizationRequestURI({
                correlationId,
                nonce,
                state,
                requestByReferenceURI,
                redirectURI,
                // definitionId?
            }).then(authRequest => {
                const authRequestBody: GenerateAuthRequestURIResponse = {
                    correlationId,
                    definitionId,
                    authRequestURI: authRequest.encodedUri,
                    authStatusURI: `${uriWithBase('/webapp/auth-status')}`
                }
                console.log(`Auth Request URI data: ${authRequestBody}`)
                return response.send(authRequestBody)
            }).catch((e: Error) => {
                console.error(e, e.stack)
                return RestAPI.sendErrorResponse(response, 500, "Could not create an authorization request URI: " + e.message)
            })
        })

        this.express.post("/webapp/auth-status", async (request, response) => {
            console.log("Received auth-status request...")
            const correlationId: string = request.body.correlationId as string
            const definitionId: string = request.body.definition as string
            const requestState = await this.verifier.sessionManager.getRequestStateByCorrelationId(correlationId, false)
            if (!requestState || !definitionId) {
                console.log(`No authentication request mapping could be found for the given URL. correlation: ${correlationId}, definitionId: ${definitionId}`)
                response.statusCode = 404

                const statusBody: AuthStatusResponse = {
                    status: requestState ? requestState.status : AuthorizationRequestStateStatus.ERROR,
                    error: "No authentication request mapping could be found for the given URL.",
                    correlationId,
                    definitionId,
                    lastUpdated: requestState ? requestState.lastUpdated : Date.now()
                }
                return response.send(statusBody)
            }

            let responseState;
            if (requestState.status === AuthorizationRequestStateStatus.SENT) {
                responseState = await this.verifier.sessionManager.getResponseStateByCorrelationId(correlationId, false)
            }
            const overallState: AuthorizationRequestState | AuthorizationResponseState = responseState ?? requestState

            const statusBody: AuthStatusResponse = {
                status: overallState.status,
                ...(overallState.error ? {error: overallState.error?.message} : {}),
                correlationId,
                definitionId,
                lastUpdated: overallState.lastUpdated
            }
            console.log(`Will send auth status: ${JSON.stringify(statusBody)}`)
            if (overallState.status === AuthorizationRequestStateStatus.ERROR || overallState.status === AuthorizationResponseStateStatus.ERROR) {
                response.statusCode = 500
                return response.send(statusBody)
            }
            response.statusCode = 200
            return response.send(statusBody)
        })

        this.express.post("/webapp/cancel-auth-request", (request, response) => {
                const stateId: string = request.body as string
                console.log(stateId)
                // TODO
            }
        )
    }

    private registerOpenID4VPEndpoints() {
        this.express.get("/ext/definitions/:definitionId/auth-requests/:correlationId", async (request, response) => {
            const correlationId = request.params.correlationId
            const definitionId = request.params.definitionId
            if (!correlationId || !definitionId) {
                console.log("No authorization request could be found for the given url.")
                return RestAPI.sendErrorResponse(response, 404, "No authorization request could be found")
            }
            const requestState = await this.verifier.sessionManager.getRequestStateByCorrelationId(correlationId, false)
            if (!requestState) {
                console.log("No authentication request could be found in registry. CorrelationID: " + correlationId)
                return RestAPI.sendErrorResponse(response, 404, `No authorization request could be found for ${correlationId}`)
            }
            const requestObject = await requestState.request?.requestObject?.toJwt()
            console.log('JWT Request object:')
            console.log(requestObject)

            let error = undefined;
            try {
                response.statusCode = 200
                return response.send(requestObject)
            } catch (e) {
                error = e
            } finally {
                this.verifier.rp.signalAuthRequestRetrieved({correlationId, error: error ? error as Error : undefined})
            }
        })

        this.express.post("/ext/definitions/:definitionId/auth-responses/:correlationId", (request, response) => {
                const correlationId = request.params.correlationId
                const definitionId = request.params.definitionId
                console.log('Authorization Response (siop-sessions')
                console.log(JSON.stringify(request.body, null, 2))
                const jwt = request.body;


                this.verifier.rp.verifyAuthorizationResponse(jwt, {
                    presentationDefinitions: [{
                        location: PresentationDefinitionLocation.CLAIMS_VP_TOKEN,
                        definition: getPresentationDefinition(this.verifier.definitionId)
                    }]
                })
                    .then((verifiedResponse: VerifiedAuthorizationResponse) => {
                        console.log("verifiedResponse: ", JSON.stringify(verifiedResponse, null, 2))

                        const wrappedPresentation = verifiedResponse?.oid4vpSubmission?.presentations[0];
                        if (wrappedPresentation) {
                            const credentialSubject = wrappedPresentation.presentation.verifiableCredential[0].credential.credentialSubject;
                            console.log('AND WE ARE DONE!')
                            console.log(JSON.stringify(credentialSubject, null, 2))
                            console.log(JSON.stringify(wrappedPresentation.presentation, null, 2))
                            response.statusCode = 200
                            // todo: delete session
                        } else {
                            response.statusCode = 500
                            response.statusMessage = 'Missing Credentials'
                        }
                        return response.send()
                    })
                    .catch(reason => {
                        console.error("verifyAuthenticationResponseJwt failed:", reason)
                    })
            }
        )
    }


    /*
        private timeout(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }*/
}


export default new RestAPI().express;
