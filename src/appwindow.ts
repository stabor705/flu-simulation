import * as PIXI from "pixi.js"
import { Simulation } from "./simulation.ts"
import { Agent } from "./agent.ts"
import { AgentSprite } from "./agentSprite.ts"
import { Viewport } from "pixi-viewport";

export class AgentRedrawRequiredEvent extends Event {
    constructor(
        public agentId: string,
        public newStateKind: Agent["stateKind"],
        public removeAgent: boolean = false
    ) {
        super("AgentRedrawRequired")
    }
}

type AgentSprites = Record<Agent["id"], AgentSprite>

export class AppWindow extends EventTarget {
    private app: PIXI.Application
    private allAgentSprites: AgentSprites = {}

    constructor(
        width: number,
        height: number,
        private simulations: Simulation[],
    ) {
        super()

        this.app = new PIXI.Application()
        simulations.forEach((simulation, idx) => {
            const agentSprites = Object.values(simulation.agents).reduce(
                (map, agent) => {
                    const sprite = new AgentSprite(
                        agent.radius,
                        agent.infectionSpreadRadius,
                        agent.timeToRemoveDead,
                        [width * idx / 2, 0],
                        agent.stateKind === "Infected"
                    )
                    map[agent.id] = sprite
                    return map
                },
                {} as AgentSprites
            )
            this.allAgentSprites = { ...this.allAgentSprites, ...agentSprites }


            this.addEventListener("AgentRedrawRequired", (event: Event) => {
                if (!(event instanceof AgentRedrawRequiredEvent)) return

                const sprite = this.allAgentSprites[event.agentId]

                if (event.removeAgent) {
                    this.app.stage.removeChild(sprite)
                    delete agentSprites[event.agentId]
                    return
                }

                switch (event.newStateKind) {
                    case "Healthy":
                        sprite.drawHealthy()
                        break
                    case "Infected":
                        sprite.drawInfected()
                        break
                    case "InfectedWithoutSymptoms":
                        sprite.drawInfectedWithoutSymptoms()
                        break
                    case "Recovered":
                        sprite.drawRecovered()
                        break
                    case "Dead":
                        sprite.drawDead()
                        break
                }
            })
        })

        this.app
            .init({ width: width, height: height, background: 0xffffff })
            .then(() => {
                const elementId = `simulation-window`
                document.getElementById(elementId)?.appendChild(this.app.canvas)
                this.app.ticker.add(this.onTick.bind(this))

                const viewport = new Viewport({
                    screenWidth: width,
                    screenHeight: height,
                    worldWidth: width,
                    worldHeight: height,
                    events: this.app.renderer.events
                })
                this.app.stage.addChild(viewport)
                viewport.drag().pinch().wheel().decelerate()

                for (const sprite of Object.values(this.allAgentSprites)) {
                    viewport.addChild(sprite)
                }
            })
    }

    private onTick(ticker: PIXI.Ticker) {
        for (const simulation of this.simulations) {
            simulation.step(ticker.deltaMS)
            simulation.agents.forEach((agent) => {
                if (agent.stateKind !== "Dead") {
                    const sprite = this.allAgentSprites[agent.id]
                    sprite.x = agent.x + sprite.offset[0]
                    sprite.y = agent.y + sprite.offset[1]
                }
            })
        }
    }
}

