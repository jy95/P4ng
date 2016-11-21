const {NORTH, EAST, WEST, SOUTH} = require('../../model/game-logic/game-const.js')
const gameLogic = require('../../model/game-logic/game-logic.js')

gameLogic.subscribe(()=>{
    updateView()
})
// context
var c = null

c = document.getElementById('gameArea').getContext('2d')
c.font = '30px LLPIXEL'

document.getElementById('startButton').addEventListener('click', ()=>{
    start()
})

function updateView(){
    requestAnimationFrame(()=>{
        let state = gameLogic.getState()
        c.clearRect(0,0,520,520)

        c.fillStyle = '#FAEBD7'
        // draw the ball
        drawBall(state.ball)

        // draw the paddles and scores
        for(let paddle of state.players){
            drawPaddle(paddle)
            drawScore(paddle)
        }
    })
}

function drawBall({x,y, width}){
    c.fillRect(x, y, width, width)
}

function drawPaddle({side, position, width}){
    let x, y, xOffset, yOffset
    switch(side){
        case NORTH:
        case SOUTH:
        x = position
        y = NORTH ? 10 : 490
        xOffset = width
        yOffset = 10
        break

        case EAST:
        case WEST:
        x = WEST ? 0 : 490
        y = position
        xOffset = 10
        yOffset = width
        break
    }
    c.fillRect(x, y, xOffset, yOffset)
}

function drawScore({side, score}){
    let x = 250, y = 250
    switch(side){
        case NORTH:
        y = 10
        case SOUTH:
        y = 490
        break;
        case EAST:
        x = 490
        break;
        case WEST:
        x = 10
        break;
    }
    c.fillText(score, x, y)
}

function start(){
    gameLogic.initGame(3*Math.PI/2)

    gameLogic.addPlayer({id: 0, side: 0, isLocal: true})
    gameLogic.addPlayer({id: 1, side: 1})
    gameLogic.addPlayer({id: 2, side: 2, isLocal: true})
    gameLogic.addPlayer({id: 3, side: 3})
    gameLogic.movePlayerRight({id:2})

    gameLogic.startGame()
}
