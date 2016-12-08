const gamepad = require('gamepad')
const io = require('socket.io-client')
var socket = io.connect('http://localhost:3000')

let devices = {} //map that holds assigned devices
let assignedDevices = 0 //number of assigned devices
let connectedDevices = 0 //number of connected devices

socket.on('connect', function() {
    init()
})

function init() {
    gamepad.init()
    // Create a game loop and poll for events
    setInterval(gamepad.processEvents, 17)
    // Scan for new gamepads at a slower rate
    setInterval(detectDevices, 500)
    //setInterval(gamepad.detectDevices, 500)
    setInterval(detectDisconnects, 500)

    socket.on('assign', function(data) {
        var assignedId = assignGamepad()
        var error = null
        if (assignedId == -1) { //couldn't assign a device
          error = {message: 'No gamepads available'}
          console.log(error.message)
        }
        socket.emit('assign', error, {deviceId: assignedId, side: data.side})
    })
    //set listener
    gamepad.on('move', function(id, axis, value, oldValue) {
        //the driver is clever enough, no need to debounce
        if (assignedDevices > 0) {
            socket.emit('move', {deviceId: id, value: Math.trunc(value)})
        }
    })
}

/**
* scans for new devices
**/
function detectDevices() {
    gamepad.detectDevices()
    var _assignedDevices = 0
    for (var i = 0; i < gamepad.numDevices(); i++) {
        var gamepadInstance = gamepad.deviceAtIndex(i)
        if (devices[gamepadInstance.deviceID] === undefined) {
            devices[gamepadInstance.deviceID] = {id: gamepadInstance.deviceID, assigned: false}
        } else if (devices[gamepadInstance.deviceID].assigned == true) {
          _assignedDevices++
        }
    }
    if (_assignedDevices < gamepad.numDevices()) {
        //new gamepad(s) connected
        socket.emit('availableDevices', {availableDevices: gamepad.numDevices() - _assignedDevices})
    }
    assignedDevices = _assignedDevices;
}

/**
* scans for disconnected devices
**/
function detectDisconnects() {
    if (connectedDevices != gamepad.numDevices()) {
        //inconsistency in numbers! -> there has been a change
        for (var i in devices) {
            var online = false
            for (var j = 0; j < gamepad.numDevices(); j++) {
                if (i == gamepad.deviceAtIndex(j).deviceID) {
                    online = true
                }
            }
            if (devices[i].assigned && !online) {
                //tell game-controller that the gamepad is no longer connected
                devices[i].assigned = false
                socket.emit('gamepadDisconnected', {deviceId: i})
            }
        }
    }
    connectedDevices = gamepad.numDevices()
}

/**
* find and assign an available gamepad
**/
function assignGamepad() {
    var assignedId = -1
    for (var i = 0, l = gamepad.numDevices(); i < l; i++) {
        var gamepadInstance = gamepad.deviceAtIndex(i)
        if (devices[gamepadInstance.deviceID] === undefined || devices[gamepadInstance.deviceID].assigned == false) {
          devices[gamepadInstance.deviceID] = {id: gamepadInstance.deviceID, assigned: true, keys : [false, false]}
          assignedId = gamepadInstance.deviceID
          assignedDevices++
          break
        }
    }
    return assignedId;
}
