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
document.getElementById('stopButton').addEventListener('click', ()=>{
    stop()
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
    let halfWidth = width/2
    c.fillRect(x-halfWidth, y-halfWidth, width, width)
}

function drawPaddle({side, position, width}){
    let halfWidth = width/2
    switch(side){

        case NORTH:
        c.fillRect(position-halfWidth, -10, width, 10)
        break

        case SOUTH:
        c.fillRect(position-halfWidth, 500, width, 510)
        break

        case EAST:
        c.fillRect(500, position-halfWidth, 10, width)
        break

        case WEST:
        c.fillRect(-10, position-halfWidth, 10, width)
        break
    }
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
