const {API_URL} = require('./config'),
    {getChapter, sleep, downloadImage} = require('./utils'),
    fs = require('fs-extra'),
    path = require('path'),
    filevars = require('./filevars'),
    {Worker, parentPort} = require('worker_threads')
   
let processingData = {
    imgDownloaded: false,
    processingData: false,
}

exports.home = (req, res) => {
    res.send("a nikonikonii to you. it works !")
}

exports.downloadMiddleware = async (req, res, next) => {
    next()
    let manga = req.params.manga
    let meta = await getChapter(req.params.chapter);
    
    if (!meta) {
        return;
    }
    // let destDir = `../public/${safeDirName(manga)}/volume_${safeDirName(meta.volume || 'misc')}/chapter_${safeDirName(meta.chapter || 1)}`;
    let destDir = path.resolve(__dirname, `../public/${safeDirName(manga)}/volume_${safeDirName(meta.volume || 'misc')}/chapter_${safeDirName(meta.chapter || 1)}`)
    processingData.destDir = destDir

    try {
        await fs.ensureDir(destDir);
    } catch (e) {
        return console.error(e);
    }
    let pages = meta.page_array;
    processingData.pages = pages
    
    for (let i = 0; i < pages.length; i++) {
        let img = await downloadImage({
            url: `${meta.server}${meta.hash}/${meta.page_array[i]}`,
            dest: destDir
        });
        if (!img) {
            return;
        }
        await sleep(1000);
    }
    console.log('done');
    processingData.imgDownloaded = true
}

exports.downloadMsg = (req, res) => {
    res.send(`download started... ~${processingData.pages} images`)
}

exports.downloadProgress = (req, res) => {
    if (processingData.imgDownloaded) {
        res.send(`imgs downloaded sucessfully ! ${processingData}`)
    } else {
        res.send(`downloading... ${processingData}`)
    }
}

exports.encodeMiddleware = async (req, res, next) => {
    next()

    const worker = new Worker(__dirname + '/encodingWorker.js',
        { workerData: {destDir: processingData.destDir} })

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
    })
}

exports.encodeMsg = (req, res) => {
    res.send('encoding started ')
}

exports.encodeProgress = (req, res) => {
    if (processingData.doneProcessing) {
        try {
            filevars.getArchive()?.finalize()
        }catch (e) {
            res.send({'msg': '(test) encoding finished !', 
                tarFile: processingData.tarFile})
        }
    } else {
        res.send('encoding imgs...\n')
    }
}
