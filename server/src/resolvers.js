const resolvers = {
  Query: {
    test (_, args, context) {
      return 'It Works!'
    }
  }
}

module.exports = resolvers
