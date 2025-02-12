const titleTypeDefs = `#graphql
type Title {
  id: ID!
  name: String!
  createdAt: Date!
  updatedAt: Date!
}


type TitlesResponse {
  statusCode: Int!
  success: Boolean!
  meta: Meta!
  titles: [Title!]!
}

type TitleResponse {
  statusCode: Int!
  success: Boolean!
  title: Title
}

# The "Query" type is special: it lists all of the available queries that
# clients can execute, along with the return type for each. In this
# case, the "titles" query returns an array of zero or more Titles (defined above).
type Query {
  titles(limit: Int, page: Int): TitlesResponse!
  title(id: ID!): TitleResponse!
}
`

export default titleTypeDefs
