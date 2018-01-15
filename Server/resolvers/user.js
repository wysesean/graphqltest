import { MongoClient, ObjectId } from 'mongodb'
import { mongoDb } from '../mongo-connector';

export default {
  Query: {
    users: async (parent, args, context) => {
      let Users = await mongoDb
        .getCollection('users')
        .find()
        .toArray()
      return Users
    },
    user: async (parent, args, context) => {
      let Users = await mongoDb
        .getCollection('users')
        .find(args._id)
        .next()
      return Users
    }
  },
  Mutation: {
    createUser: async (parent, args, context) => {
      const newUser = await mongoDb
        .getCollection('users')
        .insertOne(args)
      return newUser.ops[0]
    }
  },
};