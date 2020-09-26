const fse = require('fs-extra'),
    path = require('path'),
    {sleep} = require('./utils'),
    filevars = require('./filevars'),
    {Worker, parentPort} = require('worker_threads')


let processingData = {
    imgDownloaded: false,
    doneProcessing: false,
}

exports.testEncodeMiddleware = async (req, res, next) => {
    next()
        // processingData.logFile = fse.createFile(`${processingData.encodedDir}-log.txt`)

    const worker = new Worker(__dirname + '/testEncodingWorker.js',
        { workerData: {destDir: String(path.resolve(__dirname, `../public/gto/vol1/ch02`))} })

    worker.once('message', (msg) => {
        console.log(msg)
        processingData.tarFile = msg.gz
    })

    worker.on('error', (err) => {
        console.error(err)
    })

    worker.on('exit', (code) => {
        if (code !== 0) {
            new Error(`An error occured when encoding ${code}`)
        }
        console.info(`Worker process stopped with code: ${code}`)
        processingData.doneProcessing = true
        // filevars.getArchive().finalize()
    })
}

exports.testEncodeMsg = (req, res) => {
    res.send('(test) encoding started \n')
}

exports.testEncodeProgress = (req, res) => {
    if (processingData.doneProcessing) {
        try {
            filevars.getArchive()?.finalize()
        }catch (e) {
            res.send({'msg': '(test) encoding finished !', 
                tarFile: processingData.tarFile})
        }
    } else {
        res.send('(test) encoding imgs...\n')
    }
}