const BASE64_JS = require('./base64-js');
let Parser = require('node-dbf').default;

const CHARSET = 'windows-1251';
const CHARSET_2 = 'utf-8';
const FIELD_ISMARK = 'ISMARK';


// let parser = new Parser('./dbf/SC40575.DBF', { encoding: 'base64' });
// let parser = new Parser('./dbf/SC44886.DBF', { encoding: 'base64' });
let parser = new Parser('./dbf/SC11450.DBF', { encoding: 'base64' });

function Base64Decode(str, encoding = 'utf-8') {
    var bytes = BASE64_JS.toByteArray(str);
    return new (TextDecoder || TextDecoderLite)(encoding).decode(bytes);
}

parser.on('start', (start) => {
    console.log('STARTED');
    console.log(start);
    console.log(' ');
});

let numericFields = [];
parser.on('header', (header) => {
    console.log('HEADER');

    if (header && header.type) {
        header.type = Base64Decode(header.type, 'utf-8');
    }

    if (header && header.fields && header.fields.length > 0) {
        header.fields.forEach((item) => {
            if (item.name) {
                item.name = Base64Decode(item.name, CHARSET).replace(/\x00/gi, '');
            }
            if (item.type) {
                item.type = Base64Decode(item.type, CHARSET).replace(/\x00/gi, '');
            }

            if (item.type === 'N') {
                numericFields.push(item.name);
            }
        });
    }

    console.log(header);
    console.log(' ');
});

parser.on('record', (record) => {
    // if (record && record['@sequenceNumber'] && record['@sequenceNumber'] === 1) {
        try {
            Object.keys(record).forEach((key) => {
                if (key !== '@sequenceNumber' && key !== '@deleted') {
                    if (record[key] && typeof(record[key]) === 'string' && record[key].length > 0) {
                        let encoded = null;

                        try {
                            encoded = Base64Decode(record[key], CHARSET).trim();
                        } catch(error) {
                            encoded = Base64Decode(record[key], CHARSET_2).trim();
                            // encoded = record[key];
                            // throw('Encodiing error');
                        }

                        if (encoded !== null) {
                            record[key] = encoded;
                        }
                    }
                }
    
                if (key === FIELD_ISMARK) {
                    if (record[key] === '') {
                        record[key] = false;
                    } else {
                        record[key] = true;
                    }
                }
    
                if (record[key] === '') {
                    record[key] = null;
                }
    
                if (numericFields.indexOf(key) !== -1 && isNaN(record[key])) {
                    record[key] = null;
                }
    
            });
            console.log(record);
            console.log(' ');

        } catch(error) {
            console.error(error);
            console.log(record);
            console.log(' ');
        }
    // }
});

parser.on('end', (end) => {
    console.log('FINISHED');
    console.log(end);
    console.log(' ');
});

parser.parse();
