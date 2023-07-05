export class NumberWrapper {
    data;
    constructor(data) {
        this.data = data;
    }
    preHash() {
        return this.data;
    }
    toPrint() {
        return `${this.data}`;
    }
}
