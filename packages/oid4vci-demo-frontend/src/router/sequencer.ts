import {
    getEcosystemSequenceConfig, VCIAction,
    VCIConfigSequenceStep,
    VCIExecuteStep,
    VCINavigationStep,
    VCIOperation
} from "../ecosystem-config"
import {createCredentialOffer} from "./actions/credential-actions"

type NavigateFunction = (path: any, params?: {} | undefined) => void

export class Sequencer {

    private sequenceConfig = getEcosystemSequenceConfig()

    private currentStep?: VCIConfigSequenceStep
    private navigateFunction?: NavigateFunction
    private readonly stepsById: { [key: string]: VCIConfigSequenceStep }

    constructor() {
        if (!this.sequenceConfig) {
            throw new Error('The sequence element is missing in the ecosystem json')
        }
        if (!this.sequenceConfig.steps || this.sequenceConfig.steps.length === 0) {
            throw new Error('The sequence element in the ecosystem json is missing steps')
        }

        this.stepsById = this.sequenceConfig.steps.reduce((map, step) => {
            map[step.id] = step
            return map
        }, {} as { [key: string]: VCIConfigSequenceStep })
    }

    public getDefaultRoute(state?: any): string {
        // Take the first navigate step in the list with isDefaultRoute set to true
        for (const step of this.sequenceConfig.steps) {
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

    /*
        We call setCurrentRoute on every page because
        a. to get the useNavigate() hook and
        b. because the user can go to that pages using the browser buttons or history and the sequencer needs to know which page the user is actually on
    */
    public setCurrentRoute(route: string, navigateFunction: NavigateFunction) {
        this.navigateFunction = navigateFunction
        const defaultRoute = this.getDefaultRoute()
        for (const step of this.sequenceConfig.steps) {
            switch (step.operation) {
                case VCIOperation.NAVIGATE:
                    const path = (step as VCINavigationStep).path
                    if (path === route || (route === '/' && path == defaultRoute)) {
                        this.currentStep = step
                        return
                    }
                    break
            }
        }
        throw new Error(`No step has been defined for the current route ${route} in the sequence element of the ecosystem json`)
    }

    public async next(state?: any) {
        if (this.currentStep === undefined) {
            throw new Error('current route/step is unknown')
        }
        if (this.currentStep.nextId) {
            await this.goToStep(this.currentStep.nextId, state)
        } else {
            throw new Error(`There is no next step defined in step ${this.currentStep.id} in the sequence element of the ecosystem json`)
        }
    }

    public async goToStep(stepId: string, state?: any) {
        const nextStep = this.stepsById[stepId]
        if (!nextStep) {
            throw new Error(`Could not find a step id ${stepId} which was defined as nextId of step ${this.currentStep?.id}`)
        }
        switch (nextStep.operation) {
            case VCIOperation.NAVIGATE:
                const navStep = nextStep as VCINavigationStep
                if (!navStep.path) {
                    throw new Error(`Field path of navigation step with id ${navStep.id} is empty!`)
                }
                this.navigateFunction!(navStep.path, {state})
                break
            case VCIOperation.EXECUTE:
                await this.execute(nextStep as VCIExecuteStep, state)
                break
        }
    }

    private async execute(executeStep: VCIExecuteStep, inState: any) {
        try {
            let outState
            switch (executeStep.action) {
                case VCIAction.CREATE_CREDENTIAL_OFFER:
                    outState = await createCredentialOffer(inState)
                    break
            }
            this.currentStep = executeStep
            await this.next(outState)
        } catch (e: any) {
            throw new Error(`An error occurred while executing action ${executeStep.action} of step ${executeStep.id}. Error:\n${e.message}`)
        }
    }
}