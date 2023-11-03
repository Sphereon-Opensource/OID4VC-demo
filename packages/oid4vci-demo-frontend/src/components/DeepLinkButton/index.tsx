import React from "react"
import styles from "./DeepLinkButton.module.css"
import SSIPrimaryButton from "../SSIPrimaryButton"
import {t} from "i18next"
import SSISecondaryButton from "../SSISecondaryButton"

export interface DeepLinkProps {
  link: string
  buttonType?: string
  textColor?: string
  style?: React.CSSProperties
}

function generateSecondaryButton(props: DeepLinkProps): React.ReactElement {
  return (
      <SSISecondaryButton
          caption={t('button_open_from_wallet')}
          style={{ width: 200, ...props.style }}
          color = {props.textColor? props.textColor: '#FBFBFB'}
          disabled={!props.link}
          onClick={async () => {
            window.location.href = props.link
          }}
      />
  );
}

export default function DeepLinkButton(props: DeepLinkProps): React.ReactElement {
  if (props.buttonType === 'secondary') {
    return generateSecondaryButton(props)
  }

  return (
      <SSIPrimaryButton
          caption={t('button_open_from_wallet')}
          style={{ width: 200, ...styles, ...props.style }}
          disabled={!props.link}
          onClick={async () => {
            window.location.href = props.link
          }}
      />
  );
}
