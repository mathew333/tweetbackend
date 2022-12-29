const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FriendRequestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    requestStatus: {
      type: String,
    }
  },
  { timestamps: true },
)

module.exports = mongoose.model('FriendRequest', FriendRequestSchema)
