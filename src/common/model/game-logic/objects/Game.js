const {NORTH, EAST, WEST, SOUTH, FIELD_WIDTH} = require('../game-const.js')
const Ball = require('./Ball.js')
const Paddle = require('./Paddle.js')

module.exports = PongGame
/*
* Game object
*/
function PongGame ({ballDirection}){
    // P4ng field should be a square
    // this is the width of the field in pixels
    this.width = FIELD_WIDTH

    // the last side to hit, so that we know who scored
    // hitting is a good thing
    // hitter did nothing wrong
    this.lastHitter = undefined

    // name is self-explanatory
    // this function is passed a JSON representation of the current state as arg

    // this is an array of paddles, ordered by side
    // north, east, south, west
    this.sides = []

    // this is a map of players where the key is their id
    this.players = {}

    // the object representing the ball
    this.ball = new Ball({direction : ballDirection, game : this});

    // first at maxScore wins
    this.maxScore = 10
    // when a player reaches max
    this.isFinished = false
}

PongGame.prototype.addPlayer = function (player){
    // we give the player a paddle
    var paddle = new Paddle({
        side: player.side,
        fieldSize: this.width,
        isLocal: player.isLocal,
        id: player.id
    })

    // we store him using his ID in the game list of players
    this.players[player.id] = paddle

    // if the player doesn't have a side, we give him a free one
    if(player.side === undefined) player.side = this.sides.length
    // then we store his paddle on array storing the sides of the field
    this.sides[player.side] = paddle

    return player.side
}

PongGame.prototype.update = function (){
    // magically moves only the local players :-O I'm David Blaine yo!
    // (I'm kidding, I used an isLocal boolean in the move method)
    for (let paddle of this.sides)
        paddle.move()
    // moves the ball
    this.ball.move()
    this.updateCallback(this.toJSON())
}

PongGame.prototype.getCollisionOffset = function(stateID, side, position){
    // the paddle that was hit
    var hitPaddle = this.sides[side]

    // returns the offset, and sets a waiting ball if needed
    var offset = this.getCollision(stateID, hitPaddle, position, this.ball.ballSize)
    if(offset !== 'no') this.lastHitter = side
    else{
        // we give the paddle a point if we're sure he deserves it
        if(this.lastHitter !== undefined && stateID === hitPaddle.stateID && !this.isFinished){
            this.sides[this.lastHitter].score++
            this.isFinished = this.sides[this.lastHitter].score === this.maxScore
        }
        this.lastHitter = undefined
    }
    return offset
}


// this needs a drawing to explain
// returns 'no' if no collision with the paddle
// else the offset of the ball on the paddle
PongGame.prototype.getCollision = function(stateID, paddle, ballPosition, ballSize){
    let offset
    if(paddle.stateHistory[stateID] !== undefined){
        offset = ballPosition - (paddle.stateHistory[stateID])
    }else{
        offset = ballPosition - (paddle.position)
        this.ball.waitForState(stateID, paddle)
    }

    let halfPaddle = paddle.width/2
    let halfBall = this.ball.width/2
    if(Math.abs(offset)-halfBall > halfPaddle)return 'no'
    else return (((Math.PI/2) - 0.09)/(paddle.width/2))*offset
}

PongGame.prototype.toJSON = function(){
    var thePlayers = {}

    for(let paddle of this.sides)
        thePlayers[paddle.id] = paddle.toJSON()

    var theBall = this.ball.toJSON()

    return {players : thePlayers, ball : theBall, isFinished: this.isFinished}

}
