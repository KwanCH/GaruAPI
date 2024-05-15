import mongoose from 'mongoose'

const FitnessSchema = new mongoose.Schema({
    heartRate: Number,
    distance: Number,
    duration: String,
    date: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'fitness_data',
})

export { FitnessSchema }
export const FitnessData = mongoose.model('FitnessData', FitnessSchema)