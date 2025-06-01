import * as PIXI from "pixi.js"
import { Simulation } from "./simulation.ts"
import { Agent } from "./agent.ts"
import { AgentSprite } from "./agentSprite.ts"
import { Viewport } from "pixi-viewport"

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
        shape: [number, number],
        boxHeight: number,
        boxWidth: number,
        gap: number = 16,
        padding: number = 16
    ) {
        console.assert(shape[0] * shape[1] === simulations.length)
        super()
        this.app = new PIXI.Application()
        this.initAgentSprites(
            simulations,
            shape,
            boxWidth,
            boxHeight,
            gap,
            padding
        )
        this.addAgentRedrawListener()
        this.initApp(width, height, shape, boxWidth, boxHeight, gap, padding)
    }

    private initAgentSprites(
        simulations: Simulation[],
        shape: [number, number],
        boxWidth: number,
        boxHeight: number,
        gap: number,
        padding: number
    ) {
        simulations.forEach((simulation, idx) => {
            const x = idx % shape[0]
            const y = Math.floor(idx / shape[0])
            const agentSprites = Object.values(simulation.agents).reduce(
                (map, agent) => {
                    map[agent.id] = this.createAgentSprite(
                        agent,
                        x,
                        y,
                        boxWidth,
                        boxHeight,
                        gap,
                        padding
                    )
                    return map
                },
                {} as AgentSprites
            )
            this.allAgentSprites = { ...this.allAgentSprites, ...agentSprites }
        })
    }

    private createAgentSprite(
        agent: Agent,
        x: number,
        y: number,
        boxWidth: number,
        boxHeight: number,
        gap: number,
        padding: number
    ): AgentSprite {
        return new AgentSprite(
            agent.radius,
            agent.infectionSpreadRadius,
            agent.timeToRemoveDead,
            [
                (boxWidth + gap + 2 * padding) * x + padding,
                (boxHeight + gap + 2 * padding) * y + padding,
            ],
            agent.stateKind === "InfectedWithoutSymptoms"
        )
    }

    private addAgentRedrawListener() {
        this.addEventListener("AgentRedrawRequired", (event: Event) => {
            if (!(event instanceof AgentRedrawRequiredEvent)) return
            const sprite = this.allAgentSprites[event.agentId]
            if (!sprite) return

            if (event.removeAgent) {
                this.app.stage.removeChild(sprite)
                delete this.allAgentSprites[event.agentId]
                return
            }

            this.redrawAgentSprite(sprite, event.newStateKind)
        })
    }

    private redrawAgentSprite(
        sprite: AgentSprite,
        stateKind: Agent["stateKind"]
    ) {
        switch (stateKind) {
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
    }

    private async initApp(
        width: number,
        height: number,
        shape: [number, number],
        boxWidth: number,
        boxHeight: number,
        gap: number,
        padding: number
    ) {
        await this.app.init({
            width: width,
            height: height,
            background: 0xffffff,
        })
        const elementId = `simulation-window`
        document.getElementById(elementId)?.appendChild(this.app.canvas)
        this.app.ticker.add(this.onTick.bind(this))

        const viewport = this.createViewport(width, height)
        this.app.stage.addChild(viewport)
        viewport.drag().pinch().wheel().decelerate()

        this.addSpritesToViewport(viewport)
        this.drawSimulationBorders(
            viewport,
            shape,
            boxWidth,
            boxHeight,
            gap,
            padding
        )
    }

    private createViewport(width: number, height: number): Viewport {
        return new Viewport({
            screenWidth: width,
            screenHeight: height,
            worldWidth: width,
            worldHeight: height,
            events: this.app.renderer.events,
        })
    }

    private addSpritesToViewport(viewport: Viewport) {
        for (const sprite of Object.values(this.allAgentSprites)) {
            viewport.addChild(sprite)
        }
    }

    private drawSimulationBorders(
        viewport: Viewport,
        shape: [number, number],
        boxWidth: number,
        boxHeight: number,
        gap: number,
        padding: number
    ) {
        for (let idx = 0; idx < this.simulations.length; idx++) {
            const x = idx % shape[0]
            const y = Math.floor(idx / shape[0])
            const borders = new PIXI.Graphics()
            borders
                .roundRect(
                    x * (boxWidth + gap + 2 * padding),
                    y * (boxHeight + gap + 2 * padding),
                    boxWidth + 2 * padding,
                    boxHeight + 2 * padding
                )
                .stroke({ color: 0x000000, width: 2 })
            viewport.addChild(borders)
        }
    }

    private onTick(ticker: PIXI.Ticker) {
        for (const simulation of this.simulations) {
            simulation.step(ticker.deltaMS)
            simulation.agents.forEach((agent) => {
                if (agent.stateKind !== "Dead") {
                    const sprite = this.allAgentSprites[agent.id]
                    if (sprite) {
                        sprite.x = agent.x + sprite.offset[0]
                        sprite.y = agent.y + sprite.offset[1]
                    }
                }
            })
        }
    }
}
