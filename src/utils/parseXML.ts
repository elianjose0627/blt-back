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

    const pendingOrder = {
      platform: 0,
      language: 0,
      // language: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderLanguage.Language.LanguageCoded,
      currency: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderCurrency.Currency.CurrencyCoded,
      // customerId: process.env.ORDER_DETAIL_CUSTOMER_ID,
      // campaignId: process.env.ORDER_DETAIL_CAMPAIGN_ID,
      // companyId: process.env.ORDER_DETAIL_COMPANY_ID,
      orderNo: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderNumber.BuyerOrderNumber,
      inetorderno: 0,
      // shippingId: process.env.ORDER_DETAIL_SHIPPING_ID,
      shippingId: 7,
      shipped: dayjs(xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderDates.RequestedDeliverByDate, 'DD.MM.YYYY').format(),
      deliverydate: dayjs(xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderDates.RequestedDeliverByDate, 'DD.MM.YYYY').format(),
      note: '',
      description: '',
      costCenter: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderDetail.ListOfItemDetail.ItemDetail[0].BaseItemDetail.BaseItemReferences.ListOfCostCenter.CostCenter.CostCenterNumber,
      paymentType: 0,
      paymentTarget: 0,
      discount: 0,
      orderStatus: 0,
      quantity: 1,
      isPosted: false,
      isQueued: false,
      createdBy: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.BuyerParty.Party.OrderContact.Contact.ListOfContactNumber.ContactNumber[0].ContactNumberValue,
      createdByFullName: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderHeader.OrderParty.BuyerParty.Party.OrderContact.Contact.ContactName,
      orderLineRequests: xmlData.QxCBL.xCBLPayload.embedded.Order.OrderDetail.ListOfItemDetail.ItemDetail.map((item: any) => ({
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

    const { error, value: validatedOrders } = validator.validateCommonPendingOrder.validate(pendingOrder)
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
