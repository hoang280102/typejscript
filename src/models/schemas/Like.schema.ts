import { ObjectId } from 'mongodb'

interface LikeTypes {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  create_at?: Date
}
export class Like {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  create_at: Date
  constructor(like: LikeTypes) {
    this._id = like._id || new ObjectId()
    this.user_id = like.user_id
    this.tweet_id = like.tweet_id
    this.create_at = like.create_at || new Date()
  }
}
