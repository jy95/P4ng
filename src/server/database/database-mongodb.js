let bcrypt = require('bcryptjs');
let mongoose = require('mongoose');
const props = require('../../properties-loader.js');
let ObjectIdType = require('mongoose').Types.ObjectId;

mongoose.Promise = global.Promise;

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

let db = mongoose.createConnection('mongodb://' + props.MongoDb.url + '/' + props.MongoDb.database);
let User = db.model('Player', PlayerSchema);

module.exports = {

    registerUser : function (data,callback) {
        if(!validateEmail(data.email)){
            callback(new Error('Incorrect email'));
        }
        else{
            this.findUser(data, (err, user) => {
                if(err){
                    callback(err.message, null);
                }
                else{
                    if(user === null){
                        let salt = bcrypt.genSaltSync(10);
                        data.pwd = bcrypt.hashSync(data.pwd, salt);
                        this.createUser(data, (err, user) =>{
                            if(err){
                                callback(err.message, null);
                            }
                            else{
                                callback(null, user);
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
        User.create(data, function (err, user) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, user);
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

        let elementId = new ObjectIdType(data.id);
        let query = {_id: elementId};

        User.findOneAndUpdate(
            query,
            {
                //$push: {"scores": data.score },
                $inc : { partiesGagnees: 1  }
            },
            function(err, model) {
                callback(err,model);
            }
        );

    },

    updateScore : function (data,callback) {

        let elementId = new ObjectIdType(data.id);
        let query = {_id: elementId};

        User.findByIdAndUpdate(
            query,
            {
                //$push: {"scores": data.score },
                $inc : { partiesFinies : 1}
            },
            function(err, model) {
                callback(err,model);
            }
        );

    },

};



let validateEmail = function (email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};