import { UniformCredential } from '../../types';
import React, { useEffect, useState } from 'react';
import { useFlowRouter } from '../../router/flow-router';
import { SSIInformationVerifyPageConfig } from '../../ecosystem/ecosystem-config';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useEcosystem } from '../../ecosystem/ecosystem';
import { Trans, useTranslation } from 'react-i18next';
import { Text } from '../../components/Text';
import SSIPrimaryButton from '../../components/SSIPrimaryButton';
import { convertPIDToUniformCredential } from '../../utils/mapper/PIDMapper';
import { NonMobile } from "../..";

type State = {
    credential: UniformCredential;
};

const SSIInformationVerifyPage: React.FC = () => {
    const flowRouter = useFlowRouter<SSIInformationVerifyPageConfig>();
    const location = useLocation();
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 767px)' });
    const state: State | undefined = location.state;
    const pageConfig = flowRouter.getPageConfig();
    const generalConfig = useEcosystem().getGeneralConfig();
    const { t } = useTranslation();
    const [payload, setPayload] = useState<Record<string, any> | null>(null);
    const credential = state?.credential
    // Mock data for testing
    // const credential = getMockCredentialSdJwt();
    //const credential = getMockCredentialMdoc();
    const numberOfColumns = pageConfig.numberOfColumns ?? 1;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await convertPIDToUniformCredential(credential);
                setPayload(result);
            } catch (error) {
                console.error('Error converting credential:', error);
            }
        };

        fetchData();
    }, [credential]);

    if (!payload) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', userSelect: 'none' }}>
            <NonMobile>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        ...(pageConfig.photoLeft && {
                            background: `url(${pageConfig.photoLeft})`,
                            backgroundSize: 'cover',
                        }),
                        width: pageConfig.leftPaneWidth ?? 'auto',
                        height: pageConfig.leftPaneWidth ? '100%' : 'auto',
                        alignItems: 'center',
                        ...(pageConfig.backgroundColor && {backgroundColor: pageConfig.backgroundColor}),
                        ...(pageConfig.logo && {justifyContent: 'center'})
                    }}
                >
                    {pageConfig.logo &&
                        <img
                            src={pageConfig.logo.src}
                            alt={pageConfig.logo.alt}
                            width={pageConfig.logo.width}
                            height={pageConfig.logo.height}
                        />
                    }
                </div>
            </NonMobile>
            <div
                style={{
                    display: 'flex',
                    width: `${isTabletOrMobile ? '100%' : '40%'}`,
                    height: '100%',
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '70%',
                        marginTop: '6%',
                    }}
                >
                    <Trans>
                        <Text
                            style={{
                                whiteSpace: 'pre-line',
                                flexGrow: 1,
                                textAlign: 'center',
                            }}
                            title={t(pageConfig.topTitle ?? 'sharing_data_confirm_right_pane_title').split('\n')}
                            lines={t(`${pageConfig.topDescription ?? 'sharing_data_confirm_right_pane_paragraph'}`).split('\r\n')}
                        />
                    </Trans>
                    <div style={{marginTop: '20px', textAlign: 'center', width: '80%'}}>
                        {payload.transformedClaims &&
                            Object.entries(payload.transformedClaims).map(([key, value], index) => (
                                <div key={index} style={{marginBottom: '15px'}}>
                                    {key}
                                    <div>
                                        {typeof value === 'object' && value !== null
                                            ? JSON.stringify(value)
                                            : String(value)}
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div style={{width: '100%', alignSelf: 'flex-end' }}>
                        <SSIPrimaryButton
                            caption={t('label_next')}
                            style={{ width: '100%' }}
                            onClick={async () => await flowRouter.nextStep({ payload: state?.credential.original })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

function getMockCredentialMdoc() {
    return {
        docType: 'org.iso.18013.5.1.mDL',
        version: '1.0',
        issuer: 'DE-BMVI',
        credentialID: 'dXJuOmV4YW1wbGU6ZGUtYm12aToxMjM0NTY=',
        given_name: 'ERIKA',
        family_name: 'MUSTERMANN',
        family_name_birth: 'GABLER',
        birth_date: '1964-08-12',
        age_birth_year: 1964,
        age_in_years: 59,
        age_over_12: true,
        age_over_14: true,
        age_over_16: true,
        age_over_18: true,
        age_over_21: true,
        age_over_65: false,
        birth_place: 'BERLIN',
        resident_country: 'DE',
        resident_city: 'KÖLN',
        resident_postal_code: '51147',
        resident_street: 'HEIDESTRAẞE 17',
        nationality: 'DE',
        issuance_date: '...',
        expiry_date: '...',
        issuing_country: 'DE',
        issuing_authority: 'DE',
    };
}

function getMockCredentialSdJwt() {
    return {
        vct: 'urn:eu.europa.ec.eudi:pid:1',
        iss: 'https://demo.pid-issuer.bundesdruckerei.de/c',
        issuing_country: 'DE',
        issuing_authority: 'DE',
        given_name: 'ERIKA',
        family_name: 'MUSTERMANN',
        birth_family_name: 'GABLER',
        birthdate: '1964-08-12',
        age_birth_year: 1964,
        age_in_years: 59,
        age_equal_or_over: {
            '12': true,
            '14': true,
            '16': true,
            '18': true,
            '21': true,
            '65': false,
        },
        place_of_birth: {
            locality: 'BERLIN',
        },
        address: {
            locality: 'KÖLN',
            postal_code: '51147',
            street_address: 'HEIDESTRAẞE 17',
        },
        nationalities: ['DE'],
    };
}

export default SSIInformationVerifyPage;
