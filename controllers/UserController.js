import { promisify } from 'util'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from "../models/User.js"
import { FitnessData } from '../models/FitnessData.js'
import { calculateXpFromSession } from './LevelSystem.js';
import { checkForAchivements, checkForAchivementsOnRemoveSession, checkForAchivementsOnRemoveFriend } from './AchievementSystem.js';
import { Streak } from "../models/Streak.js"
import { makeid } from '../utils/random.js'
import { sendTheEmail } from './MailController.js'
import validator from 'email-validator';

import { decode } from 'punycode'


export const validateEmail = async (req, res) => {
    console.log('Call to `/validateEmail` endpoint')

    const email = req.query.email.toLowerCase()
    const code = req.query.code

    if (!email || !code) {
        return res.status(400).json({ "error": "Invalid email or code" })
    }

    const dbUser = await User.findOne({ email })
    console.log("Email validated?:", dbUser.emailValidated)

    if (!dbUser) {
        return res.status(400).json({ "error": "User dont exists" })
    }

    const dbCode = dbUser.emailValidationCode

    if (!bcrypt.compare(code, dbCode)) {
        return res.status(400).json({ "error": "Wrong password, malicious user " })
    }

    await User.findOneAndUpdate({ email }, { $set: { emailValidated: true } })
    console.log("Email validated", dbUser.emailValidated)

    return res.status(200).send(`Verified email ${email} , thanks!`)

}

export const signup = async (req, res) => {
    console.log('Call to `/signup` endpoint')

    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]|\s/
    
    if (req.body === undefined)
        return res.status(400).json({ "error": "body undefined" })
    else if(!req.body.email)
        return res.status(400).json({ error: 'Email not provided' })
    else if (!validator.validate(req.body.email))
        return res.status(400).json({ error: "Email not valid" })
    else if (!req.body.username || req.body.username === '')
        return res.status(400).json({ error: 'No username defined' })
    else if(format.test(req.body.username))
        return res.status(400).json({ error: 'Username contains invalid characters' })
    else if (!req.body.password || !req.body.passwordConfirm)
        return res.status(400).json({ error: 'No password defined' })
    else if (req.body.password !== req.body.passwordConfirm)
        return res.status(400).json({ error: 'Passwords don\'t match' })


    const username = req.body.username
    const email = req.body.email

    if (await User.findOne({ username }))
        return res.status(409).json({ error: 'Another account with same username' })
    else if (await User.findOne({ email }))
        return res.status(409).json({ error: 'Email already in use' })


    const validationCode = makeid(20)

    const newUser = await User.create({
        username: req.body.username,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        profilePicture: req.body.profilePicture,
        email: req.body.email.toLowerCase(),
        emailValidationCode: validationCode,
    })

    await sendTheEmail(req.body.email.toLowerCase(), validationCode)


    createSendToken(newUser, 201, res)
}

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'placeholder', {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    // res.cookie('jwt', token, {
    //   expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //   // secure: true,
    //   httpOnly: true
    // });

    user.password = undefined
    user.verificationToken = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    })
}

export const isLoggedIn = async (req, res) => {
    console.log('Call to `/isLoggedIn` endpoint')

    try {
        if (req.body.jwt) {
            try {
                // 1) verify token
                const decoded = await promisify(jwt.verify)(
                    req.body.jwt,
                    process.env.JWT_SECRET || 'placeholder'
                )

                // 2) Check if user still exists
                const currentUser = await User.findById(decoded.id)
                if (!currentUser) return false

                // THERE IS A LOGGED IN USER
                res.locals.user = currentUser

                const userObject = currentUser.toJSON()
                userObject.isLoggedIn = true

                return userObject
            } catch (err) {
                return false
            }
        }

        return false
    } catch (err) {
        return false
    }
}

export const login = async (req, res) => {
    console.log('Call to `/signin` endpoint')

    if (await isLoggedIn(req, res))
        return res.status(200).json({ message: 'You are already logged in!' })

    // 1) Check if email and password exist
    if (!req.body.username || !req.body.password)
        return res.status(404).json({ error: 'Please provide a username and password' })

    const username = req.body.username
    // 2) Check if user exists && password is correct
    const user = await User.findOne({
        username,
    }).select('+password emailValidated')


    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
        return res.status(401).json({ error: 'Invalid username or password' })

    if (!user || !user.emailValidated)
        return res.status(401).json({ error: 'Email not verified' })

    // 3) If everything ok, send token to client
    //todo Kanskje ha funskjon(er) som looper gjennom session data for å sørge for riktig data
    //todo mtp. longestDistance, numberOfRuns, totalDistance.
    createSendToken(user, 200, res)
}

