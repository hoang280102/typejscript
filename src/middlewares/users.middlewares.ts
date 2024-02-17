import { NextFunction, Request } from 'express'
import { validate } from '~/utils/validation'
//middleware login
import { ParamSchema, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import httpStatus from '~/constants/httpStatus'
import { usersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { decodePassword } from '~/utils/bcrypt'
import { verifyToken } from '~/utils/jwt'
import { TokenPayLoad } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enum'
import { REGEX_USERNAME } from '~/constants/regex'

const passwordSchema: ParamSchema = {
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

const confirmPasswordSchema: ParamSchema = {
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
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: usersMessages.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: httpStatus.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secret_public_key: process.env.JWT_SECRET_KEY_FORGOT_PASSWORD_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (user === null) {
          throw new ErrorWithStatus({
            message: usersMessages.USER_NOT_FOUND,
            status: httpStatus.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: usersMessages.INVALID_FORGOT_PASSWORD_TOKEN,
            status: httpStatus.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({ message: capitalize(error.message), status: httpStatus.UNAUTHORIZED })
        }
        throw error
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  optional: true,
  notEmpty: {
    errorMessage: usersMessages.ACCESS_TOKEN_IS_REQUIRED
  },
  isString: {
    errorMessage: usersMessages.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 255
    },
    errorMessage: usersMessages.NAME_LENGTH_MUST_BE_FROM_6_TO_255
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: usersMessages.DAY_OF_BIRTH
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: { errorMessage: usersMessages.COVER_PHOTO_MUST_BE_STRING },
  trim: true,
  isLength: {
    options: {
      min: 6,
      max: 255
    },
    errorMessage: usersMessages.COVER_PHOTO_LENGTH
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: usersMessages.INVALID_USER_ID,
          status: httpStatus.NOT_FOUND
        })
      }
      const followed_user = await databaseService.users.findOne({
        _id: new ObjectId(value)
      })
      // console.log(followed_user)
      if (followed_user === null) {
        throw new ErrorWithStatus({
          message: usersMessages.NOT_FOUND_FOLLOWED_USER,
          status: httpStatus.NOT_FOUND
        })
      }
    }
  }
}

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
            // console.log('value:', value)
            const user = await databaseService.users.findOne({
              email: value
            })
            // console.log(user)
            if (!user) {
              throw new Error(usersMessages.EMAIL_OR_PASSWORD)
            }

            const result = await decodePassword(req.body.password, user.password)
            // console.log(result)
            if (!result) {
              throw new ErrorWithStatus({
                message: usersMessages.PASSWORD_IS_WRONG,
                status: httpStatus.UNAUTHORIZED
              })
            }
            req.user = user
            return true
          }
        }
      },
      // password: {
      //   notEmpty: {
      //     errorMessage: usersMessages.PASSWORD_IS_REQUIRED
      //   },
      //   isString: {
      //     errorMessage: usersMessages.PASSWORD_MUST_BE_A_STRING
      //   },
      //   isStrongPassword: {
      //     errorMessage: usersMessages.PASSWORD_MUST_BE_STRONG
      //   }
      // }
      password: passwordSchema
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
      // password: {
      //   notEmpty: {
      //     errorMessage: usersMessages.PASSWORD_IS_REQUIRED
      //   },
      //   isString: {
      //     errorMessage: usersMessages.PASSWORD_MUST_BE_A_STRING
      //   },
      //   isStrongPassword: {
      //     errorMessage: usersMessages.PASSWORD_MUST_BE_STRONG
      //   }
      // },
      // confirm_password: {
      //   notEmpty: {
      //     errorMessage: usersMessages.CONFIRM_PASSWORD_IS_REQUIRED
      //   },
      //   isString: {
      //     errorMessage: usersMessages.CONFIRM_PASSWWORD_MUST_BE_FROM_8_TO_100
      //   },
      //   isStrongPassword: {
      //     errorMessage: usersMessages.CONFIRM_PASSWORD_MUST_BE_STRONG
      //   },
      //   custom: {
      //     options: (value, { req }) => {
      //       if (value !== req.body.password) {
      //         throw new Error(usersMessages.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      //       }
      //       return true
      //     }
      //   }
      // },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
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
              // console.log(decoded_authorization)
              ;(req as Request).decoded_authorzation = decoded_authorization
              // console.log((req as Request).decoded_authorzation)
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

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: usersMessages.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })

            if (!user) {
              throw new Error(usersMessages.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      // forgot_password_token: {
      //   trim: true,
      //   custom: {
      //     options: async (value: string, { req }) => {
      //       if (!value) {
      //         throw new ErrorWithStatus({
      //           message: usersMessages.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
      //           status: httpStatus.UNAUTHORIZED
      //         })
      //       }
      //       try {
      //         // const [refresh_token] = await Promise.all([
      //         //   verifyToken({
      //         //     token: value,
      //         //     secret_public_key: process.env.JWT_SECRET_KEY_FORGOT_PASSWORD_TOKEN as string
      //         //   }),
      //         //   databaseService.refreshTokens.findOne({ token: value })
      //         // ])
      //         const decoded_forgot_password_token = await verifyToken({
      //           token: value,
      //           secret_public_key: process.env.JWT_SECRET_KEY_FORGOT_PASSWORD_TOKEN as string
      //         })
      //         const { user_id } = decoded_forgot_password_token
      //         const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
      //         if (user === null) {
      //           throw new ErrorWithStatus({
      //             message: usersMessages.USER_NOT_FOUND,
      //             status: httpStatus.UNAUTHORIZED
      //           })
      //         }
      //         if (user.forgot_password_token !== value) {
      //           throw new ErrorWithStatus({
      //             message: usersMessages.INVALID_FORGOT_PASSWORD_TOKEN,
      //             status: httpStatus.UNAUTHORIZED
      //           })
      //         }
      //       } catch (error) {
      //         if (error instanceof JsonWebTokenError) {
      //           throw new ErrorWithStatus({ message: capitalize(error.message), status: httpStatus.UNAUTHORIZED })
      //         }
      //         throw error
      //       }
      //       return true
      //     }
      //   }
      // }
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorzation as TokenPayLoad
  // console.log(req.decoded_authorzation)
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: usersMessages.USER_NOT_VERIFIED,
        status: httpStatus.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: { errorMessage: usersMessages.BIO_MUST_BE_STRING },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 255
          },
          errorMessage: usersMessages.BIO_LENGTH
        }
      },
      location: {
        optional: true,
        isString: { errorMessage: usersMessages.LOCATION_MUST_BE_STRING },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 255
          },
          errorMessage: usersMessages.LOCALTION_LENGTH
        }
      },
      website: {
        optional: true,
        isString: { errorMessage: usersMessages.WEBSITE_MUST_BE_STRING },
        trim: true,
        isLength: {
          options: {
            min: 6,
            max: 255
          },
          errorMessage: usersMessages.WEBSITE_LENGTH
        }
      },
      username: {
        optional: true,
        isString: { errorMessage: usersMessages.USERNAME_MUST_BE_STRING },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new ErrorWithStatus({
                message: usersMessages.USERNAME_LENGTH,
                status: httpStatus.NOT_FOUND
              })
            }
            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              throw new ErrorWithStatus({
                message: usersMessages.USERNAME_EXISTED,
                status: httpStatus.NOT_FOUND
              })
            }
          }
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: usersMessages.USERNAME_LENGTH
        }
      },
      // avatar: {
      //   trim: true,
      //   optional: true,
      //   isString: { errorMessage: usersMessages.AVATAR_MUST_BE_STRING },
      //   isLength: {
      //     options: {
      //       min: 6,
      //       max: 255
      //     },
      //     errorMessage: usersMessages.AVATAR_LENGTH
      //   }
      // },
      avatar: imageSchema,
      // cover_photo: {
      //   trim: true,
      //   optional: true,
      //   isString: { errorMessage: usersMessages.COVER_PHOTO_MUST_BE_STRING },
      //   isLength: {
      //     options: {
      //       min: 6,
      //       max: 255
      //     },
      //     errorMessage: usersMessages.COVER_PHOTO_LENGTH
      //   }
      // }
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      // followed_user_id: {
      //   custom: {
      //     options: async (value: string, { req }) => {
      //       if (!ObjectId.isValid(value)) {
      //         throw new ErrorWithStatus({
      //           message: usersMessages.INVALID_FOLLOWED_USER_ID,
      //           status: httpStatus.NOT_FOUND
      //         })
      //       }
      //       const followed_user = await databaseService.users.findOne({
      //         _id: new ObjectId(value)
      //       })
      //       // console.log(followed_user)
      //       if (followed_user === null) {
      //         throw new ErrorWithStatus({
      //           message: usersMessages.NOT_FOUND_FOLLOWED_USER,
      //           status: httpStatus.NOT_FOUND
      //         })
      //       }
      //     }
      //   }
      // }
      followed_user_id: userIdSchema
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema
    },
    ['params']
  )
)

export const changPasswordValidator = validate(
  checkSchema({
    old_password: {
      ...passwordSchema,
      custom: {
        options: async (value: string, { req }) => {
          // console.log('value:', value)
          const { user_id } = (req as Request).decoded_authorzation as TokenPayLoad
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithStatus({
              message: usersMessages.USER_NOT_FOUND,
              status: httpStatus.NOT_FOUND
            })
          }
          const { password } = user

          const isMatch = await decodePassword(value, password)

          if (!isMatch) {
            throw new ErrorWithStatus({
              message: usersMessages.OLD_PASSWORD_MISMATCH,
              status: httpStatus.UNAUTHORIZED
            })
          }
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema
  })
)
