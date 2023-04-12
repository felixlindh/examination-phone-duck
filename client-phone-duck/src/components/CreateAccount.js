import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
export default function CreateAccount() {
    const navigate = useNavigate();
    const [inputValues, setInputValues ] = useState({
      username: "",
      password: "",
    });

    function handleChange(event) {
      const { name, value } = event.target;
      setInputValues((previnputValues) => {
        return {
          ...previnputValues,
          [name]: value,
        }
      });
    }

    function backToLogin() {
      navigate("/")
    }
    async function handleCreateAccount() {

        const CREATE_URL = "http://localhost:6060/ducks/api/create/account/";
      
        const accountData = {
          username: inputValues.username,
          password: inputValues.password
        }
      
        const fetchOption = {
          method: "POST",
          body: JSON.stringify(accountData),
          headers: {
            "Content-Type": "application/json" // Tells server to parse as json data
          }
        }

        const response = await fetch(CREATE_URL, fetchOption);

        console.log(response);

        if(response.status === 200) {
            navigate("/")
        } else {
            alert("Try again")
        }

    }

    return (
      <div className="login-container">
            <h2>Create new account</h2>
        
            
                <label>Username</label>
                <input onChange={handleChange} value={inputValues.username} name="username" type="text" className="create-username-field"/>
            
            
                <label>Password</label>
                <input onChange={handleChange} value={inputValues.password} name="password" type="password" className="create-password-field"/>
            

            <button onClick={handleCreateAccount} className="channel-btn">Create account</button>
            <div>
              <h4>Allready have an acoount?</h4>
              <button onClick={backToLogin} className="channel-btn">To login page</button>
            </div>
        
      </div>
    )
  }