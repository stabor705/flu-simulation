import { Noise } from "noisejs";
import  * as PIXI from "pixi.js"

export class Agent {
    private noise: Noise
    private noiseOffset: number = 0
    private v: number = 1
    private radius: number = 10
    private circle: PIXI.Graphics
    private bounds: {width: number; height: number}

    constructor(bounds: {width: number; height: number}, app: PIXI.Application) {
        this.bounds = bounds
        let initX = Math.random() * (bounds.width - this.radius) + this.radius
        let initY = Math.random() * (bounds.height - this.radius) + this.radius
        this.noise = new Noise(Math.random())
        this.circle = new PIXI.Graphics().circle(0, 0, this.radius).fill(0x00ff00)
        this.circle.x = initX
        this.circle.y = initY
        app.stage.addChild(this.circle)
    }

    update(deltaTime: number) {
        const angle = this.noise.perlin2(this.noiseOffset, this.noiseOffset) * Math.PI * 2

        let deltaX = Math.cos(angle) * this.v * deltaTime
        let deltaY = Math.sin(angle) * this.v * deltaTime

        deltaX = (this.circle.x + deltaX - this.radius < 0)
            ? Math.abs(deltaX)
            : (this.circle.x + deltaX + this.radius > this.bounds.width)
                ? -Math.abs(deltaX)
                : deltaX;
      
        deltaY = (this.circle.y + deltaY - this.radius < 0)
            ? Math.abs(deltaY)
            : (this.circle.y + deltaY + this.radius > this.bounds.height)
                ? -Math.abs(deltaY)
                : deltaY;

        this.circle.x += deltaX
        this.circle.y += deltaY

        this.noiseOffset += 0.01
    }
}