import React from "react";
import style from "./DeepLink.module.css";

export interface DeepLinkProps {
  link: string
  style?: React.CSSProperties
}

export default function DeepLink(props: DeepLinkProps): React.ReactElement | null {
  const truncateUrl = (url: string, numChars?: number): string => {
    if (url) {
      const address = new URL(url)
        return 'Open from wallet...'
      // return `${address.protocol}//${address.hostname}...${address.href.substring(address.href.length - (numChars ?? 10))}`
    }
    return ''
  }
  return (
      <div style={props.style} className={style.container}>
        <img style={{
          width: '30px',
          height: '25px'
        }} src="Group_41.svg" alt="Deep link"/>
        <div className={`${style.deepLink} poppins-normal-9`}>
          <a href={props.link}>{truncateUrl(props.link)}</a>
        </div>
      </div>
  )
}
