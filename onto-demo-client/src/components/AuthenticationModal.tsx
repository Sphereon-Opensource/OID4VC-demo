import {Button, Col, Container, Modal, Row} from "react-bootstrap"
import {Component} from "react"
import {AuthResponse} from "@sphereon/did-auth-siop-web-demo-shared"
import AuthenticationQR from "./AuthenticationQR";

/* This is a container dialog for the QR code component. It re emits the onSignInComplete callback.  */

export type AuthenticationModalProps = {
  show?: boolean
  onCloseClicked?: () => void
  onSignInComplete: (AuthResponse: AuthResponse) => void
}

interface AuthenticationModalState {
  authRequestCreated: boolean
}

export default class AuthenticationModal extends Component<AuthenticationModalProps, AuthenticationModalState> {

  private readonly scanText = "Please scan this QR code now in your authenticator app.";
  private readonly authText = "Please approve the authentication request in your app.";

  constructor(props: AuthenticationModalProps) {
    super(props)
    this.state = {authRequestCreated: false}
  }

    render() {
    return <Modal show={this.props.show} animation={false}>
      <Modal.Header style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Modal.Title>QR Code Authentication</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Container>
          <Row>
            <Col className="d-flex justify-content-center">
              <h6>{this.state.authRequestCreated ? this.authText : this.scanText}</h6>
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-center" style={{paddingTop: "10px"}}>
              <AuthenticationQR
                  onAuthRequestCreated={() => {
                    this.setState({authRequestCreated: true})
                  }}
                  onSignInComplete={(AuthResponse) =>
                      this.props.onSignInComplete(AuthResponse)}/>
            </Col>
          </Row>

        </Container>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={this.handleClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  }

  private handleClose = () => {
    this.props.onCloseClicked?.()
  }
}
