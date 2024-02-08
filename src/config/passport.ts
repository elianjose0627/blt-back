import type { PassportStatic } from 'passport'
import passportJWT from 'passport-jwt'
import db from '../models'

const { ExtractJwt } = passportJWT
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY
}

const passportAuth = (passport: PassportStatic): any => {
  const getUser = async (email: string): Promise<any> => db.User.findOne({
    attributes: { exclude: ['password'] },
    include: [
      {
        model: db.Company,
        attributes: ['id', 'customerId', 'name', 'email', 'phone', 'vat', 'domain'],
        as: 'company',
        include: [
          {
            model: db.Address,
            attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'type'],
            as: 'addresses'
          },
          {
            model: db.User,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            as: 'owner'
          },
          {
            model: db.AccessPermission,
            attributes: { exclude: ['companyId', 'deletedAt'] },
            as: 'accessPermissions',
            where: {
              isEnabled: true
            },
            required: false
          }
        ]
      },
      {
        model: db.Address,
        attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'type'],
        as: 'addresses'
      }
    ],
    where: {
      email
    }
  })

  const strategy = new JwtStrategy(jwtOptions, async (jwtPayload, next) => {
    const user = await getUser(jwtPayload.email)
    if (user !== null) {
      const tokenDate = new Date(jwtPayload.logoutTime)
      const type = jwtPayload.type
      const userDate = new Date(user.logoutTime)
      // Check if token is valid by comparing logoutTime time from the user and in the token
      if (tokenDate.toUTCString() === userDate.toUTCString()) {
        next(null, user, { type })
      } else {
        next(null, false, { message: 'token invalid' })
      }
    } else {
      next({ message: 'user not found' }, false, null)
    }
  })
  passport.use(strategy)
}

export default passportAuth
