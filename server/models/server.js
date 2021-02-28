const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const ServerSchema = new Schema({
    name: String,
    users: Array,
    rooms: Array,
    admins: Array,
})

const Server = model("Server", ServerSchema);

module.exports = Server;