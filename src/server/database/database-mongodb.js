let bcrypt = require('bcryptjs');
let mongoose = require('mongoose');

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let PlayerSchema = new Schema({
    id    : ObjectId,
    username     : String,
    pwd      : String,
    email : String,
    partiesGagnees : Number,
    partiesFinies : Number
});


let db;
let User;

module.exports = {


    connectToDatabase : function (callback) {

        try {
        mongoose.Promise = global.Promise;
        // connect to the db
        db = mongoose.createConnection('mongodb://localhost/P4ngDb');
      

        db.on('error', function () {
            callback(new Error("Failed to connect to the DB"));
        });
        db.on('open', function() {
            // register the model
            User = db.model('Player', PlayerSchema);
            callback(null);
        });

        } catch (err) {
            console.log(err);
            callback(err);
        }

    },
    
    registerUser : function (data,callback) {
        if(!validateEmail(data.email)){
            callback(new Error('Incorrect email'));
        }
        else{
            this.findUser(data, (err, user) => {
                if(err){
                    callback(err.message);
                }
                else{
                    if(user === null){
                        var salt = bcrypt.genSaltSync(10);
                        var hash = bcrypt.hashSync(data.pwd, salt);
                        data.pwd = hash;
                        this.createUser(data, (err) =>{
                            if(err){
                                callback(err.message);
                            }
                            else{
                                callback(null);
                            }
                        });
                    }
                    else{
                        callback(new Error('This email is already used'));
                    }
                }
            });
        } 
    },

    checkUserCredentials : function (data,callback){
        this.findUser(data, (err, user)=>{
            if(err){
                callback(err.message);
            }
            else{
                if(user === null){
                    callback(new Error('This email does not exist'));
                }
                else{
                    if(!bcrypt.compareSync(data.pwd, user.pwd)){
                        callback(new Error('The password is not correct'));
                    }
                    else{
                        callback(null, user);
                    }
                }
            }
        });
    },

    createUser : function (data,callback){
        User.create(data, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
        });
    },

    findUser : function (data,callback) {

        // find User
        User.findOne({email : data.email} , function (err,user) {
            if (err) {
                callback(err);
            } else {
                callback(null,user);
            }

        });

    },
    
    updateScoreAndAddVictory : function (data,callback) {

        User.findByIdAndUpdate(
            data.id,
            {
                //$push: {"scores": data.score },
                $inc : { participation : 1 }
            },
            function(err, model) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            }
        );

    },

    updateScore : function (data,callback) {

        User.findByIdAndUpdate(
            data.id,
            {
                //$push: {"scores": data.score },
                $inc : { participation : 1 , partiesGagnees: 1 }
            },
            function(err, model) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            }
        );

    },

    closeConnection : function(){
        db.close();
    }




};



let validateEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}