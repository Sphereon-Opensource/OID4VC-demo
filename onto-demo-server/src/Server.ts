// noinspection JSUnusedGlobalSymbols

import * as dotenv from "dotenv-flow"
import express from "express"
import {CookieOptions, Response} from "express"
import cookieParser from "cookie-parser"
import ExpiryMap from "expiry-map"
import shortUUID from "short-uuid"
import {AuthResponse, QRVariables, StateMapping} from "@sphereon/did-auth-siop-web-demo-shared";
import * as core from "express-serve-static-core";
import {Rules} from '@sphereon/pex-models';
import {
  RP,
  SigningAlgo,
  VerifiedAuthenticationResponse,
  PassBy,
  parseJWT,
  ResponseType,
  Scope,
  SubjectType
} from '@sphereon/did-auth-siop'
import {OobPayload} from "@sphereon/ssi-sdk-waci-pex-qr-react";
import {Resolver} from "did-resolver";
import {getUniResolver} from "@sphereon/did-uni-client";

import * as u8a from 'uint8arrays'
import {IPresentationDefinition} from "@sphereon/pex";
import {SupportedVersion} from "@sphereon/did-auth-siop/dist/main/types/SIOP.types";

export function base64ToBytes(s: string): Uint8Array {
    const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    return u8a.fromString(inputBase64Url, 'base64url')
}

export function decodeBase64url(s: string): string {
    return u8a.toString(base64ToBytes(s))
}

// noinspection JSUnusedLocalSymbols
class Server {
    public express: core.Express;
    private stateMap: ExpiryMap<string, StateMapping>;
    private rp: RP;

    constructor() {
        dotenv.config()

        this.express = express()
        const port = process.env.PORT || 5000
        const secret = process.env.COOKIE_SIGNING_KEY
        this.stateMap = new ExpiryMap(parseInt(process.env.AUTH_REQUEST_EXPIRES_AFTER_SEC) * 1000)
        const bodyParser = require("body-parser")
        this.express.use(bodyParser.urlencoded({extended: true}))
        this.express.use(bodyParser.json())
        this.express.use(cookieParser(secret))
        this.express.listen(port as number, "0.0.0.0", () => console.log(`Listening on port ${port}`))
        this.buildRP();
        this.registerWebAppEndpoints()
        this.registerSIOPEndpoint()
    }

    private static sendErrorResponse(response: Response, statusCode: number, message: string) {
        response.status(statusCode).send(message)
    }

    private registerWebAppEndpoints() {
        this.express.get("/backend/get-qr-variables", (request, response) => {
            const sessionId = shortUUID.generate()
            const stateMapping: StateMapping = request.body

            const qrVariables = new QRVariables()
            qrVariables.requestorDID = process.env.RP_DID
            qrVariables.redirectUrl = process.env.REDIRECT_URL_BASE + "/get-auth-request-url"
            qrVariables.id = sessionId
            stateMapping.sessionId = sessionId
            if (!stateMapping.stateId) {
                stateMapping.stateId = sessionId
            }
            this.stateMap.set(sessionId, stateMapping)
            response.send(qrVariables)
        })

        this.express.post("/backend/register-state", (request, response) => {
            const stateMapping: StateMapping = request.body
            let sessionId: string = request.signedCookies.sessionId;
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
            this.stateMap.set(stateMapping.stateId, stateMapping)
            console.log("Received register state", stateMapping)
            response.statusCode = 200
            response.send()
        })


        this.express.post("/backend/poll-auth-response", (request, response) => {
            // console.log("Received poll auth response...")
            const stateId: string = request.body.stateId as string
            // console.log(`State id: ${stateId}`)
            const stateMapping: StateMapping = this.stateMap.get(stateId)
            if (!stateMapping) {
                console.log("No authentication request mapping could be found for the given stateId.")
                return Server.sendErrorResponse(response, 500, "No authentication request mapping could be found for the given stateId.")
            }
            const sessionId: string = request.signedCookies.sessionId
            if (!stateMapping.sessionId || stateMapping.sessionId !== sessionId) {
                console.log(`Session id mismatch. statemapping: ${stateMapping.sessionId}, cookie session id: ${sessionId}`)
                return Server.sendErrorResponse(response, 403, "Browser session violation!")
            }

            if ("true" == process.env.MOCK_AUTH_RESPONSE && "development" == process.env.NODE_ENV) {
                this.mockResponse(stateMapping, response)
            } else {

                if (stateMapping.authResponse == null) {
                    // console.log("Poll auth resp: auth created", stateMapping.authRequestCreated)
                    response.statusCode = 202
                    return response.send({authRequestCreated: stateMapping.authRequestCreated})
                } else {
                    console.log("Poll auth response, existing authResponse" + stateMapping.authResponse)
                    response.statusCode = 200
                    return response.send(stateMapping.authResponse)
                }
            }
        })

        this.express.post("/backend/cancel-auth-request", (request, response) => {
                const stateId: string = request.body as string
                console.log(stateId)
                // TODO
            }
        )
    }

