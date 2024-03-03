import React, {CSSProperties} from "react"

export interface TextProperties {
  id?: string
  title?: string[]
  lines: string[]
  style?: CSSProperties
  h2Style?: CSSProperties
  pStyle?: CSSProperties
  className?: string
}

export function Text(props: TextProperties): React.ReactElement | null {
  return (
      <div id={props.id} className={props.className} style={props.style}>
        {props.title ? props.title.map((t: string, index: number) => <h2 style={props.h2Style} key={index}>{t}</h2>) : ''}
        {props.lines.map((line: string, index: number) => <p style={props.pStyle} key={index}>{line}</p>)}
      </div>
  )
}