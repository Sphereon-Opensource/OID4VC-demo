import {
    assertRoutes,
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
import {extractFirstSubdomain} from "../utils/generic"


export type Ecosystem = {
    getComponentConfig: <T extends ComponentConfig>(component: string) => T
    hasPageConfig: (stepId: string) => boolean
    getRoutes: () => VCIConfigRoute[]
    getPageConfig: <T extends PageConfig>(stepId: string) => T
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
        const subDomainEcosystemId = process.env.REACT_APP_DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN === 'true' ? extractFirstSubdomain(window.location.href) : undefined
        return ecosystemIdQueryParam ?? subDomainEcosystemId ?? process.env.REACT_APP_DEFAULT_ECOSYSTEM ?? 'sphereon'
    }

    function getRootConfig(): VCIConfig {
        return config
    }

    function getGeneralConfig(): EcosystemGeneralConfig {
        return config.general
    }

    function getComponentConfig<T extends ComponentConfig>(component: string): T {
        if (component in config.components) {
            return config.components[component as keyof VCIConfigComponents] as T
        }
        throw new Error(`config for ${component} doesn't exist in ecosystem ${currentEcosystemId}`)
    }

    function hasPageConfig(stepId: string): boolean {
        return stepId in config.pages
    }

    function getPageConfig<T extends PageConfig>(stepId: string): T {
        if (stepId in config.pages) {
            return config.pages[stepId as keyof VCIConfigPages] as T
        }
        throw new Error(`Page config for step ${stepId} doesn't exist`)
    }

    function getRoutes(): VCIConfigRoute[] {
        return assertRoutes(config.routes)
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