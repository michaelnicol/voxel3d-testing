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

console.log(voxel3d)

function addItem(coords, size) {
  if (coords.length === 0) {
    return;
  }
  let y = 10;
  let z = 10;
  let x = 10;
  let mesh = new three.InstancedMesh(new three.BoxGeometry(size, size, size), new three.MeshNormalMaterial(), coords.length)
  let calcObject = new three.Object3D;
  for (let i = 0; i < mesh.count; i++) {
    x += coords[i][0];
    y += coords[i][1];
    z += coords[i].length === 2 ? 0 : coords[i][2]
    calcObject.position.set(coords[i][0], coords[i][1], coords[i].length === 2 ? 0 : coords[i][2])
    calcObject.updateMatrix();
    mesh.setMatrixAt(i, calcObject.matrix);
  }
  controls.target.set(x / coords.length, y / coords.length, z / coords.length)
  scene.add(mesh)
  return mesh
}

renderer.setAnimationLoop(() => {
  // e1.model.rotation.x += 0.01;
  controls.update();
  renderer.render(scene, camera)
})
