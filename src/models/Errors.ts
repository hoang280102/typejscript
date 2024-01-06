import httpStatus from '~/constants/httpStatus'
import { usersMessages } from '~/constants/messages'

type ErrorsType = Record<
  string,
  {
    msg: string
    // locations: string
    // value: any
    // path: string
    [key: string]: any
  }
> //{[key:string]:object}
export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = usersMessages.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
