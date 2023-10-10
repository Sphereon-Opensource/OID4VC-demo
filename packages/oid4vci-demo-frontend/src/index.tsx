import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './router/AppRouter';
import './localization/i18n'
import './index.css';
import {useMediaQuery} from "react-responsive";

// @ts-ignore
export const Mobile = ({children}) => {
    const isMobile = useMediaQuery({maxWidth: 767})
    return isMobile ? children : null
}

// @ts-ignore
export const NonMobile = ({children}) => {
    const isNotMobile = useMediaQuery({minWidth: 768})
    return isNotMobile ? children : null
}
// Mobile/NonMobile are pure screen size based and this may not work on a Galaxy S10 with 1344 x 2992 pixels
// @ts-ignore
export const MobileOS = ({children}) => {
    const userAgent = window.navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ? children : null
}
// @ts-ignore
export const NonMobileOS = ({children}) => {
    const userAgent = window.navigator.userAgent;
    return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ? children : null
}

ReactDOM.render(
    // @ts-ignore
    <React.StrictMode>
      <Suspense  fallback={<div>Loading...</div>}>
        <AppRouter />
      </Suspense>
    </React.StrictMode>,
    document.getElementById('root')
);
