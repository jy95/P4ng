const props = require('../../../properties-loader.js')
var greatWallOfTrumpLogic = require(props.greatWallOfTrumpLogicPath())

var alertCreateAccountForm = document.getElementById('alertCreateAccountForm');
var alertAuthenticateForm = document.getElementById('alertAuthenticateForm');
var alertLogInAsGuestForm = document.getElementById('alertLoginAsGuestForm');



greatWallOfTrumpLogic.subscribe(function(type){
    var state = greatWallOfTrumpLogic.getState();
    if(state.failed){
        switch(type){
            case 'create':
                setText(alertCreateAccountForm, state.msg);
                break;
            case 'authenticate':
                setText(alertAuthenticateForm, state.msg);
                break;
            case 'logInAsGuest':
                setText(alertLogInAsGuestForm, state.msg);
                break;
        }
    }
    else
        displayLobby();
})


function setText(e, text){
    e.innerText = text;
}

function displayLobby(){
     document.getElementById('formsContainer').className = 'closed';
     document.getElementById('lobbyContainer').className = 'open';
}
