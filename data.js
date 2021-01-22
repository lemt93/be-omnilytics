import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import { isMainThread, parentPort, Worker, workerData } from 'worker_threads'

let generateData

if (isMainThread) {
  generateData = function generate(workerData) {
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
  const alphabetMask = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const alphanumericMask = alphabetMask + '0123456789'
  
  function randomInt() {
    return String(crypto.randomInt(Math.pow(2, 48) - 1))
  }
  function randomFloat() {
    return String(Math.random() * crypto.randomInt(10))
  }
  function randomAlphanumeric() {
    let str = ''
    for (let i = 0; i < crypto.randomInt(1, 10); i++) {
      str += alphanumericMask[crypto.randomInt(0, alphanumericMask.length)]
    }

    return str
  }
  function randomAlphabet() {
    let str = ''
    for (let i = 0; i < crypto.randomInt(1, 10); i++) {
      str += alphabetMask[crypto.randomInt(0, alphabetMask.length)]
    }
    
    return str
  }
  
  const funcs = [
    randomInt,
    randomFloat,
    randomAlphanumeric,
    randomAlphabet
  ]
  
  function random() {
    return funcs[crypto.randomInt(0, 4)]()
  }

  const { outputDir } = workerData
  const fileName = crypto.randomBytes(8).toString('hex')
  
  let offset = 0
  const output = Buffer.allocUnsafe(2 * 1024 * 1024)
  while (offset < output.length) {
    let writtenLength = output.write(random(), offset, 'utf-8')
    writtenLength += output.write(',', offset + writtenLength, 'utf-8')

    offset += writtenLength
  }
  
  const path = `${outputDir}/${fileName}`
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }
  
  fs.writeFile(path, output, { encoding: 'utf-8' }, () => {
    parentPort.postMessage({
      fileName,
      url: `http://localhost:4000/${path}`
    })
  })
}

export default generateData
