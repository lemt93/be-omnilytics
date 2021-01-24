import fs from 'fs'
import { isMainThread, parentPort, Worker, workerData } from 'worker_threads'
import {
  configurations,
  typeConfigs
} from '../services/data.js'

let generateReport

const report = (filePath, typeCheckers) => {
  const data = fs.readFileSync(filePath, 'utf-8')
  const counter = Object
    .getOwnPropertySymbols(typeConfigs)
    .reduce((counter, key) => {
      counter[key] = 0
      return counter
    }, {})

  let counts = data
    .split(',')
    .reduce((reportResult, str) => {
      // Let say these data types is mutual exclusive
      let type = typeCheckers.reduce((type, checkType) => (
        type ? type : checkType(str)
      ), undefined)
      
      if (type) {
        reportResult[type] += 1
      }
      
      return reportResult
    }, counter)
  
   return Object
    .getOwnPropertySymbols(counts)
    .reduce((report, key) => {
      return [...report, typeConfigs[key](counts[key])]
    }, [])
}

if (isMainThread) {
  generateReport = (workerData) => {
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
  const reporters = Object
    .getOwnPropertySymbols(configurations)
    .reduce((acc, key) => {
      const [_genarator, typeChecker] = configurations[key]
      return [...acc, typeChecker]
    }, [])
  
  parentPort.postMessage({
    reports: report(`${staticDir}/${fileName}`, reporters)
  })
}
export default generateReport
