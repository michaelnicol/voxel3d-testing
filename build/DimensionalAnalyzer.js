import { PointFactoryMethods } from "./PointFactoryMethods.js";
/**
 * The Pythagorean Map is designed to analyze the dimension ranges of an VoxelStorage and group stored coordinates. This grouping will compact and project the VoxelStorage tree down by one dimension.
 *
 * Projected coordinates are then sorted by it's distance from (0,0...) in the projected dimension.
 *
 * This data structure is not designed to be dynamic and does not update whenever the tree recieves or removes a coordinate.
 *
 * This analysis is used for Polygon rasterization
 *
 */
export class DimensionalAnalyzer {
    #tree;
    keyDimension = -1;
    storageMap = new Map();
    dimensionFactoryMethod;
    dimensionLowerFactoryMethod;
    constructor(tree) {
        this.dimensionLowerFactoryMethod = PointFactoryMethods.getFactoryMethod(tree.getMaxDimensions() - 1);
        this.dimensionFactoryMethod = PointFactoryMethods.getFactoryMethod(tree.getMaxDimensions());
        this.#tree = tree;
    }
    generateStorageMap(keyDimension) {
        if (this.#tree.getCoordinateCount() > 0) {
            this.keyDimension = keyDimension;
            this.storageMap = new Map();
            let points = this.#tree.getCoordinateList(false, false);
            for (let point of points) {
                if (this.storageMap.get(point[this.keyDimension]) === undefined) {
                    this.storageMap.set(point[this.keyDimension], []);
                }
                this.storageMap.get(point[this.keyDimension]).push(this.dimensionLowerFactoryMethod(point.filter((v, i) => i != this.keyDimension)));
            }
        }
        return this.storageMap;
    }
}
