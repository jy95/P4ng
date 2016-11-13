const Ball = require('./Ball.js')

// the waiting ball is always correct
// it would rather wait a thousand year than have an incoherent state
// by that I mean that if ball has stateID 47
// its state was computed with a paddle StateID 47

module.exports = WaitingBall

function WaitingBall(ball){
    // we copy the value of master into local value
    // (WaitingBall is a Ball too, see prototype)
    for(var prop in ball)
        if(prop === 'waitingBall') this.[prop] = ball[prop]

    // we don't want the waiting ball's waiting ball set automatically
    this.waitingBall = null

    // the ball that need correction of its position
    this.master = ball

    // the commands to execute once we get the state
    this.commands = []

    // if the state we were waiting for already came by
    this.wayTooOld = true

    // if we're also waiting on a waiting ball to execute
    // we're a dirty WaitingBall
    this.dirty = false
}

WaitingBall.prototype = Ball

// this method is called by a paddle we subscribed to
// when it reaches the state we told it we were waiting for
WaitingBall.prototype.execute = function(){
    for(let com of this.commands)
        com.bind(this.sittingBall)() // we execute the commands on the local ball
    // once we've done all the commands and reached a correct state
    this.correctingState
    this.wayTooOld = true
}

WaitingBall.prototype.addCommand = function(command){
    // if we're waiting for a Waiting Ball, it has to deal with the command
    // if we're not waiting for a WB but are waiting for a paddleStateID
    // we store the command
    // last case scenario: we're not waiting for anyone
    // we execute it immediately to stay up to date
    if(this.dirty) this.waitingBall.addCommand(command)
    else if(!this.wayTooOld) this.commands.push(command)
    else command.bind(this)()
}

// this allows correction of state even for nested Waiting Balls
WaitingBall.prototype.correctingState = function(x, y, direction){
    // we correct our master's state
    this.master.x = x
    this.master.y = y
    this.master.direction = direction

    // if the master is also a WaitingBall, we call his correction method
    // the method kinda bubbles up the WaitingBall chain
    if(this.master.correctingState)
        this.master.correctingState(x, y, direction)
}

WaitingBall.prototype.waitForState = function(stateID, paddle){
    if(this.wayTooOld && !this.dirty){
        this.wayTooOld = false
        paddle.subscribe(this)
    }else{
        this.waitingBall = new WaitingBall(this)
        this.waitingBall.waitForState(stateID, paddle)
        this.dirty = true
    }
}
