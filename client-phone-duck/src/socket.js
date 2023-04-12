import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'ws://localhost:5000';
const socket = io(URL, {
    extraHeaders: {
      "authorization": "Bearer " + sessionStorage.getItem("x-auth-token")
    }
  });




export default socket