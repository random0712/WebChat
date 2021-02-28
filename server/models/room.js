const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const RoomSchema = new Schema({
    name: String,
    messages: Array
})

const Room = model("Room", RoomSchema);

module.exports = Room;