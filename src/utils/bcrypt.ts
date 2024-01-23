import bcrypt from 'bcrypt'
export function hashPassword(password: string) {
  const saltRounds = 10
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
export async function decodePassword(password: string, hashPassword: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashPassword, (err, result) => {
      if (err) throw reject(err)
      resolve(result)
    })
  })
}
