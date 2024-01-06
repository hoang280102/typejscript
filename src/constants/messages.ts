export const usersMessages = {
  VALIDATION_ERROR: 'Validation error',
  EMAIL_ALREADY_EXISTS: 'Email already exists!',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_6_TO_255: 'Name length must be greater than 6',
  EMAIL_OR_PASSWORD: 'email or password incorrect',
  EMAIL_IS_INVALID: 'EmaiL is invalid',
  USER_NOT_FOUND: 'User not found',
  PASSWORD_IS_REQUIRED: ' password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_8_TO_100: 'Password length must be greater than 8',
  PASSWORD_MUST_BE_STRONG:
    'Password must be strong greater than 1 lowercase,1 characters,1 symbols, 1 numbers, 1 uppercase',
  CONFIRM_PASSWORD_IS_REQUIRED: 'confirm password is required',
  CONFIRM_PASSWWORD_MUST_BE_FROM_8_TO_100: 'confirm password must be a string',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'confirm password must be strong greater than 1 lowercase,1 characters,1 symbols, 1 numbers, 1 uppercase',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD:
    'confirm password must be the same as must be the same as must be password',
  DAY_OF_BIRTH: ' date of bith must be ISO 8601 ',
  REFRESH_TOKEN_IS_REQUIRED: 'refresh token is required',
  ACCESS_TOKEN_IS_REQUIRED: 'access token is required',
  ACCESS_TOKEN_IS_VALID: 'access token is valid',
  REFRESH_TOKEN_IS_VALID: 'refresh token is valid',
  REFRESH_TOKEN_IS_USED_OR_NOT_EXIST: 'refresh token is used or not exist',
  LOG_OUT_SUCCESS: 'log out successfully',
  REGISTER_SUCCESS: 'register successfully',
  LOGIN_SUCCESS: 'login successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'email verification token is required',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'email verified successfully before',
  EMAIL_VERIFY_SUCCESS: 'email verified successfully'
} as const
