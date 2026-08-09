const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Business', 'Music', 'Sports', 'Education', 'Arts', 'Other'],
      default: 'Other',
    },
    date: { type: Date, required: [true, 'Event date is required'] },
    time: { type: String, required: [true, 'Event time is required'] },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    capacity: { type: Number, required: true, min: [1, 'Capacity must be at least 1'] },
    imageUrl: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Event', eventSchema);
