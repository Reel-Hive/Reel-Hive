import mongoose from "mongoose";
import dotenv from "dotenv"
import app from "./app.js";

dotenv.config()

const DB = process.env.DATABASE_URI.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
)

mongoose.connect(DB).then(console.log("DB connection successfully!")
)

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}`);
    
})