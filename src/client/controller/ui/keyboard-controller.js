let moveCallback

/**
* a device in this case is essentially a set of keys
**/

//map of the 'emuilated' devices
let devices = {
    'kbPrimary': {
        'ArrowLeft': -1,
        'ArrowRight': 1,
        'visualRepr': '  L/R  ',
        assigned: false
    },  
    'kbSecondary': { //supports QWERTY and AZERTY keyboard layouts
        'a': -1,
        'A': -1,
        'q': -1,
        'Q': -1,
        'd': 1,
        'D': 1,
        'visualRepr': '  A/D  ',
        assigned: false
    },
    'kbTertiary': { // ?
        'v': -1,
        'V': -1,
        'n': 1,
        'N': 1,
        'visualRepr': '  V/N  ',
        assigned: false
    },
    'kbQuadriary': { // ?
        'i': -1,
        'I': -1,
        'p': 1,
        'P': 1,
        'visualRepr': '  I/P  ',
        assigned: false
    }
}

let controlKeys = {} //maps each key to its corresponding deviceID
for (let i in devices) {
    for (let j in devices[i]) {
        if (j != 'assigned') {
            controlKeys[j] = {deviceID: i, pressed: false}
        }
    }
}

function init(callback) {
    moveCallback = callback
    document.addEventListener('keydown', function(e){
        if (controlKeys[e.key] !== undefined && !controlKeys[e.key].pressed && devices[controlKeys[e.key].deviceID].assigned) {
            controlKeys[e.key].pressed = true
            if (devices[controlKeys[e.key].deviceID][e.key] == -1) { //left, (should import the directional constants)
                callback({deviceID: controlKeys[e.key].deviceID, value: -1})
            } else { //right, hopefully
                callback({deviceID: controlKeys[e.key].deviceID, value: 1})
            }
        }
    })
    document.addEventListener('keyup', function(e){
        if (controlKeys[e.key] !== undefined && controlKeys[e.key].pressed && devices[controlKeys[e.key].deviceID].assigned) {
            controlKeys[e.key].pressed = false
            callback({deviceID: controlKeys[e.key].deviceID, value: 0})
        }
    })
}

/**
* assigns a device for the given player
**/
function assignDevice(playerSide, callback) {
    let deviceID = null
    for (let i in devices) {
        if (devices[i].assigned == false) {
            devices[i].assigned = true
            deviceID = i
            break;
        }
    }
    let error = null
    if (deviceID === null) { //couldn't assign a device, not really possible
        error = {message: 'All defined keysets are already assigned'}
    }
    callback(error, {deviceID: deviceID, visualRepr: devices[deviceID].visualRepr, side: playerSide})
}

/**
* marks the device as unassigned
**/
function deassignDevice(deviceID, callback) {
    let device = devices[deviceID]
    if (device !== undefined) {
        device.assigned = false
    }
    if (callback !== undefined) callback(null, null)
}

module.exports = {
    init: init,
    assignDevice: assignDevice,
    deassignDevice: deassignDevice
}
