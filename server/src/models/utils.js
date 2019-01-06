const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var buildModel = function(name, schema) {
  return mongoose.model(
    name,
    new Schema(schema, {
      timestamps: true,
    })
  );
};

module.exports = buildModel;
