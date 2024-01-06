import bcrypt from 'bcrypt'
export function hashPassword(password: string) {
  const saltRounds = 10
  // const salt = bcrypt.genSaltSync(saltRounds)
  // const hashPassword = bcrypt.hashSync(password, salt)
  // return hashPassword
  return new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) throw reject(err)
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw reject(err)
        resolve(hash)
      })
    })
  })
}
export function decodePassword(password: string, hashPassword: string) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashPassword, (err, result) => {
      if (err) throw reject(err)
      resolve(result)
    })
  })
}
