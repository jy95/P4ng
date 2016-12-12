const props = require('../../properties-loader.js');
const socketProps = props.socketProps;
const socket = require(props.socketPath());
const eventsEnum = require(props.eventsEnumPath());
var vue = require(props.appRestViewPath());

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
    vue.setText(alertCreateAccountForm, "");
    if(isEmpty(usernameCreateAccountForm.value)){
        vue.setText(alertCreateAccountForm, "The field username can't be empty");
        return;
    }
    if(!validateEmail(emailCreateAccountForm.value)){
        vue.setText(alertCreateAccountForm, "Please enter a valid email");
        return;
    }
    if(isEmpty(pwdCreateAccountForm.value)){
        vue.setText(alertCreateAccountForm, "The field password can't be empty");
        return;
    }
    if(pwdCreateAccountForm.value !== verifyPwdCreateAccountForm.value){
        vue.setText(alertCreateAccountForm, "The password fields don't match");
        return;
    }

    registerUser(usernameCreateAccountForm.value, emailCreateAccountForm.value, pwdCreateAccountForm.value);

}



function checkAuthenticateForm(){
    vue.setText(alertAuthenticateForm, "");
    if(!validateEmail(emailAuthenticateForm.value)){
        vue.setText(alertAuthenticateForm, "Please enter a valid email");
        return;
    }
    if(isEmpty(pwdAuthenticateForm.value)){
        vue.setText(alertAuthenticateForm, "The field password can't be empty");
        return;
    }

    authenticate(emailAuthenticateForm.value, pwdAuthenticateForm.value);
}






function registerUser(username, email, pwd){
    vue.setText(alertCreateAccountForm, "");

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
               var rep = JSON.parse(xmlhttp.responseText);
               signIn(rep.jwt);
           }
           else {
               vue.setText(alertCreateAccountForm, xmlhttp.responseText);
           }
        }
    };

    xmlhttp.open("POST", socketProps.url + ":" + socketProps.port + "/registerUser");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({username: username, pwd: pwd, email: email}));

}



function authenticate(email, pwd){
    vue.setText(alertAuthenticateForm, "");

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
                var rep = JSON.parse(xmlhttp.responseText);
                signIn(rep.jwt);
           }
           else {
               vue.setText(alertAuthenticateForm, xmlhttp.responseText);
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


function signIn(jwt){
    socket.emit(eventsEnum.signIn, {jwt: jwt});
}

socket.on(eventsEnum.newPlayer, (player)=>{
    if(player.id != -1){
        vue.displayLobby();
    }
})
