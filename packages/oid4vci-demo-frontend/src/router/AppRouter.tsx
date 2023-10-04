import React from 'react';
import {Routes, Route, HashRouter} from 'react-router-dom';
import SSICredentialIssueRequestPage from '../pages/SSICredentialIssueRequestPage';
import SSIInformationSuccessPage from '../pages/SSIInformationSuccessPage';
import SSICredentialVerifyRequestPage from '../pages/SSICredentialVerifyRequestPage';
import SSICredentialIssuedSuccessPage from '../pages/SSICredentialIssuedSuccessPage';
import SSILandingPage from '../pages/SSILandingPage';

import SSIInformationRequestPage from '../pages/SSIInformationRequestPage';
import SSIDownloadPage from "../pages/SSIDownloadPage";
import {getCurrentEcosystemPageOrComponentConfig, SSICredentialsLandingPageConfig} from "../ecosystem-config";
import SSICredentialsLandingPage from "../pages/SSICredentialsLandingPage";

const AppRouter: React.FC = () => {
    const config = getCurrentEcosystemPageOrComponentConfig('SSICredentialsLandingPage') as SSICredentialsLandingPageConfig
    return (
        <HashRouter>
            <Routes>
                {/*<Route path="/" element={<SSILandingPage/>}/>*/}
                <Route path="/" element={<SSICredentialsLandingPage/>}/>
                <Route path={"/information/request"} element={<SSIInformationRequestPage/>}/>
                <Route path={"/information/success"} element={<SSIInformationSuccessPage/>}/>
                <Route path={"/credentials/verify/request"} element={<SSICredentialVerifyRequestPage/>}/>
                <Route path={"/credentials/issue/request"} element={<SSICredentialIssueRequestPage/>}/>
                <Route path={"/credentials/issue/success"} element={<SSICredentialIssuedSuccessPage/>}/>
                <Route path={"/download"} element={<SSIDownloadPage/>}/>
                {config.credentials.map(value => (
                        <Route
                                key={value.name}
                                path={`/credentials/${value.name}`}
                                // element={<> {window.location.href = value.route} </>}
                        />
                ))}
            </Routes>
        </HashRouter>
    );
};

export default AppRouter;
