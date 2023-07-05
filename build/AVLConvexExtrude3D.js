import { AVLObject } from "./AVLObject.js";
import { Utilities } from "./Utilities.js";
import { VoxelStorage } from "./VoxelStorage.js";
import { AVLPolygon } from "./AVLPolygon.js";
import { DimensionalAnalyzer } from "./DimensionalAnalyzer.js";
import { PointFactoryMethods } from "./PointFactoryMethods.js";
export class AVLConvexExtrude3D extends AVLObject {
    segmentsEdges = [];
    segmentAnalyzers = [];
    extrudeObjects = [];
    passes = 1;
    pointLowerFactoryMethod = PointFactoryMethods.getFactoryMethod(2);
    pointFactoryMethod = PointFactoryMethods.getFactoryMethod(3);
    useSort = false;
    shell = false;
    shellFillEndCaps = false;
    constructor(extrudeObjects) {
        super(3);
        this.extrudeObjects = [...extrudeObjects];
        this.extrudeObjects.forEach(v => {
            if (!v.hasEdges) {
                v.createEdges();
            }
            return v;
        });
    }
    generateEdges() {
        this.passes = -1;
        this.useSort = false;
        this.shell = false;
        this.shellFillEndCaps = false;
        this.segmentAnalyzers = [];
        this.segmentsEdges = [];
        for (let i = 0; i < this.extrudeObjects.length - 1; i++) {
            let startingVertices = this.extrudeObjects[i].vertices;
            let endingVertices = this.extrudeObjects[i + 1].vertices;
            this.segmentsEdges.push(new VoxelStorage(3));
            this.segmentAnalyzers.push(new DimensionalAnalyzer(this.segmentsEdges[i]));
            for (let sv of startingVertices) {
                for (let ev of endingVertices) {
                    let coordinates = Utilities.bresenham(sv, ev, 0);
                    this.internalStorage.addCoordinates(coordinates, false);
                    this.segmentsEdges[i].addCoordinates(coordinates, false);
                }
            }
            if (!this.extrudeObjects[i].hasEdges) {
                this.extrudeObjects[i].createEdges();
            }
            if (!this.extrudeObjects[i + 1].hasEdges) {
                this.extrudeObjects[i + 1].createEdges();
            }
            this.internalStorage.addCoordinates(this.extrudeObjects[i].getCoordinateList(false, true), false);
            this.segmentsEdges[i].addCoordinates(this.extrudeObjects[i].getCoordinateList(false, true), false);
            this.internalStorage.addCoordinates(this.extrudeObjects[i + 1].getCoordinateList(false, true), false);
            this.segmentsEdges[i].addCoordinates(this.extrudeObjects[i + 1].getCoordinateList(false, true), false);
        }
    }
    extrude(shell, passes, useSort, shellFillEndCaps, maxSlices) {
        this.passes = passes;
        this.shell = shell;
        this.useSort = useSort;
        this.shellFillEndCaps = shellFillEndCaps;
        this.internalStorage.reset();
        let tempPolygon = new AVLPolygon([], 2);
        for (let i = 0; i < this.segmentsEdges.length; i++) {
            let sortedSpans = this.segmentsEdges[i].getSortedRange();
            // console.log(sortedSpans)
            for (let j = 0; j < passes; j++) {
                this.segmentAnalyzers[i].generateStorageMap(sortedSpans[j][0]);
                let sliceAmount = 0;
                this.segmentAnalyzers[i].storageMap.forEach((value, key) => {
                    sliceAmount += 1;
                    if (sliceAmount <= maxSlices) {
                        tempPolygon.changeVertices(Utilities.convexHull(value)).createEdges();
                        if (!shell) {
                            tempPolygon.fillPolygon(1, true);
                        }
                        var coordinatesSlice = tempPolygon.getCoordinateList(false, true);
                        var unProjectedCoordinates = coordinatesSlice.reduce((accumulator, value) => {
                            return accumulator.push(Utilities.convertDimensionHigher(value, sortedSpans[j][0], key, 2)), accumulator;
                        }, []);
                        this.internalStorage.addCoordinates(unProjectedCoordinates, false);
                    }
                });
            }
        }
        if (this.extrudeObjects.length > 0 && shellFillEndCaps) {
            const startCap = this.extrudeObjects[0].clone();
            const endCap = this.extrudeObjects[this.extrudeObjects.length - 1].clone();
            if (!startCap.hasFill) {
                startCap.fillPolygon(passes, useSort);
            }
            if (!endCap.hasFill) {
                startCap.fillPolygon(passes, useSort);
            }
            this.internalStorage.addCoordinates(startCap.getCoordinateList(false, true), false);
            this.internalStorage.addCoordinates(endCap.getCoordinateList(false, true), false);
        }
        // Create the end caps for the shell.
    }
}
