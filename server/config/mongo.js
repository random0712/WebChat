const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_HOST, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false} );

const db = mongoose.connection;

db.on('error', console.error.bind(console, '[MONGODB] => connection error:'));
db.once('open', function() {
    console.log("[MONGODB] => connected!");
});