const {NORTH, EAST, WEST, SOUTH} = require('../game-const.js')
const Ball = require('./Ball.js')
const Paddle = require('./Paddle.js')

module.exports = PongGame
// TODO: deal with synchronicity
/*
* Game object
*/
function PongGame (ballDirection, updateCallback){
    // P4ng field should be a square
    // this is the width of the field in pixels
    this.width = 500

    // the last side to hit, so that we know who scored
    this.lastHitter = null

    // name is self-explanatory
    // this function is passed a JSON representation of the current state as arg
    this.updateCallback = updateCallback

    // this is an array of paddles, ordered by side
    // north, east, south, west
    this.sides = []

    // this is a map of players where the key is their id
    this.players = {}

    // the object representing the ball
    if(!ballDirection) ballDirection = Math.random() * Math.PI * 2
    this.ball = new Ball({coordinatesBoundary : this.width, direction : ballDirection, game : this});

    // here's all the shit needed to deal with latency

    // history of every position each paddle has had
    // each array is to be seen as a stack of every position a paddle reached
    // to avoid memory overload, the 'stack' is actually an object
    // its properties are the stateId of the paddle
    // there's at alltime a maximum of 10 entries
    this.paddlePositionHistory = {}
    this.paddlePositionHistory[NORTH] = {}
    this.paddlePositionHistory[EAST] = {}
    this.paddleStateHistory[WEST] = {}
    this.paddlePositionHistory[SOUTH] = {}

    // stack of triplets of paddlePositionHistory id, side and ball position
    // {side : 1, id : 27, ballPosition: 42}
    this.collisionHistory = []
}

PongGame.prototype.addPlayer = function (player){
    player.paddle = new Paddle({side : player.side, fieldSize : this.width})

    this.players[player.id] = player

    if(!player.side) player.side = this.sides.length
    this.sides[player.side] = player.paddle
}

PongGame.prototype.update = function (){
    // moves the ball
    this.ball.move()

    // magically moves only the local players :-O I'm David Blaine yo!
    for (let paddle of this.sides)
        paddle.move()
    this.updateCallback(this.toJson())
}

PongGame.prototype.getCollisionOffset = function(stateID, side, position){
    // the paddle that was hit
    var hitPaddle = this.sides[side]

    // returns the offset, and sets a waiting ball if needed
    var offset = getOffset(stateID, hitPaddle, position, this.ball.ballSize)
    if(offset !== 'no') this.lastHitter = side
    else{
        // we give the paddle a point if we're sure he deserves it
        if(this.lastHitter && stateID === this.lastHitter.stateID)
            this.sides[this.lastHitter].score++
        this.lastHitter = null
    }
    return offset
}


// this needs a drawing to explain
PongGame.prototype.getOffset = function(stateID, paddle, ballPosition, ballSize){
    var offset
    var halfWidth = paddle.width/2
    if(paddle.stateHistory[stateID]){
        offset = ballPosition - paddle.stateHistory[stateID] + halfWidth
    }else{
        offset = ballPosition - paddle.position + halfWidth
        this.ball.waitForState(stateID, paddle);
    }
    if(offset < 0) offset += ballSize
    if(Math.abs(offset) > halfWidth)return 'no'
    else return offset
}

PongGame.prototype.toJSON = function(){
    var thePlayers = []
    for(let currentId in this.players){
        var paddle = this.players[currentId].paddle
        thePlayers.push({id : currentId, position : paddle.position, side : paddle.side, score: paddle.score})
    }

    var theBall = this.ball.toJSON()

    return {players : thePlayers, ball : theBall}

}
