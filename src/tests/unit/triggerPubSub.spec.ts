import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'
import triggerPubSub from '../../utils/triggerPubSub'

chai.use(sinonChai)

describe('triggerPubSub', () => {
  it('Catch error when the trigger fails', async () => {
    const res = await triggerPubSub('test-missing-topic', undefined, {})
    expect(res).to.equal(false)
  })
})
