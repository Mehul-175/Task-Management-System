import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json()); // Handles application/json
app.use(express.urlencoded({ extended: true })); // Handles application/x-www-form-urlencoded
app.use(cookieParser());


app.get('/', (req, res)=>{
    res.send("Api is working...")
})

//Auth Routes
import authRoutes from './routes/auth.routes.js'
app.use('/api/auth', authRoutes)

export default app;