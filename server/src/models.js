const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const buildModel = require('./models/utils');

const Folder = buildModel('Folder', {
  name: String,
  description: String,
  shareWith: [
    {
      kind: String,
      item: { type: ObjectId, refPath: 'shareWith.kind' },
    },
  ],
  parent: { type: ObjectId, ref: 'Folder' },
});

const User = buildModel('User', {
  name: { String, default: '' },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  jobTitle: {
    type: String,
    default: '',
  },
  avatarColor: String,
  team: { type: ObjectId, ref: 'Team' },
  role: String,
  status: String,
});

const Group = buildModel('Group', {
  team: { type: ObjectId, ref: 'Team' },
  name: String,
  initials: String,
  avatarColor: String,
  users: [{ type: ObjectId, ref: 'User' }],
});

const Team = Folder.discriminator('Team', new Schema({}, { timestamps: true }));

module.exports = {
  Folder: Folder,
  Team: Team,
  User: User,
  Group: Group,
};
