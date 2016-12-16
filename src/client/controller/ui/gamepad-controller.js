//this is just test code. to be moved. remind me if you actually see it
let gamepads = navigator.getGamepads()

let devices = {} //map that holds assigned devices
let assignedDevices = 0 //number of assigned devices
let connectedDevices = 0 //number of connected devices

//callbacks
let moveCallback
let gamepadConnectedCallback
let gamepadDisconnectedCallback
let pollingInterval

window.addEventListener("gamepadconnected", function(e) {
    e.preventDefault() // has this ever even worked ?
    devices[e.gamepad.index] = { assigned: false }
    connectedDevices++
    gamepadConnectedCallback({ deviceID: e.gamepad.index })
})

window.addEventListener("gamepaddisconnected", function(e) {
    e.preventDefault()
    if (devices[e.gamepad.index].assigned) {
        deassignGamepad(e.gamepad.index)
    }
    delete devices[e.gamepad.index]
    connectedDevices--
    gamepadDisconnectedCallback({ deviceID: e.gamepad.index })
})

function isPressed(b) {
    if (typeof(b) == "object") {
        return b.pressed;
    }
    return Math.abs(b) >= 0.6 //b <= -0.6 || b >= 0.6
}

function poll() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if (!gamepads) {
        return;
    }

    for (let gp of gamepads) {

        if (gp === undefined || devices[gp.index] === undefined || !devices[gp.index].assigned) continue

        for (let axis in gp.axes) {
            //behold ..  !!
            let keyVal = ~~gp.axes[axis] //the double-bitwise-NOT ! (1.0 --> 1, -1.0 --> -1)
            /**
            *   apparantly more efficient than Math.floor/Math.ceil
            *   source :
            * http://web.archive.org/web/20100422040551/http://james.padolsey.com/javascript/double-bitwise-not/
            **/
            if (isPressed(gp.axes[axis]) && !devices[gp.index].keys[axis]) {
                devices[gp.index].keys[axis] = keyVal
                moveCallback({ deviceID: gp.index, value: keyVal })

            } else if (!isPressed(gp.axes[axis]) && devices[gp.index].keys[axis]) {
                devices[gp.index].keys[axis] = 0
                moveCallback({ deviceID: gp.index, value: 0 })
            }
        }
    }
}


function init(_moveCallback, _gamepadConnectedCallback, _gamepadDisconnectedCallback) {
    moveCallback = _moveCallback
    gamepadConnectedCallback = _gamepadConnectedCallback
    gamepadDisconnectedCallback = _gamepadDisconnectedCallback
}

/**
* find and assign an available gamepad
**/
//module.exports.assignGamepad = function(playerSide, callback) { .. }
function assignGamepad(playerSide, callback) {
    let assignedID = -1
    for (let deviceID in devices) {
        let gamepadInstance = devices[deviceID].gamepad
        if (devices[deviceID] === undefined || devices[deviceID].assigned == false) {
            devices[deviceID] = {
                id: deviceID,
                assigned: true,
                keys: [ 0, 0 ]
            }
            assignedID = deviceID
            assignedDevices++
            if (assignedDevices == 1) {
                //window.requestAnimationFrame(poll)
                pollingInterval = setInterval(function() {
                    if (assignedDevices)
                        poll()
                }, 25)
            }
            break
        }
    }
    let error = null
    if (assignedID == -1) { //couldn't assign a device
        error = { message: 'No gamepads available' }
    }
    callback(error, { deviceID: assignedID, side: playerSide })
}

/**
*   never really used, why did I write this
**/
function deassignGamepad(deviceID, callback) {
    let device = devices[deviceID]
    if (device !== undefined) {
        device.assigned = false
        assignedDevices--
    }
    if (!assignedDevices) clearInterval(pollingInterval)
    if (callback !== undefined) callback(null, null)
}

module.exports = {
    init: init,
    assignGamepad: assignGamepad,
    deassignGamepad: deassignGamepad
}
