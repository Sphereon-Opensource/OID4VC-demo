import {useLocation, useNavigate} from "react-router-dom"
import {
    getCurrentEcosystemPageConfig,
    getEcosystemRoutes,
    PageConfig,
    VCIAction,
    VCIConfigRoute,
    VCIConfigRouteStep,
    VCIExecuteStep,
    VCINavigationStep,
    VCIOperation
} from "../ecosystem-config"
import {useMemo, useState} from "react"
import {createCredentialOffer} from "./actions/credential-actions"


type StepsByIdType = { [key: string]: VCIConfigRouteStep };

export function useFlowAppRouter() {
    const routes = getEcosystemRoutes()
    const [currentRouteId, setCurrentRouteId] = useState<string>('')
    const [stepsById] = useState<StepsByIdType>(buildStepsByIdMap(routes, getRouteId()))


    function getRouteId(): string {
        return currentRouteId != '' ? currentRouteId : 'default'
    }

    function getDefaultLocation(state?: any): string {
        return defaultLocation(stepsById)
    }

    return {
        getDefaultLocation,
        setCurrentRouteId
    }
}

export function useFlowRouter() {
    const navigate = useNavigate()
    const pageLocation = useLocation()
    const routes = getEcosystemRoutes()
    const [currentRouteId, setCurrentRouteId] = useState<string>('')
    const [stepsById] = useState<StepsByIdType>(buildStepsByIdMap(routes, getRouteId()))
    const initialStep = useMemo(() => determineCurrentStep(), [pageLocation]);
    const [currentStep, setCurrentStep] = useState<VCIConfigRouteStep>(initialStep)
    const [pageConfig] = useState<(() => PageConfig | undefined) | PageConfig | undefined>(() => initConfig(currentStep))


    function getRouteId(): string {
        return currentRouteId != '' ? currentRouteId : 'default'
    }

    function determineCurrentStep(): VCIConfigRouteStep {
        const currentLocation = pageLocation.pathname
        const defaultLocation = getDefaultLocation()
        for (const step of Object.values(stepsById)) {
            switch (step.operation) {
                case VCIOperation.NAVIGATE:
                    const path = (step as VCINavigationStep).path
                    if (path === currentLocation || (currentLocation === '/' && path === defaultLocation)) {
                        console.log('determined current step: ', step.id)
                        return step
                    }
                    break
            }
        }
        throw new Error(`can't determine current step for location path ${currentLocation}`)
    }

    function getDefaultLocation(state?: any): string {
        return defaultLocation(stepsById)
    }

    async function next(state ?: any) {
        if (currentStep === undefined) {
            throw new Error('current route/step is unknown')
        }
        console.log('currentStep', JSON.stringify(currentStep))
        console.log('currentStep.nextId', JSON.stringify(currentStep.nextId))
        if (currentStep.nextId) {
            await goToStep(currentStep.nextId, state)
        } else {
            throw new Error(`There is no next step defined in step ${currentStep.id} in the sequence element of the ecosystem json`)
        }
    }

    async function goToStep(stepId: string, state?: any) {
        console.log('goToStep', stepId)
        const nextStep = stepsById[stepId]
        if (!nextStep) {
            throw new Error(`Could not find a step id ${stepId} which was defined as nextId of step ${currentStep?.id}`)
        }
        switch (nextStep.operation) {
            case VCIOperation.NAVIGATE:
                const navStep = nextStep as VCINavigationStep
                if (!navStep.path) {
                    throw new Error(`Field path of navigation step with id ${navStep.id} is empty!`)
                }
                if (navStep.path.includes('://')) {
                    // eslint-disable-next-line no-restricted-globals
                    location.href = navStep.path
                    return
                } else {
                    if (navigate === undefined) {
                        throw new Error(`Can't navigate from this page because we could not get the navigation hook.`)
                    }
                    navigate(navStep.path, {state})
                }
                break
            case VCIOperation.EXECUTE:
                await execute(nextStep as VCIExecuteStep, state)
                break
        }
    }

    async function execute(executeStep: VCIExecuteStep, inState: any) {
        try {
            let outState
            switch (executeStep.action) {
                case VCIAction.CREATE_CREDENTIAL_OFFER:
                    console.log('createCredentialOffer', JSON.stringify(inState))
                    outState = await createCredentialOffer(inState)
                    console.log('createCredentialOffer returned', JSON.stringify(outState))
                    break
            }
            console.log('setCurrentStep', JSON.stringify(executeStep))
            await setCurrentStep(executeStep)
            await next(outState)
        } catch (e: any) {
            throw new Error(`An error occurred while executing action ${executeStep.action} of step ${executeStep.id}. Error:\n${e.message}`)
        }
    }

    function getConfig(): PageConfig {
        if (!pageConfig) {
            throw new Error(`Config not found for step ${currentStep.id} in route ${currentRouteId}`)
        }
        return pageConfig as PageConfig
    }

    return {
        getConfig,
        goToStep,
        next,
        setCurrentRouteId
    }
}

function buildStepsByIdMap(routes: VCIConfigRoute[], routeId?: string): StepsByIdType {
    const inputRouteId = routeId || 'default'
    const matchingRoute = routes.find((route) => {
        return route.id === inputRouteId
    })

    if (!matchingRoute) {
        throw new Error(`Route ${inputRouteId} could not be matched with the routes/route elements in your ecosystem json`)
    }

    return matchingRoute.steps.reduce((map, step) => {
        map[step.id] = step
        return map
    }, {} as StepsByIdType)
}

function defaultLocation(stepsById: StepsByIdType) {
    // Take the first navigate step in the list with isDefaultRoute set to true
    for (const step of Object.values(stepsById)) {
        switch (step.operation) {
            case VCIOperation.NAVIGATE:
                if (step.isDefaultRoute) {
                    const navStep = step as VCINavigationStep
                    if (!navStep.path) {
                        throw new Error(`Field path of navigation step with id ${navStep.id} is empty!`)
                    }
                    return navStep.path
                }
        }
    }
    throw new Error('No navigation steps have been defined in the sequence element of the ecosystem json')
}

function initConfig(currentStep: VCIConfigRouteStep): (PageConfig | undefined) {
    if (currentStep.operation == VCIOperation.NAVIGATE) {
        return getCurrentEcosystemPageConfig(currentStep.id)
    }
    return undefined
}
