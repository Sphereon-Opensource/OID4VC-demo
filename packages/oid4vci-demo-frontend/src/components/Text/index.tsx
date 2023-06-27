import React from "react";

export interface TextProperties {
  title?: string[]
  lines: string[]
  style?: React.CSSProperties,
  className?: string
}

export function Text(props: TextProperties): React.ReactElement | null {
  return (
      <div className={props.className} style={props.style}>
        {props.title ? props.title.map((t: string, index: number) => <h2 key={index}>{t}</h2>) : ''}
        {props.lines.map((line: string, index: number) => <p key={index}>{line}</p>)}
      </div>
  )
}