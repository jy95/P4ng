const {NORTH, EAST, WEST, SOUTH} = require('../game-const.js')

module.exports = PongPaddle
/*
* Paddle object
*/
function PongPaddle ({side, fieldSize, isLocal}){
    //how many position we've been in
    // used for latency correction
    this.stateID = 0
    // the position corrsponding to a state id
    // this.stateHistory[stateID] is the position for stateID
    this.stateHistory = {}

    // the point scored by this paddle
    this.score = 0

    // top, right, bottom or left side of the field
    this.side = side

    // width of the paddle
    this.width = fieldSize/10

    // maximum value of position
    // should be PongGame.width - this.paddleLength
    this.max = fieldSize - this.width

    // position of the paddle on the field side
    // we start in the middle
    this.position = (fieldSize/2)-(this.width/2)

    // speed of the paddle
    this.speed = fieldSize/50

    // direction of the paddle
    this.direction = 0

    // dealing with latency
    this.subscribers = {}

    // boolean being true if the paddle belongs to a player on the local machine
    this.isLocal = isLocal
}

PongPaddle.prototype.setPosition = function (position){
    if(position < 0 && position > this.max) return false

    this.position = position
    this.manageHistory()

    if(this.subscribers[this.stateID])this.subscribers.execute()

    return true
}

PongPaddle.prototype.manageHistory = function(){
    this.stateID++
    this.stateHistory[this.stateID] = this.position
    // keep the state short
    delete this.stateHistory[this.stateID-20]
}

PongPaddle.prototype.move = function(){
    // if speed is at 0, paddle doesn't move
    // negative goes one side, positive goes the other
    var position = this.position + (this.speed*this.direction)

    // this enforces boundaries
    if(position > this.max) position = this.max
    else if(position < 0) position = 0

    // finally we set the position
    if(this.isLocal) this.setPosition(position)
}

PongPaddle.prototype.stop = function(){
    this.direction = 0
}

PongPaddle.prototype.movingLeft = function(){
    this.direction = -1
}

PongPaddle.prototype.movingRight = function(){
    this.direction = 1
}

PongPaddle.prototype.subscribe = function(ball){
    this.subscribers[ball.stateID] = ball
}
