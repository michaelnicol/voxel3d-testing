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

let controller = new voxel3d.UUIDController();

let layer1 = new voxel3d.Layer({
   "controller": controller,
   "origin": [0,0,0],
   "verticesArray": [[0,0,0],[9,0,0],[6,9,0]]
})
layer1.generateEdges().fillPolygon();

console.log("LAYER 1 DIRECTORY")

console.log(JSON.stringify(layer1.sortedFillVoxelsDirectory))

console.log(layer1)
let layer2 = new voxel3d.Layer({
   "controller": controller,
   "origin": [0,0,0],
   "verticesArray": [[0,0,15],[9,0,15],[6,9,15]]
})
layer2.generateEdges().fillPolygon();

console.log("LAYER 2 DIRECTORY")

console.log(JSON.stringify(layer2.sortedFillVoxelsDirectory))

// console.log(layer1.getFillVoxels().sort((a,b)=>a[2]-b[2]).sort((a,b)=>a[1]-b[1]).sort((a,b)=>a[0]-b[0]))
// console.log(layer2.getFillVoxels().sort((a,b)=>a[2]-b[2]).sort((a,b)=>a[1]-b[1]).sort((a,b)=>a[0]-b[0]))

let composite = new voxel3d.LayerConvexExtrude({
   "controller": controller,
   "origin": [0,0,0],
   "extrudeObjects": [layer1, layer2]
});

composite.generateEdges(true);
addItem(composite.getFillVoxels(), 1.0, "RED")
console.log(JSON.stringify(voxel3d.BaseObject.sortPoints(composite.getFillVoxels())))
// addItem(layer1.getFillVoxels(), 1.0, "BLUE")
// addItem(layer2.getFillVoxels(), 1.0, "RED")
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
