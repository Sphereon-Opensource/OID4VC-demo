import * as u8a from 'uint8arrays'

export function base64ToBytes(s: string): Uint8Array {
    const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    return u8a.fromString(inputBase64Url, 'base64url')
}

export function decodeBase64url(s: string): string {
    return u8a.toString(base64ToBytes(s))
}

// noinspection JSUnusedLocalSymbols

export function generateRequestObjectUri() {
    return `${process.env.REDIRECT_URL_BASE}/requests/uniquevalue`;
}
