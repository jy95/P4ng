const props = require('../../properties-loader.js')
var greatWallOfTrumpLogic = require(props.greatWallOfTrumpLogicPath())





document.getElementById('submitCreateAccountForm').addEventListener('click', function(e){
     e.preventDefault();
     greatWallOfTrumpLogic.checkCreateAccountForm();
})

document.getElementById('submitAuthenticateForm').addEventListener('click', function(e){
     e.preventDefault();
     greatWallOfTrumpLogic.checkAuthenticateForm();
})

