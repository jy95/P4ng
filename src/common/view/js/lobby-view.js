const EventEmitter = require('events')
var lobbyViewEventEmitter = new EventEmitter()
var domPerignon = new DOMParser()

module.exports.onCreateGame = function(){
}

module.exports.updateView = function({players, rooms, localPlayer, currentRoom}){
    if(currentRoom !== null) switchToGameView()
    else switchToLobbyView()

    for(let p in players){

    }
}

function displayPlayers(players){
    let rpl = document.getElementById('remotePlayersList')
    rpl.innerHtml = ''
    for(let p in players){
        let pString = getPlayerHtmlString(p)
        let parsed = domPerignon.parseFromString(pString, 'text/html')
        rpl.appendChild(parsed)
    }
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
