const ffmpeg = require('fluent-ffmpeg'),
    fse = require('fs-extra'),
    path = require('path'),
    { parentPort, workerData } = require('worker_threads'),
    {getArchive} = require('./filevars')
    filevars = require('./filevars'),
    archiver = require('archiver')


const encodeDir = async () => {
    const processingData = workerData
    processingData.encodedDir = `${processingData.destDir}-encoded`
    filevars.setGzPath(path.resolve(__dirname, processingData.encodedDir + '.tar'))
    processingData.gz = filevars.getGzPath()

    parentPort.postMessage({'gz': String(processingData.gz), })
    // processingData.archive = archiver('tar')

    // processingData.archive.pipe(fse.createWriteStream(processingData.gz))
    getArchive().pipe(fse.createWriteStream(processingData.gz))

    console.log('from worker: ara, ara it works')
    try {
        await fse.ensureDir(processingData.destDir)

        fse.readdir(processingData.destDir, (err, files) => {
            if (err) {
                console.log(err);
                next(err);
            }

            filevars.setFileLength(files.length)

            files.forEach((filename) => {
                let fullPath = path.resolve(processingData.destDir, filename);
                let baseOutputPath = path.resolve(__dirname, processingData.encodedDir);
                let outputPath = path.resolve(baseOutputPath, filename);
                fse.createFile(outputPath);
                let startTime = Date.now();

                processingData.baseOutputPath = baseOutputPath;

                ffmpeg()
                    .input(fullPath)
                    .videoCodec("libwebp")
                    .noAudio()
                    .on("progress", (info) => {
                        console.log(`Encoding: ${info.timemark}`);
                    })
                    .on("end", () => {
                        let endTime = Date.now();
                        console.log(
                            `Encoding finished after ${(endTime - startTime) / 1000} seconds`
                        );
                        filevars.setFileLength(filevars.getFileLength() - 1)
                        // processingData.archive.append(fse.createReadStream(outputPath), {
                        getArchive().append(fse.createReadStream(outputPath), {
                            name: filename,
                        });
                    })
                    .on("error", (err, stdout, stderr) => {
                        console.error(`Error: ${err.message}`);
                        console.error(`ffmpeg output: ${stdout}`);
                        console.error(`ffmpeg stderr: ${stderr}`);
                        console.error(`An error occurred during encoding: ${err.message}`);
                        filevars.setFileLength(filevars.getFileLength() - 1)
                        
                        // processingData.archive.append(fse.createReadStream(fullPath), {name: filename} )
                    })
                    .save(outputPath);
                    
                    // filevars.setArchive(processingData.archive)
                    // console.log('finished conversion tasks !')
                    
            }); // END files.forEach(cb)
        });

    } catch (e) {
        console.error(e)
    }
}

encodeDir()