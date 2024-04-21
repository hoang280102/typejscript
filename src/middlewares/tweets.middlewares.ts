import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import httpStatus from '~/constants/httpStatus'
import { tweetsMessages, usersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Twitter from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { numberEnumArray } from '~/utils/commons'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'
const tweetsType = numberEnumArray(TweetType)
const tweetAduience = numberEnumArray(TweetAudience)
const mediatype = numberEnumArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetsType],
        errorMessage: tweetsMessages.INVALID_TYPE
      }
    },
    aduience: {
      isIn: {
        options: [tweetAduience],
        errorMessage: tweetsMessages.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: async (value, { req }) => {
          const type = req.body.type as TweetType
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(tweetsMessages.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(tweetsMessages.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: async (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(tweetsMessages.CONTENT_MUST_BE_A_NOT_EMPTY_STRING)
          }
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(tweetsMessages.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: async (value, { req }) => {
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error(tweetsMessages.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRINGS)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: async (value, { req }) => {
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error(tweetsMessages.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: async (value, { req }) => {
          if (
            !value.every((item: any) => {
              return typeof item.url === 'string' || mediatype.includes(item.type)
            })
          ) {
            throw new Error(tweetsMessages.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isMongoId: {
          errorMessage: tweetsMessages.INVALID_TWEET_ID
        },
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: httpStatus.BAD_REQUEST,
                message: tweetsMessages.INVALID_TWEET_ID
              })
            }
            // const tweet = await databaseService.tweets.findOne({
            //   _id: new ObjectId(value)
            // })
            const tweet = (
              await databaseService.tweets
                .aggregate<Twitter>([
                  {
                    $match: {
                      _id: new ObjectId(value)
                    }
                  },
                  {
                    $lookup: {
                      from: 'hashtag',
                      localField: 'hashtags',
                      foreignField: '_id',
                      as: 'hashtags'
                    }
                  },
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'mentions',
                      foreignField: '_id',
                      as: 'mentions'
                    }
                  },
                  {
                    $addFields: {
                      mentions: {
                        $map: {
                          input: '$mentions',
                          as: 'mention',
                          in: {
                            _id: '$$mention._id',
                            name: '$$mention.name',
                            username: '$$mention.username'
                          }
                        }
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: 'bookmark',
                      localField: '_id',
                      foreignField: 'tweet_id',
                      as: 'bookmarks'
                    }
                  },
                  {
                    $lookup: {
                      from: 'like',
                      localField: '_id',
                      foreignField: 'tweet_id',
                      as: 'likes'
                    }
                  },
                  {
                    $lookup: {
                      from: 'tweets',
                      localField: '_id',
                      foreignField: 'parent_id',
                      as: 'tweet_children'
                    }
                  },
                  {
                    $addFields: {
                      bookmarks: {
                        $size: '$bookmarks'
                      },
                      likes: {
                        $size: '$likes'
                      },
                      retweet_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', 1]
                            }
                          }
                        }
                      },
                      comment_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', 2]
                            }
                          }
                        }
                      },
                      quote_count: {
                        $size: {
                          $filter: {
                            input: '$tweet_children',
                            as: 'item',
                            cond: {
                              $eq: ['$$item.type', 3]
                            }
                          }
                        }
                      },
                      views: {
                        $add: ['$user_views', '$guest_views']
                      }
                    }
                  },
                  {
                    $project: {
                      tweet_children: 0
                    }
                  }
                ])
                .toArray()
            )[0]
            if (!tweet) {
              throw new ErrorWithStatus({
                status: httpStatus.NOT_FOUND,
                message: tweetsMessages.TWEET_NOT_FOUND
              })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

//muốn xử dụng async/await trong handler express thì phải có try/catch

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Twitter
  if (tweet.audience === TweetAudience.TwitterCircle) {
    if (!req.decoded_authorzation) {
      throw new ErrorWithStatus({
        status: httpStatus.UNAUTHORIZED,
        message: usersMessages.ACCESS_TOKEN_IS_REQUIRED
      })
    }
    // const { user_id } = req.decoded_authorzation
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: httpStatus.NOT_FOUND,
        message: usersMessages.USER_NOT_FOUND
      })
    }
    //kiểm tra người xem này có trong tweeter circle của tác giả hay ko
    const { user_id } = req.decoded_authorzation
    const isInTweeterCircle = author.tweetCircle?.some((user_circle_id) => user_circle_id.equals(user_id))
    //Nếu bạn không phải là tác giả và không nằm trong tweeter circle thì quăng ra lỗi
    if (!author._id.equals(user_id) && !isInTweeterCircle) {
      throw new ErrorWithStatus({
        status: httpStatus.FORBIDDEN,
        message: tweetsMessages.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next()
})

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetsType],
          errorMessage: tweetsMessages.INVALID_TYPE
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page>=1')
            }
          }
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetsType],
          errorMessage: tweetsMessages.INVALID_TYPE
        }
      }
    },
    ['query']
  )
)
