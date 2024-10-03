import React from 'react'
import InputField from "../InputField";

type ClaimsPayload = Record<string, any>


const formatKey = (key: string): string => {
    return key.replace(/([A-Z|0-9])/g, (match, p1, offset) => {
        return offset > 0 ? ` ${p1}` : p1
    })
}

const RenderClaims: React.FC<{ payload: ClaimsPayload; depth?: number }> = ({ payload, depth = 0 }) => {
    const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(depth)
    const keyIndent = '\u00A0'

    return (
        <>
            {Object.entries(payload).map(([key, value], index) => {
                const formattedKey = formatKey(key)
                if (typeof value === 'object') {
                    return value !== null && Object.keys(value).length > 0 && (
                        <React.Fragment key={index}>
                            <div>{indent}{formattedKey}:</div>
                            <RenderClaims payload={value} depth={depth + 1}/>
                            <div>{'\u00A0'}</div>
                        </React.Fragment>
                    )
                } else {
                    return <div key={index}>{indent}{formattedKey}:{keyIndent} {String(value)}</div>
                }
            })}
        </>
    )
}

export default RenderClaims
