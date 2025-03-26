import { Noise } from "noisejs";
import { v4 as uuidv4 } from 'uuid'

export interface SimulationBounds {
    width: number
    height: number
}

export class Agent {
    public id = uuidv4()
    private noise: Noise = new Noise(Math.random())
    private noiseOffset: number = 0

    constructor(public x: number, public y: number, public v: number = 0.1, public radius: number = 10) {}

    move(deltaTime: number, bounds: SimulationBounds) {
        const angle = this.noise.perlin2(this.noiseOffset, this.noiseOffset) * Math.PI * 2

        let deltaX = Math.cos(angle) * this.v * deltaTime
        let deltaY = Math.sin(angle) * this.v * deltaTime

        deltaX = (this.x + deltaX - this.radius < 0)
            ? Math.abs(deltaX)
            : (this.x + deltaX + this.radius > bounds.width)
                ? -Math.abs(deltaX)
                : deltaX;

        deltaY = (this.y + deltaY - this.radius < 0)
            ? Math.abs(deltaY)
            : (this.y + deltaY + this.radius > bounds.height)
                ? -Math.abs(deltaY)
                : deltaY;

        this.x += deltaX
        this.y += deltaY

        this.noiseOffset += 0.01
    }
}