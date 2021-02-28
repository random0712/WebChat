require('dotenv/config');
require('./config/mongo');

const app = require('express')();
const http = require('http').createServer(app);

const io = require('socket.io')(http);

const cors = require('cors');
const bodyParser = require('body-parser');

const validateJWT = require('./authToken');

//Models Functions
const { signUp, signIn, createServer, createRoom } = require("./models/user");

// Configuring Express
app.use(cors());
app.use(bodyParser.json());

// Socket events
io.on('connection', (socket) => {
    console.log('[SOCKET] => a user connected');

    socket.on('disconnect', () => {
      console.log('[SOCKET] => user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });
});


// Routes
app.route('/signup')
    .post((req, res) => signUp(req, res))

app.route('/signin')
    .post((req, res) => signIn(req, res))


app.route('/create/server')
    .post(validateJWT, (req, res) => createServer(req, res));

app.route('/create/room')
    .post(validateJWT, (req, res) => createRoom(req, res));

http.listen(process.env.PORT, () => {
    console.log("[SERVER] => running in port " + process.env.PORT);
})

