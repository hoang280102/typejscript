import { TokenPayLoad } from './../models/requests/User.requests'
import jwt, { SignOptions } from 'jsonwebtoken'
import 'dotenv/config'

export const signToken = ({
  payload,
  // privatekey = process.env.JWT_SECRET_KEY as string,
  privatekey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | object | Buffer
  privatekey: string
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privatekey, options, (err, token) => {
      if (err) throw reject(err)
      resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  // secret_public_key = process.env.JWT_SECRET_KEY as string
  secret_public_key
}: {
  token: string
  secret_public_key: string
}) => {
  return new Promise<TokenPayLoad>((resolve, reject) => {
    jwt.verify(token, secret_public_key, (err, decoded) => {
      if (err) throw reject(err)
      resolve(decoded as TokenPayLoad)
    })
  })
}
