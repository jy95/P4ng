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
document.getElementById('stopButton').addEventListener('click', ()=>{
    stop()
})

function updateView(){
    requestAnimationFrame(()=>{
        let state = gameLogic.getState()
        c.clearRect(0,0,500,500)

        c.fillStyle = '#FAEBD7'
        // draw the ball
        drawBall(state.ball)

        // draw the paddles and scores
        for(let paddle of state.players){
            drawPaddle(paddle)
            drawScore(paddle)
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

function start(){
    //gameLogic.initGame((Math.PI*2)-(0.02*5)) //
    gameLogic.initGame(Math.PI-1.522)

    gameLogic.addPlayer({id: 0, side: 0, isLocal: true})
    gameLogic.addPlayer({id: 1, side: 1})
    gameLogic.addPlayer({id: 2, side: 2, isLocal: true})
    gameLogic.addPlayer({id: 3, side: 3})
    //gameLogic.movePlayerRight({id:2})

    gameLogic.startGame()
}

function stop(){
    gameLogic.killGame()
}
