import * as PIXI from 'pixi.js'
import { Noise } from 'noisejs'
import './style.css'

const app = new PIXI.Application()
await app.init({ width: 640, height: 480, background: 0xffffff })
document.getElementById('simulation-window')?.appendChild(app.canvas)

const startX = Math.random() * 640
const startY = Math.random() * 480
const circle = new PIXI.Graphics().circle(startX, startY, 10).fill(0x00ff00)
app.stage.addChild(circle)

const v = 1

const noise = new Noise(Math.random())
let noiseOffset = 0

app.ticker.add(ticker => {
  const angle = noise.perlin2(noiseOffset, noiseOffset) * Math.PI * 2
  circle.x += Math.cos(angle) * v * ticker.deltaTime
  circle.y += Math.sin(angle) * v * ticker.deltaTime
  noiseOffset += 0.01
})