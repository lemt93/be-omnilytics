import crypto from 'crypto'

const numericMask = '0123456789'
const alphabetMask = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const alphanumericMask = alphabetMask + numericMask

const randomInt = () => String(crypto.randomInt(Math.pow(2, 48) - 1))

const randomFloat = () => String(Math.random() * crypto.randomInt(10))

const randomAlphanumeric = () => {
  // To guarantee it a alphanumeric, but it's not uniform distributed
  const s = numericMask[crypto.randomInt(0, numericMask.length)]
  const n = alphabetMask[crypto.randomInt(0, alphabetMask.length)]
  let str = `${s}${n}`
  for (let i = 0; i < crypto.randomInt(1, 3); i++) {
    str += alphanumericMask[crypto.randomInt(0, alphanumericMask.length)]
  }

  return str
}

const randomAlphabet = () => {
  let str = ''
  for (let i = 0; i < crypto.randomInt(1, 3); i++) {
    str += alphabetMask[crypto.randomInt(0, alphabetMask.length)]
  }

  return str
}

export {
  randomInt,
  randomFloat,
  randomAlphabet,
  randomAlphanumeric
}
