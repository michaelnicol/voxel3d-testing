import { AVLObject } from "./AVLObject.js";
import { Utilities } from "./Utilities.js";
import { DimensionalAnalyzer } from "./DimensionalAnalyzer.js";
import { PointFactoryMethods } from "./PointFactoryMethods.js";
/**
 * E is the dimension of the polygon, K is the one less.
 */
export class AVLPolygon extends AVLObject {
    vertices = [];
    #storageMap;
    passes = -1;
    useSort = false;
    pointLowerFactoryMethod;
    pointFactoryMethod;
    hasEdges = false;
    hasFill = false;
    constructor(v, maxDimensions) {
        super(maxDimensions);
        this.pointFactoryMethod = PointFactoryMethods.getFactoryMethod(maxDimensions);
        this.pointLowerFactoryMethod = PointFactoryMethods.getFactoryMethod(maxDimensions - 1);
        for (let coord of v) {
            this.vertices.push(coord.clone());
            this.internalStorage.addCoordinate(coord, false);
        }
        this.#storageMap = new DimensionalAnalyzer(this.internalStorage);
    }
    changeVertices(v) {
        this.vertices = [];
        this.internalStorage.reset();
        v.forEach((coord) => this.vertices.push(coord.clone()));
        this.internalStorage.addCoordinates(this.vertices, false);
        this.useSort = false;
        this.passes = -1;
        this.hasEdges = false;
        this.hasFill = false;
        return this;
    }
    createEdges() {
        this.internalStorage.reset();
        this.useSort = false;
        this.passes = -1;
        this.hasEdges = true;
        this.hasFill = false;
        for (let i = 0; i < this.vertices.length; i++) {
            if (i + 1 === this.vertices.length) {
                this.internalStorage, this.addCoordinates(Utilities.bresenham(this.vertices[i], this.vertices[0], 0), false);
            }
            else {
                this.internalStorage, this.addCoordinates(Utilities.bresenham(this.vertices[i], this.vertices[i + 1], 0), false);
            }
        }
        return this;
    }
    fillPolygon(passes, useSort) {
        if (passes > this.maxDimensions) {
            throw new Error("Passes is greater than max dimensions");
        }
        this.hasFill = true;
        this.passes = passes;
        this.useSort = useSort;
        this.internalStorage.findRangeOutdatedRanges();
        let sortedSpans = this.internalStorage.getSortedRange();
        let referencePoint = this.pointLowerFactoryMethod(new Array(this.maxDimensions - 1).fill(0));
        for (let i = 0; i < passes; i++) {
            this.#storageMap.generateStorageMap(sortedSpans[i][0]);
            this.#storageMap.storageMap.forEach((value, key) => {
                value = Utilities.pythagoreanSort(value, referencePoint);
                if (useSort) {
                    let startingValue = Utilities.convertDimensionHigher(value[0], this.#storageMap.keyDimension, key, this.maxDimensions - 1);
                    let endingValue = Utilities.convertDimensionHigher(value[value.length - 1], this.#storageMap.keyDimension, key, this.maxDimensions - 1);
                    this.internalStorage.addCoordinates(Utilities.bresenham(startingValue, endingValue, 0), false);
                }
                else {
                    for (let j = 0; j < value.length - 1; j++) {
                        let startingValue = Utilities.convertDimensionHigher(value[j], this.#storageMap.keyDimension, key, this.maxDimensions - 1);
                        let endingValue = Utilities.convertDimensionHigher(value[j + 1], this.#storageMap.keyDimension, key, this.maxDimensions - 1);
                        this.internalStorage.addCoordinates(Utilities.bresenham(startingValue, endingValue, 0), false);
                    }
                }
            });
        }
        return this;
    }
    clone() {
        let polygon = new AVLPolygon([...this.vertices].reduce((accumulator, value) => {
            return accumulator.push(value), accumulator;
        }, []), this.maxDimensions);
        if (this.hasEdges) {
            polygon.createEdges();
        }
        if (this.hasFill) {
            polygon.fillPolygon(this.passes, this.useSort);
        }
        return polygon;
    }
}
