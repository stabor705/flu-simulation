import "./style.css"
import { Simulation, SimulationStatistics } from "./simulation"
import { AppWindow } from "./appwindow.ts"
import { SimulationConfig } from "./config.ts"
import { StatisticsDisplay } from "./statisticsdisplay.ts"

const simulationWindowElem = document.getElementById("simulation-window")

const startSimulation = (agentsPerCommunity: number, numberOfCommunities: number) => {
    const config = new SimulationConfig({
        agentNum: agentsPerCommunity,
        agentInfectionSpreadRadius: 20,
        agentRadius: 10,
        agentMovementSpeed: 0.1,
        maxInitialInfected: 0.3,
        infectionSpreadInterval: 1000,
        incubationPeriod: 15000,
        ilnessDuration: 15000,
        chanceToRecover: 0.7,
    })

    const boxHeight = 480
    const boxWidth = 480
    const gridSide = Math.ceil(Math.sqrt(numberOfCommunities))

    const simulations = Array.from({ length: numberOfCommunities }, () => {
        const simulation = new Simulation(config, { width: boxWidth, height: boxHeight })
        return simulation
    })

    const windowWidth = simulationWindowElem?.clientWidth
    const windowHeight = simulationWindowElem?.clientHeight
    const appWindow = new AppWindow(windowWidth ?? 720, windowHeight ? windowHeight - 30 : 360, simulations, [gridSide, gridSide], boxHeight, boxWidth)

    for (const simulation of simulations) {
        simulation.initWindow(appWindow)
    }

    const statisticsDisplay = new StatisticsDisplay()

    const updateStatistics = () => {
        const currentStatistics = simulations.reduce(
            (accumulatedStatistics, simulation) => {
                const statistics = simulation.getStatistics()
                return {
                    infectedCount:
                        accumulatedStatistics.infectedCount +
                        statistics.infectedCount,
                    healthyCount:
                        accumulatedStatistics.healthyCount +
                        statistics.healthyCount,
                    infectedWithoutSymptomsCount:
                        accumulatedStatistics.infectedWithoutSymptomsCount +
                        statistics.infectedWithoutSymptomsCount,
                    recoverdCount:
                        accumulatedStatistics.recoverdCount +
                        statistics.recoverdCount,
                    deadCount:
                        accumulatedStatistics.deadCount + statistics.deadCount,
                }
            },
            {
                infectedCount: 0,
                healthyCount: 0,
                infectedWithoutSymptomsCount: 0,
                recoverdCount: 0,
                deadCount: 0,
            } satisfies SimulationStatistics
        )
        statisticsDisplay.updateStatistics(currentStatistics)
    }

    updateStatistics()
    setInterval(updateStatistics, 1000)
}

const formAppElement = document.getElementById("form-app")
const appElement = document.getElementById("app")
const numOfAgentsInput = document.getElementById("number-of-agents-per-community") as HTMLInputElement | undefined
const numOfCommunitiesInput = document.getElementById("number-of-communities") as HTMLInputElement | undefined

if (formAppElement)  {
    formAppElement.addEventListener("submit", event => {
        if (!numOfAgentsInput || !numOfCommunitiesInput) {
            return
        }
        event?.preventDefault()
        if (appElement) {
            appElement.style.display = "flex"
        }
        formAppElement.style.display = "none"
        const agentsPerCommunity = parseInt(numOfAgentsInput.value)
        const numberOfCommunities = parseInt(numOfCommunitiesInput.value)
        startSimulation(agentsPerCommunity, numberOfCommunities)
    })
}

const totalNumberOfAgentsElem = document.getElementById("total-number-of-agents")

const updateTotalNumberOfAgents = () => {
    if (!numOfAgentsInput || !numOfCommunitiesInput || !totalNumberOfAgentsElem) {
        return
    }
    const agentsPerCommunity = parseInt(numOfAgentsInput.value)
    const numberOfCommunities = parseInt(numOfCommunitiesInput.value)
    const totalNumberOfAgents = agentsPerCommunity * numberOfCommunities
    if (isNaN(totalNumberOfAgents) || totalNumberOfAgents <= 0) {
        totalNumberOfAgentsElem.textContent = ""
        return
    }
    totalNumberOfAgentsElem.textContent = totalNumberOfAgents.toString()
}

if (numOfAgentsInput && numOfCommunitiesInput) {
    numOfAgentsInput.addEventListener("input", updateTotalNumberOfAgents)
    numOfCommunitiesInput.addEventListener("input", updateTotalNumberOfAgents)
    updateTotalNumberOfAgents()
}

updateTotalNumberOfAgents()
