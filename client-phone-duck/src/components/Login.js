import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
export default function Login() {

    const navigate = useNavigate();
    const [inputValues, setInputValues ] = useState({
        username: "",
        password: "",
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

    async function onLoginClick() {
        await handleLogin()

        const authorizationToken = sessionStorage.getItem("x-auth-token");

        if (authorizationToken === null) {
            console.log("No auth token found");
            return false; // Cancel process
        } else {
            navigate("/Home")
        }
    }

    async function handleLogin() {

        const LOGIN_URL = "http://localhost:6060/ducks/api/login/";
      
        const loginData = {
          username: inputValues.username,
          password: inputValues.password
        }
      
        const fetchOption = {
          method: "PUT",
          body: JSON.stringify(loginData),
          headers: {
            "Content-Type": "application/json" // Tells server to parse as json data
          }
        }

        const response = await fetch(LOGIN_URL, fetchOption);
        console.log(response);
        if(response.status === 200) {
            const authorizationToken = await response.text()
      
            sessionStorage.setItem("x-auth-token", authorizationToken);// Saves auth token for the duration of browser session
        }
         

    }
    function dontHaveAnAccount() {
        navigate("/create/account")
    }

    return (
        <div className="login-container">
            <div>
                <label>Username</label>
                <input onChange={handleChange} name="username" value={inputValues.username} type="text"></input>
            </div>
            <div>
                <label>Password</label>
                <input onChange={handleChange} name="password" value={inputValues.password} type="password"></input>
            </div>
            <button  className="channel-btn" onClick={onLoginClick}>LOGIN</button>
            <div>
            <h4>Dont have an account?</h4>
                <button className="channel-btn" onClick={dontHaveAnAccount} >Create account</button>
            </div>
        </div>
    )
}