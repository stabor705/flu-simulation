import * as PIXI from 'pixi.js'
import './style.css'

const app = new PIXI.Application()
await app.init({ width: 640, height: 480, background: 0xffffff })
document.getElementById('simulation-window')?.appendChild(app.canvas)