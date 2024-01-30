import BaseController from './BaseController'
import EmailTemplateTypeService from '../services/EmailTemplateTypeService'

const emailTemplateTypeService = new EmailTemplateTypeService('EmailTemplateType')

class EmailTemplateTypeController extends BaseController {

}

export default new EmailTemplateTypeController(emailTemplateTypeService)
