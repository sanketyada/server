import express from "express"
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
const app = express()
app.use(express.json({
    verify: (req, res, buffer) => {
        req.rawBody = Buffer.from(buffer)
    }
}))
app.use(cookieParser())

import authRoutes from "../routes/auth.routes.js"
import productRoutes from "../routes/products.routes.js"
import cartRoutes from "../routes/cart.routes.js"
import paymentRoutes from "../routes/payment.routes.js"

const publicDirectory = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../public",
)

app.get("/",(req,res)=>{
    res.sendFile(path.join(publicDirectory, "index.html"))
})

app.use("/api/auth",authRoutes)
app.use("/api/product",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/payment",paymentRoutes)


export default app;