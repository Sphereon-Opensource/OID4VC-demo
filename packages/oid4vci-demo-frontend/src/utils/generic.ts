
export function extractSubdomainsBefore(url: string, domain: string): string | null {
    const hostname = new URL(url).hostname
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        return null // IP address, return null
    }

    const domainParts = domain.split('.').filter(Boolean)
    const hostParts = hostname.split('.').filter(Boolean)
    if (domainParts.length === 0 || hostParts.length === 0) {
        return null // Invalid input, return null
    }

    let matchingParts = []
    let i = domainParts.length - 1
    while (i >= 0 && hostParts[i] !== domainParts[i]) {
        matchingParts.unshift(hostParts[i])
        i--
    }

    if (matchingParts.length > 0) {
        return matchingParts.join('.')
    }
    return null
}