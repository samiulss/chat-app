const express = require('express');
const dotenv = require("dotenv");
const cors = require('cors')
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notification = require('./routes/notificationRoutes');
const upload = require('./config/multer');
const path = require('path');

//app use
const app = express();
dotenv.config();
connectDB();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//rest api
app.use("/api/user", upload.single('avater'), userRoutes);
app.use("/api/chat", upload.array('image'), chatRoutes);
app.use("/api/message", upload.array('image'), messageRoutes);
app.use("/api/notification", notification);

app.use(express.static(path.join(__dirname, "/public")))

app.use(notFound);
app.use(errorHandler);


//app listen
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, console.log(`Server is live at PORT ${PORT}`));

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173"
    },
});

//socket.io connection
let activeUsers = [];
io.on('connection', (socket) => {
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        let socketID = socket.id;
        activeUsers.push({ userData, socketID })
        io.emit("connected", activeUsers);
    });

    socket.on("disconnect", () => {
        activeUsers = activeUsers.filter(user => user.socketID !== socket.id)
        io.emit("connected", activeUsers);
    })

    //join chat
    socket.on("join chat", (room) => {
        socket.join(room);
    });

    //select any chat
    socket.on("select", (data) => {
        io.emit("select", data)
    });

    // typing message
    socket.on("typing", (data) => socket.in(data.selected).emit("typing", data));

    //stop typing message
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    //new message received
    socket.on("new message", (newMessageReceived) => {
        let chat = newMessageReceived.chat;

        if (!chat.users) {
            return console.log("chat.users not defined");
        }
        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    //new data on selected chat
    socket.on("newData", (data) => {
        socket.in(data._id).emit("setData", data)
    })

    //unsent message
    socket.on("unsent", (data) => {
        io.emit("unsent", data)
    })

    socket.off("setup", () => {
        socket.leave(userData._id);
    })
});