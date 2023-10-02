import React from 'react';
import {Routes, Route, HashRouter} from 'react-router-dom';
import SSICredentialIssueRequestPage from '../pages/SSICredentialIssueRequestPage';

import SSICredentialVerifyRequestPage from '../pages/SSICredentialVerifyRequestPage';
import SSICredentialIssuedSuccessPage from '../pages/SSICredentialIssuedSuccessPage';
import SSILandingPage from '../pages/SSILandingPage';

import SSIInformationRequestPage from '../pages/SSIInformationRequestPage';
import SSIDownloadPage from "../pages/SSIDownloadPage";
import SSIInformationSuccessPage from "../pages/SSIInformationSuccessPage"
import SSISelectCredentialPage from "../pages/SSISelectCredentialPage"

const AppRouter: React.FC = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<SSILandingPage/>}/>
                <Route path={"/information/request"} element={<SSIInformationRequestPage/>}/>
                <Route path={"/information/success"} element={<SSISelectCredentialPage/>}/>
                {/*<Route path={"/information/success"} element={<SSIInformationSuccessPage/>}/>*/}
                <Route path={"/credentials/verify/request"} element={<SSICredentialVerifyRequestPage/>}/>
                <Route path={"/credentials/issue/request"} element={<SSICredentialIssueRequestPage/>}/>
                <Route path={"/credentials/issue/success"} element={<SSICredentialIssuedSuccessPage/>}/>
                <Route path={"/download"} element={<SSIDownloadPage/>}/>
            </Routes>
        </HashRouter>
    );
};

export default AppRouter;
