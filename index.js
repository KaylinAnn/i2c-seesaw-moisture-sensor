const i2c = require('i2c-bus');

const TOUCH_BASE = 0x0F;
const TOUCH_OFFSET = 0x10;
const STATUS_BASE = 0x00;
const STATUS_TEMP = 0x04;

class Client {
  constructor(addr) {
    this.addr = addr
    this.client = i2c.openSync(1)
  }

  read(regBase, reg, buf, delay) {
    this.write(regBase, reg)

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.client.i2cReadSync(this.addr, buf.length, buf)
        resolve(buf)
      }, delay)
    })
  }

  write(regBase, reg, buf) {
    buf = Buffer.from([regBase, reg])
    return this.client.i2cWriteSync(this.addr, buf.length, buf)
  }

  getMoisture() {
    let buf = Buffer.alloc(2)
    return this.read(TOUCH_BASE, TOUCH_OFFSET, buf, 5)
      .then((buf) => {
        return parseInt(buf.toString("hex"), 16)
      })
  }

  getTemperature() {
    let buf = Buffer.alloc(4)
    return this.read(STATUS_BASE, STATUS_TEMP, buf, 5)
      .then((buf) => {
        return parseInt(buf.toString("hex"), 16) * 0.00001525878
      })
  }
}

module.exports = {
  open: function (addr) {
    return new Client(addr)
  }
}