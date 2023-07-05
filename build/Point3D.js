export class Point3D {
    dimensions = new Map;
    arr;
    constructor(x, y, z) {
        this.dimensions.set("x", x);
        this.dimensions.set("y", y);
        this.dimensions.set("z", z);
        this.arr = [x, y, z];
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
        return new Point3D(dimensionValues[0], dimensionValues[1], dimensionValues[2]);
    }
    clone() {
        return new Point3D(this.arr[0], this.arr[1], this.arr[2]);
    }
}
