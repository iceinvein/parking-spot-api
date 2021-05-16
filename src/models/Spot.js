const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const SpotSchema = new Schema(
  {
    number: {
      type: Number,
      required: [true, 'Please provide spot number.'],
    },
    availableDate: {
      type: Date,
      required: [true, 'Available date is required.'],
    },
    owner: {
      type: String,
      required: true,
    },
    claimedBy: {
      type: String,
    },
  },
  {
    collection: 'Spot',
  }
);

SpotSchema.index(
  {
    number: 1,
    availableDate: 1,
  },
  {
    unique: true,
  }
);

module.exports = model('Spot', SpotSchema);
