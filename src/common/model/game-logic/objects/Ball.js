const {NORTH, EAST, WEST, SOUTH, FIELD_WIDTH} = require('../game-const.js') // ES6 deconstruction
const WaitingBall = require('./WaitingBall.js')


module.exports = PongBall
/*
* Ball object
*/
function PongBall({direction, game}){
    // stateID, used for synchronizing
    // starts at 1 because paddles start at zero
    // and since we execute paddle.update() before ball.update()
    // state never match otherwise
    this.stateID = 1
    // this ball needs to know the game it's part of
    this.game = game

    // ball coordinates, begins at the center
    this.x = FIELD_WIDTH/2
    this.y = this.x // this is a nonsense, semantically speaking

    // the ball has a width
    this.width = 10

    // max for coordinates
    // should equal the game field width minus ball width
    this.coordinatesBoundary = FIELD_WIDTH

    // speed of the ball in pixels
    this.speed = 10
    this.maxSpeed = 30
    // strategy for how we increment speed (defaults to linear-medium)
    this.incrementSpeedFunction = linearSlowIncrementSpeed

    // direction of the ball
    // represented by an angle in radians
    // defaults to a random angle
    if(direction === undefined || direction === null) direction = Math.random() * Math.PI * 2
    this.beginningDirection = direction
    this.direction = direction

    // the waiting baaaaall, used to wait for paddle stateID
    // see https://github.com/jy95/P4ng/wiki/Synchronizing-strategy
    this.waitingBall = new WaitingBall()
}

PongBall.prototype.move = function(){
    //this.waitingBall.addCommand(this.waitingBall.move)
    // move the ball from (x,y) to (x',y')
    // to compute x' and y' it uses:
    // this.angle as direction,
    // this.speed as distance
    // if you don't know math, it's magic, don't bother
    this.x += this.speed * (Math.cos(this.direction))
    this.y += this.speed * (Math.sin(this.direction))

    if(this.x < 0){
        this.x = 0 // enforcing boundaries
        this.bounceFromWest()
    }else if(this.y < 0){
        this.y = 0 // enforcing boundaries
        this.bounceFromNorth()
    }else if(this.x > this.coordinatesBoundary){
        this.x = this.coordinatesBoundary // enforcing boundaries
        this.bounceFromEast()
    }else if(this.y > this.coordinatesBoundary){
        this.y = this.coordinatesBoundary // enforcing boundaries
        this.bounceFromSouth()
    }
    this.stateID++
}

// strategy function
PongBall.prototype.incrementSpeed = function(){
    this.speed = this.incrementSpeedFunction(this.speed);
}

// "proxies" to read bounce easily
PongBall.prototype.bounceFromEast = function(){
    // this is the angle to bounce to the opponent facing the hit paddle
    const EAST_CENTER = Math.PI // 180°
    this.bounce(EAST, EAST_CENTER, this.y)
}

PongBall.prototype.bounceFromNorth = function(){
    const NORTH_CENTER = Math.PI/2 // 90°
    this.bounce(NORTH, NORTH_CENTER, this.x)
}

PongBall.prototype.bounceFromWest = function(){
    const WEST_CENTER = 0 // 0°
    this.bounce(WEST, WEST_CENTER, this.y)
}

PongBall.prototype.bounceFromSouth = function(){
    const SOUTH_CENTER = 3*Math.PI/2 // 270°
    this.bounce(SOUTH, SOUTH_CENTER, this.x)
}

PongBall.prototype.bounce = function(side, straightAngle, position){
    // if the offset is a positive or negative int
    // we bounce of the paddle
    // else it's equal to 'no', meaning there was no collision (meaning a score)
    var angleOffset = this.game.getCollisionOffset(this.stateID, side, position)
    if(angleOffset !== 'no'){
        if(side === NORTH || side === EAST)angleOffset *= -1
        let naturalBounceAngle = naturalBounceFrom(side, this.direction)
        console.log(`naturalBounceAngle + angleOffset = ${naturalBounceAngle + angleOffset}`)
        let newDirection = naturalBounceAngle + angleOffset
        let fromLeft = comesFromLeft(this.direction, straightAngle)
        let max = straightAngle + ((Math.PI/2) - 0.04) // 0.09 is arbitrary
        let min = straightAngle - (Math.PI/2) + 0.04
        alert(`newDirection: ${newDirection}\nmin: ${min}\nmax: ${max}\n`)
        // shit fix for west case
        newDirection = side === WEST ? dealWithWest(newDirection) : keepBoundaries(min, max, newDirection)
        this.direction = newDirection
        this.incrementSpeed()
    }
    else this.resetAfterScore()
}

// when a player scores
PongBall.prototype.resetAfterScore = function(){
    // we rotate the beginning direction of ninety degrees
    this.beginningDirection = (this.beginningDirection + Math.PI/2)%(2*Math.PI)
    // we make it the new direction
    this.direction = this.beginningDirection
    // and start from center again
    this.x = this.coordinatesBoundary/2
    this.y = this.x
    // with the beginning speed
    this.speed = 10
}

PongBall.prototype.waitForState = function(stateID, paddle){
    this.waitingBall.waitForState(stateID, paddle)
}

PongBall.prototype.toJSON = function(){
    return {x: this.x, y: this.y, width: this.width}
}


// incrementSpeed strategy implementation

var linearSlowIncrementSpeed = function(speed){
    return speed+=0.5
}
var linearMediumIncrementSpeed = function(speed){
    return speed++
}
var linearFastIncrementSpeed = function(speed){
    return speed += 2
}
var exponentialIncrementSpeed = function(speed){ // never use, fastest doggo
    return speed += speed/4
}

// practical functions for the ball

function getXAxisSymmetry(angle){
  return (-angle + Math.PI*2)%(Math.PI*2)
}
function getYAxisSymmetry(angle){
  return (getXAxisSymmetry(angle) + Math.PI)%(Math.PI*2)
}

function naturalBounceFrom(side, angle){
    switch(side){
        case NORTH:
        if(angle > Math.PI/2) return getXAxisSymmetry(angle)
        return getYAxisSymmetry(angle)
        break
        case EAST:
        return getYAxisSymmetry(angle)
        case SOUTH:
        return getXAxisSymmetry(angle)
        break
        case WEST:
        return getYAxisSymmetry(angle)
    }
    return undefined
}

function comesFromLeft(inAngle, refAngle){
    return (inAngle + Math.PI)%(Math.PI*2) > refAngle
}

function keepBoundaries(min, max, val){
    if(val>max)return max
    if(val<min)return min
    return val
}

// shit fix
function dealWithWest(val){
    let min = 3*Math.PI/2 + 0.02
    let max = 5*Math.PI/2 - 0.02
    return keepBoundaries(min, max, val)%(Math.PI*2)
}
