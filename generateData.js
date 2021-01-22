import fs from 'fs'
import crypto from 'crypto'
import { isMainThread, parentPort, Worker, workerData } from 'worker_threads'

let generate

if (isMainThread) {
  generate = function generate(workerData) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./generateData.js', { workerData });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      })
    })
  }
} else {
  const { outputDir } = workerData
  const fileName = crypto.randomBytes(8).toString('hex')
  
  // TODO: generate 4 types of data with fixed size 2MB:
  // Integers
  // Real numbers (float?)
  // Alphabetical strings
  // Alphanumeric
  const buf = crypto.randomBytes(2 * 1024 * 1024)
  const path = `${outputDir}/${fileName}`

  fs.writeFile(path, buf, { encoding: 'utf-8' }, () => {
    parentPort.postMessage({
      fileName,
      url: `http://localhost:4000/${path}`
    })
  })
}

export default generate
