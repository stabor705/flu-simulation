import { Noise } from "noisejs"
import { v4 as uuidv4 } from "uuid"
import {
    Simulation,
    SimulationBounds,
    SpreadInfectionEvent,
    UpdateStateEvent,
    RemoveAgentEvent
} from "./simulation.ts"

abstract class AgentState {
    abstract tick(deltaTime: number): void
    abstract kind: AgentStateKind
}

type AgentStateKind = "Healthy" | "Infected" | "InfectedWithoutSymptoms" | "Recovered" | "Dead"
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

    private timeToRemove: number = 3000

    constructor(
        private simulation: Simulation,
        private agentId: string
    ) {
        super()
    }

    tick(deltaTime: number) {
        this.timeToRemove -= deltaTime
        if (this.timeToRemove <= 0) {
            this.simulation.dispatchEvent(
                new RemoveAgentEvent(this.agentId)
            )
        }
    }
}

class InfectedAgentState extends AgentState {
    kind: AgentStateKind = "Infected"

    private timeUntilNextInfectionSpread: number
    protected timeToNextStateChange: number

    constructor(
        private readonly infectionSpreadInterval: number,
        timeToNextStateChange: number,
        protected chanceToRecover: number,
        protected simulation: Simulation,
        protected agentId: string,
    ) {
        super()

        this.timeUntilNextInfectionSpread = infectionSpreadInterval
        this.timeToNextStateChange = timeToNextStateChange
    }

    tick(deltaTime: number) {
        this.timeUntilNextInfectionSpread -= deltaTime
        if (this.timeUntilNextInfectionSpread <= 0) {
            this.timeUntilNextInfectionSpread = this.infectionSpreadInterval
            this.simulation.dispatchEvent(
                new SpreadInfectionEvent(this.agentId)
            )
        }

        this.timeToNextStateChange -= deltaTime
        if (this.timeToNextStateChange <= 0) {
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
        super(infectionSpreadInterval, incubationTime, changceToRecover, simulation, agentId)
    }

    tick(deltaTime: number) {
        super.tick(deltaTime)

        this.timeToNextStateChange -= deltaTime
        if (this.timeToNextStateChange <= 0) {
            this.simulation.dispatchEvent(
                new UpdateStateEvent(this.agentId, "Infected")
            )
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
    ) {
        this.changeState(stateKind)
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

    changeState(state: AgentStateKind) {
        switch (state) {
            case "Infected":
                this.state = new InfectedAgentState(
                this.infectionSpreadInterval,
                this.ilnessDuration,
                this.chanceToRecover,
                this.simulation,
                this.id
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
                this.state = new DeadAgentState(
                    this.simulation,
                    this.id
                )
                break
        }
    }
}
