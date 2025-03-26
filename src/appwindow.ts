import * as PIXI from "pixi.js";
import {Simulation} from "./simulation.ts";
import {Agent} from "./agent.ts";

export class AppWindow {
  private app: PIXI.Application
  private readonly agentSprites: Record<Agent["id"], PIXI.Graphics> = {}

  constructor(width: number, height: number, private simulation: Simulation) {
    this.app = new PIXI.Application()
    this.agentSprites = this.simulation.agents.reduce((map , agent) => {
      const circle = new PIXI.Graphics().circle(0, 0, agent.radius).fill(0x00ff00)
      circle.x = Math.random() * width
      circle.y = Math.random() * height
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