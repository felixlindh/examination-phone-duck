import React, { useState } from "react"
export default function Admin() {
    const [inputValues, setInputValues ] = useState({
        title: "",
        message: "",
    })

    function handleChange(event) {
        const { name, value } = event.target;
        setInputValues((prev) => {
            return {
                ...prev,
                [name]: value,
            }
        })
    }

    async function sendBroadcast() {
        const authToken = sessionStorage.getItem("x-auth-token");
        const BROADCAST_URL = "http://localhost:6060/ducks/api/broadcast/";
      
        const broadcastData = {
          title: inputValues.title,
          message: inputValues.message
        }
      
        const fetchOption = {
          method: "POST",
          body: JSON.stringify(broadcastData),
          headers: {
            "Authorization": "Bearer " + authToken,
            "Content-Type": "application/json" // Tells server to parse as json data
          }
        }

        const response = await fetch(BROADCAST_URL, fetchOption);
        console.log(response);
        setInputValues({
            title: "",
            message: "",
        })

        alert("Broadcast was sent")
    }

    return (
        <div>
            

            <div className="broadcast">
                <h2>Admin page</h2>
                <h4>Create broadcast</h4>
                
                    <label>Title</label>
                    <input onChange={handleChange} value={inputValues.title} name="title" type="text" />
                
                    <label>Message</label>
                    <textarea onChange={handleChange} value={inputValues.message} name="message" type="text" />
                
                <button onClick={sendBroadcast}>Send Broadcast</button>
            </div>
        </div>
    )
}