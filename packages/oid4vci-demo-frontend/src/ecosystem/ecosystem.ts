import {
    ComponentConfig,
    EcosystemGeneralConfig,
    getEcosystemRootConfig,
    getEcosystemRoutes,
    PageConfig,
    VCIConfig,
    VCIConfigComponents,
    VCIConfigPages,
    VCIConfigRoute
} from "./ecosystem-config"
import {useMemo} from "react"
import getOrCreateAgent, {VCIAgentType} from "../agent"

export type Ecosystem = {
    getComponentConfig: (component: string) => ComponentConfig
    hasPageConfig: (stepId: string) => boolean
    getRoutes: () => VCIConfigRoute[]
    getPageConfig: (stepId: string) => PageConfig
    getRootConfig: () => VCIConfig
    getGeneralConfig: () => EcosystemGeneralConfig
    getAgent(): VCIAgentType
};

export function useEcosystem(): Ecosystem {
    const currentEcosystemId = determineEcosystemId()
    const config = useMemo<VCIConfig>(() => getEcosystemRootConfig(currentEcosystemId), [currentEcosystemId])

    function determineEcosystemId(): string {
        const searchParams = new URLSearchParams(window.location.search)
        const ecosystemIdQueryParam = searchParams.has('ecosystemId') ? searchParams.get('ecosystemId') : undefined
        return ecosystemIdQueryParam ?? process.env.REACT_APP_DEFAULT_ECOSYSTEM ?? 'sphereon'
    }

    function getRootConfig(): VCIConfig {
        return config
    }

    function getGeneralConfig(): EcosystemGeneralConfig {
        return config.general
    }

    function getComponentConfig(component: string): ComponentConfig {
        if (component in config.components) {
            return config.components[component as keyof VCIConfigComponents]
        }
        throw new Error(`config for ${component} doesn't exist in ecosystem ${currentEcosystemId}`)
    }

    function hasPageConfig(stepId: string): boolean {
        return stepId in config.pages
    }

    function getPageConfig(stepId: string): PageConfig {
        if (stepId in config.pages) {
            return config.pages[stepId as keyof VCIConfigPages]
        }
        throw new Error(`Page config for step ${stepId} doesn't exist`)
    }

    function getRoutes(): VCIConfigRoute[] {
        return getEcosystemRoutes(config)
    }

    function getAgent(): VCIAgentType {
        return getOrCreateAgent(currentEcosystemId, getGeneralConfig())
    }

    return {
        getGeneralConfig,
        getComponentConfig,
        getRootConfig,
        hasPageConfig,
        getPageConfig,
        getRoutes,
        getAgent
    }
}