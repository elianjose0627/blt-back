import BaseController from './BaseController'
import BundleItemService from '../services/BundleItemService'

const bundleItemService = new BundleItemService('BundleItem')

class BundleItemController extends BaseController {

}

export default new BundleItemController(bundleItemService)
