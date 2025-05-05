import * as PIXI from "pixi.js"
import { Simulation } from "./simulation.ts"
import { Agent } from "./agent.ts"
import { AgentSprite } from "./agentSprite.ts"

export class AgentRedrawRequiredEvent extends Event {
    constructor(
        public agentId: string,
        public radius: number,
        public infectionSpreadRadius: number
    ) {
        super("AgentRedrawRequired")
    }
}

export class AppWindow extends EventTarget {
    private app: PIXI.Application
    private readonly agentSprites: Record<Agent["id"], PIXI.Graphics> = {}

    constructor(
        width: number,
        height: number,
        private simulation: Simulation,
        id: number | undefined = undefined
    ) {
        super()

        this.app = new PIXI.Application()
        this.agentSprites = Object.values(this.simulation.agents).reduce(
            (map, agent) => {
                const sprite = new AgentSprite(
                    agent.radius,
                    agent.infectionSpreadRadius,
                    agent.stateKind === "Infected"
                )
                map[agent.id] = sprite
                return map
            },
            {} as typeof this.agentSprites
        )
        this.app
            .init({ width: width, height: height, background: 0xffffff })
            .then(() => {
                const elementId = `simulation-window${id ? `-${id}` : ""}`
                console.log(elementId)
                document.getElementById(elementId)?.appendChild(this.app.canvas)
                this.app.ticker.add(this.onTick.bind(this))
            })
        for (const sprite of Object.values(this.agentSprites)) {
            this.app.stage.addChild(sprite)
        }

        this.addEventListener("AgentRedrawRequired", (event: Event) => {
            if (!(event instanceof AgentRedrawRequiredEvent)) return

            const sprite = this.agentSprites[event.agentId] as AgentSprite
            sprite.drawInfected()
        })
    }

    private onTick(ticker: PIXI.Ticker) {
        this.simulation.step(ticker.deltaMS)
        this.simulation.agents.forEach((agent) => {
            const sprite = this.agentSprites[agent.id]
            sprite.x = agent.x
            sprite.y = agent.y
        })
    }
}
