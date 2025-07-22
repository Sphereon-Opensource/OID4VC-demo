import React, {useEffect, useState} from 'react'
import {isImageAddress} from "@sphereon/ui-components.credential-branding"

type ClaimsPayload = Record<string, any>


const formatKey = (key: string): string => {
    return key.replace(/([A-Z|0-9])/g, (match, p1, offset) => {
        return offset > 0 ? ` ${p1}` : p1
    })
}

const RenderClaims: React.FC<{ payload: ClaimsPayload; depth?: number }> = ({payload, depth = 0}) => {
    const [processedEntries, setProcessedEntries] = useState<Array<{ key: string, value: any, isImage: boolean }>>([])
    const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(depth)
    const keyIndent = '\u00A0\u00A0'

    useEffect(() => {
        const processEntries = async () => {
            const entries = await Promise.all(
                Object.entries(payload).map(async ([key, value]) => ({
                    key,
                    value,
                    isImage: typeof value === 'string' ? await isImageAddress(value) : false
                }))
            )
            setProcessedEntries(entries)
        }

        processEntries()
    }, [payload])

    return (
        <>
            {processedEntries.map(({key, value, isImage}, index) => {
                    const formattedKey = formatKey(key)
                    if (typeof value === 'object') {
                        return value !== null && Object.keys(value).length > 0 && (
                            <React.Fragment key={index}>
                                <div>{indent}{formattedKey}:</div>
                                <RenderClaims payload={value} depth={depth + 1}/>
                                <div>{'\u00A0'}</div>
                            </React.Fragment>
                        )
                    } else if (isImage) {
                        return (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                }}
                            >
                            <span style={{whiteSpace: 'pre'}}>
                                {indent}{formattedKey}:{keyIndent}
                            </span>
                                <img
                                    src={value}
                                    alt={formattedKey}
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        )
                    } else {
                        return (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start'
                                }}
                            >
                            <span style={{whiteSpace: 'pre'}}>
                                {indent}{formattedKey}:{keyIndent}
                            </span>
                                <span style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    flex: 1
                                }}>
                                {String(value)}
                            </span>
                            </div>
                        )
                    }
                }
            )
            }
        </>
    )
}

export default RenderClaims
