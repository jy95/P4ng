const props = require('../../../../properties-loader.js')
const {NORTH, EAST, WEST, SOUTH, FIELD_WIDTH} = props.gameConsts

module.exports = PongPaddle
/*
* Paddle object
*/
function PongPaddle ({side, isLocal, id}){
    // player's id
    this.id = id
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
    this.width = FIELD_WIDTH/10

    // boundaries

    // position of the paddle on the field side
    // we start in the middle
    this.position = (FIELD_WIDTH/2)

    // speed of the paddle
    this.speed = FIELD_WIDTH/50

    // direction of the paddle
    this.direction = 0

    // dealing with latency
    this.subscribers = {}

    // boolean being true if the paddle belongs to a player on the local machine
    this.isLocal = isLocal

    this.isAWall = false
}

PongPaddle.prototype.wallMe = function(){
    this.position = (FIELD_WIDTH/2)
    this.width = FIELD_WIDTH
}

PongPaddle.prototype.max = function(){return FIELD_WIDTH - this.width/2}
PongPaddle.prototype.min = function(){return this.width/2}

PongPaddle.prototype.setPosition = function (position){
    if(position < this.min() && position > this.max()) return false

    this.position = position
    this.manageHistory()

    if(this.subscribers[this.stateID])this.subscribers[this.stateID].execute()

    return true
}

PongPaddle.prototype.manageHistory = function(){
    this.stateID++
    this.stateHistory[this.stateID] = this.position
    // keep the state history short
    delete this.stateHistory[this.stateID-20]
}

PongPaddle.prototype.move = function(){
    // if speed is at 0, paddle doesn't move
    // negative goes one side, positive goes the other
    let position = this.position + (this.speed*this.direction)

    // this enforces boundaries
    if(position > this.max()) position = this.max()
    else if(position < this.min()) position = this.min()

    // finally we set the position only if he's local or a wall
    // because remote peeps get updated by the socket events
    if(this.isLocal || this.isAWall) this.setPosition(position)
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

PongPaddle.prototype.toJSON = function(){
    return {
        width: this.width,
        position: this.position,
        side: this.side,
        score: this.score,
        isLocal: this.isLocal,
        isAWall: this.isAWall,
        name: this.name
    }
}
