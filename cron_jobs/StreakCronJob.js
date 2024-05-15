import cron from 'node-cron';
import { Streak } from '../models/Streak.js';
import { User } from '../models/User.js';

const updateStreaksDaily = async () => {

    console.log('UpdateStreaksDaily ran at ' + new Date(Date.now()));

    const streaks = await Streak.find().populate('users');
  
    streaks.forEach(async(streak) => {

        const currDate = new Date(Date.now())
        currDate.setDate(currDate.getDate())

        const tempDate = new Date()
        tempDate.setDate(streak.dateAnchor.getDate() + 7)


        if(currDate >= (tempDate) && streak.streakChecked){
            streak.streakChecked = false;
            streak.dateAnchor = currDate
        } else if (currDate > (tempDate) && !streak.streakChecked){
            streak.currentStreak = 0;
            streak.streakChecked = false;
            streak.dateAnchor = currDate
        } else if(!streak.streakChecked){
            var streakHit = true
            
            for (const userId of streak.users) {
                const user = await User.findById(userId);
                    
                const streakSessions = user.sessions.filter(session =>
                     new Date(session.date) >= new Date(streak.dateAnchor),
                );
  
                console.log(streakSessions.length)
    
                if (streakSessions.length < streak.targetRuns){
                    streakHit = false
                } 
    
            }

            if(streakHit){
                streak.currentStreak += 1
                streak.streakChecked = true
                updateHighestStreak(streak.users, streak.currentStreak)
            }
  
        }

        streak.save()
  
    })  
};

const updateHighestStreak = async (users, currentStreak) => {

    for (const userId of users) {
        const user = await User.findById(userId);

        if(user.highestStreak < currentStreak){
            await User.findByIdAndUpdate(user, { $set: { highestStreak: currentStreak }})
        }

    }

};

//Runs every day at 00:00
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled cron  jobs:');
  updateStreaksDaily();
});