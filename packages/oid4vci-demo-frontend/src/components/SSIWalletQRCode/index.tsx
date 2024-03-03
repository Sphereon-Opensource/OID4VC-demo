import SSISecondaryButton, {IProps} from "../SSISecondaryButton"
import React, {CSSProperties} from "react"
import {ImageProperties} from "../../types"

export interface SSIWalletQRCodeProps {
  className?: string
  style?: CSSProperties
  text?: string
  button: IProps
  image: ImageProperties & { style?: CSSProperties }
}
const SSIWalletQRCode: React.FC<SSIWalletQRCodeProps> = (props: SSIWalletQRCodeProps) => {
  return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        ...props.style
      }} className={props.className}>
          {props.text && (<p>{props.text}</p>)}
          {props.image && (<img {...props.image}/>)}
          <SSISecondaryButton {...props.button} />
      </div>
  )
}

export default SSIWalletQRCode