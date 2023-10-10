import React, {useState} from 'react'
import {HashRouter, Route, Routes} from 'react-router-dom'
import SSICredentialIssueRequestPage from '../pages/SSICredentialIssueRequestPage'
import SSICredentialVerifyRequestPage from '../pages/SSICredentialVerifyRequestPage'
import SSICredentialIssuedSuccessPage from '../pages/SSICredentialIssuedSuccessPage'
import SSILandingPage from '../pages/SSILandingPage'
import SSIInformationRequestPage from '../pages/SSIInformationRequestPage'
import SSIDownloadPage from "../pages/SSIDownloadPage"
import SSIInformationSuccessPage from "../pages/SSIInformationSuccessPage"
import SSISelectCredentialPage from "../pages/SSISelectCredentialPage"
import SSICredentialsLandingPage from "../pages/SSICredentialsLandingPage";
import {Sequencer} from "./sequencer"
import SphereonWalletPage from "../pages/SphereonWalletPage"

export const routes: Record<string, any> = {
    '/start': <SSILandingPage/>,
    '/landing': <SSICredentialsLandingPage/>,
    '/information/request': <SSIInformationRequestPage/>,
    '/information/success': <SSIInformationSuccessPage/>,
    '/credentials/select': <SSISelectCredentialPage/>,
    '/credentials/verify/request': <SSICredentialVerifyRequestPage/>,
    '/credentials/issue/request': <SSICredentialIssueRequestPage/>,
    '/credentials/issue/success': <SSICredentialIssuedSuccessPage/>,
    '/download/sphereon-wallet': <SphereonWalletPage/>,
    '/download': <SSIDownloadPage/>
}

const AppRouter: React.FC = () => {
    const [sequencer] = useState<Sequencer>(new Sequencer())
    const defaultRoute = sequencer.getDefaultRoute()
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
