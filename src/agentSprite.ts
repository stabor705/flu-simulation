import * as PIXI from "pixi.js"

export class AgentSprite extends PIXI.Graphics {
    constructor(
        private radius: number,
        private infectionSpreadRadius: number,
        isInfected: boolean
    ) {
        super()
        if (isInfected) {
            this.drawInfected()
        } else {
            this.drawHealthy()
        }
    }

    public drawHealthy() {
        this.clear().circle(0, 0, this.radius).fill(0x00ff00)
    }

    public drawInfected() {
        this.clear()
            .circle(0, 0, this.infectionSpreadRadius)
            .fill({ color: 0xff0000, alpha: 0.2 })
            .circle(0, 0, this.radius)
            .fill(0xff0000)
    }
}
