import express from "express"
import cookieParser from "cookie-parser";
const app = express()
app.use(express.json())
app.use(cookieParser())

import authRoutes from "../routes/auth.routes.js"

app.get("/",(req,res)=>{
    res.send("Snitch Backned is Working.")
})

app.use("/api/auth",authRoutes)


export default app;