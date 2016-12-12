const props = require('../../../properties-loader.js')
var lobbyLogic = require(props.lobbyLogicPath())
var domPerignon = new DOMParser()

lobbyLogic.subscribe(function(){
    let lobbyState = lobbyLogic.getState()
    displayRooms(lobbyState.rooms)
    displayPlayers(lobbyState.players)
    displayLocalPlayer(lobbyState.localPlayer)
    if(lobbyState.currentRoom)switchToGameView()
    else switchToLobbyView()
})

module.exports.updateView = function({players, rooms, localPlayer, currentRoom}){
    if(currentRoom !== null) switchToGameView()
    else switchToLobbyView()
    if(localPlayer) displayLocalPlayer(localPlayer)
    for(let p in players){

    }
}

function displayRooms(rooms){
    if(rooms){
        let gamesTable = document.getElementById('gameList')
        while(gamesTable.firstChild){
            gamesTable.removeChild(gamesTable.firstChild)
        }
        for(let i in rooms){
            let rString = getGameString(rooms[i])
            let parsed = domPerignon.parseFromString(rString, 'text/html').firstChild
            gamesTable.appendChild(parsed)
        }
    }
}

function getGameString(room){
    return `<table>
    <tr id="game${room.roomId}">
    <td>${room.roomName}</td>
    <td class="playersInside"></td>
    <td ><button id="${room.roomId}">&nbsp;~</button></td>
    </tr></table>`
}


function displayPlayers(players){
    let rpl = document.getElementById('remotePlayersList')
    rpl.innerHtml = ''
    for(let p in players){
        let pString = getPlayerHtmlString(players[p])
        let parsed = domPerignon.parseFromString(pString, 'text/html')
        rpl.appendChild(parsed)
    }
}

function displayLocalPlayer(player){
    document.getElementById('localPlayerName').innerText = player.name
}

function getPlayerHtmlString(p){
    return `
    <li id="${p.id}" class="remotePlayer">
    <ul class="playerInfo">
    <li>${p.name}</li>
    <li><p>Score: ${p.totalScore}></p></li>
    <li><p>Rank: ${p.rank}</p></li>
    </ul>
    </li>`
}

function switchToGameView(){
    document.getElementById('lobbyContainer').className = 'closed'
    document.getElementById('gameContainer').className = 'open'
}

function switchToLobbyView(){
    document.getElementById('lobbyContainer').className = 'open'
    document.getElementById('gameContainer').className = 'closed'
}
