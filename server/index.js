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
import suiviRouter from './routes/suivi.route.js'
import contactRouter from './routes/contact.route.js'
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
const app = express()
const port = process.env.PORT

// middlewares
app.use(cors({
    origin : ['http://localhost:5173', 'http://localhost:5174', "http://localhost:8080" , 'https://oriventa-pro-service.com' ,'https://landing.oriventa-pro-service.com' ,'https://admin.oriventa-pro-service.com'] ,
    credentials : true,
    methods : ['GET' , 'POST' , 'PUT' , 'DELETE' , 'PATCH'],
    allowedHeaders : ['Content-Type' , 'Authorization'],
    exposedHeaders : ['Content-Type' , 'Authorization'],
    optionsSuccessStatus : 200,
}))
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://connect.facebook.net", // Allow FB Pixel
        "https://www.googletagmanager.com",
      ],
      imgSrc: ["'self'", "data:", "https://www.facebook.com"],
    },
  }));
app.use(express.json({limit: "50mb", extended: true}))
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))
app.use(cookieParser());

app.use(morgan('combined'))
app.use("/uploads", express.static("uploads"));
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // ⏱️ 15 minutes
//   max: 100, // 💥 limit each IP to 100 requests per window
//   message: {
//     status: 429,
//     message: "Too many requests, please try again later.",
//   },
//   standardHeaders: true, // Return rate limit info in headers
//   legacyHeaders: false, // Disable the X-RateLimit headers
// });

// app.use(limiter);



// routes
app.use( '/api/auth' , authRouter)
app.use( '/api/consultations' , consultationRouter)
app.use( '/api/dossiers' , candidateRouter)
app.use('/api/creation' , creationRouter)
app.use('/api/clients' , clientRouter)
app.use('/api/contact' , contactRouter)
app.use('/api/suivi', suiviRouter)

// DB Connection

connectDB()

app.get( "/" , (req,res) => {
    res.send('Welcome to Oriventa Pro Services API')
})


app.listen(port , () => {
    console.log(`Server running on port ${port}`)
})