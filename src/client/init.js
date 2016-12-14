// this mofo only requires the modules in the correct order
// and makes sure everyone is required
// because we had some nasty bugs

// in an attempt to optimize shit, some lines could be commented out or removed in the future

// ORDER MATTERS

let props = require('../properties-loader.js')

require(props.greatWallOfTrumpViewPath())
require(props.lobbyViewPath())
require(props.gameViewPath())

require(props.socketPath())

require(props.greatWallOfTrumpToServerPath())
require(props.serverToLobbyPath())
require(props.serverToGamePath())

require(props.lobbyToServerPath())
require(props.gameToServerPath())

require(props.gameControllerPath()).init()
require(props.lobbyControllerPath())
require(props.greatWallOfTrumpControllerPath())

require(props.gameLogicPath())
require(props.lobbyLogicPath())
