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

      return Comments.map(async (comment) => {
        let user = await mongoDb
          .getCollection('users')
          .find(ObjectId(comment.userId))
          .next()
        comment.user = user
        return comment
      })
    },
    comment: async (parent, args, context) => {

      let Comments = await mongoDb
        .getCollection('comments')
        .find(ObjectId(args._id))
        .next()
      
      let User = await mongoDb
        .getCollection('users')
        .find(ObjectId(Comments.userId))
        .next()
      
      Comments.user = User
      return Comments
    }
  },
  Mutation: {
    createComment: async (parent, args, context) => {
      const newCommentUser = await mongoDb
        .getCollection('user')
        .find(args.userId)
        .next()
      const newComment = await mongoDb
        .getCollection('comments')
        .insertOne(Object.assign(args, {createdAt: Date.now(), user: newCommentUser}))
      pubsub.publish('newComment', newComment.ops[0])
      return newComment.ops[0]
    }
  },
  Subscription: {
    newComment: {
      // Resolve is for transforming the data
      resolve: async (payload) => {
        const user = await mongoDb
          .getCollection('user')
          .find(payload.userId)
          .next()
        return Object.assign({}, payload, {user: user})
      },
      subscribe: () => pubsub.asyncIterator('newComment')
    }
  }
};