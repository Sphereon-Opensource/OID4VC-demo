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
  authRequestRetrieved: boolean
}

export default class AuthenticationModal extends Component<AuthenticationModalProps, AuthenticationModalState> {

  private readonly scanText = "Please scan the QR code with your app.";
  private readonly authText = "Please approve the request in your app.";

  constructor(props: AuthenticationModalProps) {
    super(props)
    this.state = {authRequestRetrieved: false}
  }

    render() {
    return <Modal show={this.props.show} animation={true} style={{
      height: "100%",
      marginTop: "150px"
    }}>
      <Modal.Header style={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#352575",
        color: "white",
        alignItems: "center",
      }}>
        <Modal.Title>Authentication</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Container>
          <Row>
            <Col className="d-flex justify-content-center">
              <h6>{this.state.authRequestRetrieved ? this.authText : this.scanText}</h6>
            </Col>
          </Row>
          <Row>
            <Col className="d-flex justify-content-center" style={{paddingTop: "10px"}}>
              <AuthenticationQR
                  onAuthRequestRetrieved={() => {
                    this.setState({authRequestRetrieved: true})
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
