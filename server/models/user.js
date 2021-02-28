const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Server = require('./server');
const Room = require('./room');

const { Schema, model } = mongoose;

const UserSchema = new Schema({
    username: String,
    email: String,
    password: String,
    serverList: Array,
    ownerServers: Array,
    friends: Array
});

const User = model('User', UserSchema);


function signUp(req, res) {
    const { _id, username, email, password } = req.body;

    if(!username || !email || !password) return res.send({code: 404, error: "There are unfilled fields"})

    if(_id) {
        User.findById(_id, {
            username,
            email,
            password
        }, (err) => {
            if(err) return res.send({code: 503, error: err});
            console.log("[MONGODB] => Update user", _id);
            return res.send({code: 201, data: "Successfully updated"})
        })
    } else {
        bcrypt.hash(password, 10, function(err, hash) {
            if(err) return console.log(err);

            const newUser = new User({
                username,
                email,
                password: hash
            })

            newUser.save((err, user) => {
                if(err) return res.send({code: 503, error: err});
                console.log("[MONGODB] => Create user", user);
                return res.send({code: 201, data: user});
            })
        });
    }
}

function signIn(req, res) {
    const { email, password } = req.body;

    User.findOne({email}, function(err, user) {
        if(err) return console.log(err);

        if(!user) return res.send({code: 404, error: "User not found!"});

        bcrypt.compare(password, user.password,  function(err, result) {
            if(err) return console.log(err);

            if(!result) return res.send({code: 404, error: "Invalid password!"});

            jwt.sign({ id: user._id }, process.env.AUTH_SECRET, {
                expiresIn: "7 days"
            }, (err, token) => {
                if(err) return console.log(err);

                res.send({code: 200, token, user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        serverList: user.serverList,
                        ownerServers: user.ownerServers,
                        friends: user.friends
                    }})
            })
        })
    })
}

function createServer(req, res) {
    const { _id, serverName } = req.body;

    if(!_id) return res.send({code: 404, error: "Invalid id"});

    User.findById(_id, (err, user) => {
        if(err) return res.send({code: 404, error: "User not found"});
        const newServer = new Server({
            name: serverName,
            admins: [user._id]
        });

        newServer.save((err, server) => {
            if(err) return res.send({code: 503, error: `Somenthing wrong happened: ${err}`});

            const serverUpdates = {
                serverList: [server._id, ...user.serverList],
                ownerServers: [server._id, ...user.ownerServers]
            };

            User.findByIdAndUpdate(user._id, serverUpdates, (err, user) => {
                if(err) return res.send({code: 503, error: "Server changes error"});
            })
            console.log("[MONGODB] => Server created", server);
            return res.send({code: 201, data: server});
        })
    })
}


function createRoom(req, res) {
    const { userId, serverId, roomName } = req.body;

    User.findById(userId, (err, user) => {
        if(err) return res.send({code: 404, error: "User ID invalid"});

        Server.findById(serverId, (err, server) => {
            if(err) return res.send({code: 404, error: "Server ID invalid"});
            
            if(!server.admins.includes(user._id)) return res.send({code: 404, error: "User isn't a server administrator"});

            const newRoom = new Room({
                name: roomName
            })

            newRoom.save((err, room) => {
                if(err) return res.send({code: 503, error: `Somenthing wrong happened: ${err}`});

                const roomUpdates = {
                    rooms: [room._id, ...server.rooms],
                }

                Server.findByIdAndUpdate(server._id, roomUpdates, (err, server) => {
                    if(err) return res.send({code: 503, error: "Room changes"});
                })
                console.log("[MONGODB] => Room created: ", room);
                return res.send({code: 201, data: room});
            })
        })
    })
}

module.exports = {
    signUp,
    signIn,
    createServer,
    createRoom
}