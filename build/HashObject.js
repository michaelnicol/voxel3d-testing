import { HashStorage } from "./HashStorage.js";
export class HashObject {
    internalStorage;
    pointFactoryMethod;
    maxDimensions;
    constructor(maxDimensions, pointFactoryMethod) {
        this.maxDimensions = maxDimensions;
        this.pointFactoryMethod = pointFactoryMethod;
        this.internalStorage = new HashStorage(maxDimensions);
    }
    reset() {
        this.internalStorage.reset();
    }
    hasCoordinate(p) {
        return this.internalStorage.hasCoordinate(p);
    }
    getFactoryMethod() {
        return this.pointFactoryMethod;
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
        for (let c of coordinatesToRemove) {
            this.internalStorage.removeCoordinate(c);
        }
        return this;
    }
    preHash() {
        return this;
    }
    toPrint() {
        return JSON.stringify(this.internalStorage.getCoordinateList(true, false));
    }
}
