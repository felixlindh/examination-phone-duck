import  express from "express";
import cors from "cors"
import router from "./src/router/router.js";

const port = 6060;

const app = express();

app.use(cors())
app.use(express.json())

app.use("/ducks/api", router)

app.listen(port, () => {
    console.log("Server listening to port: " + port);
})