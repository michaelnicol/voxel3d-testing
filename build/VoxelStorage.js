import { VoxelStorageNode } from "./VoxelStorageNode.js";
import { AVLTree } from "./AVLTree.js";
import { VoxelStorageComparator } from "./VoxelStorageComparator.js";
import { Point3D } from "./Point3D.js";
import { PointFactoryMethods } from "./PointFactoryMethods.js";
export class VoxelStorage {
    /**
     * This object holds a hashmap of the dimension as the key, and the value is the extremes for that dimension. Dimensions start at zero for x.
     *
     * dimensionNumber: [minValue, minAmount, maxValue, maxAmount]
     *
     * The amount of numbers in the data set that are the min and max are also stored. This prevents re-calculation of the range for a dimension if a,
     * number is removed from the dataset that is not an extreme or it is not the only instance.
     *
     * If no coordinates are in the tree and findRange is called, the min and max of each dimension will become the min and max integer limits. This is because all future coordinates could exist in that range.
     * This is why the minAmount and maxAmount should be checked.
     *
     */
    #dimensionRange = new Map();
    outdatedDimensionRanges = new Map();
    /**
     * The root is the AVL tree that contains all of the x values. Each node contains the x-value, and a binary tree containing all of the y-values that have followed that x-value.
     * This processes repeats recursively for all dimensions.
     */
    root = new AVLTree(undefined, new VoxelStorageComparator());
    #maxDimensions = -1;
    /**
     * Amount of coordinates, including duplicates, that are stored in this tree.
     */
    #coordinateCount = 0;
    pointFactoryMethod;
    /**
     * @param maxDimensions The amount of dimensions that this tree will have. For XYZ, this will be 3.
     * @param pointFactoryMethod The factory method create a new instance of that dimension point. For a dimension of 3, pass in: new Point3D().factoryMethod.
     *
     * A factory method is needed because TypeScript can not create instances of generics at run time. Since coordinates are not stored as points internally (but rather nodes on a tree),
     * a factor method must be used to convert collections of tree nodes back into point instances.
     */
    constructor(maxDimensions) {
        if (maxDimensions < 1) {
            throw new Error("Invalid Depth: Can not be less than 1");
        }
        this.#maxDimensions = maxDimensions;
        for (let i = 0; i < this.#maxDimensions; i++) {
            this.#dimensionRange.set(i, [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 0]);
            this.outdatedDimensionRanges.set(i, false);
        }
        this.pointFactoryMethod = PointFactoryMethods.getFactoryMethod(maxDimensions);
    }
    /**
     * @returns Amount of dimensions this tree contains
     */
    getMaxDimensions() {
        return this.#maxDimensions;
    }
    /**
     * @returns Amount of coordinates, including duplicates, that are stored in this tree.
     */
    getCoordinateCount() {
        return this.#coordinateCount;
    }
    hasOutdatedRanges() {
        for (let [key, value] of this.outdatedDimensionRanges) {
            if (value) {
                return true;
            }
        }
        return false;
    }
    reset() {
        this.root = new AVLTree(undefined, new VoxelStorageComparator());
        for (let i = 0; i < this.#maxDimensions; i++) {
            this.#dimensionRange.set(i, [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 0]);
            this.outdatedDimensionRanges.set(i, false);
        }
        this.#coordinateCount = 0;
        return this;
    }
    /**
     * Private recursive method for calculating the range of dimensions within the tree.
     *
     * @param currentNode The current Node the call stack is checking
     * @param depth The current depth of the tree. Zero is for the x (or first) dimension.
     * @param limitingDepth If the parameter specifies useInclusiveRanges, then stop after this depth
     * @param useInclusiveRanges  If the program should use a list of target dimensions to calculate the range for verse calculating ranges up to a depth
     * @param inclusiveRanges Otherwise, without a limiting depth, only re-calculate ranges for this depth.
     */
    #findRangeRecursiveCall(currentNode, depth, limitingDepth, useInclusiveRanges, inclusiveRanges) {
        if (!useInclusiveRanges || depth === inclusiveRanges[inclusiveRanges.length - 1]) {
            if (useInclusiveRanges) {
                // n is the length of the initial inclusiveRanges array
                // Removing from end of array is o(1), so o(n) for all range values;
                // Instead of shift that will be o(n^2).
                inclusiveRanges?.pop();
            }
            const amount = currentNode.getAmount();
            const currentValue = this.#dimensionRange.get(depth);
            // [minValue, minAmount, maxValue, maxAmount]
            if (amount < currentValue[0]) {
                currentValue[0] = amount;
                currentValue[1] = 1;
            }
            if (amount === currentValue[0]) {
                currentValue[1] += 1;
            }
            if (amount > currentValue[2]) {
                currentValue[2] = amount;
                currentValue[3] = 1;
            }
            if (amount === currentValue[2]) {
                currentValue[3] += 1;
            }
        }
        if (currentNode.hasRight()) {
            let rightSubTree = currentNode.getRight();
            this.#findRangeRecursiveCall(rightSubTree, depth, limitingDepth, useInclusiveRanges, inclusiveRanges);
        }
        if (currentNode.hasLeft()) {
            let leftSubTree = currentNode.getLeft();
            this.#findRangeRecursiveCall(leftSubTree, depth, limitingDepth, useInclusiveRanges, inclusiveRanges);
        }
        if (depth < (!useInclusiveRanges ? limitingDepth : this.#maxDimensions - 1)) {
            let downwardSubTree = currentNode.getValue().getBinarySubTreeRoot();
            this.#findRangeRecursiveCall(downwardSubTree, ++depth, limitingDepth, useInclusiveRanges, inclusiveRanges);
        }
    }
    findRangeOutdatedRanges() {
        let ranges = [];
        for (let [key, value] of this.outdatedDimensionRanges) {
            if (value) {
                ranges.push(key);
            }
        }
        return this.findRangeInclusive(ranges);
    }
    /**
     * @param inclusiveRange Re-calculate the range at only these dimensions
     * @returns The current dimension range hashmap
     */
    findRangeInclusive(inclusiveRange) {
        return this.#findRange(true, inclusiveRange, -1);
    }
    /**
     * @param maxDimensions  Re-calculate the range up to these dimensions
     * @returns
     */
    findRangeExclusive(maxDimensions) {
        return this.#findRange(true, [], maxDimensions);
    }
    /**
     * Re-calculates the internal range hash map.
     *
     * @param useInclusive If the program should use a list of target dimensions to calculate the range for verse calculating ranges up to a depth
     * @param inclusiveRange Only calculate the ranges for these dimensions
     * @param exclusiveDepth Otherwise, only calculate up to this depth
     * @returns The dimension range object
     */
    #findRange(useInclusive, inclusiveRange, exclusiveDepth) {
        if (exclusiveDepth > this.#maxDimensions) {
            throw new Error(`Invalid tree height for range call: ${exclusiveDepth} greater than this.#maxDimensions ${this.#maxDimensions}`);
        }
        const range = this.#dimensionRange === undefined ? new Map() : this.#dimensionRange;
        if (!useInclusive) {
            for (let i = 0; i < exclusiveDepth; i++) {
                this.outdatedDimensionRanges.set(i, false);
                range.set(i, [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 0]);
            }
        }
        else {
            inclusiveRange = inclusiveRange?.sort((a, b) => b - a);
            if (inclusiveRange[0] > this.#maxDimensions) {
                throw new Error(`Inclusive Ranges depth too large: ${JSON.stringify(range)}`);
            }
            for (let i = 0; i < inclusiveRange.length; i++) {
                let rangeNumber = inclusiveRange[i];
                this.outdatedDimensionRanges.set(rangeNumber, false);
                range.set(rangeNumber, [Number.MAX_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER, 0]);
            }
        }
        if (this.#coordinateCount === 0) {
            return range;
        }
        this.#findRangeRecursiveCall(this.root.getRoot(), 0, exclusiveDepth, useInclusive, inclusiveRange);
        return range;
    }
    /**
     * Checks if the AVL tree contains this coordinate.
     *
     * @param coordinate
     * @returns
     */
    hasCoordinate(coordinate) {
        const { arr } = coordinate;
        let nodeToFind = new VoxelStorageNode(arr[0]);
        if (!this.root.hasItem(nodeToFind)) {
            return false;
        }
        let currentTree = this.root.getItem(nodeToFind).getValue();
        for (let i = 1; i < arr.length; i++) {
            if (currentTree.hasItem(arr[i])) {
                currentTree = currentTree.getItem(arr[i]).getValue();
            }
            else {
                return false;
            }
        }
        return true;
    }
    addCoordinates(coordinates, allowDuplicates) {
        for (let coord of coordinates) {
            this.addCoordinate(coord, allowDuplicates);
        }
    }
    /**
     * Adds a coordinate to the tree.
     *
     * @param coordinate The coordinate instance to add.
     * @param allowDuplicates If this coordinate already exists in this tree, specify true to ignore it or false to increase the amount of that coordinate.
     * @returns
     */
    addCoordinate(coordinate, allowDuplicates) {
        const { arr } = coordinate;
        var currentNode;
        if (!allowDuplicates && this.hasCoordinate(coordinate)) {
            return;
        }
        this.#coordinateCount += 1;
        for (let i = 0; i < arr.length; i++) {
            const range = this.#dimensionRange.get(i);
            // Calculates the range as each dimension is traversed to prevent needing to call findRange
            if (arr[i] < range[0]) {
                range[0] = arr[i];
                range[1] = 1;
            }
            else if (arr[i] === range[0]) {
                range[1] += 1;
            }
            if (arr[i] > range[2]) {
                range[2] = arr[i];
                range[3] = 1;
            }
            else if (arr[i] === range[2]) {
                range[3] += 1;
            }
            const nodeToAdd = new VoxelStorageNode(arr[i]);
            if (i == 0) {
                this.root.addItem(nodeToAdd);
                currentNode = this.root.getItem(nodeToAdd).getValue();
            }
            else {
                currentNode.addItem(arr[i]);
                currentNode = currentNode.getItem(arr[i]).getValue();
            }
        }
        if (!this.root.hasItem(new VoxelStorageNode(arr[0]))) {
            throw new Error("Internal Error");
        }
    }
    /**
     * Removes a list of coordiantes. calculateRange will batch range calculations to the end of all coordinate removals.
     *
     * @param coordinates List of coordinate instances to remove.
     * @param calculateRange If the dimension ranges should be re-calculated
     * @returns
     */
    removeCoordinateList(coordinates, calculateRange) {
        let rangeList = [];
        for (let coord of coordinates) {
            let ranges = this.removeCoordinate(coord, false);
            for (let v of ranges) {
                if (rangeList.indexOf(v) === -1) {
                    rangeList.push(v);
                }
            }
        }
        if (calculateRange && rangeList.length > 0) {
            this.findRangeInclusive(rangeList);
        }
        return rangeList;
    }
    /**
     * Removes a coordinate of type E from the tree.
     *
     * @param coordinate Coordinate instance to remove
     * @param calculateRange If the dimension ranges should be re-calculated.
     * @returns
     */
    removeCoordinate(coordinate, calculateRange) {
        if (!this.hasCoordinate(coordinate)) {
            return [];
        }
        this.#coordinateCount -= 1;
        // Grab the list of dimension values from the coordinate
        const { arr } = coordinate;
        /**
        * The range list contains the dimension numbers that ranges needs to be re-calculated. This is because, if a y coordinate is removed
        * and it was the min or the max of that y-coordinate range, then a new one must be found.
        */
        const rangeList = [];
        let nodeToFind = new VoxelStorageNode(arr[0]);
        // Find the node that needs to be reduced
        let nodeToReduce = this.root.getItem(nodeToFind);
        let nodeToReduceValue = nodeToReduce.getValue().getData();
        let dimensionEntry = this.#dimensionRange.get(0);
        // If the node to reduce amount is equal to one, this node and its sub-branch is removed from the tree.
        if (nodeToReduce.getAmount() === 1) {
            // If the reduced value is the min of the entire range for that dimension
            if (nodeToReduceValue === dimensionEntry[0]) {
                // And it is the only number that is that min
                if (dimensionEntry[1] === 1) {
                    // That range needs to be re-calculated.
                    rangeList.push(0);
                }
                else {
                    // Otherwise, just reduce the amount of numbers that are the min of that dimension
                    dimensionEntry[1] -= 1;
                }
                // Same applies with the max
            }
            else if (nodeToReduceValue === dimensionEntry[1]) {
                if (dimensionEntry[3] === 1) {
                    rangeList.push(0);
                }
                else {
                    dimensionEntry[3] -= 1;
                }
            }
            // Otherwise, this number is inbetween the min and the max, and the range does not need to be recalculated.
        }
        // The value of each VoxelStorageNode is another tree, and grab that tree.
        let currentTree = this.root.removeItem(nodeToFind).getValue();
        // Start at the second dimension, work your way into all subsequente dimensions.
        for (let i = 1; i < arr.length; i++) {
            nodeToReduce = currentTree.getItem(arr[i]);
            nodeToReduceValue = nodeToReduce.getValue().getData();
            dimensionEntry = this.#dimensionRange.get(i);
            // If the node to reduce amount is equal to one, this node and its sub-branch is removed from the tree.
            if (nodeToReduce.getAmount() === 1) {
                // If the reduced value is the min of the entire range for that dimension
                if (nodeToReduceValue === dimensionEntry[0]) {
                    // And it is the only number that is that min
                    if (dimensionEntry[1] === 1) {
                        // That range needs to be re-calculated.
                        this.outdatedDimensionRanges.set(i, true);
                        rangeList.push(i);
                    }
                    else {
                        // Otherwise, just reduce the amount of numbers that are the min of that dimension
                        dimensionEntry[1] -= 1;
                    }
                    // Same applies with the max
                }
                else if (nodeToReduceValue === dimensionEntry[1]) {
                    if (dimensionEntry[3] === 1) {
                        this.outdatedDimensionRanges.set(i, true);
                        rangeList.push(i);
                    }
                    else {
                        dimensionEntry[3] -= 1;
                    }
                }
                // Otherwise, this number is between the min and the max, and the range does not need to be recalculated.
            }
            currentTree = currentTree.removeItem(arr[i]).getValue();
        }
        if (calculateRange && rangeList.length > 0) {
            this.findRangeInclusive(rangeList);
        }
        else {
        }
        return rangeList;
    }
    /**
     * Private recursive call for collecting the coordinates in the tree.
     *
     * @param currentNode
     * @param currentCoordinate
     * @param allCoordinates Uses a reference to an external list rather than returning that list
     * @param depth
     * @returns
     */
    #getCoordinatesRecursiveCall(currentNode, currentCoordinate, allCoordinates, depth, duplicates, instances) {
        if (currentNode.hasRight()) {
            let rightSubTree = currentNode.getRight();
            this.#getCoordinatesRecursiveCall(rightSubTree, [...currentCoordinate], allCoordinates, depth, duplicates, instances);
        }
        if (currentNode.hasLeft()) {
            let leftSubTree = currentNode.getLeft();
            this.#getCoordinatesRecursiveCall(leftSubTree, [...currentCoordinate], allCoordinates, depth, duplicates, instances);
        }
        if (depth >= this.#maxDimensions) {
            currentCoordinate.push(currentNode.getValue().getData());
            if (duplicates) {
                for (let i = currentNode.getAmount(); i > 0; i--) {
                    if (instances) {
                        allCoordinates.push(this.pointFactoryMethod(currentCoordinate));
                    }
                    else {
                        allCoordinates.push([...currentCoordinate]);
                    }
                }
            }
            else {
                if (instances) {
                    allCoordinates.push(this.pointFactoryMethod(currentCoordinate));
                }
                else {
                    allCoordinates.push([...currentCoordinate]);
                }
            }
            return;
        }
        else {
            currentCoordinate.push(currentNode.getValue().getData());
            let downwardSubTree = currentNode.getValue().getBinarySubTreeRoot();
            this.#getCoordinatesRecursiveCall(downwardSubTree, [...currentCoordinate], allCoordinates, depth + 1, duplicates, instances);
        }
    }
    /**
     *
     * @param duplicates If duplicate coordinates should be returned in the list
     * @returns A list of all of the tree's coordinates, mutation free, where each coordinate is a instance of the pointFactoryMethod.
     */
    getCoordinateList(duplicates, instances) {
        if (this.root.getRoot() === undefined) {
            return [];
        }
        let allCoordinates = [];
        this.#getCoordinatesRecursiveCall(this.root.getRoot(), [], allCoordinates, 1, duplicates, instances);
        return allCoordinates;
    }
    /**
     *
     * @returns An instance of Corners3D which is the coordinates of a 3D rectangle encompassing the coordinates stored in the tree. This can still be calculated if the dimensions are greater than 3. For a 4D tree, this is the volume of space this object exists in across all points in time.
     *
     * @throws Error if the maxDimensions is less than 3.
     */
    getBoundingBox3D() {
        if (this.#maxDimensions < 3) {
            throw new Error("Storage tree depth is less than 3: " + this.#maxDimensions);
        }
        let xRange = this.#dimensionRange.get(0);
        let yRange = this.#dimensionRange.get(1);
        let zRange = this.#dimensionRange.get(2);
        return {
            "0": new Point3D(xRange[0], yRange[0], zRange[0]),
            "1": new Point3D(xRange[2], yRange[0], zRange[0]),
            "2": new Point3D(xRange[0], yRange[2], zRange[0]),
            "3": new Point3D(xRange[2], yRange[2], zRange[0]),
            "4": new Point3D(xRange[0], yRange[0], zRange[2]),
            "5": new Point3D(xRange[2], yRange[0], zRange[2]),
            "6": new Point3D(xRange[0], yRange[2], zRange[2]),
            "7": new Point3D(xRange[2], yRange[2], zRange[2])
        };
    }
    getRanges() {
        let mapToReturn = new Map();
        for (let [key, value] of this.#dimensionRange) {
            mapToReturn.set(key, [...value]);
        }
        return mapToReturn;
    }
    /**
       * @returns Within the dimensionRange, dimensions are stored zero through n (key) and the min and maxes are stored (value). The span is the difference between the min and the max of each dimension.
       * This function will return a list of [dimensionNumber, dimensionSpan] elements sorted by span.
    */
    getSortedRange() {
        // Each element is a [dimensionNumber, dimensionSpan]
        let list = [];
        // For each range in the hashmap
        for (let [key, value] of this.#dimensionRange) {
            // Calculate the span of that dimension. Difference between min and max. 
            let r = Math.abs(value[0] - value[2]);
            // Add the [dimensionNumber: span] to the list.
            list.push([key, r]);
        }
        // Sort from highest to lowest dimension.
        list.sort((a, b) => b[1] - a[1]);
        // Then return that.
        return list;
    }
    preHash() {
        return this;
    }
    toPrint() {
        return "";
    }
    clone() {
        const newStorage = new VoxelStorage(this.#maxDimensions);
        const coordinates = this.getCoordinateList(true, true);
        coordinates.forEach(value => newStorage.addCoordinate(value.clone(), true));
        return newStorage;
    }
}
