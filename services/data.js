import {
  randomInt,
  randomFloat,
  randomAlphabet,
  randomAlphanumeric
} from './rand.js'

const INT = Symbol('int')
const REAL = Symbol('real')
const ALPHABET = Symbol('alphabetic')
const ALPHANUM = Symbol('alphanumeric')

const typeConfigs = {
  [INT]: (numElements = 0) => ({
    id: 1, // A unique identifier, use integer for simplicity
    name: 'Integer numbers',
    numElements
  }),
  [REAL]: (numElements = 0) => ({
    id: 2,
    name: 'Real numbers',
    numElements
  }),
  [ALPHABET]: (numElements = 0) => ({
    id: 3,
    name: 'Alphabet',
    numElements: numElements
  }),
  [ALPHANUM]: (numElements = 0) => ({
    id: 4,
    name: 'Alphanumeric',
    numElements
  })
}

const isCharInt = (char = '') => (
  (char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57)
)

const isInt = (str = '') => (
   str
    .split('')
    .reduce(
      (isPreviousInt, char) => isPreviousInt && isCharInt(char),
      true
    )
)

const isCharAlphabet = (char = '') => (
  char.charCodeAt(0) >= 65 && char.charCodeAt(0) <= 122
)

const isAlphabet = (str = '') => (
  str
    .split('')
    .reduce(
      (isPreviousAlphabet, char) => isPreviousAlphabet && isCharAlphabet(char),
      true
    )
)

const reportInt = (str = '') => {
  if (!str) return
  
  return isInt(str) && INT
}

const reportFloat = (str = '') => {
  const separator = '.'
  const separatorIndex = str.indexOf(separator)
  
  if (separatorIndex === -1) return
  if (separatorIndex === str.length -1) return
  
  const leftPart = str.substr(0, separatorIndex)
  const rightPart = str.substr(separatorIndex + 1, str.length)
  
  // Have more than one 1 separator, no further proceed
  // Also consider ".111" with separator at head is not a Number
  if (leftPart.indexOf(separator) !== -1 || rightPart.indexOf(separator) !== -1) return
  
  return isInt(leftPart) && isInt(rightPart) && REAL
}

const reportAlphabet = (str = '') => {
  if (!str) return

  return isAlphabet(str) && ALPHABET}

const reportAlphanumeric = (str = '') => {
  const [hasInt, hasChar] = str
    .split('')
    .reduce(([hasInt, hasChar], char) => {
      if (hasInt && hasChar) {
        return [hasInt, hasChar]
      }

      return [
        !hasInt ? isCharInt(char) : hasInt,
        !hasChar ? isCharAlphabet(char) : hasChar
      ]
    }, [false, false])
  
  return (hasInt && hasChar) && ALPHANUM
}

const configurations = {
  // [generator, typeChecker]
  INT: [randomInt, reportInt],
  REAL: [randomFloat, reportFloat],
  ALPHABET: [randomAlphabet, reportAlphabet],
  ALPHANUM: [randomAlphanumeric, reportAlphanumeric]
}

export {
  configurations,
  typeConfigs,
  INT,
  REAL,
  ALPHABET,
  ALPHANUM
}
