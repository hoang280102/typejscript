import { Collection, Db, MongoClient } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/Users.schemas'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
// console.log(process.env.USERNAME)
const password = process.env.PASSWORD_DATABASE
const username = process.env.USERNAME_DATABASE
const uri = `mongodb+srv://${username}:${password}@typescript.lhpugvh.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri)

class DatabaseService {
  private client: MongoClient
  private Db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.Db = this.client.db(process.env.NAME_DATABASE)
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.Db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.log(err)
    }
    // } finally {
    //   // Ensures that the client will close when you finish/error
    //   await this.client.close()
    // }
  }
  get users(): Collection<User> {
    return this.Db.collection(process.env.COLLECTION_DATABASE as string)
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.Db.collection(process.env.REFRESH_TOKEN_DATABASE as string)
  }
}
const databaseService = new DatabaseService()
export default databaseService
