export function extractSubdomains(url: string, numParts?: number): string | null {
    const hostname = new URL(url).hostname
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        return null
    }
    const subdomainMatch = hostname.split('.').slice(0, numParts).join('.')
    if (subdomainMatch) {
        return subdomainMatch
    }
    return null
}
