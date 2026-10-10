import app from "./app/app.js"
import config from "./config/config.js"
import ConnnectDB from "./config/db.js"
await ConnnectDB()


const PORT = config.PORT || 4000

app.listen(PORT,(req,res)=>{
    console.log(`http://localhost:${PORT}/`)
})