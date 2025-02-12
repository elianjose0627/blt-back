// Resolvers define how to fetch the types defined in your schema.
import salutationResolver from './salutationResolver'
import titleResolver from './titleResolver'
import profileResolver from './profileResolver'
const resolvers = {
  Query: {
    ...salutationResolver.Query,
    ...titleResolver.Query,
    ...profileResolver.Query
  }
}

export default resolvers
