import React from "react"
import style from "./DeepLink.module.css"
import SSIPrimaryButton from "../SSIPrimaryButton"
import {t} from "i18next"

export interface DeepLinkProps {
  link: string
  style?: React.CSSProperties
}

export default function DeepLink(props: DeepLinkProps): React.ReactElement | null {
  return (
      <SSIPrimaryButton
          caption={t('button_open_from_wallet')}
          style={{width: 200, ...style}}
          disabled={!props.link}
          onClick={async () => {
              window.location.href = props.link
          }}
      />
  )
}
