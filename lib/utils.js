const {API_URL} = require('./config'),
    axios = require('axios'),
    imageDownloader = require('image-downloader')

exports.getChapter = async (chapter, url = API_URL) => {
    try {
        let response = await axios.get(url + chapter);

        if (response.status === 200)  
            return response.data
        else 
            return false; 
    } catch (e) {
        console.error(e)
        return false
    }
}

exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

exports.safeDirName = name => name.toString().replace(/[^a-z0-9 ]/gi, '_');

exports.downloadImage = async options => {
    try {
        const { filename, image } = await imageDownloader.image(options);
        console.log(filename);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

