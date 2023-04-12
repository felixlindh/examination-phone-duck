import React, {useState, useEffect, useRef} from "react"
import  socket  from "../socket";

export default function Home() {
    const ref = useRef(false)
    useEffect(() => {
        handleNewConnect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        if(ref.current === false) {
            ref.current = true
            console.log(socket);
           
            
            socket.on("new-connection", handleNewConnect)
            socket.on("new-channel", handleNewConnect)
            socket.on("new-message", handleNewConnect)
        }
        
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const [channels, setChannels ] = useState(undefined)
    const [renderChannel, setRenderChannel ] = useState(undefined)
    const [message, setMessage ] = useState("")
    const [ number, setNumber ] = useState(undefined)
    const [ render, setRender ] = useState(true)
    const [channelTitle, setChannelTitle ] = useState("")

    async function handleNewConnect(data) {
        console.log("new connection, woohoo");
        console.log(data);

        const authToken = sessionStorage.getItem("x-auth-token");
        const GETCHANNELS_URL = "http://localhost:6060/ducks/api/channel/"

        const fetchOption = {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            }
        }

        const response = await fetch(GETCHANNELS_URL, fetchOption)
        const result = await response.json()

        setChannels(result)

    }
    
    function readChannel(event) {
      let i = event.target.getAttribute("value")
      setNumber(i)
      setRenderChannel(channels[i])
      setRender(!render)
      console.log(renderChannel);
    }
    function handleMessage(event) {
        let value = event.target.value
        setMessage(value)
    }

    async function sendMessage(event) {
        const authToken = sessionStorage.getItem("x-auth-token");
        const id = event.target.value
        const SENDMESSAGE_URL = `http://localhost:6060/ducks/api/channel/${id}`
        const messageData = {
            message: message
        }

        const fetchOption = {
            method: "POST",
            body: JSON.stringify(messageData),
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            }
        }

        const response = await fetch(SENDMESSAGE_URL, fetchOption)
        const result = await response.json()

        console.log(result);
        setMessage("")
    }
    function goBack() {
        setRender(!render)
    }

    async function createChannel() {
        const authToken = sessionStorage.getItem("x-auth-token");
        const GETCHANNELS_URL = "http://localhost:6060/ducks/api/channel/"
        const titelData = {
            title: channelTitle
        }
        const fetchOption = {
            method: "PUT",
            body: JSON.stringify(titelData),
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            }
        }

        const response = await fetch(GETCHANNELS_URL, fetchOption)
        const result = await response.json()

        console.log(result);
        setChannelTitle("")
    }
    function handleCreateChannel(event) {
        let value = event.target.value
        setChannelTitle(value)
    }

    async function deleteChannel(event) {
        let value = event.target.value
        console.log(channels[value]._id);
        const DELETE_URL = `http://localhost:6060/ducks/api/channel/${channels[value]._id}`
        const authToken = sessionStorage.getItem("x-auth-token");
        console.log(DELETE_URL);

        const fetchOption = {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            }
        }

        const response = await fetch(DELETE_URL, fetchOption)
        console.log(response);
    }
    function parseJwt(token) {
        if (!token) {
          return;
        }
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace("-", "+").replace("_", "/");
        return JSON.parse(window.atob(base64));
      }

    return (
        <div className="home-container">
            <div className="header-container">
            <input type="text" onChange={handleCreateChannel} value={channelTitle} placeholder="Enter channel title.." />
            <button className="channel-btn" onClick={createChannel}>Create new channel</button>
            </div>
            {render && channels && channels.map((channel, index) => {
                return (
                    <div className="channel-container-container">
                    <div className="channel-container" onClick={readChannel} key={index} value={index}>
                        <h4 value={index}>{channel.title}</h4>
                        <p value={index}>Created by {channel.createdBy}</p>
                        
                    </div>
                    <button className="delete-btn" onClick={deleteChannel} value={index}>Delete {channel.title}</button>
                    </div>
                )
            })}
            {!render && renderChannel && <div className="channel-chat">
                <button className="nav-button" onClick={goBack}>Back</button>
                <h3>{channels[number].title}</h3>
                <div className="chat-container">
                {channels[number].messages.map((message, index) => {
                        const authToken = sessionStorage.getItem("x-auth-token");
                        let currentUser = parseJwt(authToken);
                        let sentFrom;
                        let sentFromContainer;
                        if (message.from === currentUser.username) {
                          sentFrom = "my-message";
                          sentFromContainer = "my-message-container";
                        } else {
                          sentFrom = "other-user-message";
                          sentFromContainer = "other-user-container";
                        }
                    return (
                        <div className={sentFromContainer}>
                        <div className={sentFrom} key={index}>
                            <p>{message.from}: {message.message}</p>
                        </div>
                        </div>
                    )
                })}
                </div>
                <div className="message-container">
                <input placeholder="new message.." type="text" value={message} onChange={handleMessage}/>
                <button className="channel-btn" value={channels[number]._id} onClick={sendMessage}>Send</button>
                </div>
            </div>}
        </div>
    )
}