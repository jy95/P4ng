const props = require('../../properties-loader.js')

var greatWallOfTrumpEventEmitter = new (require('events'))();
var greatWallOfTrumpToServer = require(props.greatWallOfTrumpToServerPath())

var usernameCreateAccountForm = document.getElementById('usernameCreateAccountForm');
var emailCreateAccountForm = document.getElementById('emailCreateAccountForm');
var pwdCreateAccountForm = document.getElementById('pwdCreateAccountForm');
var verifyPwdCreateAccountForm = document.getElementById('verifyPwdCreateAccountForm');


var pwdAuthenticateForm = document.getElementById('pwdAuthenticateForm');
var emailAuthenticateForm = document.getElementById('emailAuthenticateForm');


let state = {failed:false, msg: ''};



module.exports.checkCreateAccountForm = function(){
    changeState(false, '');
    if(isEmpty(usernameCreateAccountForm.value)){
        changeState(true, 'The field username can\'t be empty');
    }
    else if(!validateEmail(emailCreateAccountForm.value)){
        changeState(true, 'Please enter a valid email');
    }
    else if(isEmpty(pwdCreateAccountForm.value)){
        changeState(true, 'The field password can\'t be empty');
    }
    else if(pwdCreateAccountForm.value !== verifyPwdCreateAccountForm.value){
        changeState(true, 'The password fields don\'t match');
    }
    if(!(state.failed)){
         greatWallOfTrumpToServer.registerUser(usernameCreateAccountForm.value, emailCreateAccountForm.value, pwdCreateAccountForm.value, function(failed, msg){
             changeState(failed, msg);
             greatWallOfTrumpEventEmitter.emit('greatWallOfTrumpUpdate', 'create');
         });
    }
    else{
        greatWallOfTrumpEventEmitter.emit('greatWallOfTrumpUpdate', 'create');
    }
    
    

}



module.exports.checkAuthenticateForm = function(){
    changeState(false, '');
    if(!validateEmail(emailAuthenticateForm.value)){
        changeState(true, 'Please enter a valid email');
    }
    else if(isEmpty(pwdAuthenticateForm.value)){
        changeState(true, 'The field password can\'t be empty');
    }
    if(!(state.failed)){
        greatWallOfTrumpToServer.authenticate(emailAuthenticateForm.value, pwdAuthenticateForm.value, function(failed, msg){
            changeState(failed, msg);
            greatWallOfTrumpEventEmitter.emit('greatWallOfTrumpUpdate', 'authenticate');
        });  
    }
    else{
         greatWallOfTrumpEventEmitter.emit('greatWallOfTrumpUpdate', 'authenticate');
    }
    
   
    
}


function isEmpty(s){
    return (s === null || s.trim() === '');
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}



function changeState(failed, msg){
    state.failed = failed;
    state.msg = msg;
}


module.exports.subscribe = function(callback){
    greatWallOfTrumpEventEmitter.on('greatWallOfTrumpUpdate', function(type){callback(type)})
}


module.exports.getState = function(){
    return state;
}

module.exports.newPlayer = function(player){
    if(player.id != -1){
        changeState(false, '');
        greatWallOfTrumpEventEmitter.emit('greatWallOfTrumpUpdate', '');
    }
}
