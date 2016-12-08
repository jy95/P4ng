const props = require('../../properties-loader.js')
const gameLogic = require(props.gameLogicPath())
const lobbyLogic = require(props.lobbyLogicPath())
const lobbyToServer = require(props.lobbyToServerPath())
//const {NORTH, EAST, WEST, SOUTH} = props.gameConsts

const io = require('socket.io')(3000)
const kbc = require('./keyboard-controller.js')

//controller type constants
const GAMEPAD = 0
const KEYBOARD = 1

//directional constants, should they be here ?
const LEFT = -1
const RIGHT = 1

let controllerMap = {} // maps deviceIds to players
let controllerQueue = [] // list of players (temporarily using the keyboard) who await available gamepads
let assignmentFailures = {} // a support structure that helps avoid infinite callback loops
let socket // communication socket for the gamepad-controller

document.getElementById('stopButton').addEventListener('click', onStopGame)
document.getElementById('startButton').addEventListener('click', onStart)
document.getElementById('addPlayerButton').addEventListener('click', onAddPlayer);

/*
document.addEventListener('keydown', function(e){
    for(let side in pc){
        if(e.key === pc[side].left) gameLogic.movePlayerLeft({'side': side})
        if(e.key === pc[side].right) gameLogic.movePlayerRight({'side': side})
    }
})
document.addEventListener('keyup', function(e){
    for(let side in pc){
        if(e.key === pc[side].left) gameLogic.stopPlayer({'side': side})
        if(e.key === pc[side].right) gameLogic.stopPlayer({'side': side})
    }
})
*/

function onStart() {

    //assignController(GAMEPAD, NORTH) //ne pas faire ici
    //assignController(KEYBOARD, EAST) // ..
    //assignController(KEYBOARD, WEST)
    //assignController(GAMEPAD, SOUTH)
    lobbyLogic.startGame()
}

function onStopGame(){
    lobbyLogic.leaveRoom({roomId: false, id: false})
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
* assigns a controller to the given player
**/
function assignController(controllerType, side, callback) {
    if (controllerType == GAMEPAD) {
        socket.emit('assign', {side: side})
    } else {
        kbc.assignControls(side, handleAssignment)
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
        controllerQueue.push({side: side, awaitingResponse: false})
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
        socket.emit('assign', {side: side})
    }
}

function init() {
    kbc.init(handleMove)

    document.getElementById('playerName').style.visibility = 'hidden'

    io.on('connect', function(_socket) {
        socket = _socket
        socket.on('move', function(data) {
            handleMove(data)
        })

        socket.on('assign', function(err, data) {
            handleAssignment(err, data)
        })

        socket.on('gamepadDisconnected', function(data) {
            //gamepad disconnected, assign player to keyboard
            var side = controllerMap[data.deviceId].side
            delete controllerMap[data.deviceId]
            assignController(KEYBOARD, side, undefined)
            pushToQueue(side)
        })

        socket.on('availableDevices', function(data) {
            //available gamepads
            for (var i = 0; i < data.availableDevices; i++) {
                assignFromQueue()
            }
        })
    })
}

/**
* transmit the received 'move' event
**/
function handleMove(data) {
    if (data.value != 0) {
        if (controllerMap[data.deviceId].inMovement) { //not really doing anything at the moment
            gameLogic.stopPlayer({side: controllerMap[data.deviceId].side})
            controllerMap[data.deviceId].skippingStop = true
        }
        if (data.value == LEFT) {
            gameLogic.movePlayerLeft({side: controllerMap[data.deviceId].side})
        } else if (data.value == RIGHT) {
            gameLogic.movePlayerRight({side: controllerMap[data.deviceId].side})
        }
    } else {
        if (!controllerMap[data.deviceId].skippingStop) {
            controllerMap[data.deviceId].inMovement = false
            gameLogic.stopPlayer({side: controllerMap[data.deviceId].side})
        } else {
            controllerMap[data.deviceId].skippingStop = false
        }
    }
}

/**
* Performs the necessary actions following an attempt to assign a device by one of the
* controllers.
**/
function handleAssignment(err, data) {
    console.log(data)
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
        kbc.assignControls(data.side, handleAssignment)
    } else { //success

        assignmentFailures[data.side] = 0
        deassignAll(data.side) // necessary ?
        controllerMap[data.deviceId] = {side: data.side, inMovement : false, skippingStop: false};
        if (controllerQueue.length > 0 && controllerQueue[0].side == data.side && controllerQueue[0].awaitingResponse) {
            popFromQueue()
        }
    }
}

/**
* deassign any devices currently assigned to the given player
**/
function deassignAll(side) {
    for (var deviceId in controllerMap) {
        if (controllerMap[deviceId].side == side) {
            delete(controllerMap[deviceId])
            if (isNaN(deviceId)) {
                kbc.deassignControls(deviceId)
            }
        }
    }
}

module.exports.init = init
module.exports.assignController = assignController
//module.exports.LEFT = LEFT
//module.exports.RIGHT = RIGHT
module.exports.GAMEPAD = GAMEPAD
module.exports.KEYBOARD = KEYBOARD
