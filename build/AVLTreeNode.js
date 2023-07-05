export class AVLTreeNode {
    left;
    right;
    parent;
    value;
    amount = 1;
    balance = 0;
    constructor(left, parent, right, value) {
        this.left = left;
        this.right = right;
        this.parent = parent;
        this.value = value;
    }
    setBalance(h) {
        this.balance = h;
    }
    getBalance() {
        return this.balance;
    }
    increaseBalance() {
        this.balance += 1;
    }
    decreaseBalance() {
        this.balance -= 1;
    }
    toPrint() {
        let leftPrint = "undefined";
        let rightPrint = "undefined";
        let parentPrint = "undefined";
        if (this.hasLeft()) {
            leftPrint = this.getLeft()?.getValue() === undefined ? leftPrint : this.getLeft()?.getValue()?.toPrint();
        }
        if (this.hasRight()) {
            rightPrint = this.getRight()?.getValue() === undefined ? rightPrint : this.getRight()?.getValue()?.toPrint();
        }
        if (this.hasParent()) {
            parentPrint = this.getParent()?.getValue() === undefined ? parentPrint : this.getParent()?.getValue()?.toPrint();
        }
        return `<L: ${leftPrint}, P: ${parentPrint}, V: {${this.getValue() === undefined ? "undefined" : this.getValue()?.toPrint()}}, A: ${this.amount}, R: ${rightPrint}, B: ${this.balance}>`;
    }
    // Interface
    preHash() {
        return this;
    }
    setLeft(newLeft) {
        this.left = newLeft;
        if (newLeft != undefined) {
            newLeft.setParent(this);
        }
    }
    setRight(newRight) {
        this.right = newRight;
        if (newRight != undefined) {
            newRight.setParent(this);
        }
    }
    setParent(newParent) {
        this.parent = newParent;
        return this;
    }
    setValue(value) {
        this.value = value;
        return this;
    }
    increaseAmount() {
        this.amount += 1;
        return this;
    }
    decreaseAmount() {
        this.amount -= 1;
        if (this.amount < 0) {
            throw new Error("Binary Tree Node amount can not be less than zero");
        }
        return this;
    }
    resetAmount() {
        this.amount = 0;
        return this;
    }
    hasParent() {
        return this.parent != null;
    }
    // GETTERS
    hasLeft() {
        return this.left != null;
    }
    hasRight() {
        return this.right != null;
    }
    getLeft() {
        return this.left;
    }
    getRight() {
        return this.right;
    }
    getValue() {
        return this.value;
    }
    getAmount() {
        return this.amount;
    }
    getParent() {
        return this.parent;
    }
}
