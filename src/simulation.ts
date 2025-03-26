import {Agent, SimulationBounds} from "./agent"

export class Simulation {
    public agents: Agent[] = [];

    constructor(agentNum: number = 10, private bounds: SimulationBounds) {
        this.agents = Array.from({length: agentNum}, () => new Agent(0, 0))
    }

    step(deltaTime: number) {
        this.agents.forEach(agent => agent.move(deltaTime, this.bounds))
    }
}