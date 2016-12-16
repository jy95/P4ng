const props = require('../../../properties-loader.js')
const gameLogic = require(props.gameLogicPath())
const lobbyLogic = require(props.lobbyLogicPath())
const lobbyToServer = require(props.lobbyToServerPath())

const KEYBOARD_ICON = "../../view/icon-keyboard.png"
const GAMEPAD_ICON = "../../view/icon-gamepad.png"

//slave controllers
const gpc = require('./gamepad-controller.js')
const kbc = require('./keyboard-controller.js')

//controller type constants
const GAMEPAD = 0
const KEYBOARD = 1

//directional constants, should they be here ?
const LEFT = -1
const RIGHT = 1

let controllerMap = {} // maps deviceIDs to players
let controllerQueue = [] // list of players (temporarily using the keyboard) who await available gamepads
let assignmentFailures = {} // a support structure that helps avoid infinite callback loops
let pendingDeviceID

document.getElementById('stopButton').addEventListener('click', onStop)
document.getElementById('startButton').addEventListener('click', onStart)
document.getElementById('addPlayerButton').addEventListener('click', onAddPlayer);

function onStart() {
    lobbyLogic.askToStartGame()
}

function onStop(){
    lobbyLogic.askToLeaveRoom()
    deassignAll(0, true)
    var pControllerIcons = document.getElementsByClassName('controlIcon')
    var pControlDetails = document.getElementsByClassName('controlDetails')
    for (let i = 0; i < pControllerIcons.length; i++) {
        pControllerIcons[i].style.visibility = 'hidden'
        pControlDetails[i].textContent = ''
    }
}

function onAddPlayer() {
    let inputZone = document.getElementById('playerName')
    if (inputZone.style.visibility == 'hidden') {
        inputZone.style.visibility = 'visible'
    } else {
        let playerName = inputZone.value
        inputZone.value = ''
        lobbyToServer.newPlayer({name: playerName})
        inputZone.style.visibility = 'hidden'
    }
}

/**
* updates the user interface with information regarding
* a newly assigned controller (keyboard/gamepad icon + more details if necessary)
**/
function updateDeviceInfo(device) {
    var pControllerIcons = document.getElementsByClassName('controlIcon')
    var pControlDetails = document.getElementsByClassName('controlDetails')
    pControllerIcons[device.side].style.visibility = 'visible'
    if (getDeviceType(device) == KEYBOARD) {
        pControllerIcons[device.side].src = KEYBOARD_ICON
        pControlDetails[device.side].textContent = device.visualRepr
    } else {
        pControllerIcons[device.side].src = GAMEPAD_ICON
        pControlDetails[device.side].textContent = ''
    }
}

/**
* assigns a controller to the given player
**/
function assignController(controllerType, side, callback) {
    if (controllerType == GAMEPAD) {
        gpc.assignGamepad(side, handleAssignment)
    } else {
        kbc.assignDevice(side, handleAssignment)
    }
    if (callback !== undefined) {
        callback()
    }
}

/**
* adds the given player to the queue for gamepads
**/
function pushToQueue(side) {
    var waiting = false
    for (var i = 0; i < controllerQueue.length; i++) {
        if (controllerQueue[i].side == side) {
            waiting = true
        }
    }
    if (!waiting) { //avoid adding the same player multiple times
        controllerQueue.push({ side: side, awaitingResponse: false })
    }
}

/**
* pops from the queue and returns the first element
**/
function popFromQueue() {
    var popped = controllerQueue.shift()
    return popped.side
}

/**
* assigns a gamepad to the first in-line
**/
function assignFromQueue() {
    if (controllerQueue.length > 0) {
        var side = controllerQueue[0].side
        controllerQueue[0].awaitingResponse = true
        gpc.assignGamepad(side, handleAssignment)
    }
}

function init() {
    kbc.init(handleMove)
    gpc.init(handleMove, onDeviceAvailable, onDeviceDisconnect)
    document.getElementById('playerName').style.visibility = 'hidden'
}

/**
* called when a new gamepad is available
**/
function onDeviceAvailable(device) {
    if (pendingDeviceID != device.deviceID) { // a desperate last minute attempt to fix an annoying bug
        pendingDeviceID = device.deviceID
        assignFromQueue()
    }
}

function onDeviceDisconnect(data) {
    if (controllerMap[data.deviceID] !== undefined) {
        var side = controllerMap[data.deviceID].side
        delete controllerMap[data.deviceID]
        assignController(KEYBOARD, side, undefined)
        pushToQueue(side)
    }
}

/**
* transmit the received 'move' event
**/
function handleMove(data) {
    if (data.value != 0) {
        if (data.value == LEFT) {
            gameLogic.movePlayerLeft({ side: controllerMap[data.deviceID].side })
        } else if (data.value == RIGHT) {
            gameLogic.movePlayerRight({ side: controllerMap[data.deviceID].side })
        }
    } else {
        gameLogic.stopPlayer({ side: controllerMap[data.deviceID].side })
    }
}

/**
* Performs the necessary actions following an attempt to assign a device by one of the
* controllers.
**/
function handleAssignment(err, data) {
    if (err) { //the controller failed to assign a device
        if (assignmentFailures[data.side] === undefined) {
            assignmentFailures[data.side] = 1 // first failed attempt
        } else { // already failed once before
            assignmentFailures[data.side] = assignmentFailures[data.side]+1
            if (assignmentFailures[data.side] >= 2) { // reached the limit, stop
                return
            }
        }
        //distinguish between a failure to assign a gamepad and a failure to assign a keyboard 'device'
        if (controllerQueue.length > 0 && controllerQueue[0].side == data.side && controllerQueue[0].awaitingResponse) {
            controllerQueue[0].awaitingResponse = false
        } else {
            pushToQueue(data.side)
        }
        //assign a keyboard 'device'
        kbc.assignDevice(data.side, handleAssignment)
    } else { //success
        assignmentFailures[data.side] = 0
        controllerMap[data.deviceID] = { side: data.side };
        if (controllerQueue.length > 0 && controllerQueue[0].side == data.side && controllerQueue[0].awaitingResponse) {
            popFromQueue()
            if (pendingDeviceID == data.deviceID) pendingDeviceID = undefined
        }
        updateDeviceInfo(data)
    }
}

function getDeviceType(deviceID) {
    return KEYBOARD ? isNaN(deviceID) : GAMEPAD
}

/**
* deassign any devices currently assigned to the given player
**/
function deassignAll(side, allPlayers) {
    for (var deviceID in controllerMap) {
        if (allPlayers || controllerMap[deviceID].side == side) {
            deassignDevice(deviceID)
        }
    }
}

function deassignDevice(deviceID) {
    delete controllerMap[deviceID]
    if (getDeviceType(deviceID) == KEYBOARD) {
        kbc.deassignDevice(deviceID)
    } else {
        gpc.deassignGamepad(deviceID)
    }
}

module.exports = {
    init: init,
    assignController: assignController,
    deassignController: deassignAll,
    GAMEPAD: GAMEPAD,
    KEYBOARD: KEYBOARD
}