    private registerSIOPEndpoint() {
        this.express.get("/ext/get-auth-request-url", (request, response) => {
            console.log('get auth request url')
            console.log('request:' + JSON.stringify(request.body))
            // fixme: We are splitting, since the SIOP package appends ?state=undefined to the oob
            const oobQuery = (request.query['oob'] as string).split('?')[0]
            const oobStr = decodeBase64url(oobQuery).replace('goal-code', 'goalCode')
            console.log(oobStr)
            const oobPayload = JSON.parse(oobStr) as OobPayload
            if (!oobPayload) {
                return Server.sendErrorResponse(response, 403, "No oob param")
            }

            const stateId = oobPayload.id

            const stateMapping: StateMapping = this.stateMap.get(stateId);
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
        })

        this.express.post("/ext/siop-sessions", (request, response) => {
                console.log('SIOP Sessions')
                console.log(JSON.stringify(request.body, null, 2))
                const jwt = request.body.id_token;
                const authResponse = parseJWT(jwt);
                const stateMapping: StateMapping = this.stateMap.get(authResponse.payload.state)
                if (stateMapping === null) {
                    return Server.sendErrorResponse(response, 500, "No request mapping could be found for the given stateId.")
                }

                this.rp.verifyAuthorizationResponse(jwt, {audience: authResponse.payload.aud as string})
                    .then((verifiedResponse: VerifiedAuthenticationResponse) => {
                        console.log("verifiedResponse: ", verifiedResponse)
                        // The vp_token only contains 1 presentation max (the id_token can contain multiple VPs)
                        const verifiableCredential = verifiedResponse.payload.vp_token.presentation.verifiableCredential;
                        if (verifiableCredential) {
                            const credentialSubject = verifiableCredential[0]['credentialSubject'];
                            const bedrijfsinformatie = credentialSubject['Bedrijfsinformatie']
                            if (bedrijfsinformatie) {
                                stateMapping.authResponse = {
                                    token: verifiedResponse.jwt,
                                    kvkNummer: verifiedResponse.payload.kvkNummer,
                                    // @ts-ignore
                                    ...bedrijfsinformatie
                                }
                            }
                            response.statusCode = 200
                        } else {
                            response.statusCode = 500
                            response.statusMessage = 'Missing Chamber of Commerce credential subject'
                        }
                        return response.send()
                    })
                    .catch(reason => {
                        console.error("verifyAuthenticationResponseJwt failed:", reason)
                    })
            }
        )
    }

    private static buildPresentationDefinition(): IPresentationDefinition {
        return {
            id: "9449e2db-791f-407c-b086-c21cc677d2e0",
            purpose: "You need to prove your Chamber of Commerce data to login",
            submission_requirements: [{
                name: "kvk",
                rule: Rules.Pick,
                count: 1,
                from: "A"
            }],
            input_descriptors: [{
                id: "chamberOfCommerceSchema",
                purpose: "checking the schema",
                name: "kvkCredentialSchema",
                group: ["A"],
                schema: [{uri: "https://sphereon-opensource.github.io/vc-contexts/myc/bedrijfsinformatie-v1.jsonld"}]
            }]
        };
    }

    private buildRP() {
        const SPHEREON_UNIRESOLVER_RESOLVE_URL = 'https://uniresolver.test.sphereon.io/1.0/identifiers'
        const resolver = new Resolver({
            ...getUniResolver('ethr', {
                resolveUrl: 'https://dev.uniresolver.io/1.0/identifiers'
            }),
            // ...ethrDidResolver({infuraProjectId: 'e57bcb689a4f49d3a59e801384fcdca5'}),
            ...getUniResolver('lto', {
                resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL
            }),
            ...getUniResolver('factom', {
                resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL
            }),
            ...getUniResolver('key', {
                resolveUrl: 'https://dev.uniresolver.io/1.0/identifiers'
            }),

        })

        this.rp = RP.builder({ requestVersion: SupportedVersion.SIOPv2_ID1 })
          .withScope('openid vp_token')
          .withResponseType(ResponseType.ID_TOKEN)
          .withRedirectUri(process.env.REDIRECT_URL_BASE + "/siop-sessions",)
          .withRequestBy(PassBy.VALUE)
          .withInternalSignature(process.env.RP_PRIVATE_HEX_KEY, process.env.RP_DID, process.env.RP_DID + "#controller", SigningAlgo.ES256K)
          .withCustomResolver(resolver)
          .withClientId(process.env.RP_DID)
          .withSupportedVersions([
            SupportedVersion.SIOPv2_ID1,
          ])
          .addDidMethod('ethr')
          .withClientMetadata(
              {
                idTokenSigningAlgValuesSupported: [SigningAlgo.EDDSA], // added newly
                requestObjectSigningAlgValuesSupported: [SigningAlgo.EDDSA, SigningAlgo.ES256], // added newly
                responseTypesSupported: [ResponseType.ID_TOKEN], // added newly
                vpFormatsSupported: { jwt_vc: { alg: [SigningAlgo.EDDSA] } },
                scopesSupported: [Scope.OPENID_DIDAUTHN],
                subjectTypesSupported: [SubjectType.PAIRWISE],
                subjectSyntaxTypesSupported: ['did', 'did:ethr'],
                passBy: PassBy.VALUE,
              }
          )
          .withPresentationDefinition(Server.buildPresentationDefinition())
          .build();
    }

    private timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private mockResponse(stateMapping: StateMapping, response: Response) {
        if (stateMapping.pollCount == undefined) stateMapping.pollCount = 0

        if (stateMapping.pollCount > 2) {
            console.log("Poll mockup sending AuthResponse")
            const authResponse: AuthResponse = new AuthResponse("did:test-user");
            authResponse.aanduidingBijHuisnummer = "did:test-user"
            authResponse.naam = "Mr. Test"
            authResponse.huisletter = "Test"
            response.statusCode = 200
            response.send(authResponse)
        } else {
            console.log("Poll mockup delaying poll response")
            this.timeout(2000).then(() => {
                stateMapping.pollCount++
                console.log("Poll mockup sending 202 response, pollCount=", stateMapping.pollCount)
                response.statusCode = 202
                return response.send()
            })
        }
    }
}

export default new Server().express;
