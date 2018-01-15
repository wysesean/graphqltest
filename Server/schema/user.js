export default `
  type User {
    _id: String!
    name: String!
    comments: [Comment]!
  }

  type Query {
    users: [User!]!
    user(_id: String!): User
  }

  type Mutation {
    createUser(name: String!): User
  }
`
