import fs from 'fs'
import express from 'express'
import cors from 'cors'
import cluster from 'cluster'
import os from 'os'
import generateData from './data.js'
import generateReport from './reports.js'

const numCPUs = os.cpus().length
const app = express()
const port = 4000
const staticPath = '/files'
const staticDir = 'files'

function main() {
  app.use(cors())
  app.use(staticPath, express.static(staticDir))
  app.post('/generate', async (req, res) => {
    // Avoid blocking main thread by using worker threads for CPU intensive ops
    // e.g: crypto/generating truly random data
    const buff = await generateData()
    const fileName = String(Math.floor(Math.random() * 1000))
    const path = `${staticDir}/${fileName}`

    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir)
    }

    fs.writeFile(path, buff, { encoding: 'utf-8' }, () => {
      res.json({
        fileName,
        url: `http://localhost:4000/${path}`
      })
    })

  })
  app.get('/reports/:id', async (req, res) => {
    const { reports } = await generateReport({ staticDir, fileName: req.params.id })
    res.send(reports)
  })

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Process ${process.pid}`)
  })
}

// Init number of processes to equal number of cores
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
} else {
  main()
}

