export class Point1D {
    dimensions = new Map;
    arr;
    constructor(x) {
        this.dimensions.set("x", x);
        this.arr = [x];
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
        return new Point1D(dimensionValues[0]);
    }
    clone() {
        return new Point1D(this.arr[0]);
    }
}
