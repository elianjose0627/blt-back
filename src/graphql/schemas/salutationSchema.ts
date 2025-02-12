const salutationTypeDefs = `#graphql
  type Salutation {
    id: ID!
    name: String!
    createdAt: Date!
    updatedAt: Date!
  }

    type SalutationsResponse {
    statusCode: Int!
    success: Boolean!
    meta: Meta!
    salutations: [Salutation!]!
  }

  type SalutationResponse {
    statusCode: Int!
    success: Boolean!
    salutation: Salutation
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "salutations" query returns an array of zero or more Salutations (defined above).
  type Query {
    salutations(limit: Int, page: Int): SalutationsResponse!
    salutation(id: ID!): SalutationResponse!
  }
`

export default salutationTypeDefs
