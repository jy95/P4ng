const {NORTH, EAST, WEST, SOUTH} = require('../game-const.js')
const Ball = require('./Ball.js')
const Paddle = require('./Paddle.js')
/*
* Game object
*/
function PongGame (ballDirection){
    // P4ng field should be a square
    // this is the width of the field in pixels
    this.width = 500

    // the last side to hit, so that we know who scored
    this.lastHitter

    // this is an array of paddles, ordered by side
    // north, east, south, west
    this.sides = []

    // this is a map of players where the key is their id
    this.players = {}

    // the object representing the ball
    if(!ballDirection) ballDirection = Math.random() * Math.PI * 2
    this.ball = new Ball({coordinatesBoundary : this.width, direction : ballDirection});

    // this the id of the interval used to move things around
    // it's set in the start method
    this.intervalId
}

PongGame.prototype.addPlayer = function (player){
    player.paddle = new Paddle({side : player.side, fieldSize : this.width})

    this.players[player.id] = player

    if(!player.side) player.side = this.sides.length
    this.sides[player.side] = player.paddle
}

PongGame.prototype.startGame = function (){
    this.intervalId = setInterval(()=>{
        this.ball.move()
        // TO DO: fire event
    }, 17)
}

PongGame.prototype.getCollisionOffset = function(side, position){
    var offset = this.sides[side].getOffset(position, this.ball.ballSize)
    if(offset !== 'no') this.lastHitter = side
    else{
        this.sides[lastHitter].score++
        this.lastHitter = null
    }
    return offset
}

PongGame.prototype.toJSON = function(){
    var thePlayers = []
    for(let currentId of this.players){
        var paddle = this.players[id].paddle
        players.push({id : currentIt, position : paddle.position, side : paddle.side, score: paddle.score})
    }

    var theBall = this.ball.toJSON()

    return {players : thePlayer, ball : theBall}

}
