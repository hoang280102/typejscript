import { Request } from 'express'
//middleware login
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import httpStatus from '~/constants/httpStatus'
import { usersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { decodePassword } from '~/utils/bcrypt'
import { verifyToken } from '~/utils/jwt'

import { validate } from '~/utils/validation'
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: usersMessages.EMAIL_IS_INVALID
        },
        notEmpty: { errorMessage: usersMessages.NAME_IS_REQUIRED },
        trim: true,
        errorMessage: 'Please enter email',
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })

            if (!user) {
              throw new Error(usersMessages.EMAIL_OR_PASSWORD)
            }
            decodePassword(req.body.password, user.password)
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: usersMessages.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: usersMessages.PASSWORD_MUST_BE_A_STRING
        },
        isStrongPassword: {
          errorMessage: usersMessages.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        isString: {
          errorMessage: usersMessages.NAME_MUST_BE_A_STRING
        },
        notEmpty: {
          errorMessage: usersMessages.NAME_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 6,
            max: 255
          },
          errorMessage: usersMessages.NAME_LENGTH_MUST_BE_FROM_6_TO_255
        },
        trim: true,
        errorMessage: 'Please enter least min 6 characters'
      },
      email: {
        isEmail: {
          errorMessage: usersMessages.EMAIL_IS_INVALID
        },
        notEmpty: { errorMessage: usersMessages.NAME_IS_REQUIRED },
        trim: true,
        errorMessage: 'Please enter email',
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(usersMessages.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: usersMessages.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: usersMessages.PASSWORD_MUST_BE_A_STRING
        },
        isStrongPassword: {
          errorMessage: usersMessages.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: usersMessages.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: usersMessages.CONFIRM_PASSWWORD_MUST_BE_FROM_8_TO_100
        },
        isStrongPassword: {
          errorMessage: usersMessages.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(usersMessages.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
            }
            return true
          }
        }
      },
      day_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          }
        },
        errorMessage: usersMessages.DAY_OF_BIRTH
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        // notEmpty: {
        //   errorMessage: usersMessages.ACCESS_TOKEN_IS_REQUIRED
        // },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token)
              throw new ErrorWithStatus({
                message: usersMessages.ACCESS_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secret_public_key: process.env.JWT_SECRET_KEY_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorzation = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: httpStatus.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refereshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        // notEmpty: {
        //   errorMessage: usersMessages.REFRESH_TOKEN_IS_REQUIRED
        // },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: usersMessages.REFRESH_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secret_public_key: process.env.JWT_SECRET_KEY_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: usersMessages.REFRESH_TOKEN_IS_USED_OR_NOT_EXIST,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      // notEmpty: {
      //   errorMessage: usersMessages.EMAIL_VERIFY_TOKEN_IS_REQUIRED
      // }
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: usersMessages.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }
          try {
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secret_public_key: process.env.JWT_SECRET_KEY_EMAIL_VERIFY_TOKEN as string
            })
            ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
          } catch (error) {
            throw new ErrorWithStatus({
              message: capitalize((error as JsonWebTokenError).message),
              status: httpStatus.UNAUTHORIZED
            })
          }

          return true
        }
      }
    }
  })
)
