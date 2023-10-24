import React from "react"
import style from './Card.module.css'
import {Text, TextProperties} from "../Text"
import SSIPrimaryButton, {IButtonProps} from "../SSIPrimaryButton"

export interface ImageProperties {
  src: string
  alt: string
  width?: string | number
  height?: string | number
}

export interface CardProperties {
  style?: React.CSSProperties
  className?: string
  disabled?: boolean
  image: ImageProperties
  button: IButtonProps
  text: TextProperties
}

export default function Card(props: CardProperties): React.ReactElement | null {
  return (
      <div style={props.style} className={`${style.container} ${props.className ?? ''} ${props.disabled ? style.disabled : ''}`}>
        <div>
          <div>
            <img src={props.image.src} alt={props.image.alt} width={props.image.width} height={props.image.height}/>
          </div>
          <Text style={props.text.style} className={props.text.className} title={props.text.title} lines={props.text.lines} />
        </div>
        <div>
          <SSIPrimaryButton
              caption={props.button.caption}
              className={props.button.className}
              style={props.button.style}
              onClick={props.button.onClick}
              disabled={props.button.disabled}/>
        </div>
      </div>
  )
}
