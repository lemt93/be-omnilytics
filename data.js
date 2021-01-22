import crypto from 'crypto'
import { isMainThread, parentPort, Worker } from 'worker_threads'
import { performance } from 'perf_hooks'

let generateData

if (isMainThread) {
  // For sake of simplicity,
  // No error handling for worker threads!
  // No pool!
  
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
    return Promise.all([
      generate(...args),
      generate(...args)
    ]).then(results => results.reduce((acc, item) => Buffer.concat([acc.output, item.output])))
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
    for (let i = 0; i < crypto.randomInt(1, 3); i++) {
      str += alphanumericMask[crypto.randomInt(0, alphanumericMask.length)]
    }

    return str
  }
  function randomAlphabet() {
    let str = ''
    for (let i = 0; i < crypto.randomInt(1, 3); i++) {
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
  
  function random(...args) {
    return funcs[crypto.randomInt(0, 4)].apply(this, args)
  }

  // TODO: improve generate perf by writing directly into the buffer
  // e.g: buffer.write() instead of str +=
  // for (let i = 0; i < crypto.randomInt(1, 3); i++) {
  //   str += alphabetMask[crypto.randomInt(0, alphabetMask.length)]
  // }
  const start = performance.now()
  let offset = 0
  const output = Buffer.allocUnsafe(1024 * 1024)
  while (offset < output.length) {
    let writtenLength = output.write(random(output.length - offset), offset, 'utf-8')
    writtenLength += output.write(',', offset + writtenLength, 'utf-8')

    offset += writtenLength
  }
  const end = performance.now()
  console.log(end - start)
  
  parentPort.postMessage({
    output
  })
  
  // const path = `${outputDir}/${fileName}`
  //
  // if (!fs.existsSync(outputDir)) {
  //   fs.mkdirSync(outputDir)
  // }
  //
  // fs.writeFile(path, output, { encoding: 'utf-8' }, () => {
  //   parentPort.postMessage({
  //     fileName,
  //     url: `http://localhost:4000/${path}`
  //   })
  // })
}

export default generateData
