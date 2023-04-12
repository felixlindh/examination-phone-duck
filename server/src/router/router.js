import express from "express"
import { fetchCollection } from "../mongo/mongoClient.js"
import jwtUtil from "../util/jwtUtil.js"
import jwtFilter from "../filter/jwtFilter.js"
import { ObjectId } from 'mongodb'
import bcrypt from "bcrypt"
import * as dotenv from "dotenv"
dotenv.config()

const router = express.Router()

router.post("/create/account/", async (req, res) => { // skapar ett konto
    let user = req.body
    user.role = "USER"

    const hash = bcrypt.hashSync(user.password, parseInt(process.env.saltRounds));
    user.password = hash
    console.log(user);

    const result = await fetchCollection("users").updateOne({username: user.username}, {$setOnInsert: user}, {upsert: true})

    if(result.matchedCount !== 0) {
        res.status(400).send("User allready exists")
    } else {
        res.status(200).send("Account was created")
    }
})

router.put("/login/", async (req, res) => {
    let login = req.body;

    // Load hash from your password DB.
    if(login.username == null || login.username == "") {
        res.status(400).send("Bad Request")
    } else {
        const user = await fetchCollection("users").findOne({username: login.username})
        console.log(user);
        const match = bcrypt.compareSync(login.password, user.password) // true or false

        if(match == false) {
        res.status(400).send("Bad Request")
        } else {
                if(user != null) {
                const token = jwtUtil.generate(user)
                res.send(token)
                } else {
                    res.sendStatus(400)
                }
        }
    }
    

    
})

router.put("/channel/", jwtFilter.authorize, async (req, res) => { // <-- skapar en ny kanal. Tema (rubrik) på kanalen ska skickas som en del http-body:n, förslagvis som del av ett json objekt.
    const channel = req.body 
    const decoded = jwtUtil.getUser(req)
    channel.createdBy = decoded.username 
    channel.messages = []
    if(channel.title == null || channel.title == "") {
        res.status(400).send({error: "Missing title"})
    } else {
        const newChannel = await fetchCollection("channels").updateOne({title: channel.title}, {$setOnInsert: channel}, {upsert:true})

        res.send(newChannel)
        await fetch("http://localhost:5000/channel") // säger åt socketen att emitta till alla som är uppkopplade
    }
    
})

router.get("/channel/", async (req, res) => { //hämtar en lista över annonserade kanaler. Se VG kritierier för krav till ett högre betyg.
    try {
        const allChannels = await fetchCollection("channels").find().toArray()

        res.send(allChannels)
      } catch (err) {

        res.status(500); 
        res.send(err.clientMessage);
      }
    
})

router.get("/channel/:id", jwtFilter.authorize, async (req, res) => { // <-- hämtar innehållet i en identiferad kanal som tidigare har annonserats ut, detta syftar på meddelanden som har skickats i kanalen.
    if (ObjectId.isValid(req.params.id)) {
            const channel = await fetchCollection('channels').findOne({_id: new ObjectId(req.params.id)})
                if(channel == null) {
                    res.status(404).send({error: 'Could not fetch the document'})
                } else {
                    res.status(200).send(channel)
                }
        } else {
            res.status(404).send({error: 'Could not fetch the document'})
        }
})



router.post("/channel/:id", jwtFilter.authorize, async (req, res) => { // <-- skickar ut ett nytt meddelanden till en identiferad kanal som tidigare har annonserats ut. Innehållet i ett meddlande bör vara minst anvsändare och innehåll.
    const decoded = jwtUtil.getUser(req)
    const id = new ObjectId(req.params.id)
    const message = req.body.message
    const newMessage = {
        from: decoded.username,
        message: message
    }
    const channel = await fetchCollection("channels").updateOne({_id: id }, { $push: {messages: newMessage}})
    if(channel.matchedCount == 0) {
        res.status(404).send({error: "Could not find the channel"})
    } else {
        res.status(200).send(channel)
        await fetch(`http://localhost:5000/message/?id=${id}`) // säger åt socketen att emitta till alla som är uppkopplade
    }
    
})

router.delete("/channel/:id", jwtFilter.authorize, async (req, res) => { // <-- tar bort en identiferad kanal som tidigare annonserats ut. Se VG kritierna för krav till ett högre betyg.
    if (ObjectId.isValid(req.params.id)) {
        const channel = await fetchCollection('channels').deleteOne({_id: new ObjectId(req.params.id)})
            if(channel.deletedCount == 0) {
                res.status(404).send({error: 'Could not find the document'})
            } else {
                res.status(200).send({message: 'Channel deleted'})
                await fetch("http://localhost:5000/channel") // säger åt socketen att emitta till alla som är uppkopplade
            }
    } else {
        res.status(404).send({error: 'Could not find the document'})
    }
})

router.get("/broadcast/", async (req, res) => { // <-- hämtar en lista över alla händelser som har skickats ut, ex. älgvandring, traffikolycker m.m. Se VG kritierier för krav till ett högre betyg.
    
    try {
        const allBroadcasts = await fetchCollection("broadcasts").find().toArray()
        res.send(allBroadcasts)
      } catch (err) {
        res.status(500); 
        res.send(err.clientMessage);
      }
})

router.post("/broadcast/", jwtFilter.authorizeAdmin, async (req, res) => { // <-- skapar en ny nödhändelse.
    const broadcast = req.body
    if(broadcast.title == null || broadcast.title == "") {
        res.status(400).send({error: "Missing title"})
    } else if(broadcast.message == null || broadcast.message == "") {
        res.status(400).send({error: "Missing message"})
    } else {
        const decoded = jwtUtil.getUser(req)
        const date = new Date().toLocaleDateString("sv-SE")
        const time = new Date().toLocaleTimeString("sv-SE");
        broadcast.uploadedAt = `${date} ${time}`
        broadcast.createdBy = decoded.username 
        const newBroadcast = await fetchCollection("broadcasts").insertOne(broadcast)

        res.send(newBroadcast)
        await fetch("http://localhost:5000/broadcast") // säger åt socketen att emitta till alla som är uppkopplade
    }
    
})


export default router;