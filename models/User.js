import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { FitnessSchema } from '../models/FitnessData.js'
import { AchievementsSchema } from '../models/Achievements.js'


const levelSystemSchema = new mongoose.Schema({
    lvl: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    nextLvl: {
        type: Number,
        default: 100
    }
});


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not the same!',
        },
    },

    email:{
        type: String,
        required: true,
        unique: true        // validate: [validator.isEmail,"Mail is not valid"]
    },

    emailValidated:{
        type: Boolean,
        default: false
    },

    emailValidationCode:{
        type: String,

    },

    profilePicture: {
        type: String,
    },

    longestDistance: {
        type: Number,
        default: 0

    },

    totalDistance: {
        type: Number,
        default: 0

    },

    totalDuration:{
        type: Number,
        default: 0
    },

    numberOfRuns: {
        type: Number,
        default: 0
    },
    lastRun: {
        type: String,
        default: null
    },
    highestStreak: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    sessions: {
        type: [FitnessSchema],
        ref: "FitnessData",
        default: []
    },

    friends: {
        type: [mongoose.Types.ObjectId],
        ref: "User",
        default: []
    },
    achievements:{
        type: AchievementsSchema,
        default: () => ({})
    },

    levelDetail: {
        type: levelSystemSchema,
        default: () => ({})
    },

    streaks: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Streak' }],
        default: []
    },

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'users',
})

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12)
    this.emailValidationCode = await bcrypt.hash(this.emailValidationCode, 12)

    this.passwordConfirm = undefined
    next()
})

export const User = mongoose.model('User', userSchema)