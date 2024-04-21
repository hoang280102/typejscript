import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/Users.schemas'
import databaseService from '~/services/database.services'
import { hashPassword } from './bcrypt'
import Follower from '~/models/schemas/Follower.schema'
import tweetsService from '~/services/tweets.services'

const PASSWORD = 'Hoang123!'
// id cuả mk để đi follow người khác
const myID = new ObjectId('65b135963b4f430369bb75e6')
const user_count = 100

const createRandomUser = () => {
  const user: RegisterRequestBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    day_of_birth: faker.date.past().toISOString()
  }
  return user
}
const createRandomTweet = () => {
  const tweet: TweetRequestBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    parent_id: null,
    hashtags: [],
    mentions: [],
    medias: []
  }
  return tweet
}

const users: RegisterRequestBody[] = faker.helpers.multiple(createRandomUser, { count: user_count })

const insertMultipleUsers = async (users: RegisterRequestBody[]) => {
  console.log('creating users...')
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      const HashPassword = await hashPassword(user.password)
      await databaseService.users.insertOne(
        new User({
          ...user,
          username: `user${user_id.toString()}`,
          password: HashPassword,
          date_of_birth: new Date(user.day_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`created ${result.length} users`)
  return result
}

const followMultupleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  console.log('Start following...')
  const result = await Promise.all(
    followed_user_ids.map((followed_user_id) =>
      databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
    )
  )
  console.log(`Followed ${result.length} users`)
}

const insertMultipleTweets = async (ids: ObjectId[]) => {
  console.log('creating tweets...')
  console.log('counting ..')
  let count = 0
  const result = await Promise.all(
    ids.map(async (id, index) => {
      await Promise.all([
        tweetsService.createTweet(id.toString(), createRandomTweet()),
        tweetsService.createTweet(id.toString(), createRandomTweet())
      ])
      count += 2
      console.log(`created ${count} tweets`)
    })
  )
  return result
}

insertMultipleUsers(users).then((ids) => {
  followMultupleUsers(new ObjectId(myID), ids), insertMultipleTweets(ids)
})
