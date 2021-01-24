import crypto from 'crypto'
import { isMainThread, parentPort, Worker } from 'worker_threads'
import { performance } from 'perf_hooks'
import { configurations } from '../services/data.js'

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
    // 2 threads
    return Promise.all([
      generate(...args),
      generate(...args)
    ]).then(results => results.reduce((acc, item) => Buffer.concat([acc.output, item.output])))
  }
} else {
  // TODO: To improve/squeeze out a little bit more performance and reduce mem usage
  // e.g: buffer.write() instead of str +=
  // for (let i = 0; i < crypto.randomInt(1, 3); i++) {
  //   str += alphabetMask[crypto.randomInt(0, alphabetMask.length)]
  // }
  // return str
  const funcs = Object
    .getOwnPropertySymbols(configurations)
    .reduce((acc, key) => {
      const [generator] = configurations[key]
      return [...acc, generator]
    }, [])
  
  function random(...args) {
    return funcs[crypto.randomInt(0, funcs.length)].apply(this, args)
  }
  
  let offset = 0
  // Use 2 threads
  const output = Buffer.allocUnsafe(1024 * 1024)
  const start = performance.now()
  while (offset < output.length) {
    offset += output.write(random(), offset, 'utf-8')
    offset += output.write(',', offset, 'utf-8')
  }
  const end = performance.now()
  console.log(process.pid, end - start)
  
  parentPort.postMessage({
    output
  })
}

export default generateData
