import { Noise } from "noisejs";
import { v4 as uuidv4 } from 'uuid'
import {Simulation, SpreadInfectionEvent} from "./simulation.ts";

export interface SimulationBounds {
    width: number
    height: number
}

abstract class AgentState {
    abstract tick(deltaTime: number): void
    abstract kind: AgentStateKind
}

type AgentStateKind = "Healthy" | "Infected"

class HealthyAgentState extends AgentState {
    tick() {}
    kind: AgentStateKind = "Healthy"
}

class InfectedAgentState extends AgentState {
    kind: AgentStateKind = "Infected"

    private timeUntilNextInfectionSpread: number

    constructor(
        private readonly infectionSpreadInterval: number,
        private simulation: Simulation,
        private agentId: string
    ) {
        super()

        this.timeUntilNextInfectionSpread = infectionSpreadInterval
    }

    tick(deltaTime: number) {
        this.timeUntilNextInfectionSpread -= deltaTime
        if (this.timeUntilNextInfectionSpread <= 0) {
            this.timeUntilNextInfectionSpread = this.infectionSpreadInterval
            this.simulation.dispatchEvent(new SpreadInfectionEvent(this.agentId))
        }
    }
}

export class Agent {
    public id = uuidv4()
    private noise: Noise = new Noise(Math.random())
    private noiseOffset: number = 0
    public get stateKind(): AgentStateKind { return this.state.kind }

    private state: AgentState

    constructor(
        public x: number,
        public y: number,
        stateKind: AgentStateKind,
        private simulation: Simulation,
        public v: number = 0.1,
        public radius: number = 10
    ) {
        switch (stateKind) {
            case "Healthy":
                this.state = new HealthyAgentState()
                break
            case "Infected":
                this.state = new InfectedAgentState(1000, this.simulation, this.id)
                break
        }
    }

    move(deltaTime: number, bounds: SimulationBounds) {
        const angle = this.noise.perlin2(this.noiseOffset, this.noiseOffset) * Math.PI * 2

        let deltaX = Math.cos(angle) * this.v * deltaTime
        let deltaY = Math.sin(angle) * this.v * deltaTime

        deltaX = (this.x + deltaX - this.radius < 0)
            ? Math.abs(deltaX)
            : (this.x + deltaX + this.radius > bounds.width)
                ? -Math.abs(deltaX)
                : deltaX;

        deltaY = (this.y + deltaY - this.radius < 0)
            ? Math.abs(deltaY)
            : (this.y + deltaY + this.radius > bounds.height)
                ? -Math.abs(deltaY)
                : deltaY;

        this.x += deltaX
        this.y += deltaY

        this.noiseOffset += 0.01
    }

    tick(deltaTime: number) {
        this.state.tick(deltaTime)
    }

    infect() {
        if (this.state.kind === "Infected") return

        this.state = new InfectedAgentState(1000, this.simulation, this.id)
    }
}