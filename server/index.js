import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import cors from 'cors'
import { connectDB } from './config/dbConnect.js';

import consultationRouter from './routes/consultation.route.js'
import candidateRouter from './routes/candidate.route.js'
import authRouter from './routes/auth.route.js'
import creationRouter from './routes/creation.route.js'
import clientRouter from './routes/client.route.js'
import contactRouter from './routes/contact.route.js'
import cookieParser from "cookie-parser";

const app = express()
const port = process.env.PORT

// middlewares

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin : ['http://localhost:5173', 'http://localhost:5174' , 'https://admin.oriventa-pro-service.com'] ,
    credentials : true,
    methods : ['GET' , 'POST' , 'PUT' , 'DELETE' , 'PATCH'],
    allowedHeaders : ['Content-Type' , 'Authorization'],
    exposedHeaders : ['Content-Type' , 'Authorization'],
    optionsSuccessStatus : 200,
}))
app.use(morgan('combined'))
app.use("/uploads", express.static("uploads"));




// routes
app.use( '/api/auth' , authRouter)
app.use( '/api/consultations' , consultationRouter)
app.use( '/api/dossiers' , candidateRouter)
app.use('/api/creation' , creationRouter)
app.use('/api/clients' , clientRouter)
app.use('/api/contact' , contactRouter)

// DB Connection

connectDB()

app.get( "/" , (req,res) => {
    res.send('Welcome to Oriventa Pro Services API')
})


app.listen(port , () => {
    console.log(`Server running on port ${port}`)
})