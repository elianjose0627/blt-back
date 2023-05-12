import BaseController from './BaseController'
import PrivacyRuleService from '../services/PrivacyRuleService'

const privacyService = new PrivacyRuleService('PrivacyRule')

class PrivacyRuleController extends BaseController {

}

export default new PrivacyRuleController(privacyService)
