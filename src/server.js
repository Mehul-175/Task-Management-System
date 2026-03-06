import "dotenv/config";
import app from "./app.js";
import connectDb from "./config/db.js";

const PORT = process.env.PORT || 6001;

app.listen(PORT, ()=>{
    console.log(`Server running on port: ${PORT}`);
    connectDb();
})