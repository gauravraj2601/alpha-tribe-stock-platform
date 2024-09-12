const express = require("express")
const cors = require("cors");
const { connection } = require("./config/db");
const { authRouter } = require("./routes/auth");
const { userRouter } = require("./routes/users");
const { Post_Router } = require("./routes/posts");
const { Comment_Router } = require("./routes/comments");
require("dotenv").config();

const app = express();

app.use(express.json())
app.use(cors());

app.use("/api/auth",authRouter)
app.use("/api/user", userRouter)
app.use("/api/posts", Post_Router)
app.use("/api/posts", Comment_Router)

app.get("/",(req, res)=>{
    res.send("Welcome to Alpha-Trive: Stock Platform")
})

app.listen(process.env.PORT, async()=>{
    try {
        await connection
        console.log(`Server is Running on PORT ${process.env.PORT}`)
        console.log("DB connected")
    } catch (error) {
        console.log(error.message)
    }
})