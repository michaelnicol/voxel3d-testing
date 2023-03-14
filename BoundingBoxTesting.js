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

var boxOne = {
   width: 10,
   height: 10,
   depth: 10,
   x: 0,
   y: 0,
   z: 0
}

var boxTwo = {
   width: 5,
   height: 7,
   depth: 5,
   x: 0,
   y: 0,
   z: 0
}

let controller = new voxel3d.UUIDController()

let b2 = new voxel3d.VoxelCollection({
   "controller": controller,
   "origin": [0, 0, 0],
   "fillVoxels": []
})

let b1 = new voxel3d.VoxelCollection({
   "controller": controller,
   "origin": [0, 0, 0],
   "fillVoxels": []
})


const boxOneFolder = GUI.addFolder("Box One");
const boxTwoFolder = GUI.addFolder("Box Two");

const runBoxes = () => {
   let objects = [];
   scene.traverse((obj) => {
      if (obj.reID === "remove") {
         objects.push(obj)
      }
   })
   for (let i = 0; i < objects.length; i++) {
      scene.remove(objects[i])
   }
   let b1Voxels = [
      [boxOne.x - boxOne.width, boxOne.y - boxOne.height, boxOne.z - boxOne.depth],
      [boxOne.x + boxOne.width, boxOne.y + boxOne.height, boxOne.z + boxOne.depth]
   ]
   let b2Voxels = [
      [boxTwo.x - boxTwo.width, boxTwo.y - boxTwo.height, boxTwo.z - boxTwo.depth],
      [boxTwo.x + boxTwo.width, boxTwo.y + boxTwo.height, boxTwo.z + boxTwo.depth]
   ]
   b1.setOrigin([boxOne.x, boxOne.y, boxOne.z])
   b2.setOrigin([boxTwo.x, boxTwo.y, boxTwo.z])
   b1.setFillVoxels(b1Voxels)
   b2.setFillVoxels(b2Voxels)
   let b1Box = voxel3d.BoundingBox.compileBoundingDirectory(b1.boundingBox.boundingBox);
   let b2Box = voxel3d.BoundingBox.compileBoundingDirectory(b2.boundingBox.boundingBox);
   // let b1Box = b1.jointBoundingBox.getAllJointBoundingBoxes("RETURN_MODE_VOXELS")
   // let b2Box = b2.jointBoundingBox.getAllJointBoundingBoxes("RETURN_MODE_VOXELS")
   addItem(b1Box, 0.8, "RED")
   addItem(b2Box, 0.8, "BLUE")
   let b3 = voxel3d.BoundingBox.boundingBoxIntersect(b1.boundingBox.boundingBox, b2.boundingBox.boundingBox);
   if (b3[0]) {
      addItem(voxel3d.BoundingBox.compileBoundingDirectory(b3[1]), 1.0, "GREEN")
   } else {
   }
   // addItem(composite.getFillVoxels(), 1.0, "GREEN")
}

boxOneFolder.add(boxOne, "width", -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxOneFolder.add(boxOne, "height",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxOneFolder.add(boxOne, "depth",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxTwoFolder.add(boxTwo, "width",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxTwoFolder.add(boxTwo, "height",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxTwoFolder.add(boxTwo, "depth",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})

boxOneFolder.add(boxOne, "x",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxOneFolder.add(boxOne, "y",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxOneFolder.add(boxOne, "z",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})

boxTwoFolder.add(boxTwo, "x",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxTwoFolder.add(boxTwo, "y",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
boxTwoFolder.add(boxTwo, "z",  -20, 100, 1).listen().onChange(() => {
   runBoxes();
})
runBoxes();
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
