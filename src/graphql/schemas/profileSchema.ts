const profileTypeDefs = `#graphql
  type LoginTime {
    lastSuccessful: Date!
    lastFailed: Date!
    failed: Int!
  }
  type Profile {
    id: ID!
    title: String
    salutation: String
    firstName: String
    lastName: String
    username: String
    email: String!
    phone: String
    role: String!
    isActive: Boolean!
    isVerified: Boolean!
    logoutTime: Date
    loginTime: LoginTime!
    hireDate: Date
    startDate: Date
    birthDate: Date
    releaseDate: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type ProfileResponse {
    statusCode: Int!
    success: Boolean!
    profile: Profile!
  }

  type Query {
    profile: ProfileResponse!
  }
`

export default profileTypeDefs
