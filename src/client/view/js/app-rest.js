const props = require('../../../properties-loader.js').socketProps;

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
               alertCreateAccountForm.innerText =xmlhttp.responseText;
               //should change the class of alertCreateAccountForm to display it in a positive color
           }
           else {
               alertCreateAccountForm.innerText =xmlhttp.responseText;
           }
        }
    };

    xmlhttp.open("POST", props.url + ":" + props.port + "/registerUser");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({username: username, pwd: pwd, email: email}));

}



function authenticate(email, pwd){
    alertAuthenticateForm.innerText ="";

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
                document.getElementById('formsContainer').className = 'closed';
                document.getElementById('lobbyContainer').className = 'open';
                console.log(JSON.parse(xmlhttp.responseText));
           }
           else {
               alertAuthenticateForm.innerText =xmlhttp.responseText;
           }
        }
    };

    xmlhttp.open("POST", props.url + ":" + props.port + "/checkUserCredentials");
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