// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
import salutationTypeDefs from './salutationSchema'
import titleTypeDefs from './titleSchema'
import profileTypeDefs from './profileSchema'

const rootTypeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  scalar Date

  type Meta {
    total: Int!
    pageCount: Int!
    perPage: Int!
    page: Int!
  }
`
const typeDefs = [rootTypeDefs, salutationTypeDefs, titleTypeDefs, profileTypeDefs]

export default typeDefs
