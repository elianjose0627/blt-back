class FlakeIDGenerator {
  private readonly epoch: number
  private readonly orderType: number
  private readonly processId: number
  private sequence: number
  private lastTimestamp: number

  constructor (orderType: number = 0, customEpoch?: number) {
    this.epoch = customEpoch ?? new Date('2025-01-01T00:00:00Z').getTime()
    this.orderType = orderType & 0x0F // 4-bit platform type (max 15)
    this.processId = process.pid & 0x3FF // 10-bit process ID
    this.sequence = 0
    this.lastTimestamp = -1
  }

  currentTimestamp (): number {
    return Date.now()
  }

  waitForNextMilliSeconds (lastTimestamp: number): number {
    let timestamp = this.currentTimestamp()
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp()
    }
    return timestamp
  }

  generate (): string {
    let timestamp = this.currentTimestamp() - this.epoch

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & 0xFFF // 12-bit sequence number
      if (this.sequence === 0) {
        timestamp = this.waitForNextMilliSeconds(this.lastTimestamp)
      }
    } else {
      this.sequence = 0
    }

    this.lastTimestamp = timestamp

    /**
     * ID Structure:
     * 41-bit timestamp | 4-bit platformType | 10-bit process ID | 12-bit sequence
     */
    const flakeId =
      (BigInt(timestamp) << 26n) | // 41-bit timestamp
      (BigInt(this.orderType) << 22n) | // 4-bit platform type
      (BigInt(this.processId) << 12n) | // 10-bit process ID
      BigInt(this.sequence) // 12-bit sequence

    return flakeId.toString() // Convert to decimal string
  }
}

export default FlakeIDGenerator
