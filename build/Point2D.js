export class Point2D {
    dimensions = new Map;
    arr;
    constructor(x, y) {
        this.dimensions.set("x", x);
        this.dimensions.set("y", y);
        this.arr = [x, y];
    }
    getCoordinateValue(key) {
        return this.dimensions.get(key.toLowerCase());
    }
    preHash() {
        return this.arr.join(",");
    }
    toPrint() {
        return "[" + this.arr.join(",") + "]";
    }
    dimensionCount() {
        return this.arr.length;
    }
    factoryMethod(dimensionValues) {
        return new Point2D(dimensionValues[0], dimensionValues[1]);
    }
    clone() {
        return new Point2D(this.arr[0], this.arr[1]);
    }
}
