const props = require('../../properties-loader.js')
const {NORTH, EAST, WEST, SOUTH} = props.gameConsts
var gameControllerEventEmitter = new (require('events'))()

// default values for controls
var playersControls = {
    NORTH: {left: 'a', right: 'e'},
    EAST: {left: 'p', right: 'm'},
    SOUTH: {left: 'ArrowLeft', right: 'ArrowRight'},
    WEST: {left: 'y', right: 'h'}
}

var pc = playersControls

document.getElementById('stopButton').addEventListener('click', onStopGame)
document.getElementById('startButton').addEventListener('click', onStart)

document.addEventListener('keydown', function(e){
    for(let side in pc){
        if(e.key === pc[side].left) gameControllerEventEmitter.emit('moveLeft', {'side': side})
        if(e.key === pc[side].right) gameControllerEventEmitter.emit('moveRight', {'side': side})
    }
})
document.addEventListener('keyup', function(e){
    for(let side in pc){
        if(e.key === pc[side].left) gameControllerEventEmitter.emit('stopPlayer', {'side': side})
        if(e.key === pc[side].right) gameControllerEventEmitter.emit('stopPlayer', {'side': side})
    }
})

function onStart(){
    gameControllerEventEmitter.emit('start')
}

function onStopGame(){
    gameControllerEventEmitter.emit('leaveGame')
}

module.exports.on = function(event, callback){
    gameControllerEventEmitter.on(event, callback)
}

module.exports.setControls = function({side, left, right}){
    playersControls[side]['left'] = left
    playersControls[side]['right'] = right
}
