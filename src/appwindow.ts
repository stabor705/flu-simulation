import * as PIXI from "pixi.js";
import {Simulation} from "./simulation.ts";
import {Agent} from "./agent.ts";

export class AgentRedrawRequiredEvent extends Event {
  constructor(public agentId: string, public radius: number) {
    super("AgentRedrawRequired")
  }
}

export class AppWindow extends EventTarget {
  private app: PIXI.Application
  private readonly agentSprites: Record<Agent["id"], PIXI.Graphics> = {}

  constructor(width: number, height: number, private simulation: Simulation) {
    super()

    this.app = new PIXI.Application()
    this.agentSprites = Object.values(this.simulation.agents).reduce((map , agent) => {
      const color = agent.stateKind === "Healthy" ? 0x00ff00 : 0xff0000
      const circle = new PIXI.Graphics().circle(0, 0, agent.radius).fill(color)
      map[agent.id] = circle
      return map
    }, {} as typeof this.agentSprites)
    this.app.init({width: width, height: height, background: 0xffffff}).then(() => {
      document.getElementById("simulation-window")?.appendChild(this.app.canvas)
      this.app.ticker.add(this.onTick.bind(this))
    })
    for (const sprite of Object.values(this.agentSprites)) {
      this.app.stage.addChild(sprite)
    }

    this.addEventListener("AgentRedrawRequired", (event: Event) => {
      if (!(event instanceof AgentRedrawRequiredEvent)) return

      const sprite = this.agentSprites[event.agentId]
      sprite.clear()
      // TODO: would be nice to not use deprecated methods, but I could not find the PixiJS v8.0 way
      sprite.fill(0xff0000)
      sprite.beginFill(0xff0000)
      sprite.drawCircle(0, 0, event.radius)
      sprite.endFill()
    })
  }

  private onTick(ticker: PIXI.Ticker) {
    this.simulation.step(ticker.deltaMS)
    this.simulation.agents.forEach(agent => {
      const sprite = this.agentSprites[agent.id]
      sprite.x = agent.x
      sprite.y = agent.y
    })
  }
}