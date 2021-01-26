const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true
    },
    profile_image_url: {
      type: String,
      required: true
    },
    twitch: {
      id: { type: String, required: true },
      accessToken: { type: String, required: true },
      refreshToken: { type: String, required: true }
    },
    meethue: {
      connected: { type: Boolean, default: false },
      username: String,
      accessToken: String,
      refreshToken: String,
      expiresIn: String
    },
    channelPoint: {
      default: String
    },
    lightgroup: {
      default: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', UserSchema);