export const addFriend = async (req, res) => {
    console.log('Call to `/addFriend` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user)
        return res.status(200).json({ error: 'You are not logged in!' })

    if (!req.body) {
        return res.status(200).json({ error: 'No body included!' })
    }

    if (!req.body.friendname) {
        return res.status(200).json({ error: 'Friend name not included!' })
    }

    //Pass på at man ikke kan legge til seg selv eller man allerede er venn
    const friend = await User.findOne({ username: req.body.friendname })

    if (!friend) {
        return res.status(200).json({ error: 'Friend name does not exist!' })
    }

    console.log(user.friends)

    await User.updateOne({ _id: user._id }, { $push: { friends: friend._id } })
    await User.updateOne({ _id: friend._id }, { $push: { friends: user._id } })

    console.log(`${user.username} befriended ${friend.username}`)

    const updatedUser = await User.findById(user._id);
    await checkForAchivements(updatedUser)
    return res.status(200).json({ error: 'FINISH' })

}

export const removeFriend = async (req, res) => {
    console.log('Call to `/removeFriend` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user)
        return res.status(200).json({ error: 'You are not logged in!' })

    if (!req.body) {
        return res.status(200).json({ error: 'No body included!' })
    }

    if (!req.body.friendname) {
        return res.status(200).json({ error: 'Friend name not included!' })
    }

    //todo Pass på at man ikke kan legge til seg selv eller man allerede er venn
    const friend = await User.findOne({ username: req.body.friendname })

    if (!friend) {
        return res.status(200).json({ error: 'Friend name does not exist!' })
    }

    console.log(user.friends)

    //Removing streaks if there exists with the friend to be removed
    const sharedStreak = user.streaks.find(streakId =>
        friend.streaks.some(friendStreakId => streakId.equals(friendStreakId))
    );

    if (sharedStreak) {
        await User.findByIdAndUpdate(user, { $pull: { streaks: sharedStreak._id } });
        await User.findByIdAndUpdate(friend, { $pull: { streaks: sharedStreak._id } });
        await Streak.findByIdAndDelete(sharedStreak._id);
        console.log(`${user.username} removed a streak with ${friend.username}`)
    } else {
        console.log('No shared streak!')
    }

    await User.findOneAndUpdate({ _id: user._id }, { $pull: { friends: friend._id } })
    await User.findOneAndUpdate({ _id: friend._id }, { $pull: { friends: user._id } })

    console.log(`${user.username} unfriended ${friend.username}`)

    const updatedUser = await User.findById(user._id);
    await checkForAchivementsOnRemoveFriend(updatedUser)
    return res.status(200).json({ error: 'FINISH' })

}

export const removeSession = async (req, res) => {
    console.log('Call to `/removeSession` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user)
        return res.status(200).json({ error: 'You are not logged in!' })

    if (!req.body) {
        return res.status(200).json({ error: 'No body included!' })
    }


    const session = user.sessions.find(s => s._id.toString() == req.body.sessionID);

    await User.findOneAndUpdate({ _id: user._id }, { $pull: { sessions: { _id: req.body.sessionID } } })
    await User.updateOne({ _id: user._id }, { $inc: { totalDistance: -session.distance } })
    await User.updateOne({ _id: user._id }, { $inc: { numberOfRuns: -1 } })


    if (session.distance == user.longestDistance && user.sessions.length > 1) {
        let newLongestDistance = 0
        for (let s in user.sessions) {
            if (s.distance > newLongestDistance) {
                newLongestDistance = s.distance
            }
        }
        await User.findOneAndUpdate({ _id: user._id }, { $set: { longestDistance: newLongestDistance } })
    }


    await User.findOneAndUpdate({ _id: user._id }, { $set: { longestDistance: 0 } })

    const updatedUser = await User.findById(user._id);
    await checkForAchivementsOnRemoveSession(updatedUser, session)
    return res.status(200).json({ error: 'FINISH' })

}

export const getAllFriends = async (req, res) => {
    console.log('Call to `/getAllFriends` endpoint')
    const user = await isLoggedIn(req, res)

    if (!user)
        return res.status(200).json({ error: 'You are not logged in!' })

    if (!req.body) {
        return res.status(200).json({ error: 'No body included!' })
    }

    try {
        // Use findById to fetch the user and populate the friends field
        const userWithFriends = await User.findById(user._id)
            .populate('friends', ["username", "profilePicture"])
            .populate({
                path: 'streaks',
                populate: { path: 'users', select: 'username' }
            }).exec(); // Execute the query

        // Initialize a new object to hold the merged data
        const newList = {};

        // Populate newList with friends data
        userWithFriends.friends.forEach((friend) => {
            newList[friend.id] = {
                profilePicture: friend.profilePicture,
                username: friend.username,
                streak: -1
            };
        });

        // Loop through each streak and add the streak info to the corresponding user in newList
        userWithFriends.streaks.forEach((streak) => {
            streak.users.forEach(user => {
                // Check if the user is a friend and if so, add the streak information
                if (newList[user._id]) {
                    newList[user._id].streak=streak.currentStreak
                }
            });
        });

        // Optional: logging the new list to see the merged data
        const friendList = Object.values(newList)

        // console.log(streakList);
        return res.status(200).json({friendList: friendList})
    } catch (error) {
        return res.status(200).json({ error: 'Was unable to fetch friends.' })
    }

}

export const updateFitnessData = async (req, res) => {
    console.log('Call to `/updateFitnessData` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user) {
        console.log('You are not logged in!')
        return res.status(200).json({ error: 'You are not logged in!' })
    }

    if (!req.body) {
        console.log('No body included!')

        return res.status(200).json({ error: 'No body included!' })
    }


    const sessionData = new FitnessData({
        heartRate: req.body.heartRate,
        distance: req.body.distance,
        duration: req.body.duration,
        date: req.body.date,
    })

    const timeStr = req.body.duration;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;

    await User.updateOne({ _id: user._id }, { $push: { sessions: sessionData } })
    await User.updateOne({ _id: user._id }, { $inc: { totalDistance: req.body.distance } })
    await User.updateOne({ _id: user._id }, { $inc: { numberOfRuns: 1 } })
    await User.updateOne({ _id: user._id }, { $max: { longestDistance: req.body.distance } });
    await User.updateOne({ _id: user._id }, { $inc: { totalDuration: totalMilliseconds } })
    await User.updateOne({ _id: user._id }, { $set: { lastRun: sessionData.date.toString() } })


    if (sessionData.distance >= 0) {
        await calculateXpFromSession(user, sessionData)
    }
    // if (req.body.distance > user.longestDistance) {
    //     console.log('longestDistance!')
    //     await User.updateOne({ _id: user._id }, { $set: { longestDistance: req.body.distance }});
    // }

    console.log('Session data uploaded!')

    const updatedUser = await User.findById(user._id);
    await checkForAchivements(updatedUser)


    return res.status(200).json({ error: 'Session data uploaded' })
}

export const fetchSessionData = async (req, res) => {
    console.log('Call to `/fetchSessionData` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user) {
        console.log('You are not logged in!')
        return res.status(200).json({ error: 'You are not logged in!' })
    }

    if (!req.body) {
        console.log('No body included!')

        return res.status(200).json({ error: 'No body included!' })
    }


    // try {
    // Assuming `User` is your user model and it has a `sessions` field.
    // Fetch the user again to get the most current session data.
    const userData = await User.findById(user._id);

    if (!userData) {
        return res.status(200).json({ error: 'User not found' });
    }

    console.log('Data fetched!');
    return res.status(200).json({
        status: 'success',
        data: userData.sessions, // Assuming sessions is the field you want to return
    });

    // } catch (error) {
    //     console.error('Error fetching session data:', error);
    //     return res.status(500).json({ error: 'Internal server error' });
    // }
}

export const fetchUserData = async (req, res) => {
    console.log('Call to `/fetchUserData` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user) {
        console.log('You are not logged in!')
        return res.status(401).json({ error: 'Session expired' })
    }

    if (!req.body) {
        console.log('No body included!')

        return res.status(200).json({ error: 'No body included!' })
    }


    // try {
    // Assuming `User` is your user model and it has a `sessions` field.
    // Fetch the user again to get the most current session data.
    const userData = await User.findById(user._id);

    if (!userData) {
        return res.status(200).json({ error: 'User not found' });
    }

    console.log('Data fetched!');
    return res.status(200).json({
        status: 'success',
        data: userData
    });

    // } catch (error) {
    //     console.error('Error fetching session data:', error);
    //     return res.status(500).json({ error: 'Internal server error' });
    // }
}

export const updateProfilePicture = async (req, res) => {
    console.log('Call to `/updateProfilePicture` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user) {
        console.log('You are not logged in!')
        return res.status(200).json({ error: 'You are not logged in!' })
    }

    if (!req.body) {
        console.log('No body included!')

        return res.status(200).json({ error: 'No body included!' })
    }

    // try {
    // Assuming `User` is your user model and it has a `sessions` field.
    // Fetch the user again to get the most current session data.

    await User.updateOne({ _id: user._id }, { $set: { profilePicture: req.body.profilePicture } })


    return res.status(200).json({ error: 'Profile Picture uploaded' })

}

export const createStreak = async (req, res) => {
    console.log('Call to `/createStreak` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user)
        return res.status(200).json({ error: 'You are not logged in!' })

    if (!req.body) {
        return res.status(200).json({ error: 'No body included!' })
    }

    if (!req.body.friendname) {
        return res.status(200).json({ error: 'Friend name not included!' })
    }

    const friend = await User.findOne({ username: req.body.friendname })

    if (!friend) {
        return res.status(200).json({ error: 'Friend name does not exist!' })
    }

    const targetRuns = req.body.targetRuns
    const currDate = new Date()

    const newStreak = await Streak.create({
        users: [user, friend],
        targetRuns,
        dateAnchor: currDate.setDate(currDate.getDate())
    });
    console.log(newStreak.dateAnchor)

    await User.findByIdAndUpdate(user, { $push: { streaks: newStreak._id } });
    await User.findByIdAndUpdate(friend, { $push: { streaks: newStreak._id } });

    console.log(`${user.username} started a streak with ${friend.username}`)

    return res.status(200).json({ error: 'FINISH' })

};

export const removeStreak = async (req, res) => {
    console.log('Call to `/removeStreak` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user)
        return res.status(200).json({ error: 'You are not logged in!' })

    if (!req.body) {
        return res.status(200).json({ error: 'No body included!' })
    }

    if (!req.body.friendname) {
        return res.status(200).json({ error: 'Friend name not included!' })
    }

    const friend = await User.findOne({ username: req.body.friendname })

    if (!friend) {
        return res.status(200).json({ error: 'Friend name does not exist!' })
    }

    const sharedStreak = user.streaks.find(streakId =>
        friend.streaks.some(friendStreakId => streakId.equals(friendStreakId))
    );

    if (!sharedStreak) {
        return res.status(200).json({ error: 'No shared streak!' })
    }

    await User.findByIdAndUpdate(user, { $pull: { streaks: sharedStreak._id } });
    await User.findByIdAndUpdate(friend, { $pull: { streaks: sharedStreak._id } });
    await Streak.findByIdAndDelete(sharedStreak._id);

    console.log(`${user.username} removed a streak with ${friend.username}`)

    return res.status(200).json({ error: 'FINISH' })
};


export const getStreak = async (req, res) => {
    console.log('Call to `/getStreak` endpoint')

    const user = await isLoggedIn(req, res)

    if (!user)
        return res.status(200).json({ error: 'You are not logged in!' })

    if (!req.body) {
        return res.status(200).json({ error: 'No body included!' })
    }

    if (!req.body.friendname) {
        return res.status(200).json({ error: 'Friend name not included!' })
    }

    const friend = await User.findOne({ username: req.body.friendname })

    if (!friend) {
        return res.status(200).json({ error: 'Friend name does not exist!' })
    }

    const sharedStreak = user.streaks.find(streakId =>
        friend.streaks.some(friendStreakId => streakId.equals(friendStreakId))
    );

    //console.log(sharedStreak)

    if (!sharedStreak) {
        return res.status(200).json({ error: 'No shared streak!' })
    }

    const streakObject = await Streak.findOne({ _id: sharedStreak })

    //console.log("-----\n" + streakObject)

    return res.status(200).json(streakObject)

};

export const tokenStatus = async (req, res) => {
    const user = await isLoggedIn(req, res)

    if (!user)
        return res.status(401).json({ error: 'Session expired' })

    return res.status(200).json({message:`success`})
}



