import express from "express"
import cookieParser from "cookie-parser";
const app = express()
app.use(express.json())
app.use(cookieParser())

import authRoutes from "../routes/auth.routes.js"
import productRoutes from "../routes/products.routes.js"
import cartRoutes from "../routes/cart.routes.js"

app.get("/",(req,res)=>{
    res.send("Snitch Backned is Working.")
})

app.use("/api/auth",authRoutes)
app.use("/api/product",productRoutes)
app.use("/api/cart",cartRoutes)


export default app;