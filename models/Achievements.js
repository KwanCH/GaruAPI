import mongoose from 'mongoose'

const AchievementsSchema = new mongoose.Schema({
    totalAchieved: {
        type: Number,
        default: 0
    },

    firstSteps: {
        name: { type: String, default: 'First Steps' },
        description: { type: String, default: 'Complete your first run or workout session' },
        category: { type: String, default: 'General' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    consistencyChampion: {
        name: { type: String, default: 'Consistency Champion' },
        description: { type: String, default: 'Log a workout for 7 consecutive days' },
        category: { type: String, default: 'General' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    nightOwl: {
        name: { type: String, default: 'Night Owl' },
        description: { type: String, default: 'Complete a workout session between 21:00 and 04:00' },
        category: { type: String, default: 'General' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    earlyBird: {
        name: { type: String, default: 'Early Bird' },
        description: { type: String, default: 'Complete a workout session between 05:00 and 07:00' },
        category: { type: String, default: 'General' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    centuryClub: {
        name: { type: String, default: 'Century Club' },
        description: { type: String, default: 'Log 100 total workouts' },
        category: { type: String, default: 'General' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    collector: {
        name: { type: String, default: 'Collector' },
        description: { type: String, default: 'Unlock 10 different achievements.' },
        category: { type: String, default: 'General' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    fiveKfinisher: {
        name: { type: String, default: '5K Finisher' },
        description: { type: String, default: 'Complete a total of 5 kilometers in one session.' },
        category: { type: String, default: 'Distance-Based' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    marathoner: {
        name: { type: String, default: 'Marathoner' },
        description: { type: String, default: 'Complete a distance of 42.195 kilometers cumulatively.' },
        category: { type: String, default: 'Distance-Based' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    globetrotter: {
        name: { type: String, default: 'Globetrotter' },
        description: { type: String, default: "Cover a distance equal to the Earth's equator (40,075 kilometers) cumulatively." },
        category: { type: String, default: 'Distance-Based' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    hourglass: {
        name: { type: String, default: 'Hourglass' },
        description: { type: String, default: 'Accumulate a total of 24 hours of workout time.' },
        category: { type: String, default: 'Time-Based' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    theLongHaul: {
        name: { type: String, default: 'The Long Haul' },
        description: { type: String, default: 'Complete a single session lasting more than 40 minutes.' },
        category: { type: String, default: 'Time-Based' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    socialButterfly: {
        name: { type: String, default: 'Social Butterfly' },
        description: { type: String, default: 'Add 5 people as your friends' },
        category: { type: String, default: 'Social' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    motivator: {
        name: { type: String, default: 'Motivator' },
        description: { type: String, default: 'Start a streak with 3 friend' },
        category: { type: String, default: 'Social' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    newYearsResolution: {
        name: { type: String, default: 'New Year’s Resolution' },
        description: { type: String, default: 'Log a workout on January 1st.' },
        category: { type: String, default: 'Special' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    christmasGrind: {
        name: { type: String, default: 'Christmas Grind' },
        description: { type: String, default: 'Complete a workout on christmas eve.' },
        category: { type: String, default: 'Special' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    levelUp: {
        name: { type: String, default: 'Level Up' },
        description: { type: String, default: 'Reach level 10 in the app’s leveling system.' },
        category: { type: String, default: 'Progress' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

    xpCollector: {
        name: { type: String, default: 'XP Collector' },
        description: { type: String, default: 'Earn 10,000 XP points.' },
        category: { type: String, default: 'Progress' },
        achieved: { type: Boolean, default: false },
        dateAchieved: String,
    },

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'achievements',
});

export { AchievementsSchema }
export const Achievements = mongoose.model('Achievements', AchievementsSchema);

