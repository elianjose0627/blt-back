import BaseController from '../BaseController'
import JtlShippingMethodService from '../../services/jtl/JtlShippingMethodService'

const jtlShippingMethodService = new JtlShippingMethodService('JtlShippingMethod')

class JtlShippingMethodController extends BaseController {

}

export default new JtlShippingMethodController(jtlShippingMethodService)
