import * as three from "three"
import { BoxGeometry, Color } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as voxel3d from "./voxel3d.js";
import * as dat from 'dat.gui';

const container = document.getElementById("app")
const scene = new three.Scene()
const renderer = new three.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio);
const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
camera.position.z = 20
renderer.setSize(window.innerWidth, window.innerHeight)
const controls = new OrbitControls(camera, renderer.domElement)
container.appendChild(renderer.domElement)
// controls.autoRotate = true;
// controls.autoRotateSpeed = 5.0
scene.add(new three.AxesHelper(100, 100, 100))

var GUI = new dat.GUI();


let controller = new voxel3d.UUIDController();

let L1Coords = {
   x: 0,
   y: 0,
   z: 0
}

let layer1 = new voxel3d.Layer({
   "controller": controller,
   "origin": [0, 0, 0],
   "verticesArray": [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]]
})
let line1 = new voxel3d.Line({
   "controller": controller,
   "origin": [0, 0, 0],
   "endPoints": [[5, 5, 10], [5, 5, -10]]
})
line1.generateLine();
layer1.generateEdges();
let composite = new voxel3d.CompositeVoxelCollection({
   "controller": controller,
   "origin": [0, 0, 0],
   "variableNames": {
      [layer1.uuid]: layer1,
      [line1.uuid]: line1
   }
})
composite.setEquation(line1.uuid + composite.tokens.SUBTRACTION_OP + layer1.uuid);

let unionComposite = new voxel3d.VoxelCollection({
   "controller": controller,
   "origin": [0, 0, 0],
   "fillVoxels": []
})


const LineFolder = GUI.addFolder("Line");

LineFolder.add(L1Coords, "x", -20, 100, 1).listen().onChange(() => {
   subtractUnion();
})

LineFolder.add(L1Coords, "y", -20, 100, 1).listen().onChange(() => {
   subtractUnion();
})
LineFolder.add(L1Coords, "z", -20, 100, 1).listen().onChange(() => {
   subtractUnion();
})

function subtractUnion() {
   let objects = [];
   scene.traverse((obj) => {
      if (obj.reID === "remove") {
         objects.push(obj)
      }
   })
   for (let i = 0; i < objects.length; i++) {
      scene.remove(objects[i])
   }
   line1.setOrigin([L1Coords.x, L1Coords.y, L1Coords.z]);
   unionComposite.setFillVoxels(layer1.getFillVoxels());
   unionComposite.addFillVoxels(composite.interpretAST().getFillVoxels());
   addItem(unionComposite.getFillVoxels(), 1.0, "RED");
   console.log(unionComposite)
   addItem(line1, 0.8, "BLUE");
   addItem(layer1, 0.8, "GREEN");
}
subtractUnion();
function addItem (coords, size, color = 'RED') {
   if (coords.length === 0) {
      return;
   }
   let y = 10;
   let z = 10;
   let x = 10;
   let mesh = new three.InstancedMesh(new three.BoxGeometry(size, size, size), new three.MeshBasicMaterial({ "color": color }), coords.length) // new three.MeshBasicMaterial({"color":color})
   let calcObject = new three.Object3D;
   for (let i = 0; i < mesh.count; i++) {
      x += coords[i][0];
      y += coords[i][1];
      z += coords[i].length === 2 ? 0 : coords[i][2]
      calcObject.position.set(coords[i][0], coords[i][1], coords[i].length === 2 ? 0 : coords[i][2])
      calcObject.updateMatrix();
      mesh.setMatrixAt(i, calcObject.matrix);
   }
   // controls.target.set(x / coords.length, y / coords.length, z / coords.length)
   mesh.reID = "remove";
   scene.add(mesh)
   return mesh
}
renderer.setAnimationLoop(() => {
   controls.update();
   renderer.render(scene, camera)
})
