import React, {ReactElement, useEffect} from 'react';
import {useMediaQuery} from 'react-responsive';
import {useTranslation} from 'react-i18next';
import {useFlowRouter} from '../../router/flow-router';
import {SSILoadingPageConfig} from '../../ecosystem/ecosystem-config';
import {NonMobile} from '../../index';
import style from './index.module.css'

const SSILoadingPage: React.FC = (): ReactElement => {
    const {t} = useTranslation()
    const flowRouter = useFlowRouter<SSILoadingPageConfig>()
    const pageConfig = flowRouter.getPageConfig();
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})

    useEffect((): void => {
        // Simulating a verifying process here that navigates to the next step after 10 seconds
        setTimeout(async (): Promise<void> => {
            await flowRouter.nextStep()
        }, 10000)
    }, []);

    return <div style={{display: 'flex',  height: "100vh", width: '100vw',  ...(isTabletOrMobile && { overflowX: "hidden", ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) })}}>
        <NonMobile>
            <div id={"photo"}
                 style={{
                    display: 'flex',
                    width: pageConfig.leftPaneWidth ?? '60%',
                    height: isTabletOrMobile ? '100%': '100vh',
                    flexDirection: 'column',
                    alignItems: 'center',
                    ...(pageConfig.backgroundColor && { backgroundColor: pageConfig.backgroundColor }),
                    ...(pageConfig.logo && { justifyContent: 'center' })
                 }}
            >
                { pageConfig.logo &&
                    <img
                        src={pageConfig.logo.src}
                        alt={pageConfig.logo.alt}
                        width={pageConfig.logo.width}
                        height={pageConfig.logo.height}
                    />
                }
            </div>
        </NonMobile>
        <div className={style.rightPanel}
            style={{
            ...(isTabletOrMobile && { gap: 24, ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) }),
            ...(!isTabletOrMobile && { justifyContent: 'center', backgroundColor: '#FFFFFF' })
        }}>
            {/*TODO implement the spinner here*/}
            <div className={style.captionContainer}>
                <div className={style.caption}>{t(pageConfig.sharing_data_right_pane_title)}</div>
                <div className={style.description}>{t(pageConfig.sharing_data_right_pane_paragraph)}</div>
            </div>
        </div>
    </div>
}

export default SSILoadingPage;