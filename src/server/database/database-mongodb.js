
let mongoose = require('mongoose');

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let PlayerSchema = new Schema({
    id    : ObjectId,
    username     : String,
    pwd      : String,
    scores : [Number],
    partiesGagnees : Number,
    participation : Number
});


let db;
let User;

module.exports = {


    connectToDatabase : function (callback) {

        try {

        // connecte to the db
        mongoose.connect('mongodb://localhost/P4ng-Db');
        db = mongoose.connection;

        db.on('error', function () {
            callback(new Error("Failed to connect to the DB"));
        });
        db.once('open', function() {

            // register the model
            User = mongoose.model('Player', PlayerSchema);
            callback(null);
        });

        } catch (err) {
            console.log(err);
            callback(err);
        }

    },
    
    registerUser : function (data,callback) {

        User.save(function (err, user) {
            if (err) {
                callback(err);
            } else {
                callback(null,user);
            }

        });

    },

    findUser : function (data,callback) {

        // find User
        User.findOne({username : data.username} , function (err,user) {
            if (err) {
                callback(err);
            } else {
                callback(null,user);
            }

        });

    },
    
    updateScoreAndAddVictory : function (user,data,callback) {

        user.findByIdAndUpdate(
            data.id,
            {
                $push: {"scores": data.score },
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

    updateScore : function (user,data,callback) {

        user.findByIdAndUpdate(
            data.id,
            {
                $push: {"scores": data.score },
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

    }




};