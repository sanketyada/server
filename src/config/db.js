import mongoose from "mongoose"
import config from "./config.js"

async function ConnnectDB(params) {
    try {
        await mongoose.connect(`${config.MONGO_URI}/Snitch`)
        console.log("Database Connected!")
    } catch (error) {
        console.log(error.message)
    }
}
export default ConnnectDB;