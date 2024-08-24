import {UniformCredential} from "../../types";
import {CredentialDetailsRow, toNonPersistedCredentialSummary} from "@sphereon/ui-components.credential-branding";
import {CredentialMapper, SdJwtDecodedVerifiableCredentialPayload} from "@sphereon/ssi-types";

export async function convertPIDToUniformCredential(credential: any): Promise<UniformCredential> {
    //fixme: we have a problem with crypto library that should be fixed when we update the sdk libs version. for now, we're assuming that sd-jwt credential that we have here is already decoded
    /*if (CredentialMapper.isSdJwtEncoded(credential)) {
        // @ts-ignore
        const hasher = (data, algorithm) => createHash(algorithm).update(data).digest()
        // @ts-ignore
        const sdJwtDecodedVc: SdJwtDecodedVerifiableCredential = CredentialMapper.decodeSdJwtVcAsync(credential as string, hasher)
        return {
            original: credential,
            subjectClaim: sdJwtDecodedVc.decodedPayload as Record<string, any>,
            transformedClaims: convertPIDSdJwtWellknownPayloadValues(sdJwtDecodedVc.decodedPayload)
        }
    }*/
    if ('vct' in credential) {
        return {
            original: credential,
            subjectClaim: credential,
            transformedClaims: convertPIDSdJwtWellknownPayloadValues(credential)
        }
    }
    //fixme: we should decode the mdoc here. for now I'm assuming that I'm getting the decoded value here
    else if (isMdoc(credential)) {
        return {
            original: credential,
            subjectClaim: credential,
            transformedClaims: convertPIDMdocWellknownPayloadValues(credential)
        }
    }
    const credentialSummary = await toNonPersistedCredentialSummary(credential)
    return {
        original: credential,
        subjectClaim: CredentialMapper.toUniformCredential(credential).credentialSubject,
        transformedClaims: convertPIDUniformVCWellknownPayloadValues(credentialSummary.properties)
    }
}

/**
 * This function reduces the payload to show only the important parts of the claims in a human-readable fashion. We're doing this with keeping the pid credential in mind
 * @param payload
 */
function convertPIDSdJwtWellknownPayloadValues(payload: SdJwtDecodedVerifiableCredentialPayload) {
    const humanReadablePayload = {};

    const keyMappings = {
        "issuing_country": "Issuing Country",
        "issuing_authority": "Issuing Authority",
        "given_name": "Given Name",
        "family_name": "Family Name",
        "birth_family_name": "Birth Family Name",
        "birthdate": "Date of Birth",
        "place_of_birth": "Place of Birth",
        "nationalities": "Nationalities"
    };

    for (const [key, value] of Object.entries(payload)) {
        // @ts-ignore
        if (keyMappings[key]) {
            // @ts-ignore
            humanReadablePayload[keyMappings[key]] = enforceStringSafety(value);
        }
    }

    if (payload.age_equal_or_over) {
        const ageKeys = Object.keys(payload.age_equal_or_over).map(Number).sort((a, b) => a - b);
        const lowerLimit = ageKeys[0];
        const upperLimit = ageKeys[ageKeys.length - 1];
        // @ts-ignore
        humanReadablePayload[`Age is above ${lowerLimit}`] = payload.age_equal_or_over[lowerLimit.toString()];
        // @ts-ignore
        humanReadablePayload[`Age is above ${upperLimit}`] = payload.age_equal_or_over[upperLimit.toString()];
    }
    if (payload.address) {
        // @ts-ignore
        const { street_address, locality, postal_code } = payload.address;
        const addressParts = [street_address, postal_code, locality].filter(part => part);
        // @ts-ignore
        humanReadablePayload["Address"] = addressParts.join(', ');
    }
    if (payload.place_of_birth) {
        // @ts-ignore
        humanReadablePayload["Place of Birth"] = payload.place_of_birth['locality'] ?? ''
    }
    return humanReadablePayload;
}

function enforceStringSafety(value: unknown): string {
    if (Array.isArray(value)) {
        let updated = ''
        value.forEach(val => updated += val + ', ')
        return updated.substring(0, updated.length - 2)
    }
    return value as string
}

function convertPIDMdocWellknownPayloadValues(credential: any) {
    const humanReadablePayload = {};

    const keyMappings = {
        "given_name": "Given Name",
        "family_name": "Family Name",
        "family_name_birth": "Birth Family Name",
        "birth_date": "Date of Birth",
        "birth_place": "Place of Birth",
        "resident_country": "Resident Country",
        "resident_city": "Resident City",
        "resident_postal_code": "Postal Code",
        "resident_street": "Street Address",
        "nationality": "Nationality",
        "nationalities": "Nationalities",
        "issuing_country": "Issuing Country",
        "issuing_authority": "Issuing Authority"
    };

    for (const [key, value] of Object.entries(credential)) {
        // @ts-ignore
        if (keyMappings[key]) {
            // @ts-ignore
            humanReadablePayload[keyMappings[key]] = enforceStringSafety(value);
        }
    }

    const ageFields = Object.keys(credential)
        .filter(key => key.startsWith("age_over_"))
        .sort((a, b) => parseInt(a.split("_")[2]) - parseInt(b.split("_")[2]));

    if (ageFields.length > 0) {
        const lowerAgeLimit = ageFields[0].split("_")[2];
        const upperAgeLimit = ageFields[ageFields.length - 1].split("_")[2];

        // @ts-ignore
        humanReadablePayload[`Age is over ${lowerAgeLimit}`] = credential[ageFields[0]];
        // @ts-ignore
        humanReadablePayload[`Age is over ${upperAgeLimit}`] = credential[ageFields[ageFields.length - 1]];
    }

    const addressParts = [
        credential["resident_street"],
        credential["resident_postal_code"],
        credential["resident_city"]
    ].filter(part => part);

    if (addressParts.length > 0) {
        // @ts-ignore
        humanReadablePayload["Address"] = addressParts.join(', ');
    }

    return humanReadablePayload;
}

function isMdoc(credential: any) {
    return 'docType' in credential && credential['docType'] === 'org.iso.18013.5.1.mDL'
}

function convertPIDUniformVCWellknownPayloadValues(properties: CredentialDetailsRow[]) {
    const humanReadablePayload: Record<string, string> = {};

    const keyMappings: Record<string, string> = {
        "issuing_country": "Issuing Country",
        "issuing_authority": "Issuing Authority",
        "given_name": "Given Name",
        "family_name": "Family Name",
        "birth_family_name": "Birth Family Name",
        "birthdate": "Date of Birth",
        "place_of_birth": "Place of Birth",
        "nationalities": "Nationalities"
    };

    properties.forEach(property => {
        const { id, value } = property;

        if (keyMappings[id]) {
            humanReadablePayload[keyMappings[id]] = enforceStringSafety(value);
        } else if (id === "age_equal_or_over" && typeof value === "object" && value !== null) {
            const ageKeys = Object.keys(value).map(Number).sort((a, b) => a - b);
            const lowerLimit = ageKeys[0];
            const upperLimit = ageKeys[ageKeys.length - 1];

            humanReadablePayload[`Age is above ${lowerLimit}`] = value[lowerLimit.toString()];
            humanReadablePayload[`Age is above ${upperLimit}`] = value[upperLimit.toString()];
        } else if (id === "address" && typeof value === "object" && value !== null) {
            const { street_address, locality, postal_code } = value;
            const addressParts = [street_address, postal_code, locality].filter(part => part);
            humanReadablePayload["Address"] = addressParts.join(', ');
        }
    });

    return humanReadablePayload;
}