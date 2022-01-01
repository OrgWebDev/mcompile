const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid') 
// v4 version is used as uuid(uuid can be replaced with custom name)

const dirCodes = path.join(__dirname, 'codes')

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, {recursive: true});
}

const generateScript = async (format, content) => {
    const jobId = uuid(); // random id generator
    const filename = `${jobId}.${format}` 
    const filepath = path.join(dirCodes, filename);
    await fs.writeFileSync(filepath, content);
    return filepath;
};

module.exports = {
    generateScript,
};