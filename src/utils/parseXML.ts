import dayjs from 'dayjs'
import { XMLParser, XMLValidator } from 'fast-xml-parser'
import validator from '../validators/validators'

const parser = new XMLParser()

const getecOrderDetailMappings = [
  {
    key: 'BLT_001',
    itemDescription: 'big little things Onboardingbox - Damen',
    cArtNr: '1911',
    cName: 'Onboarding - Getec - Female',
    jtlFpid: 'VZ9N01D8NEK'
  },
  {
    key: 'BLT_002',
    itemDescription: 'big little things Onboardingbox - Herren',
    cArtNr: '1910',
    cName: 'Onboarding - Getec - Male',
    jtlFpid: 'VZ9N01P2FD1'
  },
  {
    key: 'BLT_003',
    itemDescription: 'Versand',
    cArtNr: '1',
    cName: '',
    jtlFpid: ''
  }
]

export const parseXml = async (xmlContent: string): Promise<any> => {
  try {
    const isValid = XMLValidator.validate(xmlContent)
    if (isValid !== true) {
      throw new Error(isValid.err.msg.replace('.', '') + ` in line ${isValid.err.line} and column ${isValid.err.col}`)
    }

    const xmlData = parser.parse(xmlContent)
    let itemDetail = (xmlData.QxCBL.xCBLPayload.embedded.Order.OrderDetail.ListOfItemDetail.ItemDetail)
    if (!Array.isArray(itemDetail) && typeof itemDetail === 'object' && itemDetail !== null) {
      itemDetail = [itemDetail]
    }
    const pendingOrder = {
      currency: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderCurrency.Currency.CurrencyCoded,
      orderNo: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderNumber.BuyerOrderNumber,
      inetorderno: 0,
      shippingId: 7,
      shipped: dayjs(xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderDates.RequestedDeliverByDate, 'DD.MM.YYYY').format(),
      deliverydate: dayjs(xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderDates.RequestedDeliverByDate, 'DD.MM.YYYY').format(),
      note: '',
      description: '',
      costCenter: itemDetail[0].BaseItemDetail.BaseItemReferences.ListOfCostCenter.CostCenter.CostCenterNumber,
      quantity: 1,
      orderLineRequests: itemDetail.map((item: any) => ({
        itemName: item.BaseItemDetail.ItemIdentifiers.ItemDescription,
        articleNumber: getecOrderDetailMappings.filter((mapping) => mapping.key === item.BaseItemDetail.ItemIdentifiers.PartNumbers.SellerPartNumber.PartNum.PartID)[0].cArtNr,
        itemNetSale: item.PricingDetail.ListOfPrice.Price.UnitPrice.UnitPriceValue,
        itemVAT: item.PricingDetail.Tax.TaxAmount,
        quantity: item.BaseItemDetail.TotalQuantity.Quantity.QuantityValue,
        type: 1,
        discount: 0,
        netPurchasePrice: 0
      })),
      shippingAddressRequests: [{
        salutation: '',
        title: '',
        firstName: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.ReceivingContact.Contact.ContactName.split(' ')[0],
        lastName: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.ReceivingContact.Contact.ContactName.split(' ')[1],
        company: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.NameAddress.Name1,
        companyAddition: '',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        street: `${xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.NameAddress.Street} ${xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.NameAddress.HouseNumber}`,
        addressAddition: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.NameAddress.InhouseMail,
        zipCode: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.NameAddress.PostalCode.toString(),
        place: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.NameAddress.City,
        phone: '',
        state: '',
        country: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.NameAddress.Country.CountryCoded,
        iso: '',
        telephone: '',
        mobile: '',
        fax: '',
        email: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.ShipToParty.Party.ReceivingContact.Contact.ListOfContactNumber.ContactNumber[0].ContactNumberValue
      }]
    }

    const { error, value: validatedOrders } = validator.validatePendingOrder.validate(pendingOrder)
    if (error !== undefined) {
      throw error
    } else {
      return {
        status: true,
        xmlDoc: validatedOrders
      }
    }
  } catch (error: any) {
    return {
      status: false,
      message: error.message
    }
  }
}
