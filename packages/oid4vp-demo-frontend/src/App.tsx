import "./App.css"
import React, {Component} from "react"
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import Button from '@material-ui/core/Button';
import AuthenticationModal from "./components/AuthenticationModal"
import jsonpack from "jsonpack"
import Nav from "./components/Nav"
import Landing from "./pages/Landing"
import SecretPage from "./pages/SecretPage"
import ClassifiedPage from "./pages/ClassifiedPage"
import {Col, Container, Row} from "react-bootstrap"
import {CredentialMapper, UniformVerifiablePresentation} from "@sphereon/ssi-types";
import {AuthorizationResponsePayload} from "@sphereon/ssi-sdk.siopv2-oid4vp-common";


export type AppState = {
    showAuthenticationModal?: boolean
    payload?: AuthorizationResponsePayload
}


class App extends Component<AppState> {

    state: AppState = {}
    private readonly _stateStorageKey = "state-onto-app"

    constructor(props: AppState, context: any) {
        super(props, context)
        this.initState()
    }

    render() {
        this.saveState()
        const payload = this.state.payload!
        return (
            <div>
                <style type="text/css">
                    {`
                                    .btn-sphereon {
                                      background-color: #e8261f;
                                      color: white;
                                      border-radius: 0px;
                                    }
                                    
                                    .btn-sphereon:hover {
                                        background-color: #ba1e19;
                                        color: white;
                                        border-radius: 0px;
                                    }
                                    
                                    .btn-sphereon2 {
                                      background-color: #352575;
                                      color: white;
                                      border-radius: 0px;
                                    }
                                    
                                    .btn-sphereon2:hover {
                                        background-color: #ba1e19;
                                        color: white;
                                        border-radius: 0px;
                                    }
                                `}
                </style>
                <header className="App-header">
                    {/*<img style={{height: 50}}*/}
                    {/*     src="https://sphereon.com/content/themes/sphereon/assets/img/logo.png?auto=compress&cs=tinysrgb&h=10"*/}
                    {/*     alt="new"*/}
                    {/*/>*/}
                    {this.signInOutButtons()}
                </header>
                <Router>
                    <div style={{display: "flex"}}>
                        <Nav payload={payload}/>
                        <Switch>
                            <Route path="/secret">
                                <SecretPage payload={payload}/>
                            </Route>
                            <Route path="/classified">
                                <ClassifiedPage payload={payload}/>
                            </Route>
                            <Route path="/"><Landing/></Route>
                        </Switch>
                        <AuthenticationModal show={this.state.showAuthenticationModal as boolean}
                                             onCloseClicked={this.hideLoginDialog}
                                             onSignInComplete={this.completeSignIn}/>
                    </div>
                </Router>
            </div>
        )
    }

    private showLoginDialog = () => {
        this.setState({showAuthenticationModal: true})
    }

    private hideLoginDialog = () => {
        this.setState({showAuthenticationModal: false})
    }

    private completeSignIn = (payload: AuthorizationResponsePayload) => {
        this.setState({showAuthenticationModal: false, payload})
    }

    private signOut = () => {
        this.setState({payload: undefined})
    }

    private initState() {
        let storedState = sessionStorage.getItem(this._stateStorageKey)
        if (storedState != null) {
            this.loadState(storedState)
        } else {
            this.setState({showAuthenticationModal: false})
        }
    }

    private loadState = (storedState: string) => {
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state = jsonpack.unpack(storedState) as AppState
    }


    private saveState = () => {
        sessionStorage.setItem(this._stateStorageKey, jsonpack.pack(this.state))
    }

    private signInOutButtons = () => {
        const payload = this.state.payload

        if (payload) {

            const wrappedPresentation = CredentialMapper.toWrappedVerifiablePresentation(Array.isArray(payload.vp_token) ? payload.vp_token[0] : payload.vp_token!)
            const presentation = wrappedPresentation?.presentation as UniformVerifiablePresentation
            const subjects = presentation?.verifiableCredential[0].credential.credentialSubject // Although rare, a VC can have more than one subject
            let subject2 = undefined
            if (Array.isArray(presentation?.verifiableCredential) && presentation.verifiableCredential.length > 1) {
                const subjects2 = presentation.verifiableCredential[1]!.credential.credentialSubject
                if (subjects2) {
                    if (Array.isArray(subjects2)) {
                        subject2 = subjects2[0]
                    } else {
                        subject2 = subjects2
                    }
                }
            }

            const subject = Array.isArray(subjects) ? subjects[0] : subjects!
            return (<Container fluid>
                    <Row className="align-items-center">

                        <Col className="col">
                            <h5>{subject.firstName} {subject.lastName as string} ({'company' in subject ? subject.company : 'emailAddress' in subject ? subject.emailAddress : "demo"}{!!subject2 && 'awardDetails' in subject2 ? `, ${subject2.awardDetails.awardDescription}`: ""})</h5>
                        </Col>
                        <Col className="col-1">
                            <Button style={{width: "90%", backgroundColor: 'red', color: "white"}}
                                    onClick={this.signOut} variant="contained">Sign out</Button>
                        </Col>
                    </Row>
                </Container>
            )
        } else {
            return (<Container fluid>
                    <Row>
                        <Col className="col-10">
                            <img style={{height: 30}}
                                 src="https://sphereon.com/content/themes/sphereon/assets/img/logo-wit.svg?auto=compress&cs=tinysrgb&h=10"
                                 alt="new"
                            />
                        </Col>
                        <Col className="col-1">
                            <Button style={{width: "90%", backgroundColor: 'red', color: "white"}}
                                    onClick={this.showLoginDialog} variant="contained">Sign in</Button>
                        </Col>
                    </Row>
                </Container>
            )
        }
    }
}

export default App
