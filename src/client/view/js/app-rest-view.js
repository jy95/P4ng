module.exports.setText = function (e, text){
    e.innerText = text;
}

module.exports.displayLobby = function(){
     document.getElementById('formsContainer').className = 'closed';
     document.getElementById('lobbyContainer').className = 'open';
}