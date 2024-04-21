import { ObjectId } from 'mongodb'

interface BookmarkType {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  create_at?: Date
}

export class Bookmark {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  create_at?: Date
  constructor(bookmark: BookmarkType) {
    this._id = bookmark._id ?? new ObjectId()
    this.user_id = bookmark.user_id
    this.tweet_id = bookmark.tweet_id
    this.create_at = bookmark.create_at ?? new Date()
  }
}
