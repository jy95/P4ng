const props = require('../../../properties-loader.js');
const lobbyLogic = require(props.lobbyLogicPath());
const socketProps = props.socketProps
const socket = require(props.socketPath())
const eventsEnum = require(props.eventsEnumPath())

var submitCreateAccountForm = document.getElementById('submitCreateAccountForm');
var alertCreateAccountForm = document.getElementById('alertCreateAccountForm');
var usernameCreateAccountForm = document.getElementById('usernameCreateAccountForm');
var emailCreateAccountForm = document.getElementById('emailCreateAccountForm');
var pwdCreateAccountForm = document.getElementById('pwdCreateAccountForm');
var verifyPwdCreateAccountForm = document.getElementById('verifyPwdCreateAccountForm');

var submitAuthenticate = document.getElementById('submitAuthenticate');
var alertAuthenticateForm = document.getElementById('alertAuthenticateForm');
var pwdAuthenticateForm = document.getElementById('pwdAuthenticateForm');
var emailAuthenticateForm = document.getElementById('emailAuthenticateForm');





submitCreateAccountForm.addEventListener("click", function(event){
    event.preventDefault();
    checkCreateAccountForm();
});


submitAuthenticateForm.addEventListener("click", function(event){
    event.preventDefault();
    checkAuthenticateForm();
});








function checkCreateAccountForm(){
    alertCreateAccountForm.innerText ="";
    if(isEmpty(usernameCreateAccountForm.value)){
        alertCreateAccountForm.innerText ="The field username can't be empty";
        return;
    }
    if(!validateEmail(emailCreateAccountForm.value)){
        alertCreateAccountForm.innerText ="Please enter a valid email";
        return;
    }
    if(isEmpty(pwdCreateAccountForm.value)){
        alertCreateAccountForm.innerText ="The field password can't be empty";
        return;
    }
    if(pwdCreateAccountForm.value !== verifyPwdCreateAccountForm.value){
        alertCreateAccountForm.innerText ="The password fields don't match";
        return;
    }

    registerUser(usernameCreateAccountForm.value, emailCreateAccountForm.value, pwdCreateAccountForm.value);

}



function checkAuthenticateForm(){
    alertAuthenticateForm.innerText ="";
    if(!validateEmail(emailAuthenticateForm.value)){
        alertAuthenticateForm.innerText ="Please enter a valid email";
        return;
    }
    if(isEmpty(pwdAuthenticateForm.value)){
        alertAuthenticateForm.innerText ="The field password can't be empty";
        return;
    }

    authenticate(emailAuthenticateForm.value, pwdAuthenticateForm.value);
}






function registerUser(username, email, pwd){
    alertCreateAccountForm.innerText ="";

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
               var rep = JSON.parse(xmlhttp.responseText);
               signIn(rep.jwt);
           }
           else {
               alertCreateAccountForm.innerText =xmlhttp.responseText;
           }
        }
    };

    xmlhttp.open("POST", socketProps.url + ":" + socketProps.port + "/registerUser");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({username: username, pwd: pwd, email: email}));

}



function authenticate(email, pwd){
    alertAuthenticateForm.innerText ="";

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
                var rep = JSON.parse(xmlhttp.responseText);
                signIn(rep.jwt);
           }
           else {
               alertAuthenticateForm.innerText =xmlhttp.responseText;
           }
        }
    };

    xmlhttp.open("POST", socketProps.url + ":" + socketProps.port + "/checkUserCredentials");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({pwd: pwd, email: email}));

}




function isEmpty(s){
    return (s === null || s.trim() === '');
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function displayLobby(){
     document.getElementById('formsContainer').className = 'closed';
     document.getElementById('lobbyContainer').className = 'open';
}

function signIn(jwt){
    socket.emit(eventsEnum.signIn, jwt);
}

socket.on(eventsEnum.newPlayer, (player)=>{
    console.log(player);
    if(!player.id === -1){
        lobbyLogic.setLocalPlayer(player)
        displayLobby();
    }
})
