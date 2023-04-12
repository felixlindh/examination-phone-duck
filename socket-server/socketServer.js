import express from "express";
import { Server } from "socket.io"

const app = express();

app.use(express.json());

let clients = []
const server = app.listen(5000, () => {
    console.log('Application started on port 5000!');
  });

const socketIo = new Server(server, {
cors: {
    origin: '*', // Allow any origin for testing purposes. This should be changed on production.
},
});

socketIo.on("connection", (socket) => {
    const authHeader = socket.handshake.headers.authorization
    const authToken = authHeader.replace("Bearer ", "");
    socket.jwt = authToken
    clients.push(socket)

    
    clients.forEach(client => {
        client.emit("new-connection", clients.length + " users has connected")
    })


    socket.on("disconnect", () => {
        console.log("user left")
        clients = clients.filter(client => client != socket)
    })

    
})
app.get("/channel", (req, res) => {
    clients.forEach(client => {
        client.emit("new-channel", "updated channels, do a get request")
    })
    
    console.log("channel socket emitted");
    res.sendStatus(200)
})

app.get("/message/", (req, res) => {
    const channelId = req.query.id
    console.log(channelId);
    clients.forEach(client => {
        client.emit("new-message", `there is new a new message in ${channelId}, do a get request`)
    })
    
    console.log("message socket emitted");
    res.sendStatus(200)
})

app.get("/broadcast", (req, res) => {
    clients.forEach(client => {
        client.emit("new-broadcast", "there is new a new broadcast, do a get request")
    })
    
    console.log("new broadcast was emitted");
    res.sendStatus(200)
})

