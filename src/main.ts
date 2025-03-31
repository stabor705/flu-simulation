import './style.css'
import { Simulation } from './simulation'
import {AppWindow} from "./appwindow.ts";

const simulation = new Simulation(10, {width: 640, height: 480})
const window = new AppWindow(640, 480, simulation)
simulation.initWindow(window)
