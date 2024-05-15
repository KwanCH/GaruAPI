import express, { Router } from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import './cron_jobs/StreakCronJob.js'


import { 
    addFriend, 
    getAllFriends, 
    login, 
    removeFriend, 
    signup, 
    updateFitnessData, 
    fetchSessionData,
    fetchUserData,
    updateProfilePicture,
    removeSession,
    createStreak,
    removeStreak,
    getStreak,
    validateEmail,
    tokenStatus,
} from './controllers/UserController.js'

import {
    sendTheEmail
} from './controllers/MailController.js'

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') })

// * Create server
const app = express(),
    port = 50000,
    server = createServer(app)

// * Setup database

mongoose
    .connect("mongodb://158.39.200.212:27017/garu")
    .then(() => {
        console.log('Connected to the database')
    })
    .catch((err) => console.log(err))
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// Increase the limit for JSON payloads
app.use(express.json({ limit: '200mb' })); // Adjust '50mb' to your needs

// Increase the limit for URL-encoded payloads (form data)
app.use(express.urlencoded({ limit: '200mb', extended: true })); // Adjust '50mb' to your needs

// * Middleware
const router = Router()
app.set('json spaces', 2)

// * List endpoints
router.route('/signup').post(signup)
router.route("/login").post(login)
router.route("/validateEmail").get(validateEmail)
router.route("/addfriend").post(addFriend)
router.route("/removefriend").post(removeFriend)
router.route("/removeSession").post(removeSession)
router.route("/getallfriends").post(getAllFriends)
router.route("/updateFitnessData").post(updateFitnessData)
router.route("/fetchSessionData").post(fetchSessionData)
router.route("/fetchUserData").post(fetchUserData)
router.route("/updateProfilePicture").post(updateProfilePicture)
router.route("/createStreak").post(createStreak)
router.route("/removeStreak").post(removeStreak)
router.route("/getStreak").post(getStreak)
router.route("/sendTheEmail").post(sendTheEmail)
router.route("/tokenStatus").post(tokenStatus)



// * Open server on port
app.use('/api', router)
server.listen(port, () => {
    console.log(`Server listening on the port::${port}`)
})