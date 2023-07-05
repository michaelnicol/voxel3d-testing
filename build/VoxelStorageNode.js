import { AVLTree } from "./AVLTree.js";
import { VoxelStorageComparator } from "./VoxelStorageComparator.js";
export class VoxelStorageNode {
    data;
    binarySubtree = new AVLTree(undefined, new VoxelStorageComparator());
    constructor(data) {
        this.data = data;
    }
    getBinarySubTreeRoot() {
        return this.binarySubtree.getRoot();
    }
    removeItem(numberToRemove) {
        return this.binarySubtree.removeItem(new VoxelStorageNode(numberToRemove));
    }
    addItem(numberToAdd) {
        return this.binarySubtree.addItem(new VoxelStorageNode(numberToAdd));
    }
    getItem(numberToCheck) {
        return this.binarySubtree.getItem(new VoxelStorageNode(numberToCheck));
    }
    hasItem(numberToCheck) {
        return this.binarySubtree.hasItem(new VoxelStorageNode(numberToCheck));
    }
    getBinarySubTree() {
        return this.binarySubtree;
    }
    getData() {
        return this.data;
    }
    preHash() {
        return this.data;
    }
    toPrint() {
        return `Data: ${this.data}, SubNodes: ${this.binarySubtree.size()}`;
    }
}
