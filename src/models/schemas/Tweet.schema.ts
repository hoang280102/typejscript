import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Orther'

interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  create_at?: Date
  update_at?: Date
}

export default class Twitter {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  create_at: Date
  update_at: Date
  constructor(TweetOop: TweetConstructor) {
    const date = new Date()
    this._id = TweetOop._id ?? new ObjectId()
    // this.user_id = TweetOop.user_id ?? new ObjectId()
    this.user_id = TweetOop.user_id
    this.type = TweetOop.type
    this.audience = TweetOop.audience
    this.content = TweetOop.content
    this.parent_id = TweetOop.parent_id ? new ObjectId(TweetOop.parent_id) : null
    this.hashtags = TweetOop.hashtags
    this.mentions = TweetOop.mentions.map((item) => new ObjectId(item))
    this.medias = TweetOop.medias
    this.guest_views = TweetOop.guest_views || 0
    this.user_views = TweetOop.user_views || 0
    this.create_at = TweetOop.create_at || date
    this.update_at = TweetOop.update_at || date
  }
}
