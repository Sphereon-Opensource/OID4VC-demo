import React, {ReactElement} from 'react'
import {useMediaQuery} from 'react-responsive'
import {useTranslation} from 'react-i18next'
import {useFlowRouter} from '../../router/flow-router'
import {SSIWelcomePageConfig} from '../../ecosystem/ecosystem-config'
import {NonMobile} from '../../index'
import style from './index.module.css'
import {useLocation} from "react-router-dom"
import SSIPrimaryButton from "../../components/SSIPrimaryButton"

const SSIWelcomePage: React.FC = (): ReactElement => {
    const {t} = useTranslation()
    const flowRouter = useFlowRouter<SSIWelcomePageConfig>()
    const pageConfig = flowRouter.getPageConfig();
    const isTabletOrMobile = useMediaQuery({query: '(max-width: 767px)'})
    const location = useLocation();
    const state = location.state

    return <div style={{display: 'flex',  height: "100vh", width: '100vw',  ...(isTabletOrMobile && { overflowX: "hidden", ...(pageConfig.mobile?.backgroundColor && { backgroundColor: pageConfig.mobile.backgroundColor }) })}}>
        <NonMobile>
            <div id={"photo"}
                 style={{
                     display: 'flex',
                     width: pageConfig.leftPaneWidth ?? 'auto',
                     height: pageConfig.leftPaneWidth ? '100%' : 'auto',
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
            <div className={style.contentContainer}>
                <div className={style.textContainer}>
                    <div className={style.titleContainer}>
                        { pageConfig.right_pane_title &&
                            <div className={style.title}>{t(pageConfig.right_pane_title)}</div>
                        }
                        { pageConfig.right_pane_subtitle &&
                            <div className={style.subtitle}>{t(pageConfig.right_pane_subtitle)}</div>
                        }
                    </div>
                    { pageConfig.right_pane_paragraph &&
                        // @ts-ignore
                        <div className={style.description} style={{...(pageConfig.right_pane_paragraph_text_align && { textAlign: pageConfig.right_pane_paragraph_text_align})}} dangerouslySetInnerHTML={{ __html: t(pageConfig.right_pane_paragraph)}}/>
                    }
                </div>
                <SSIPrimaryButton
                    caption={t("label_continue")}
                    style={style}
                    onClick={async (): Promise<void> => {
                        await flowRouter.nextStep(state)
                    }}
                />
            </div>
        </div>
    </div>
}

export default SSIWelcomePage;
