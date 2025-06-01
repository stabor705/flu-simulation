import { Noise } from "noisejs"
import { v4 as uuidv4 } from "uuid"
import {
    Simulation,
    SimulationBounds,
    SpreadInfectionEvent,
    UpdateStateEvent,
    RemoveAgentEvent,
} from "./simulation.ts"

abstract class AgentState {
    abstract tick(deltaTime: number): void
    abstract kind: AgentStateKind
}

type AgentStateKind =
    | "Healthy"
    | "Infected"
    | "InfectedWithoutSymptoms"
    | "Recovered"
    | "Dead"
    | "Quarantined"
class HealthyAgentState extends AgentState {
    kind: AgentStateKind = "Healthy"
    tick() {}
}

class RecoveredAgentState extends AgentState {
    kind: AgentStateKind = "Recovered"
    tick() {}
}

class DeadAgentState extends AgentState {
    kind: AgentStateKind = "Dead"

    constructor(
        private timeToRemove: number,
        private simulation: Simulation,
        private agentId: string
    ) {
        super()
    }

    tick(deltaTime: number) {
        this.timeToRemove -= deltaTime
        if (this.timeToRemove <= 0) {
            this.simulation.dispatchEvent(new RemoveAgentEvent(this.agentId))
        }
    }
}

abstract class InfectedAgentState extends AgentState {
    protected timeUntilNextInfectionSpread: number
    protected timeToNextStateChange: number
    protected infectionDisabled: boolean = false

    constructor(
        private readonly infectionSpreadInterval: number,
        timeToNextStateChange: number,
        protected chanceToRecover: number,
        protected simulation: Simulation,
        protected agentId: string
    ) {
        super()

        this.timeUntilNextInfectionSpread = infectionSpreadInterval
        this.timeToNextStateChange = timeToNextStateChange
    }

    abstract changeState(): any

    tick(deltaTime: number) {
        this.timeUntilNextInfectionSpread -= deltaTime
        if (!this.infectionDisabled && this.timeUntilNextInfectionSpread <= 0) {
            this.timeUntilNextInfectionSpread = this.infectionSpreadInterval
            this.simulation.dispatchEvent(
                new SpreadInfectionEvent(this.agentId)
            )
        }

        this.timeToNextStateChange -= deltaTime
        if (this.timeToNextStateChange <= 0) {
            this.changeState()
        }
    }
}

class InfectedWithSymptomsAgentState extends InfectedAgentState {
    kind: AgentStateKind = "Infected"

    constructor(
        infectionSpreadInterval: number,
        timeToNextStateChange: number,
        protected chanceToRecover: number,
        protected simulation: Simulation,
        protected agentId: string,
        private chanceToQuarantine: number,
        private timeUntilQuarantine: number
    ) {
        super(
            infectionSpreadInterval,
            timeToNextStateChange,
            chanceToRecover,
            simulation,
            agentId
        )
    }

    changeState() {
        const randomChance = Math.random()
        if (randomChance < this.chanceToRecover) {
            this.simulation.dispatchEvent(
                new UpdateStateEvent(this.agentId, "Recovered")
            )
        } else {
            this.simulation.dispatchEvent(
                new UpdateStateEvent(this.agentId, "Dead")
            )
        }
    }

    tick(deltaTime: number) {
        super.tick(deltaTime)

        this.timeUntilQuarantine -= deltaTime
        if (this.timeUntilQuarantine <= 0) {
            const randomChance = Math.random()
            if (randomChance < this.chanceToQuarantine) {
                this.simulation.dispatchEvent(
                    new UpdateStateEvent(this.agentId, "Quarantined")
                )
                this.chanceToQuarantine = 10000
            }
        }
    }
}

class InfectedWithoutSymptomsAgentState extends InfectedAgentState {
    kind: AgentStateKind = "InfectedWithoutSymptoms"

    constructor(
        infectionSpreadInterval: number,
        incubationTime: number,
        changceToRecover: number,
        simulation: Simulation,
        agentId: string
    ) {
        super(
            infectionSpreadInterval,
            incubationTime,
            changceToRecover,
            simulation,
            agentId
        )
    }

    changeState() {
        this.simulation.dispatchEvent(
            new UpdateStateEvent(this.agentId, "Infected")
        )
    }

    tick(deltaTime: number) {
        super.tick(deltaTime)
    }
}

