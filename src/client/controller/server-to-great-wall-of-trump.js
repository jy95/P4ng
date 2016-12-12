const props = require('../../properties-loader.js')
const socket = require(props.socketPath());
const eventsEnum = require(props.eventsEnumPath());
var greatWallOfTrumpLogic = require(props.greatWallOfTrumpLogicPath())


socket.on(eventsEnum.newPlayer, (player)=>{
    greatWallOfTrumpLogic.newPlayer(player);
})