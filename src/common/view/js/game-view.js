const {NORTH, EAST, WEST, SOUTH} = require('../../model/game-logic/game-const.js')
const gameLogic = require('../../model/game-logic/game-logic.js')

gameLogic.subscribe(()=>{
    updateView()
})
// context
var c = null

c = document.getElementById('gameArea').getContext('2d')

document.getElementById('startButton').addEventListener('click', ()=>{
    start()
})

// leave place for the paddle's thickness
c.translate(10,10)

function updateView(){
    requestAnimationFrame(()=>{
        let state = gameLogic.getState()

        c.clearRect(-10,-10,520,520)
        drawBall(state.ball)

        for(let paddle of state.players){
            drawPaddle(paddle)
            document.getElementById(`p${paddle.side}`).innerText = paddle.score;
        }
    })
}

function drawBall({x,y, width}){
    console.log(`x: ${x}, y: ${y}, width: ${width}`)
    c.fillRect(x, y, width, width)
}

function drawPaddle({side, position, width}){
    switch(side){

        case NORTH:
        c.fillRect(position, -10, width, 10)
        break

        case SOUTH:
        c.fillRect(position, 500, width, 510)
        break

        case EAST:
        c.fillRect(500, position, 10, width)
        break

        case WEST:
        c.fillRect(-10, position, 10, width)
        break
    }
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
