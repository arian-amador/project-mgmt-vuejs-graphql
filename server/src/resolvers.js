const { GraphQLScalarType } = require('graphql');
const { User, Team } = require('./models');
const moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET;

function randomAvatar(arr) {
  const avatarColors = [
    'D81B60',
    'F06292',
    'F48FB1',
    'FFB74D',
    'FF9800',
    'F57C00',
    '00897B',
    '4DB6AC',
    '80CBC4',
    '80DEEA',
    '4DD0E1',
    '00ACC1',
    '9FA8DA',
    '7986CB',
    '3949AB',
    '8E24AA',
    'BA68C8',
    'CE93D8',
  ];

  return avatarColors[Math.floor(avatarColors.length * Math.random())];
}

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

    async signUp(_, { id, firstName, lastName, password }) {
      const user = await User.findById(id);
      const avatarColor = randomAvatar();

      const common = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        avatarColor: avatarColor,
        password: await bcrypt.hash(password, 10),
        status: 'Active',
      };

      if (user.role === 'Owner') {
        const team = await Team.create({
          name: `${common.name}'s Team`,
        });
        user.set({
          ...common,
          team: team.id,
          jobTitle: 'Owner',
        });
      } else {
        user.set(common);
      }

      await user.save();
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET);

      return { token, user };
    },

    async login(_, { email, password }) {
      const user = await User.findOne({ email });
      if (!user || !user.password) {
        throw new Error('Unable to authenticate');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Unable to authenticate');
      }

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET);

      console.log(`Successful Auth: ${user.email}`);
      return { token, user };
    },
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
