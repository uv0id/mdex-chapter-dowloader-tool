const archiver = require('archiver')

let archieve = archiver('tar')
let gzPath = null, destDir = null, fileLenght = 1


exports.getArchive = () => archieve
exports.setArchive = (value) => archieve = value

exports.getGzPath = () => gzPath
exports.setGzPath = (value) => gzPath = value

exports.getDestDir = () => destDir
exports.setDestDir = (path) => destDir = path

exports.setFileLength = (length) => fileLenght = length
exports.getFileLength = () => fileLenght