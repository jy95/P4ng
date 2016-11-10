const NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3;

/*
 * Game object
 */
function PongGame (width, squareUnit, ball){
  // P4ng field should be a square
  // this is the width of the field in pixels
  this.width

  // this is an array of paddles, ordered by side
  // north, east, south, west
  this.sides = []

  // this is a map of players where the key is their id
  this.players = {}

  // the object representing the ball
  this.ball = ball ? ball : new Ball();
}

PongGame.prototype.addPlayer = function (player){
  // returns false if a player already has that name
  if(this.players[player.id]) return false

  this.players[player.id] = player
  this.sides[player.side] = player
  return true
}

// finds out if the ball is hitting the paddle
// returns the hit paddle or null
PongGame.prototype.detectCollision = function (){
  for(let paddle of this.sides){
    if(){

    }
  }
}

PongGame.prototype.update = function () {
  if(ball.x == 0){
    ball.angle
  }
  ball.move()
}

PongGame.prototype.startGame = function (){
  setInterval(()=>{
    this.update()
    // TO DO: fire event
  }, 17)
}

/*
 * Paddle object
 */
function PongPaddle (){
  // identifiers
  this.id

  // top, right, bottom or left side of the field
  this.side

  // width of the paddle
  this.width

  // maximum value of position
  // should be PongGame.width - this.paddleLength
  this.max

  // position of the paddle on the field side in pixels
  this.position

  // speed of the paddle in pixels (how many pixels it moves when told to)
  this.speed
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

  // this forces boundaries
  if(newPosition > this.max) newPosition = this.max
  if(position < 0) newPosition = 0

  // set position
  this.setPosition(newPosition);
}

// this changes the default behavior of ball bouncing
// regarding where the ball land on the paddle
PongPaddle.prototype.bounceBall = function(position, angle){
  switch(this.side){
    case NORTH:
      break;
    case EAST:
    break;
    case SOUTH:
    break;
    case WEST:
    break;
    default:
    console.log('your mom')
  }
}

/*
 * Ball object
 */
function PongBall(x, y, coordinatesBoundary, incrementSpeedFunction){
  // ball coordinates
  this.x = x
  this.y = y

  // max for coordinates
  // should equal the game field width
  this.coordinatesBoundary = coordinatesBoundary

  // speed of the ball in pixels
  this.speed = 10 // original value to be adjusted
  this.maxSpeed = 70 // original value to be adjusted
  this.incrementSpeedFunction = incrementSpeedFunction ? incrementSpeedFunction : linearIncrementSpeed

  // direction of the ball
  // represented by an angle in radians
  // defaults to a random angle
  this.direction = Math.random() * Math.PI * 2
}

PongBall.prototype.move = function(){
  // move the ball from (x,y) to (x',y')
  // to compute x' and y' it uses:
  // this.angle as direction,
  // this.speed as distance
  // if you don't know math, its magic, don't bother
  this.x += this.speed * (Math.cos(this.angle))
  this.y += this.speed * (Math.sin(this.angle))

  // enforcing boundaries
  if(this.x < 0) this.x = 0;
  if(this.y < 0) this.y = 0;

  if(this.x > this.coordinatesBoundary) this.x = coordinatesBoundary;
  if(this.y > this.coordinatesBoundary) this.y = coordinatesBoundary;
}

// strategy function
PongBall.prototype.incrementSpeed = function(){
  this.speed = incrementSpeedFunction(this.speed);
}

// set strategy
PongBall.prototype.setIncrementSpeedFunction = function(incrementSpeedFunction){
  this.incrementSpeedFunction = incrementSpeedFunction
}

function linearIncrementSpeed = function(speed){
  this.speed++
}
function exponentialIncrementSpeed = function(speed){
  this.speed+=this.speed/4
}

function getXAxisSymmetry(angle){
  return (angle-(angle*2))+(Math.PI*2)
}
function getYAxisSymmetry(angle){
  return getXAxisSymmetry(angle) + Math.PI
}

Ball.prototype.bounceFromTop = function(angle){
  if(this.direction > Math.PI/2) return getXAxisSymmetry(angle)
  this.direction = getYAxisSymmetry(this.direction)
}

Ball.prototype.bounceFromLeft = function(angle){
  this.direction = getYAxisSymmetry(this.direction)
}

Ball.prototype.bounceFromBottom = function(angle){
  this.direction = getXAxisSymmetry(this.direction)
}

Ball.prototype.bounceFromRight = function(angle){
  this.direction = getYAxisSymmetry(this.direction)
}
