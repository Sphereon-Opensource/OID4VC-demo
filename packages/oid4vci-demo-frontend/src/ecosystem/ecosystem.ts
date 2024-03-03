import {
    assertRoutes,
    ComponentConfig,
    EcosystemGeneralConfig,
    getEcosystemRootConfig,
    PageConfig,
    VCIConfig,
    VCIConfigComponents,
    VCIConfigPages,
    VCIConfigRoute
} from "./ecosystem-config"
import {useMemo} from "react"
import getOrCreateAgent, {VCIAgentType} from "../agent"
import {extractSubdomainsBefore} from "../utils/generic"
import {
    DEFAULT_ECOSYSTEM,
    DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN,
    DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN_BEFORE,
} from "../environment"


export type Ecosystem = {
    getComponentConfig: <T extends ComponentConfig>(component: string) => T
    hasPageConfig: (stepId: string) => boolean
    getRoutes: () => VCIConfigRoute[]
    getPageConfig: <T extends PageConfig>(stepId: string) => T
    getRootConfig: () => VCIConfig
    getGeneralConfig: () => EcosystemGeneralConfig
    getAgent(): VCIAgentType
    getEcosystemId(): string
};

export function useEcosystem(): Ecosystem {
    const currentEcosystemId = determineEcosystemId()
    const config = useMemo<VCIConfig>(() => getEcosystemRootConfig(currentEcosystemId), [currentEcosystemId])

    function determineEcosystemId(): string {
        const searchParams = new URLSearchParams(window.location.search)
        const ecosystemIdQueryParam = searchParams.has('ecosystemId') ? searchParams.get('ecosystemId') : undefined
        const subDomainEcosystemId = DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN && DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN_BEFORE
            ? extractSubdomainsBefore(window.location.href, DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN_BEFORE)
            : undefined
        return ecosystemIdQueryParam ?? subDomainEcosystemId ?? DEFAULT_ECOSYSTEM ?? 'sphereon'
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

    function getEcosystemId(): string {
        return currentEcosystemId
    }

    return {
        getGeneralConfig,
        getComponentConfig,
        getRootConfig,
        hasPageConfig,
        getPageConfig,
        getRoutes,
        getAgent,
        getEcosystemId
    }
}