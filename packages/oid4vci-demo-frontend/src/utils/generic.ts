export function extractSubdomainsBefore(url: string, domain: string): string | null {
    const hostname = new URL(url).hostname

    // Check if the hostname is an IP address
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        return null // IP address, return null
    }

    const domainParts = domain.split('.').filter(Boolean).reverse()
    const hostParts = hostname.split('.').filter(Boolean).reverse()

    if (domainParts.length === 0 || hostParts.length === 0) {
        return null // Invalid input, return null
    }

    const matchingParts = []
    for (let i = 0; i < hostParts.length; i++) {
        if (hostParts[i] !== domainParts[i]) {
            matchingParts.push(hostParts[i])
        }
    }

    if (matchingParts.length > 0) {
        return matchingParts.reverse().join('.')
    }

    return null
}