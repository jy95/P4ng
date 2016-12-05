
const props = require('../../../properties-loader.js')
const gameLogic = require(props.gameLogicPath())
const {NORTH, EAST, WEST, SOUTH} = props.gameConsts

// context
var c = document.getElementById('gameArea').getContext('2d')
c.font = '30px earlygameboy'

gameLogic.subscribe(()=>{
    updateView(gameLogic.getState())
    console.log('gameView - update')
    console.log(gameLogic.getState())
})

function updateView (state){
    requestAnimationFrame(()=>{
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
