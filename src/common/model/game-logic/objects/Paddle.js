const {NORTH, EAST, WEST, SOUTH} = require('../game-const.js')

module.exports = PongPaddle
/*
* Paddle object
*/
function PongPaddle ({side, fieldSize}){
    //
    this.score = 0

    // top, right, bottom or left side of the field
    this.side

    // width of the paddle
    this.width = fielSize/10

    // maximum value of position
    // should be PongGame.width - this.paddleLength
    this.max = fieldSize - this.width

    // position of the paddle on the field side
    // we start in the middle
    this.position = (fieldSize/2)-(this.width/2)

    // speed of the paddle
    this.speed = filedSize/5
}

PongPaddle.prototype.setPosition = function (position){
    if(position < 0 && position > this.max) return false

    this.position = position
    return true
}

PongPaddle.prototype.move = function(){
    // if speed is at 0, paddle doesn't move
    // negative goes one side, positive goes the other
    var newPosition += this.speed

    // this enforces boundaries
    if(newPosition > this.max) newPosition = this.max
    if(position < 0) newPosition = 0

    // set position
    this.setPosition(newPosition);
}

// this needs a drawing to explain
PongPaddle.prototype.getOffset = function(ballPosition, ballSize){
    var halfWidth = this.width/2
    var offset = ballPosition - this.position + halfWidth
    if(offset < 0) offset += ballSize
    Math.abs(offset) > halfWidth ? return 'no' : return offset
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
