import { MongoClient, ObjectId } from 'mongodb';
import { mongoDb } from '../mongo-connector';
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();

export default {
  Query: {
    comments: async (parent, args, context) => {
      let Comments = await mongoDb
        .getCollection('comments')
        .find()
        .toArray()
      return Comments
    },
    comment: async (parent, args, context) => {
      let Comments = await mongoDb
        .getCollection('comments')
        .find(args._id)
        .next()
      return Comments
    }
  },
  Mutation: {
    createComment: async (parent, args, context) => {
      const newComment = await mongoDb
        .getCollection('comments')
        .insertOne(Object.assign(args, {createdAt: Date.now()}))
      pubsub.publish('newComment', newComment.ops[0])
      return newComment.ops[0]
    }
  },
  Subscription: {
    newComment: {
      // Resolve is for transforming the data
      resolve: (payload) => payload,
      subscribe: () => pubsub.asyncIterator('newComment')
    }
  }
};