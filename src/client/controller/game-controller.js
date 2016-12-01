const props = require('../../properties-loader.js')
const gameLogic = require(props.gameLogicPath())
const lobbyLogic = require(props.lobbyLogicPath())
const lobbyToServer = require(props.lobbyToServerPath())
const {NORTH, EAST, WEST, SOUTH} = props.gameConsts

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

function onStart(){
    lobbyLogic.startGame()
}

function onStopGame(){
    lobbyLogic.leaveRoom({roomId: false, id: false})
}

module.exports.setControls = function({side, left, right}){
    playersControls[side]['left'] = left
    playersControls[side]['right'] = right
}
