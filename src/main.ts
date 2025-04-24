import './style.css'
import { Simulation } from './simulation'
import { AppWindow } from "./appwindow.ts";
import { SimulationConfig } from './config.ts';

const config = new SimulationConfig({
    agentNum: 10,
    agentInfectionSpreadRadius: 20,
    agentRadius: 10,
    agentMovementSpeed: 0.1,
    maxInitialInfected: 0.3,
    infectionSpreadInterval: 1000
})

const simulation = new Simulation(config, { width: 640, height: 480 })
const window = new AppWindow(640, 480, simulation)
simulation.initWindow(window)
