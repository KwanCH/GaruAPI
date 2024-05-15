import { User } from "../models/User.js"
import { FitnessData } from '../models/FitnessData.js'

async function calculateXpFromSession(user, session) {
    //const xp = session.distance / 1000
    const xp = 400

    //todo her kan vi også sjekke ulike status på Total Distance
    //todo longest distance for å gi bonus xp

    await calculateLevelFromXp(user, xp)

}

async function calculateLevelFromXp(user, xp) {
    console.log('/calculateLevelFromXp')
    let currentXP = user.levelDetail.xp + xp
    let currentLvl = user.levelDetail.lvl
    let xpCap = user.levelDetail.nextLvl
    console.log('Current xp', currentXP)
    console.log('Current xpCap', xpCap)

    if (currentXP >= xpCap) {
        console.log('Time to level up')

        currentLvl += 1
        currentXP = currentXP - xpCap
        xpCap = getNextLevelXp(currentLvl)

        //This is suppose to handle the case when the user have gained enough XP to at least level up twice
        if (currentXP >= xpCap) {
            while (currentXP >= xpCap) {
                currentLvl += 1
                currentXP = currentXP - xpCap
                xpCap = getNextLevelXp(currentLvl)
            }
        }


        await User.updateOne({ _id: user._id }, {
            $set: {
                "levelDetail.lvl": currentLvl,
                "levelDetail.xp": currentXP,
                "levelDetail.nextLvl": xpCap
            }
        });

    } else {
        console.log('Not enough to level up')

        await User.updateOne({ _id: user._id }, {
            $set: {
                "levelDetail.xp": currentXP,
            }
        });
    }

}

function getNextLevelXp(currentLevel) {
    const growthRate = 1
    const baseXP = 100
    return Math.floor(baseXP * (currentLevel ** growthRate))
}

function getTotalXP(user){
    const growthRate = 1
    const baseXP = 100

    let totalXP = 0
    for(let i = 1; i < user.levelDetail.lvl; i++){
        totalXP += Math.floor(baseXP * (i ** growthRate))
    }

    return totalXP + user.levelDetail.xp
}

export {
    calculateXpFromSession,
    getTotalXP,
};