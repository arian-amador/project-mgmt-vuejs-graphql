require('dotenv').config();

import { GraphQLServer } from 'graphql-yoga';

const mongoose = require('mongoose');
const resolvers = require('./resolvers');

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true }
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error'));
db.once('open', function(callback) {
  console.log('Connection Succeeded');
});

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => req,
});

const options = {
  port: process.env.PORT || 3000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
};

server.start(options, ({ port }) =>
  console.log(`Server is running localhost:${port}`)
);
