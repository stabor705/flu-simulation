import "./style.css"
import { Simulation, SimulationStatistics } from "./simulation"
import { AppWindow } from "./appwindow.ts"
import { SimulationConfig } from "./config.ts"
import { StatisticsDisplay } from "./statisticsdisplay.ts"

const simulationWindowElem = document.getElementById("simulation-window")

interface StatisticsHistoryEntry {
    time: number
    statistics: SimulationStatistics
}
const statisticsHistory: StatisticsHistoryEntry[] = []
const statisticsUpdateInterval = 100

const startSimulation = (
    agentsPerCommunity: number,
    numberOfCommunities: number,
    maxInitialInfected: number,
    chanceToRecover: number,
    isQuarantineEnabled: boolean
) => {
    const config = new SimulationConfig({
        agentNum: agentsPerCommunity,
        maxInitialInfected: maxInitialInfected,
        chanceToRecover: chanceToRecover,
        isQuarantineEnabled: isQuarantineEnabled,
    })

    const boxHeight = 480
    const boxWidth = 480
    const gridSide = Math.ceil(Math.sqrt(numberOfCommunities))

    const simulations = Array.from({ length: numberOfCommunities }, () => {
        const simulation = new Simulation(config, {
            width: boxWidth,
            height: boxHeight,
        })
        return simulation
    })

    const windowWidth = simulationWindowElem?.clientWidth
    const windowHeight = simulationWindowElem?.clientHeight
    const appWindow = new AppWindow(
        windowWidth ?? 720,
        windowHeight ? windowHeight - 30 : 360,
        simulations,
        [gridSide, gridSide],
        boxHeight,
        boxWidth
    )

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
                    quarantinedCount:
                        accumulatedStatistics.quarantinedCount +
                        statistics.quarantinedCount,
                }
            },
            {
                infectedCount: 0,
                healthyCount: 0,
                infectedWithoutSymptomsCount: 0,
                recoverdCount: 0,
                deadCount: 0,
                quarantinedCount: 0,
            } satisfies SimulationStatistics
        )
        statisticsDisplay.updateStatistics(currentStatistics)
        const lastTimestamp = statisticsHistory.at(-1)?.time
        const timestamp =
            lastTimestamp !== undefined
                ? lastTimestamp + statisticsUpdateInterval
                : 0
        statisticsHistory.push({
            time: timestamp,
            statistics: currentStatistics,
        })
    }

    updateStatistics()
    setInterval(updateStatistics, 100)
}

document.getElementById("export-button")?.addEventListener("click", () => {
    const data = JSON.stringify(statisticsHistory)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "history.json"
    a.click()
    URL.revokeObjectURL(url)
})

const formAppElement = document.getElementById("form-app")
const appElement = document.getElementById("app")
const numOfAgentsInput = document.getElementById(
    "number-of-agents-per-community"
) as HTMLInputElement | undefined
const numOfCommunitiesInput = document.getElementById(
    "number-of-communities"
) as HTMLInputElement | undefined
const maxInitialInfectedInput = document.getElementById(
    "max-initial-infected"
) as HTMLInputElement | null
const chanceToRecoverInput = document.getElementById(
    "chance-to-recover"
) as HTMLInputElement | null
const isQuarantineEnabledInput = document.getElementById(
    "quarantine-checkbox"
) as HTMLInputElement | null

if (formAppElement) {
    formAppElement.addEventListener("submit", (event) => {
        if (
            !numOfAgentsInput ||
            !numOfCommunitiesInput ||
            !maxInitialInfectedInput ||
            !chanceToRecoverInput
        ) {
            return
        }
        event?.preventDefault()
        if (appElement) {
            appElement.style.display = "flex"
        }
        formAppElement.style.display = "none"
        const agentsPerCommunity = parseInt(numOfAgentsInput.value)
        const numberOfCommunities = parseInt(numOfCommunitiesInput.value)
        const maxInitialInfected = Number(maxInitialInfectedInput.value)
        const chanceToRecover = Number(chanceToRecoverInput.value)
        const isQuarantineEnabled = isQuarantineEnabledInput?.checked ?? false
        startSimulation(
            agentsPerCommunity,
            numberOfCommunities,
            maxInitialInfected,
            chanceToRecover,
            isQuarantineEnabled
        )
    })
}

const totalNumberOfAgentsElem = document.getElementById(
    "total-number-of-agents"
)

const updateTotalNumberOfAgents = () => {
    if (
        !numOfAgentsInput ||
        !numOfCommunitiesInput ||
        !totalNumberOfAgentsElem
    ) {
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
