import React from "react"
import { useNavigate } from "react-router-dom"

export default function Navbar() {
    const navigate = useNavigate();

    function navHome(){
        navigate("/home")
    }
    function navBroadcasts(){
        navigate("/broadcasts")
    }
    return (
        <nav className="navbar">
            <h2>Phone Duck Inc</h2>
            <div>
            <button className="nav-button" onClick={navHome}>Home</button>
            <button className="nav-button" onClick={navBroadcasts}>Broadcasts</button>
            </div>
        </nav>
    )
}