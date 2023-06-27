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

ReactDOM.render(
    <React.StrictMode>
      <Suspense>
        <AppRouter />
      </Suspense>
    </React.StrictMode>,
    document.getElementById('root')
);
