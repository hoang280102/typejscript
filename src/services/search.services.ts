import { SearchQuery } from '~/models/requests/search.request'
import databaseService from './database.services'
import { TweetType } from '~/constants/enum'

class SearchService {
  async search({ limit, page, content }: { limit: number; page: number; content: string }) {
    const data = await databaseService.tweets.aggregate([
      {
        $match: {
          $text: {
            $search: content
          }
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
                  $eq: ['$$item.type', TweetType.Retweet]
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
                  $eq: ['$$item.type', TweetType.Comment]
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
                  $eq: ['$$item.type', TweetType.QuoteTweet]
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
      },
      {
        $skip: limit * (page - 1)
      },
      {
        $limit: limit
      }
    ])
    // .find({ $text: { $search: content } })
    // .skip(limit * (page - 1))
    // .limit(limit)
    // .toArray()
    return data
  }
}
const searchService = new SearchService()
export default searchService
