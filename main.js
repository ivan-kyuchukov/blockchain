const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount= amount;
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        let emptyTransactions = [new Transaction('0', '0', 0)];
        return new Block(Date.now(), emptyTransactions, 0);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        let newBlock = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        newBlock.mineBlock(this.difficulty);

        this.chain.push(newBlock);

        this.pendingTransactions = [];
        this.pendingTransactions.push(
            new Transaction(null, miningRewardAddress, this.miningReward)
        );
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for(let block of this.chain) {
            for(let transaction of block.transactions) {
                if(transaction.fromAddress === address) {
                    balance -= transaction.amount;
                }

                if(transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(currentBlock.hash !== currentBlock.calculateHash() ) {
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
            
            return true;
        }
    }
}

let vakCoin = new Blockchain();


vakCoin.createTransaction(new Transaction("address1", "address2", 100))
vakCoin.createTransaction(new Transaction("address2", "address1", 50))

console.log("Starting the miner..");
vakCoin.minePendingTransactions("vakosAddress");

console.log("Balance: " + vakCoin.getBalanceOfAddress("address1"));
console.log("Balance: " + vakCoin.getBalanceOfAddress("address2"));
console.log("Balance: " + vakCoin.getBalanceOfAddress("vakosAddress"));

console.log(vakCoin.isChainValid());