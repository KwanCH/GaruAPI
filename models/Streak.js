// models/Streak.js
import mongoose from 'mongoose';

const StreakSchema = new mongoose.Schema({
  users: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  currentStreak: { type: Number, default: 0 },
  dateAnchor: { type: Date, required: true },
  streakChecked: { type: Boolean, default: false},
  targetRuns: { type: Number, required: true }
}, {
  timestamps: true,
  collection: 'streaks',
});

export { StreakSchema }
export const Streak = mongoose.model('Streak', StreakSchema);
