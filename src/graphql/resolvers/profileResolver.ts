import * as statusCodes from '../../constants/statusCodes'

const profileResolver = {
  Query: {
    profile: async (_: any, args: { args: any }, { user }: { user: any }) => {
      return {
        statusCode: statusCodes.OK,
        success: true,
        profile: user
      }
    }
  }
}

export default profileResolver
