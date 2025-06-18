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
import SSIInformationVerifyPage from "../pages/SSIInformationVerifyPage";
import {Navigate} from "react-router";

export const routes: Record<string, any> = {
    '/start': <SSILandingPage/>,
    '/landing': <SSICredentialsLandingPage/>,
    '/landingvp': <SSIPresentationsLandingPage/>,
    '/information/manual/request/:pageId': <SSIInformationManualRequestPage/>,
    '/information/manual/request': <SSIInformationManualRequestPage/>, // Kept for backward compatibility
    '/information/success': <SSIInformationSuccessPage/>,
    '/credentials/select': <SSISelectCredentialPage/>,
    '/credentials/verify/request': <SSICredentialVerifyRequestPage/>,
    '/credentials/verify/share': <SSIInformationVerifyPage/>,
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

const DefaultRouteRedirect: React.FC = () => {
    const flowAppRouter = useFlowAppRouter()
    const defaultRoute = flowAppRouter.getDefaultLocation()

    console.log('Redirecting to default route:', defaultRoute)

    return <Navigate to={defaultRoute} replace/>
}

const AppRouter: React.FC = () => {
    return (
        <HashRouter>
            <Routes>
                {/* Redirect root path to the actual default route */}
                <Route
                    key="default-root"
                    path="/"
                    element={<DefaultRouteRedirect/>}
                />

                {/* Map all defined routes */}
                {Object.entries(routes).map(([path, component]) => (
                    <Route key={path} path={path} element={component}/>
                ))}
            </Routes>
        </HashRouter>
    )
}

export default AppRouter