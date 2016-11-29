const {NORTH, EAST, WEST, SOUTH} = require('../../model/game-logic/game-const.js')
const gameLogic = require('../../model/game-logic/game-logic.js')

gameLogic.subscribe(()=>{
    updateView()
})
// context
var c = document.getElementById('gameArea').getContext('2d')
c.font = '30px earlygameboy'

document.getElementById('createGame').addEventListener('click', onCreateGame)
document.getElementById('stopButton').addEventListener('click', onStop)
document.getElementById('startButton').addEventListener('click', onStart)

document.addEventListener('keydown', function(e){
    if(e.key === 'ArrowLeft') gameLogic.movePlayerLeft({id: 2})
    if(e.key === 'ArrowRight') gameLogic.movePlayerRight({id: 2})
})
document.addEventListener('keyup', function(e){
    if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') gameLogic.stopPlayer({id: 2})
})

function updateView(){
    requestAnimationFrame(()=>{
        let state = gameLogic.getState()
        c.clearRect(0,0,500,500)

        c.fillStyle = '#FAEBD7'
        // draw the ball
        drawBall(state.ball)

        // draw the paddles and scores
        for(let id in state.players){
            drawPaddle(state.players[id])
            drawScore(state.players[id])
        }
        drawCorners()
    })
}

function drawBall({x,y, width}){
    let halfWidth = width/2
    c.fillRect(x-halfWidth, y-halfWidth, width, width)
}

function drawPaddle({side, position, width}){
    let halfWidth = width/2
    switch(side){
        case NORTH:
        c.fillRect(position-halfWidth, 0, width, 10)
        break

        case SOUTH:
        c.fillRect(position-halfWidth, 490, width, 10)
        break

        case EAST:
        c.fillRect(490, position-halfWidth, 10, width)
        break

        case WEST:
        c.fillRect(0, position-halfWidth, 10, width)
        break
    }
}

function drawScore({side, score}){
    let x = 240, y = 260
    switch(side){
        case NORTH:
        y = 40
        break

        case SOUTH:
        y = 480
        break

        case EAST:
        x = 460
        break

        case WEST:
        x = 20
        break
    }
    c.fillText(score, x, y)
}

function drawCorners(){
    c.fillRect(0,0,10,10)
    c.fillRect(490,0,10,10)
    c.fillRect(490,490,10,10)
    c.fillRect(0,490,10,10)
}

function onStart(){
    //gameLogic.initGame((Math.PI*2)-(0.02*5)) //
    gameLogic.initGame(Math.PI-1.522)

    gameLogic.addPlayer({id: 0, side: 0, isLocal: true})
    gameLogic.addPlayer({id: 1, side: 1})
    gameLogic.addPlayer({id: 2, side: 2, isLocal: true})
    gameLogic.addPlayer({id: 3, side: 3})
    //gameLogic.movePlayerRight({id:2})

    gameLogic.startGame()
}

function onCreateGame(){
    document.getElementById('lobbyContainer').className = 'closed'
    document.getElementById('gameContainer').className = 'open'
}
function onStop(){
    gameLogic.killGame()
    document.getElementById('lobbyContainer').className = 'open'
    let gc = document.getElementById('gameContainer')
    gc.addEventListener('transitionend', function(){c.clearRect(0,0,500,500)})
    gc.className = 'closed'
    document.getElementById('startButton').addEventListener('click', onStart)
}
