export default `
  type Comment {
    _id: String!
    text: String!
    createdAt: String!
  }

  type Query {
    comments: [Comment!]!
    comment(_id: String!): Comment!
  }

  type Mutation {
    createComment(text: String!): Comment
  }

  type Subscription {
   newComment: Comment
  }
`
