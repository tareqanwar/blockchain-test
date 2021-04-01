const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    constructor() {
        this.chain = [];
        this.height = -1;
        console.log('Hi');
        this.initializeChain();
    }

    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                let chainHeight = await self.getChainHeight();
                if(chainHeight > 0) {
                    const previousBlock = await self.getBlockByHeight(chainHeight);
                    block.previousBlockHash = previousBlock.hash;
                }
                block.height = ++chainHeight;
                block.time = new Date().getTime().toString().slice(0, -3);
                block.hash = SHA256(JSON.stringify(block)).toString();
    
                self.chain.push(block);
                self.chain.height = chainHeight;
    
                resolve(block);
            } catch(err) {
                reject(err);
            }

            resolve(null);
        });
    }

    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            resolve(`${address}:${new Date().getTime().toString().slice(0, -3)}:starRegistry`);
        });
    }

    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            const messageParts = message.split(':');
            if (messageParts.length === 3) {
                const time = parseInt(messageParts[1]);
                const currentTime = parseInt(new Date().getTime().toString().slice(0, -3));

                if(currentTime - time <= 300) {
                    if(bitcoinMessage.verify(message, address, signature)) {
                        const block = new BlockClass.block({owner: address, data: star});
                        resolve(await self._addBlock(block));
                    } else {
                        reject('Verification failed');
                    }
                }

                reject('Elasped time is more than 5 minutes. Failed!')
            }
            
            reject('Invalid message!');
        });
    }

    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(b => b.hash === hash)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(b => b.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(b => b.owner === address)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            let latestBlockHash = null;
            self.chain.forEach(async block => {
                const isValid = await block.validate();
                if (!isValid || block.previousBlockHash !== latestBlockHash) {
                    errorLog.push({ block, error: "Failed to validate the block!"})
                }
                latestBlockHash = block.previousBlockHash;
            });

            resolve(errorLog);
        });
    }

}

module.exports.Blockchain = Blockchain;   