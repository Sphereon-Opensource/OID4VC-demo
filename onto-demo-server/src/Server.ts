// noinspection JSUnusedGlobalSymbols

import * as dotenv from "dotenv-flow"
import express, {Response} from "express"
import cookieParser from "cookie-parser"
import uuid from "short-uuid"
import * as core from "express-serve-static-core";
import {PresentationDefinitionLocation, VerifiedAuthorizationResponse} from '@sphereon/did-auth-siop'
import {generateRequestObjectUri} from "./utils";
import {RelyingParty} from "./RelyingParty";
import bodyParser from "body-parser"


export class Server {
    public express: core.Express;
    private verifier: RelyingParty


    constructor() {
        dotenv.config()

        this.express = express()
        const port = process.env.PORT || 5000
        const secret = process.env.COOKIE_SIGNING_KEY
        // this.sessions = new ExpiryMap(parseInt(process.env.AUTH_REQUEST_EXPIRES_AFTER_SEC) * 1000)
        this.express.use(bodyParser.urlencoded({extended: true}))
        this.express.use(bodyParser.json())
        this.express.use(cookieParser(secret))
        this.express.listen(port as number, "0.0.0.0", () => console.log(`Listening on port ${port}`))

        this.verifier = new RelyingParty()
        this.registerWebAppEndpoints()
        this.registerOpenID4VPEndpoints()
    }

    private static sendErrorResponse(response: Response, statusCode: number, message: string) {
        response.status(statusCode).send(message)
    }

    private registerWebAppEndpoints() {
        this.express.get("/webapp/auth-request-uri", (request, response) => {
            const state: string = uuid.uuid()
            const nonce: string = uuid.uuid();
            const correlationId = generateRequestObjectUri()

            // random URI should be created an registered with replay registry
            this.verifier.rp.createAuthorizationRequestURI({
                correlationId,
                nonce,
                state
            }).then(uri => {
                const encodedUri = uri.encodedUri
                console.log(`Auth Request URI: ${encodedUri}`)
                return response.send(encodedUri)
            }).catch((e: Error) => {
                console.error(e, e.stack)
                return Server.sendErrorResponse(response, 500, "Could not create an authorization request URI: " + e.message)
            })
        })
        /*
                this.express.post("/backend/register-state", (request, response) => {
                    const stateMapping: StateMapping = request.body
                    let sessionId: string = request.signedCookies.requestUri;
                    if (!sessionId) {
                        console.log(`Session ID will be generated in stored in cookie`)
                        sessionId = shortUUID.generate()
                        const options: CookieOptions = {
                            signed: true,
                            httpOnly: true
                        }
                        response.cookie("sessionId", sessionId, options).send({authenticated: true})
                    }
                    stateMapping.sessionId = sessionId
                    this.sessions.set(stateMapping.stateId, stateMapping)
                    console.log("Received register state", stateMapping)
                    response.statusCode = 200
                    response.send()
                })*/


        this.express.get("/ext/requests/uniquevalue", async (request, response) => {
            /*const port = request.app.settings.port || 3002;
            const correlationId = request.protocol + '://' + request.hostname + (port == 80 || port == 443 ? '' : ':' + port) + request.path;*/
            const correlationId = generateRequestObjectUri()
            if (!correlationId) {
                console.log("No authentication request could be found for the given url.")
                return Server.sendErrorResponse(response, 404, "No authorization request could be found")
            }
            const requestState = await this.verifier.sessionManager.getRequestStateByCorrelationId(correlationId, false)
            if (!requestState) {
                console.log("No authentication request could be found in registry. CorrelationID: " + correlationId)
                return Server.sendErrorResponse(response, 404, "No authorization request could be found in reqistry")
            }
            const requestObject = await requestState.request?.requestObject?.toJwt()
            console.log('JWT Request object:')
            console.log(requestObject)
            response.statusCode = 200
            return response.send(requestObject)
        })

        this.express.post("/backend/poll-auth-response", async (request, response) => {
            // console.log("Received poll auth response...")
            const correlationId: string = request.body.uri as string
            // console.log(`State id: ${stateId}`)
            const state = await this.verifier.sessionManager.getRequestStateByCorrelationId(correlationId, false)
            if (!state) {
                console.log("No authentication request mapping could be found for the given URL.")
                return Server.sendErrorResponse(response, 500, "No authentication request mapping could be found for the given URL.")
            }
            // const sessionId: string = request.signedCookies.requestUri


            /*if (!this.state.) {
                // console.log("Poll auth resp: auth created", stateMapping.authRequestCreated)
                response.statusCode = 202
                return response.send()
            } else {*/
            console.log(`Poll auth response, existing auth ${correlationId} has nonce ${await state.request.getMergedProperty('nonce')}`)
            response.statusCode = 200
            return response.send()

            // }
        })

        this.express.post("/backend/cancel-auth-request", (request, response) => {
                const stateId: string = request.body as string
                console.log(stateId)
                // TODO
            }
        )
    }

    private registerOpenID4VPEndpoints() {
        /*        this.express.get("/ext/get-auth-request-url", (request, response) => {
                    console.log('get auth request url')
                    console.log('request query:' + JSON.stringify(request.query))
                    // fixme: We are splitting, since the SIOP package appends ?state=undefined to the oob
                    const oobQuery = (request.query['oob'] as string).split('?')[0]
                    const oobStr = decodeBase64url(oobQuery).replace('goal-code', 'goalCode')
                    console.log(oobStr)
                    const oobPayload = JSON.parse(oobStr) as OobPayload
                    if (!oobPayload) {
                        return Server.sendErrorResponse(response, 403, "No oob param")
                    }

                    const stateId = oobPayload.id

                    const stateMapping: StateMapping = this.sessions.get(stateId);
                    if (stateMapping) {
                        let nonce = shortUUID.generate();
                        console.log(`Nonce: ${nonce}`)

                        this.rp.createAuthorizationRequest({
                            nonce,
                            state: stateId
                        }).then(authorizationRequest => {
                            console.log('createAuthenticationRequest')

                            authorizationRequest.uri().then(uri => {
                                const encodedUri = uri.encodedUri
                                console.log(`encoded URI: ${encodedUri}`)
                                stateMapping.authRequestCreated = true
                                response.statusCode = 200


                                return response.send(encodedUri)

                            })
                        }).catch((e: Error) => {
                            console.error(e, e.stack)
                            return Server.sendErrorResponse(response, 500, "Could not create an authentication request URI: " + e.message)
                        })
                    } else {
                        return Server.sendErrorResponse(response, 403, "State id unknown")
                    }
                })*/

        this.express.post("/ext/siop-sessions", (request, response) => {
                console.log('Authorization Response (siop-sessions')
                console.log(JSON.stringify(request.body, null, 2))
                const jwt = request.body;

                this.verifier.rp.verifyAuthorizationResponse(jwt, {
                    presentationDefinitions: [{
                        location: PresentationDefinitionLocation.CLAIMS_VP_TOKEN,
                        definition: RelyingParty.buildEntraVeifiedIDPresentationDefinition()
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


export default new Server().express;
