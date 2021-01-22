import fs from 'fs'
import { isMainThread, parentPort, Worker, workerData } from 'worker_threads'

let generateReport

const INT = Symbol('int')
const REAL = Symbol('real')
const ALPHABET = Symbol('alphabetic')
const ALPHANUM = Symbol('alphanumeric')

function getType(str) {
  let haveInts = false
  let haveChar = false
  let haveDecimalPoints = false
  
  for (let i=0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    
    if (charCode >= 48 && charCode <= 57) {
      haveInts = true
    } else if (charCode >= 65 && charCode <= 122) {
      haveChar = true
    } else if (charCode === 46) {
      haveDecimalPoints = true
    }
  }
  const isInt = haveInts && (!haveChar && !haveDecimalPoints)
  const isAlphabet = haveChar && (!haveInts && !haveDecimalPoints)
  const isAlphanumeric = haveInts && haveChar
  const isRealNum = haveInts && haveDecimalPoints && !haveChar

  if (isInt) return INT
  if (isAlphabet) return ALPHABET
  if (isAlphanumeric) return ALPHANUM
  if (isRealNum) return REAL
}

function report(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8')
  let integers = 0
  let realNumbers = 0
  let alphaNumerics = 0
  let alphaBetStrings = 0

  data.split(',').forEach(str => {
    const type = getType(str)

    switch (type) {
      case INT:
        integers += 1
        break
      case REAL:
        realNumbers += 1
        break
      case ALPHABET:
        alphaBetStrings += 1
        break
      case ALPHANUM:
        alphaNumerics += 1
        break
    }
  })

  return [
    {
      id: 1,
      name: 'Integers',
      numElements: integers
    },
    {
      id: 2,
      name: 'Real Numbers',
      numElements: realNumbers
    },
    {
      id: 3,
      name: 'Alphanumerics',
      numElements: alphaNumerics
    },
    {
      id: 4,
      name: 'Alphabet strings',
      numElements: alphaBetStrings
    }
  ]
}

if (isMainThread) {
  generateReport = function (workerData) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL(import.meta.url).pathname, { workerData });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      })
    })
  } 
} else {
  const { fileName, staticDir } = workerData

  parentPort.postMessage({
    reports: report(`${staticDir}/${fileName}`)
  })
}
export default generateReport
