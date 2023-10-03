import {
    getEcosystemSequenceConfig, VCIAction,
    VCIConfigSequenceStep,
    VCIExecuteStep,
    VCINavigationStep,
    VCIOperation
} from "../ecosystem-config"
import {useNavigate} from "react-router-dom"
import short from "short-uuid"
import {IOID4VCIClientCreateOfferUriResponse} from "@sphereon/ssi-sdk.oid4vci-issuer-rest-client"
import agent from "../agent"
import {createCredentialOffer} from "../actions/credential-actions"


export class Sequencer {

    private navigate = useNavigate()
    private sequenceConfig = getEcosystemSequenceConfig()
    private stepsById: { [key: string]: VCIConfigSequenceStep } = this.sequenceConfig.steps.reduce((map, step) => {
        map[step.id] = step
        return map
    }, {})

    private currentStep?: VCIConfigSequenceStep

    constructor() {
        if (!this.sequenceConfig) {
            throw new Error('The sequence element is missing in the ecosystem json')
        }
        if (!this.sequenceConfig.steps || this.sequenceConfig.steps.length == 0) {
            throw new Error('The sequence element in the ecosystem json is missing steps')
        }
    }

    public async getDefaultRoute(state?: any): Promise<string> {
        // Take the first navigate step in the list with isDefaultRoute set to true
        for (const step of this.sequenceConfig.steps) {
            switch (step.operation) {
                case VCIOperation.NAVIGATE:
                    if(step.isDefaultRoute) {
                        return (step as VCINavigationStep).path
                    }
            }
        }
        throw new Error('No navigation steps have been defined in the sequence element of the ecosystem json')
    }

    public setCurrentRoute(route: string) {
        for (const step of this.sequenceConfig.steps) {
            switch (step.operation) {
                case VCIOperation.NAVIGATE:
                    if ((step as VCINavigationStep).path == route) {
                        this.currentStep = step
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
        switch (nextStep.operation) {
            case VCIOperation.NAVIGATE:
                this.navigate((nextStep as VCINavigationStep).path, state)
                break
            case VCIOperation.EXECUTE:
                await this.execute(nextStep as VCIExecuteStep, state)
                break
        }
    }

    private async execute(executeStep: VCIExecuteStep, inState: any) {
        this.currentStep = executeStep
        switch (executeStep.action) {
            case VCIAction.CREATE_CREDENTIAL_OFFER:
                await this.next(await createCredentialOffer(inState))
                break
        }
    }
}