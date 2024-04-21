import { Request } from 'express'
import User from './models/schemas/Users.schemas'
import { TokenPayLoad } from './models/requests/User.requests'
import Twitter from './models/schemas/Tweet.schema'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorzation?: TokenPayLoad
    decoded_refresh_token?: TokenPayLoad
    decoded_email_verify_token?: TokenPayLoad
    decoded_forgot_password_token?: TokenPayLoad
    tweet?: Twitter
  }
}
