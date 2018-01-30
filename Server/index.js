import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypes, mergeResolvers, fileLoader } from 'merge-graphql-schemas';
import { MongoClient, ObjectId } from 'mongodb'
import { mongoDb } from './mongo-connector';

import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws'; // From Apollo


const PORT = 4000
const MONGO_URL = 'mongodb://localhost:27017/test'

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

export const schema = makeExecutableSchema({
  typeDefs, 
  resolvers
})

function authMiddleware(req, res, next) {
  if(req.headers.cookie.includes('secretpassword')){
    next();
  }
  else {
    console.log('russian hacker alert')
  }
}

const server = express();
const ws = createServer(server);

server.use('*', cors({ origin: `http://localhost:${PORT}` }));
server.use(authMiddleware)

server.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
}));

mongoDb.connect(MONGO_URL)
  .then(() => {
    console.log('Connected to Mongo 🍺');    
    ws.listen(PORT, () => {
      console.log(`Serving out websockets on PORT ws://localhost:${PORT}/subscriptions`)
      new SubscriptionServer({
        execute, subscribe, schema
      }, {
        server: ws, 
        path: '/subscriptions'
      })
    })


  })
  .catch(err => {
    console.log('Error:', err);
    process.exit(1);
  });
