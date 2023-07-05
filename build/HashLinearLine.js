import { HashObject } from "./HashObject.js";
import { Utilities } from "./Utilities.js";
export class HashLinearLine extends HashObject {
    startPoint;
    endPoint;
    constructor(maxDimensions, pointFactoryMethod, startPoint, endPoint) {
        super(maxDimensions, pointFactoryMethod);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.internalStorage.addCoordinate(startPoint, false);
        this.internalStorage.addCoordinate(endPoint, false);
    }
    // Will Provide A Problem
    generateLine() {
        this.internalStorage.reset();
        this.internalStorage.addCoordinates(Utilities.bresenham(this.startPoint, this.endPoint, 0), false);
        return this;
    }
    changeEndPoints(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.internalStorage.reset();
        this.internalStorage.addCoordinate(startPoint, false);
        this.internalStorage.addCoordinate(endPoint, false);
        return this;
    }
}
