import express from 'express'
import cors from 'cors'
import cluster from 'cluster'
import os from 'os'
import generate from './generateData.js'

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
    // For sake of simplicity, no error handling for worker threads!
    const { url, fileName } = await generate({ outputDir: staticDir })
    res.send({
      url,
      fileName
    })

  })
  app.get('/reports/:id', (req, res) => {
    console.log(req.params.id)
    // TODO: read and generate report from generated file
    // Non-blocking IO ops
    // But consider processing data after read is a CPU-intensive ops
    // => Move to worker thread
    // const reports = await getReport(req.params.id)
    res.send([
        {
          id: 1,
          name: 'Integers',
          noOfElements: 32
        },
        {
          id: 2,
          name: 'Real numbers',
          noOfElements: 23
        },
        {
          id: 3,
          name: 'Alphabetical strings',
          noOfElements: 111
        },
        {
          id: 4,
          name: 'Alphanumerics',
          noOfElements: 1040
        }
      ]
    )
  })

  const listener = app.listen(port, () => {
    console.log(listener.address())
    console.log(`Example app listening at http://localhost:${port}`)
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

