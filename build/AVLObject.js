import { VoxelStorage } from "./VoxelStorage.js";
export class AVLObject {
    internalStorage;
    maxDimensions;
    constructor(maxDimensions) {
        this.maxDimensions = maxDimensions;
        this.internalStorage = new VoxelStorage(maxDimensions);
    }
    setStorage(newStorage) {
        this.internalStorage = newStorage;
    }
    hasCoordinate(p) {
        return this.internalStorage.hasCoordinate(p);
    }
    getMaxDimensions() {
        return this.maxDimensions;
    }
    getCoordinateCount() {
        return this.internalStorage.getCoordinateCount();
    }
    getCoordinateList(duplicates, instances) {
        return this.internalStorage.getCoordinateList(duplicates, instances);
    }
    addCoordinates(coordinatesToAdd, allowDuplicates) {
        for (let c of coordinatesToAdd) {
            this.internalStorage.addCoordinate(c, allowDuplicates);
        }
        return this;
    }
    removeCoordinates(coordinatesToRemove) {
        let removeRanges = [];
        for (let c of coordinatesToRemove) {
            removeRanges.push(...this.internalStorage.removeCoordinate(c, false));
        }
        this.internalStorage.findRangeInclusive(removeRanges);
        return this;
    }
    preHash() {
        return this;
    }
    toPrint() {
        let list = this.internalStorage.getCoordinateList(true, false);
        let str = "[";
        for (let i = 0; i < list.length; i++) {
            str += list[i].toPrint();
            if (i + 1 != list.length) {
                str += ",";
            }
        }
        return str + "]";
    }
    clone() {
        const newObject = new AVLObject(this.maxDimensions);
        newObject.internalStorage = this.internalStorage.clone();
        return newObject;
    }
}
