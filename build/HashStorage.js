import { HashStorageNode } from "./HashStorageNode.js";
import { PointFactoryMethods } from "./PointFactoryMethods.js";
export class HashStorage {
    hashMap = new Map;
    maxDimensions;
    pointFactoryMethod;
    coordinateCount = 0;
    constructor(maxDimensions) {
        if (maxDimensions < 1 || maxDimensions === undefined) {
            throw new Error("Invalid Depth: Can not be less than 1 or undefined: " + maxDimensions);
        }
        this.maxDimensions = maxDimensions;
        this.pointFactoryMethod = PointFactoryMethods.getFactoryMethod(maxDimensions);
    }
    reset() {
        this.hashMap = new Map;
        this.coordinateCount = 0;
    }
    removeCoordinate(p) {
        if (!this.hasCoordinate(p)) {
            return;
        }
        this.coordinateCount -= 1;
        var workingMap = this.hashMap;
        for (let i = 0; i < p.arr.length; i++) {
            let j = p.arr[i];
            let workingNode = workingMap.get(j);
            workingNode.decreaseAmount();
            if (workingNode.getAmount() === 0) {
                workingNode.getHashMap().delete(j);
                return;
            }
            workingMap = workingNode.getHashMap();
        }
    }
    hasCoordinate(p) {
        var workingMap = this.hashMap;
        for (let i = 0; i < p.arr.length; i++) {
            let j = p.arr[i];
            if (workingMap.has(j)) {
                workingMap = workingMap.get(j).getHashMap();
            }
            else {
                return false;
            }
        }
        return true;
    }
    addCoordinates(coordinates, allowDuplicates) {
        for (let point of coordinates) {
            this.addCoordinate(point, allowDuplicates);
        }
    }
    addCoordinate(p, allowDuplicates) {
        if (this.hasCoordinate(p) && !allowDuplicates) {
            return;
        }
        if (!this.hasCoordinate(p)) {
            this.coordinateCount += 1;
        }
        var workingMap = this.hashMap;
        for (let i = 0; i < p.arr.length; i++) {
            if (workingMap.has(p.arr[i])) {
                let targetNode = workingMap.get(p.arr[i]);
                targetNode.increaseAmount();
                workingMap = targetNode.getHashMap();
            }
            else {
                workingMap = workingMap.set(p.arr[i], new HashStorageNode(p.arr[i]));
                workingMap = workingMap.get(p.arr[i]).getHashMap();
            }
        }
    }
    #getCoordinatesListRecursiveCall(currentNode, currentCoordinate, coordinateList, depth, duplicates, instances) {
        currentCoordinate.push(currentNode.getValue());
        if (depth === this.maxDimensions) {
            for (let i = 0; i < currentNode.amount; i++) {
                if (instances) {
                    coordinateList.push(this.pointFactoryMethod(currentCoordinate));
                }
                else {
                    coordinateList.push([...currentCoordinate]);
                }
                if (!duplicates) {
                    break;
                }
            }
        }
        else {
            for (let [key, value] of currentNode.getHashMap()) {
                this.#getCoordinatesListRecursiveCall(value, [...currentCoordinate], coordinateList, depth + 1, duplicates, instances);
            }
        }
    }
    getCoordinateList(allowDuplicates, instances) {
        let coordinateList = [];
        for (let [key, value] of this.hashMap) {
            this.#getCoordinatesListRecursiveCall(value, [], coordinateList, 1, allowDuplicates, instances);
        }
        return coordinateList;
    }
    preHash() {
        return this;
    }
    toPrint() {
        return JSON.stringify(this.getCoordinateList(true, false));
    }
    getCoordinateCount() {
        return this.coordinateCount;
    }
}
