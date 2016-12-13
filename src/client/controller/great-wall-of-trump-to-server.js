const props = require('../../properties-loader.js');
const socketProps = props.socketProps;
const socket = require(props.socketPath());
const eventsEnum = require(props.eventsEnumPath());


module.exports.registerUser = function(username, email, pwd, callback){

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
            manageResponse(xmlhttp, callback);        
        }
    };

    xmlhttp.open("POST", socketProps.url + ":" + socketProps.port + "/registerUser");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({username: username, pwd: pwd, email: email}));

}

module.exports.authenticate = function (email, pwd, callback){

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
       if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           manageResponse(xmlhttp, callback);
        }
    };

    xmlhttp.open("POST", socketProps.url + ":" + socketProps.port + "/checkUserCredentials");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({pwd: pwd, email: email}));

}

function signIn(jwt){
    socket.emit(eventsEnum.signIn, {jwt: jwt});
}

function manageResponse(xmlhttp, callback){
    if(xmlhttp.status == 200){
        var rep = JSON.parse(xmlhttp.responseText);
        signIn(rep.jwt);
        callback(false, '');
    }
    else{
        callback(true, xmlhttp.responseText);   
    }
}

module.exports.logInAsGuest = function(username, callback){
    socket.emit(eventsEnum.newPlayer, {name: username});
    callback();
}



