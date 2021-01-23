import crypto from 'crypto'
import { isMainThread, parentPort, Worker } from 'worker_threads'
import { performance } from 'perf_hooks'

let generateData

if (isMainThread) {

  
  function generate(workerData) {
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
  
  generateData = function (...args) {
    // For sake of simplicity,
    // No error handling for worker threads!
    // No pool! 2 threads
    return Promise.all([
      generate(...args),
      generate(...args)
    ]).then(results => results.reduce((acc, item) => Buffer.concat([acc.output, item.output])))
  }
} else {
  // TODO: To improve/squeeze out a little bit more performance
  // e.g: buffer.write() instead of str +=
  // for (let i = 0; i < crypto.randomInt(1, 3); i++) {
  //   str += alphabetMask[crypto.randomInt(0, alphabetMask.length)]
  // }
  const alphabetMask = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const alphanumericMask = alphabetMask + '0123456789'
  let offset = 0
  // Use 2 threads
  const output = Buffer.allocUnsafe(1024 * 1024)

  function addSeparator() {
    offset += output.write(',', offset, 'utf-8')
  }
  function randomInt() {
    offset += output.write(String(crypto.randomInt(Math.pow(2, 48) - 1)), offset, 'utf-8') 
    addSeparator()
  }
  function randomFloat() {
    offset += output.write(String(Math.random() * crypto.randomInt(10)), offset, 'utf-8')
    addSeparator()
  }
  function randomAlphanumeric() {
    for (let i = 0; i < crypto.randomInt(1, 5); i++) {
      offset += output.write(alphanumericMask[crypto.randomInt(0, alphanumericMask.length)], offset, 'utf-8')
    }
    addSeparator()
  }
  function randomAlphabet() {
    for (let i = 0; i < crypto.randomInt(1, 5); i++) {
      offset += output.write(alphabetMask[crypto.randomInt(0, alphabetMask.length)], offset, 'utf-8')
    }
    addSeparator()
  }
  
  const funcs = [
    randomInt,
    randomFloat,
    randomAlphanumeric,
    randomAlphabet
  ]
  
  function random(...args) {
    return funcs[crypto.randomInt(0, 4)].apply(this, args)
  }
  
  const start = performance.now()
  while (offset < output.length) {
    random(output)
  }
  const end = performance.now()
  console.log(process.pid, end - start)
  
  parentPort.postMessage({
    output
  })
}

export default generateData
