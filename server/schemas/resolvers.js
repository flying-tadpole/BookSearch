const { User } = require('../models')
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        // uses context to identify current user
        me: async (parents, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id })
            }
            throw AuthenticationError
        }
    },

    Mutation: {
        // adds a new user
        addUser: async (parent, { username, email, password }) => {
          const user = await User.create({ username, email, password });
          const token = signToken(user);
          console.log('hit addUser on backend: ', user, token)

          return { token, user };
        },

        // login and verifies password
        login: async (parent, { email, password }) => {
          const user = await User.findOne({ email });
    
          if (!user) {
            throw AuthenticationError;
          }
          // isCorrectPassword is in the user model, that's how we ask bcrypt if the password is correct
          const correctPw = await user.isCorrectPassword(password);
    
          if (!correctPw) {
            throw AuthenticationError;
          }
          //returns auth token
          const token = signToken(user);
          return { token, user };
        },

        //allows user to save books
        saveBook: async (parent, args, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: book}},
                    {new: true, runValidators: true}
                )
            }
            throw AuthenticationError
        },

        //allows user to remove saved books
        removeBook: async (parents, args, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: { savedBooks: { bookId: bookId } }},
                    {new: true}
                )
            }
            throw AuthenticationError
        }
    }
}

module.exports = resolvers