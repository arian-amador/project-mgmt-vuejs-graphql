const { GraphQLScalarType } = require('graphql');
const { User } = require('./models');
const moment = require('moment');

const resolvers = {
  Query: {
    test(_, args, context) {
      return 'It Works!';
    },
  },
  Mutation: {
    async captureEmail(_, { email }) {
      const isEmailTaken = await User.findOne({ email });

      if (isEmailTaken) {
        throw new Error('Email is already taken');
      }

      const user = await User.create({
        email,
        role: 'Owner',
        status: 'Pending',
      });

      return user;
    },
    async signUp(_, { id, firstName, lastName, password }) {},
    async login(_, { email, password }) {},
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: value => moment(value).toDate(),
    serialize: value => value.getTime(),
    parseLiteral: ast => ast,
  }),
};

module.exports = resolvers;
