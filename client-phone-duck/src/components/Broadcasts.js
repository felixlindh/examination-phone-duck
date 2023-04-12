import React, {useState, useEffect, useRef} from "react"
import  socket  from "../socket";

export default function Broadcasts() {
    const ref = useRef(false)
    useEffect(() => {
        handleNewConnect()
    }, [])
    useEffect(() => {
        if(ref.current === false) {
            ref.current = true
            console.log(socket);
           
            
            socket.on("new-connection", handleNewConnect)
            socket.on("new-broadcast", handleNewConnect)
        }
        
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const [broadcasts, setBroadcasts ] = useState(undefined)

    async function handleNewConnect(data) {
        console.log("new connection, woohoo");
        console.log(data);

        const authToken = sessionStorage.getItem("x-auth-token");
        const GETBROADCAST_URL = "http://localhost:6060/ducks/api/broadcast/"

        const fetchOption = {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            }
        }

        const response = await fetch(GETBROADCAST_URL, fetchOption)
        const result = await response.json()

        setBroadcasts(result)

    }



    return (
        <div>
            <h2>Broadcasts</h2>
            {broadcasts && broadcasts.slice(0).reverse().map((broadcast, index) => {
                return (
                    <div className="broadcast-container" key={index}>
                        <h4>{broadcast.title}</h4>
                        <p>Date & time {broadcast.uploadedAt}</p>
                        <p>Created by {broadcast.createdBy}</p>
                        <p>{broadcast.message}</p>
                    </div>
                )
            })}
        </div>
    )
}