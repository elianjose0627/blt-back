import { expect } from 'chai'
import sinon from 'sinon'
import dayjs from 'dayjs'
import FlakeIdGenerator from '../../utils/flakeIdGenerator' // Adjust the import path as necessary

describe('Flake Id Generator', () => {
  let clock: any

  beforeEach(() => {
    // Use sinon to control the system time
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    // Restore the original timer
    clock.restore()
  })

  describe('FlakeIdGenerator constructor', () => {
    it('should initialize with default epoch if not provided', () => {
      const generator = new FlakeIdGenerator()
      const id = generator.generate()
      expect(id).to.be.a('string')
    })

    it('should initialize with custom epoch if provided', () => {
      const customEpoch = new Date('2023-01-01T00:00:00Z').getTime()
      const generator = new FlakeIdGenerator(0, customEpoch)
      const id = generator.generate()
      expect(id).to.be.a('string')
    })
  })

  describe('FlakeIdGenerator generate method', () => {
    it('should generate unique IDs', () => {
      const generator = new FlakeIdGenerator()
      const id1 = generator.generate()
      const id2 = generator.generate()
      expect(id1).to.not.equal(id2)
    })

    it('should handle sequence overflow correctly', () => {
      const generator = new FlakeIdGenerator()

      // Force the sequence to overflow by generating multiple IDs in the same millisecond
      for (let i = 0; i < 4096; i++) {
        generator.generate()
      }

      const id1 = generator.generate()
      clock.tick(1) // Move time forward by 1ms
      const id2 = generator.generate()

      expect(id1).to.not.equal(id2) // Ensure IDs are unique after overflow
    })

    it('should handle timestamp collision correctly', () => {
      const generator = new FlakeIdGenerator()

      // Generate an ID to set the lastTimestamp
      const id1 = generator.generate()

      // Simulate a timestamp collision by freezing time
      const id2 = generator.generate()
      clock.tick(1) // Move time forward by 1ms
      const id3 = generator.generate()

      expect(id1).to.not.equal(id2) // Ensure IDs are unique even with timestamp collision
      expect(id2).to.not.equal(id3) // Ensure IDs are unique after waiting for the next millisecond
    })

    it('should handle timestamp collision correctly when the lastTimestamp is in the future', () => {
      const generator = new FlakeIdGenerator()
      const lastTimestamp = dayjs().add(1, 'day').valueOf()

      // Simulate time being stuck at lastTimestamp
      const originalCurrentTimestamp = generator.currentTimestamp.bind(generator)
      let callCount = 0
      generator.currentTimestamp = () => {
        callCount++
        if (callCount <= 2) {
          return lastTimestamp
        }
        return lastTimestamp + 1
      }

      const nextTimestamp = generator.waitForNextMilliSeconds(lastTimestamp)

      // Restore original method
      generator.currentTimestamp = originalCurrentTimestamp

      expect(nextTimestamp).to.be.greaterThan(lastTimestamp)
      expect(callCount).to.be.greaterThan(1)
    })
  })
})
