
export function extractFirstSubdomain(url: string): string | null {
    const hostname = new URL(url).hostname;
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        return null; // IP address, return null
    }
    const subdomainMatch = hostname.match(/^[^.]+/);
    if (subdomainMatch) {
        return subdomainMatch[0];
    }
    return null;
}

