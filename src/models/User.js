const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config');

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, 'First Name is required'],
    },
    lastname: {
      type: String,
      required: [true, 'Last Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Invalid email address',
      ],
    },
    role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password length required: 8'],
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'Users',
  }
);

UserSchema.pre('save', async function check(next) {
  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.getSignedJwtToken = function getToken() {
  // eslint-disable-next-line no-underscore-dangle
  return jwt.sign({ id: this._id }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};

UserSchema.methods.matchPassword = function checkPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = model('User', UserSchema);
