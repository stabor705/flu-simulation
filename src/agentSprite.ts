import * as PIXI from "pixi.js"

export class AgentSprite extends PIXI.Graphics {
    constructor(
        private radius: number,
        private infectionSpreadRadius: number,
        private timeToRemoveDead: number,
        public offset: [number, number],
        isInitialyInfected: boolean
    ) {
        super()
        if (isInitialyInfected) {
            this.drawInfected()
        } else {
            this.drawHealthy()
        }
    }

    public drawHealthy() {
        this.clear().circle(0, 0, this.radius).fill(0x00ff00)
    }

    public drawRecovered() {
        this.clear().circle(0, 0, this.radius).fill(0x0000ff)
    }

    public drawDead() {
        const duration = this.timeToRemoveDead / 1000
        let alpha = 1
        const fadeStep = 1 / (duration * 60)

        const fade = () => {
            alpha -= fadeStep
            if (alpha <= 0) {
                alpha = 0
                this.clear()
                return
            }

            this.clear()
                .circle(0, 0, this.radius)
                .fill({ color: 0x000000, alpha })

            requestAnimationFrame(fade)
        }

        fade()
    }

    public drawInfected() {
        this.clear()
            .circle(0, 0, this.infectionSpreadRadius)
            .fill({ color: 0xff0000, alpha: 0.2 })
            .circle(0, 0, this.radius)
            .fill(0xff0000)
    }

    public drawInfectedWithoutSymptoms() {
        this.clear()
            .circle(0, 0, this.infectionSpreadRadius)
            .fill({ color: 0xfa6e00, alpha: 0.2 })
            .circle(0, 0, this.radius)
            .fill(0xffa500)
    }
}
