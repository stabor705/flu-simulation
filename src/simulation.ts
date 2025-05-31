import { Agent } from "./agent"
import { AgentRedrawRequiredEvent, AppWindow } from "./appwindow.ts"
import { SimulationConfig } from "./config.ts"

export interface SimulationBounds {
    width: number
    height: number
}

export class SpreadInfectionEvent extends Event {
    constructor(public agentId: string) {
        super("SpreadInfection")
    }
}

export class UpdateStateEvent extends Event {
    constructor(
        public agentId: string,
        public newStateKind: Agent["stateKind"]
    ) {
        super("UpdateState")
    }
}

export class RemoveAgentEvent extends Event {
    constructor(public agentId: string) {
        super("RemoveAgent")
    }
}

export interface SimulationStatistics {
    healthyCount: number
    infectedCount: number
    infectedWithoutSymptomsCount: number
    recoverdCount: number
    deadCount: number
}

export class Simulation extends EventTarget {
    private _agents: Record<Agent["id"], Agent>
    private window?: AppWindow

    get agents() {
        return Object.values(this._agents)
    }

    constructor(
        private config: SimulationConfig,
        private bounds: SimulationBounds
    ) {
        super()

        this._agents = Object.fromEntries(
            Array.from({ length: config.agentNum }, () => {
                const infected = Math.random() < config.maxInitialInfected
                const init_x = Math.random() * bounds.width
                const init_y = Math.random() * bounds.height
                const agent = new Agent(
                    this,
                    init_x,
                    init_y,
                    infected ? "InfectedWithoutSymptoms" : "Healthy",
                    config.agentMovementSpeed,
                    config.infectionSpreadInterval,
                    config.agentRadius,
                    config.agentInfectionSpreadRadius,
                    config.incubationPeriod,
                    config.ilnessDuration,
                    config.chanceToRecover,
                    config.timeToRemoveDead
                )
                return [agent.id, agent]
            })
        )

        this.addEventListener("SpreadInfection", (event: Event) => {
            if (!(event instanceof SpreadInfectionEvent)) return

            const agent = this._agents[event.agentId]
            for (const otherAgent of Object.values(this.agents)) {
                if (agent === otherAgent) continue

                const distance = Math.sqrt(
                    (agent.x - otherAgent.x) ** 2 +
                        (agent.y - otherAgent.y) ** 2
                )
                if (distance < this.config.agentInfectionSpreadRadius) {
                    if (otherAgent.stateKind === "Healthy") {
                        otherAgent.changeState("InfectedWithoutSymptoms")
                    }
                    this.window?.dispatchEvent(
                        new AgentRedrawRequiredEvent(
                            otherAgent.id,
                            otherAgent.stateKind
                        )
                    )
                }
            }
        })

        this.addEventListener("UpdateState", (event: Event) => {
            if (!(event instanceof UpdateStateEvent)) return

            const agent = this._agents[event.agentId]
            if (!agent) return

            agent.changeState(event.newStateKind)
            this.window?.dispatchEvent(
                new AgentRedrawRequiredEvent(agent.id, agent.stateKind)
            )
        })

        this.addEventListener("RemoveAgent", (event: Event) => {
            if (!(event instanceof RemoveAgentEvent)) return

            const agent = this._agents[event.agentId]
            if (!agent) return

            this.window?.dispatchEvent(
                new AgentRedrawRequiredEvent(agent.id, agent.stateKind, true)
            )
        })
    }

    initWindow(appWindow: AppWindow) {
        this.window = appWindow
    }

    step(deltaTime: number) {
        this.agents.forEach((agent) => {
            agent.move(deltaTime, this.bounds)
            agent.tick(deltaTime)
        })
    }

    getStatistics(): SimulationStatistics {
        return {
            healthyCount: Object.values(this._agents).filter(
                (agent) => agent.stateKind === "Healthy"
            ).length,
            infectedCount: Object.values(this._agents).filter(
                (agent) => agent.stateKind === "Infected"
            ).length,
            infectedWithoutSymptomsCount: Object.values(this._agents).filter(
                (agent) => agent.stateKind === "InfectedWithoutSymptoms"
            ).length,
            recoverdCount: Object.values(this._agents).filter(
                (agent) => agent.stateKind === "Recovered"
            ).length,
            deadCount: Object.values(this._agents).filter(
                (agent) => agent.stateKind === "Dead"
            ).length,
        }
    }
}