class QuarantinedAgentState extends AgentState {
    kind: AgentStateKind = "Quarantined"

    constructor(
        private readonly simulation: Simulation,
        private readonly agentId: string,
        private timeUntilRelease: number,
        private readonly quarantineSurviveChance: number
    ) {
        super()
    }

    tick(deltaTime: number) {
        this.timeUntilRelease -= deltaTime
        if (this.timeUntilRelease <= 0) {
            const randomChance = Math.random()
            if (randomChance < this.quarantineSurviveChance) {
                this.simulation.dispatchEvent(
                    new UpdateStateEvent(this.agentId, "Recovered")
                )
            } else {
                this.simulation.dispatchEvent(
                    new UpdateStateEvent(this.agentId, "Dead")
                )
            }
        }
    }
}

export class Agent {
    public id = uuidv4()
    private noise: Noise = new Noise(Math.random())
    private noiseOffset: [number, number] = [
        Math.random() * 1000,
        Math.random() * 1000,
    ]
    public get stateKind(): AgentStateKind {
        return this.state.kind
    }

    private state!: AgentState

    constructor(
        private simulation: Simulation,
        public x: number,
        public y: number,
        stateKind: AgentStateKind,
        public v: number,
        private infectionSpreadInterval: number,
        public radius: number,
        public infectionSpreadRadius: number,
        public incubationPeriod: number,
        public ilnessDuration: number,
        public chanceToRecover: number,
        public timeToRemoveDead: number,
        private timeUntilRelease: number,
        private chanceToSurviveQuarantine: number,
        private timeToQuarantine: number,
        private chanceToQuarantine: number
    ) {
        this.changeState(stateKind, "Healthy")
    }

    move(deltaTime: number, bounds: SimulationBounds) {
        this.noiseOffset[0] += 0.005
        this.noiseOffset[1] += 0.004

        const noiseX = this.noise.perlin2(
            this.noiseOffset[0],
            this.noiseOffset[1]
        )
        const noiseY = this.noise.perlin2(
            this.noiseOffset[0] + 10.3,
            this.noiseOffset[1] + 5.7
        )

        const magnitude = Math.sqrt(noiseX * noiseX + noiseY * noiseY)

        let deltaX = 0
        let deltaY = 0

        if (magnitude > 0) {
            deltaX = (noiseX / magnitude) * this.v * deltaTime
            deltaY = (noiseY / magnitude) * this.v * deltaTime
        }

        deltaX =
            this.x + deltaX - this.radius < 0
                ? Math.abs(deltaX)
                : this.x + deltaX + this.radius > bounds.width
                  ? -Math.abs(deltaX)
                  : deltaX

        deltaY =
            this.y + deltaY - this.radius < 0
                ? Math.abs(deltaY)
                : this.y + deltaY + this.radius > bounds.height
                  ? -Math.abs(deltaY)
                  : deltaY

        this.x += deltaX
        this.y += deltaY
    }

    tick(deltaTime: number) {
        this.state.tick(deltaTime)
    }

    changeState(state: AgentStateKind, oldState: AgentStateKind) {
        switch (state) {
            case "Infected":
                this.state = new InfectedWithSymptomsAgentState(
                    this.infectionSpreadInterval,
                    this.ilnessDuration,
                    this.chanceToRecover,
                    this.simulation,
                    this.id,
                    this.chanceToQuarantine,
                    this.timeToQuarantine
                )
                break
            case "InfectedWithoutSymptoms":
                this.state = new InfectedWithoutSymptomsAgentState(
                    this.infectionSpreadInterval,
                    this.incubationPeriod,
                    this.chanceToRecover,
                    this.simulation,
                    this.id
                )
                break
            case "Healthy":
                this.state = new HealthyAgentState()
                break
            case "Recovered":
                this.state = new RecoveredAgentState()
                break
            case "Dead":
                const timeToRemoveDead =
                    oldState === "Quarantined" ? 0 : this.timeToRemoveDead
                console.log(timeToRemoveDead)
                this.state = new DeadAgentState(
                    timeToRemoveDead,
                    this.simulation,
                    this.id
                )
                break
            case "Quarantined":
                this.state = new QuarantinedAgentState(
                    this.simulation,
                    this.id,
                    this.timeUntilRelease,
                    this.chanceToSurviveQuarantine
                )
                break
        }
    }
}
