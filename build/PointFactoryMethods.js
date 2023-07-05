import { Point1D } from "./Point1D.js";
import { Point2D } from "./Point2D.js";
import { Point3D } from "./Point3D.js";
export class PointFactoryMethods {
    static factoryMethods = {
        3: new Point3D(0, 0, 0).factoryMethod,
        2: new Point2D(0, 0).factoryMethod,
        1: new Point1D(0).factoryMethod
    };
    static getFactoryMethod(dimension) {
        return PointFactoryMethods.factoryMethods[dimension];
    }
    static setFactoryMethod(dimension, factoryMethod) {
        PointFactoryMethods.factoryMethods[dimension] = factoryMethod;
    }
}
