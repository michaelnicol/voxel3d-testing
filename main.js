import { Point2D } from "./build/Point2D"
import { Point3D } from "./build/Point3D"
import { AVLPolygon } from "./build/AVLPolygon"
import { AVLConvexExtrude3D } from "./build/AVLConvexExtrude3D.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from 'dat.gui';
import * as three from "three"

const container = document.getElementById("app")
const scene = new three.Scene()
const renderer = new three.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio);
const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
camera.position.z = 20
renderer.setSize(window.innerWidth, window.innerHeight)
const controls = new OrbitControls(camera, renderer.domElement)
container.appendChild(renderer.domElement)
scene.add(new three.AxesHelper(100, 100, 100))

const gui = new dat.GUI();

const guiData = {
   "passes": 1
}

gui.add(guiData, 'passes', 0, 100).step(1).onChange(
   function () {
      const passesAmount = this.getValue();
      while (scene.children.length) {
         scene.remove(scene.children[scene.children.length - 1]);
      }
      let polygon1 = new AVLPolygon([new Point3D(0, 0, 0),new Point3D(5, 0, 0),new Point3D(0, 5, 0)], 3)
      polygon1.createEdges()
      addItem(polygon1.getCoordinateList())
      let polygon2 = new AVLPolygon([new Point3D(0, 0, 50),new Point3D(50, 0, 50),new Point3D(50, 50, 50),new Point3D(0, 50, 50)], 3)
      polygon2.createEdges()
      let polygon3 = new AVLPolygon([new Point3D(0, 0, 100),new Point3D(50, 0, 100),new Point3D(50, 50, 100),new Point3D(0, 50, 100)], 3)
      polygon3.createEdges()
      addItem(polygon2.getCoordinateList())
      let extrude = new AVLConvexExtrude3D([polygon1, polygon2, polygon3])
      extrude.generateEdges()
      addItem(extrude.getCoordinateList(false, false))
      extrude.extrude(true, 3, true, false, passesAmount)
      addItem(extrude.getCoordinateList(false, false))
   }
);


function addItem (coords, size, color = 'RED') {
   if (coords.length === 0) {
      return;
   }
   let y = 10;
   let z = 10;
   let x = 10;
   let mesh = new three.InstancedMesh(new three.BoxGeometry(size, size, size), new three.MeshNormalMaterial(), coords.length) // new three.MeshBasicMaterial({"color":color})
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
