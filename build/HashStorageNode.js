export class HashStorageNode {
    hashMap = new Map();
    value;
    amount = 1;
    constructor(value) {
        this.value = value;
    }
    ;
    preHash() {
        return this;
    }
    getValue() {
        return this.value;
    }
    toPrint() {
        let str = "[" + this.value + ": ";
        for (let [key, value] of this.hashMap) {
            str += `<${key}, ${this.hashMap.get(Number(value))}>`;
        }
        return str + "]";
    }
    increaseAmount() {
        this.amount += 1;
    }
    decreaseAmount() {
        this.amount -= 1;
        if (this.amount < 0) {
            throw new Error("Negative Amount");
        }
    }
    getAmount() {
        return this.amount;
    }
    getHashMap() {
        return this.hashMap;
    }
}
