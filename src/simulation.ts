import  * as PIXI from "pixi.js"
import { Agent } from "./agent"

export class Simulation {
    private app: PIXI.Application
    private agents: Agent[] = [];
    private agentNum: number;
    private window: {width: number, height: number}

    constructor(window: {width: number, height: number}, agentNum: number = 10) {
        this.app = new PIXI.Application()
        this.window = window
        this.agentNum = agentNum
        this.app.init({width: window.width, height: window.height, background: 0xffffff}).then(() => {
            document.getElementById("simulation-window")?.appendChild(this.app.canvas)
            this.initAgents()
            this.app.ticker.add((ticker) => this.update(ticker.deltaTime))
        })
    }

    private initAgents() {
        for (let i = 0; i < this.agentNum; i++) {
            const agent = new Agent(this.window, this.app)
            this.agents.push(agent)
        }
    }

    private update(deltaTime: number) {
        this.agents.forEach(agent => agent.update(deltaTime))
    }

}