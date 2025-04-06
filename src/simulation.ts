import { Agent } from "./agent"
import { AgentRedrawRequiredEvent, AppWindow } from "./appwindow.ts";
import { SimulationConfig } from "./config.ts";

export interface SimulationBounds {
    width: number
    height: number
}


export class SpreadInfectionEvent extends Event {
    constructor(public agentId: string) { super("SpreadInfection") }
}

export class Simulation extends EventTarget {
    private _agents: Record<Agent["id"], Agent>
    private window?: AppWindow

    get agents() { return Object.values(this._agents) }

    constructor(private config: SimulationConfig, private bounds: SimulationBounds) {
        super()

        this._agents = Object.fromEntries(Array.from({length: config.agentNum}, () => {
            const infected = Math.random() < config.maxInitialInfected
            const init_x = Math.random() * bounds.width
            const init_y = Math.random() * bounds.height
            const agent = new Agent(init_x, init_y, infected ? "Infected" : "Healthy", this, config.agentMovementSpeed, config.infectionSpreadInterval)
            return [agent.id, agent]
        }))

        this.addEventListener("SpreadInfection", (event: Event) => {
            if (!(event instanceof SpreadInfectionEvent)) return
            const agent = this._agents[event.agentId]
            for (const otherAgent of Object.values(this.agents)) {
                if (agent === otherAgent) continue
                const distance = Math.sqrt((agent.x - otherAgent.x) ** 2 + (agent.y - otherAgent.y) ** 2)
                if (distance < this.config.agentInfectionSpreadRadius) {
                    otherAgent.infect()
                    this.window?.dispatchEvent(new AgentRedrawRequiredEvent(otherAgent.id, otherAgent.radius))
                }
            }
        })
    }

    initWindow(appWindow: AppWindow) {
        this.window = appWindow
    }

    step(deltaTime: number) {
        this.agents.forEach(agent => {
            agent.move(deltaTime, this.bounds)
            agent.tick(deltaTime)
        })
    }
}