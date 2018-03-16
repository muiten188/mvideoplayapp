const RNFetchBlob = require('react-native-fetch-blob').default;
const IMEI = require('react-native-imei');
const {
    fs
} = RNFetchBlob;
const activeDownloads = {};
const baseDir = '/storage/emulated/0/';
const arrDowloading = [];
const _arrUrlDowloading = [];
const _indexDowloading = 0;
if (checkExits(baseDir + "m_videoplay") == false) {
    fs.mkdir(baseDir + "m_videoplay");
}
//call the downloadVideo function
// downloadVideo('...', baseCacheDir)
//Function to download a file..

function _getFileNameByPath(path) {

    return path.replace(/^.*[\\\/]/, '');
}

export async function downloadVideo(fromUrl, toFile, forceDowload) {
    let _toFile = toFile;
    if (!toFile) {
        _toFile = baseDir + "m_videoplay" + "/" + _getFileNameByPath(fromUrl);
    }
    // use toFile as the key
    if (arrDowloading.indexOf(fromUrl) > -1) {
        console.log("dowloading: " + fromUrl);
        return;
    }
    let checkFile = await checkExits(_toFile);
    if (checkFile == false || forceDowload) {
        if (forceDowload) {
            await deleteFile(_toFile);
        }
        console.log("dowloading: " + _toFile);
        arrDowloading.push(fromUrl);
        activeDownloads[_toFile] = new Promise((resolve, reject) => {
            RNFetchBlob
                .config({
                    path: _toFile
                })
                .fetch('GET', fromUrl)
                .then(res => {
                    if (Math.floor(res.respInfo.status / 100) !== 2) {
                        throw new Error('Failed to successfully download video');
                    }
                    resolve(_toFile);
                })
                .catch(err => {
                    console.log("dowload error")
                    return deleteFile(_toFile)
                        .then(() => reject(err));
                })
                .finally(() => {
                    // cleanup
                    var index = arrDowloading.indexOf(fromUrl);
                    if (index > -1) {
                        arrDowloading.splice(index, 1);
                    }
                    delete activeDownloads[_toFile];
                });
        });
        return activeDownloads[_toFile];
    }
}

//To delete a file..

export function deleteFile(filePath) {
    return fs.stat(filePath)
        .then(res => res && res.type === 'file')
        .then(exists => exists && fs.unlink(filePath)) //if file exist
        .catch((err) => {
            // swallow error to always resolve
        });
}

export function checkVideoCacheExits(filePath) {
    let tempFilePath = baseDir + "m_videoplay" + "/" + _getFileNameByPath(filePath)
    return checkExits(tempFilePath);
}

function checkExits(path) {
    return fs.exists(path);
}
export function getLinkVideoCacheExits(filePath) {
    var index = arrDowloading.indexOf(filePath);
    if (index > -1) {
        return filePath
    }
    else {
        let tempFilePath = "file://" + baseDir + "m_videoplay" + "/" + _getFileNameByPath(filePath);
        return tempFilePath;
    }
}

export function getIMEI() {
    let imei = IMEI.getImei();
    return imei;
}


export async function deleteEntireFolder(path) {
    let _path = path;
    if (!path) {
        _path = baseDir + "m_videoplay";
    }
    console.log("deleting: " + _path);
    await fs.unlink(_path)
    await fs.mkdir(baseDir + "m_videoplay");
}