const SHA256 = require('crypto-js/sha256');
const hex2ascii = require('hex2ascii');

class Block {

	constructor(data){
		this.hash = null;
		this.height = 0;
		this.body = Buffer(JSON.stringify(data)).toString('hex');
		this.time = 0;
		this.previousBlockHash = null;
    }
    
    validate() {
        let self = this;
        return new Promise((resolve, reject) => {
            const currentHash = self.hash;
                                            
            const calculatedHash = SHA256(JSON.stringify(self)).toString();

            return resolve(currentHash === calculatedHash);
        });
    }
    
    getBData() {
        let self = this;
        return new Promise((resolve, reject) => {
            const body = self.body;
                                            
            const decodedBody = hex2ascii(self.body);
            const parsedBody = JSON.parse(decodedBody);

            if(self.previousBlockHash === null) {
                resolve(null);
            }

            resolve(parsedBody);
        });
    }

}

module.exports.Block = Block;