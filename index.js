import fs from 'fs'
import express from 'express'
import cors from 'cors'
import cluster from 'cluster'
import crypto from 'crypto'
import os from 'os'
import generateData from './workers/data.js'
import generateReport from './workers/reports.js'

const numCPUs = os.cpus().length
const app = express()
const port = 4000
const staticPath = '/files'
const staticDir = 'files'

const main = () => {
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir)
  }
  
  app.use(cors())
  app.use(staticPath, express.static(staticDir))
  app.post('/generate', async (req, res) => {
    // Avoid blocking main thread by using worker threads for CPU intensive ops
    // e.g: crypto/generating truly random data
    const buff = await generateData()
    const fileName = crypto.randomBytes(6).toString('hex')
    const path = `${staticDir}/${fileName}`
    
    await fs.promises.writeFile(path, buff)
    res.json({
      fileName,
      url: `http://localhost:4000/${path}`
    })
  })
  app.get('/reports/:id', async (req, res) => {
    const { reports } = await generateReport({ staticDir, fileName: req.params.id })
    res.json(reports)
  })
  app.get('/hello', (req, res) => {
    res.send('Hello, non-blocking!')
  })
  
  app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
    console.log(`Process ${process.pid}`)
  })
}

// Init number of processes to equal number of cores
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs - 1; i++) {
    cluster.fork()
  }
} else {
  main()
}

