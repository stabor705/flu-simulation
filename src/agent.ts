import { Noise } from "noisejs";
import { v4 as uuidv4 } from 'uuid'
import {Simulation, SimulationBounds, SpreadInfectionEvent} from "./simulation.ts";

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
    private noiseOffset: [number, number] = [Math.random() * 1000, Math.random() * 1000]
    public get stateKind(): AgentStateKind { return this.state.kind }

    private state: AgentState

    constructor(
        public x: number,
        public y: number,
        stateKind: AgentStateKind,
        private simulation: Simulation,
        public v: number,
        private infectionSpreadInterval: number,
        public radius: number = 10
    ) {
        switch (stateKind) {
            case "Healthy":
                this.state = new HealthyAgentState()
                break
            case "Infected":
                this.state = new InfectedAgentState(this.infectionSpreadInterval, this.simulation, this.id)
                break
        }
    }

    move(deltaTime: number, bounds: SimulationBounds) {
        this.noiseOffset[0] += 0.005
        this.noiseOffset[1] += 0.004

        const noiseX = this.noise.perlin2(this.noiseOffset[0], this.noiseOffset[1]);
        const noiseY = this.noise.perlin2(this.noiseOffset[0] + 10.3, this.noiseOffset[1] + 5.7);

        const magnitude = Math.sqrt(noiseX * noiseX + noiseY * noiseY);

        let deltaX = 0;
        let deltaY = 0;

        if (magnitude > 0) {
            deltaX = (noiseX / magnitude) * this.v * deltaTime;
            deltaY = (noiseY / magnitude) * this.v * deltaTime;
    }

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
    }

    tick(deltaTime: number) {
        this.state.tick(deltaTime)
    }

    infect() {
        if (this.state.kind === "Infected") return

        this.state = new InfectedAgentState(this.infectionSpreadInterval, this.simulation, this.id)
    }
}