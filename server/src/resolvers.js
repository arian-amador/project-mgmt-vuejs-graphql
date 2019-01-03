const { GraphQLScalarType } = require('graphql');
const { User, Team, Folder, Group } = require('./models');
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

function getUserId(context) {
  const auth = context.request.get('Authorization');

  if (auth) {
    const token = auth.replace('Bearer ', '');
    const { id } = jwt.verify(token, SECRET);

    return id;
  }

  throw new Error('Not Authorized');
}

const resolvers = {
  Query: {
    async getTeam(_, args, context) {
      const userId = getUserId(context);
      const user = await User.findById(userId);
      return await Team.findById(user.team);
    },
    async getFolders(_, { parent }, context) {
      const userId = getUserId(context);
      if (parent) {
        return await Folder.find({ parent });
      } else {
        const user = await User.findById(userId);
        const groups = await Group.find({ users: ObjectId(userId) }, '_id');
        const ids = groups
          .map(o => o._id)
          .concat(
            ['External User', 'Collaborator'].includes(user.role)
              ? [ObjectId(userId)]
              : [ObjectId(userId), user.team]
          );
        return await Folder.find({ 'shareWith.item': ids }).populate(
          'shareWith'
        );
      }
    },
    async getFolder(_, { id }, context) {
      return await Folder.findById(id).populate('shareWith');
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
