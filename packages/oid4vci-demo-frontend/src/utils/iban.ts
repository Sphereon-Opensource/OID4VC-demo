export function generateRandomIBAN(): string {
    const countryCode = "NL10";
    const bankCode = "BAB";
    const accountNumber = generateRandomAccountNumber();
    return `${countryCode}${bankCode}${accountNumber}`;
}

function generateRandomAccountNumber(): string {
    // Generate a random 10-digit account number
    return Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
}
