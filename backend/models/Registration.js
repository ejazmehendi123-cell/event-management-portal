const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

// A user can register for the same event only once (re-registration after
// cancellation is handled in the controller instead of a hard unique index).
registrationSchema.index({ user: 1, event: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
