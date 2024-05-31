import React from 'react'
import {HashRouter, Route, Routes} from 'react-router-dom'
import SSICredentialIssueRequestPage from '../pages/SSICredentialIssueRequestPage'
import SSICredentialVerifyRequestPage from '../pages/SSICredentialVerifyRequestPage'
import SSICredentialIssuedSuccessPage from '../pages/SSICredentialIssuedSuccessPage'
import SSILandingPage from '../pages/SSILandingPage'
import SSIInformationManualRequestPage from '../pages/SSIInformationManualRequestPage'
import SSIDownloadPage from "../pages/SSIDownloadPage"
import SSIInformationSuccessPage from "../pages/SSIInformationSuccessPage"
import SSISelectCredentialPage from "../pages/SSISelectCredentialPage"
import SSICredentialsLandingPage from "../pages/SSICredentialsLandingPage"
import SphereonWalletPage from "../pages/SphereonWalletPage"
import SSILoadingPage from '../pages/SSILoadingPage';
import {useFlowAppRouter} from "./flow-router"
import SSIEmailVerificationPage from "../pages/SSIEmailVerificationPage"
import SSIWelcomePage from '../pages/SSIWelcomePage'
import SSIIdentityVerificationPage from '../pages/SSIIdentityVerificationPage'
import SSICredentialVerifyFromVPRequestPage from '../pages/SSICredentialVerifyFromVPRequest'
import SSIPresentationsLandingPage from "../pages/SSIPresentationsLandingPage";

export const routes: Record<string, any> = {
    '/start': <SSILandingPage/>,
    '/landing': <SSICredentialsLandingPage/>,
    '/landingvp': <SSIPresentationsLandingPage/>,
    '/information/manual/request': <SSIInformationManualRequestPage/>,
    '/information/success': <SSIInformationSuccessPage/>,
    '/credentials/select': <SSISelectCredentialPage/>,
    '/credentials/verify/request': <SSICredentialVerifyRequestPage/>,
    '/credentials/verify/vp/request': <SSICredentialVerifyFromVPRequestPage/>,
    '/credentials/issue/request': <SSICredentialIssueRequestPage/>,
    '/credentials/issue/success': <SSICredentialIssuedSuccessPage/>,
    '/verify/email': <SSIEmailVerificationPage/>,
    '/verify/identity': <SSIIdentityVerificationPage/>,
    '/download/sphereon-wallet': <SphereonWalletPage/>,
    '/download': <SSIDownloadPage/>,
    '/loading': <SSILoadingPage/>,
    '/welcome': <SSIWelcomePage/>
}

const AppRouter: React.FC = () => {
    const defaultRoute = useFlowAppRouter().getDefaultLocation()
    return (
        <HashRouter>
            <Routes>
                {Object.entries(routes)
                    .filter(([path]) => path === defaultRoute)
                    .map(([path, component]) => (
                        <Route key='/' path='/' element={component}/>
                    ))}
                {Object.entries(routes).map(([path, component]) => (
                    <Route key={path} path={path} element={component}/>
                ))}
            </Routes>
        </HashRouter>
    )
}

export default AppRouter
