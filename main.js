import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { LineMaterial } from 'three/examples/jsm/Addons.js';
import { Wireframe } from 'three/examples/jsm/Addons.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/Addons.js';
import { mx_bilerp_0 } from 'three/src/nodes/materialx/lib/mx_noise.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg")
});



// const controls = new OrbitControls(camera, renderer.domElement)


renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(1.3);
camera.position.setY(-2);
camera.rotation.x = 1.2

var rotationx=1.2
var rotx=1.2

function movecamera() {
  const change = document.body.getBoundingClientRect().top;
  var camspeed = 5
  const changed = change - (1000/camspeed)

  let rotchange = 1.2 + (-change *0.001)
  rotchange = Math.max(1.2,Math.min(3,rotchange))
  let smoothing = 1.2 + (rotchange - camera.rotation.x)*1

  rotationx = rotchange
  rotx=rotationx
  camera.position.y = changed*(0.002*camspeed)
  let fovchange = 75 + (Math.log(Math.abs(change)+10)*8)
  if (fovchange>150) {
    fovchange = 150
  }
  camera.fov = fovchange
  camera.updateProjectionMatrix();
}

window.history.scrollRestoration = "manual";
window.onload = () => {
  window.scrollTo(0,0)
}



const originalcamrot = {x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z};


var xmouse = 0
var ymouse = 0
var xtarget = 0
var ytarget = 0

document.addEventListener('mousemove', (event) => {
  xmouse = (event.clientX/window.innerWidth)*2-1
  ymouse = (event.clientY/window.innerHeight)*2+1
  xtarget += (xmouse-xtarget)*0.1
  ytarget += (ymouse-ytarget-0.8)*0.1
  camera.rotation.y = originalcamrot.y - xtarget * 0.1;
})

const plane = new THREE.PlaneGeometry(10,10,10,10)
const material = new THREE.MeshStandardMaterial({ color: 0x555555, wireframe: true })

var CircleGeometry = new THREE.CircleGeometry(2);
var edgesGeometry = new THREE.EdgesGeometry(CircleGeometry);
const lineseg = new LineSegmentsGeometry().fromEdgesGeometry(edgesGeometry)


const geometry1 = new THREE.PlaneGeometry(40,40,140,140);
const geometry2 = new THREE.PlaneGeometry(40,1.5,140,5.25);
const geometry3 = new THREE.IcosahedronGeometry(0.5,15)

const wireframe1 = new THREE.WireframeGeometry(geometry1);
const wireframe2 = new THREE.WireframeGeometry(geometry2);
const lineMaterial1 = new THREE.LineBasicMaterial({color:0x000000});
const lineMaterial2 = new THREE.LineBasicMaterial({color:0x000000});
const meshmaterial = new THREE.MeshBasicMaterial({color:0x000000});
const line1 = new THREE.LineSegments(wireframe1,lineMaterial1);
const line2 = new THREE.LineSegments(wireframe2,lineMaterial2);
const sphere = new THREE.Mesh(geometry3,meshmaterial)
sphere.material.wireframe = true
scene.add(line1)

line2.translateY(5.8)

class Perlin {
    constructor() {
      this.grad3 =
        [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
         [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
         [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
      this.p = [];
      for (var i=0; i<256; i++) {
        this.p[i] = Math.floor(Math.random()*256);
      }
  
      // To remove the need for index wrapping, double the permutation table length
      this.perm = [];
      for(i=0; i<512; i++) {
        this.perm[i]=this.p[i & 255];
      }
  
      // A lookup table to traverse the simplex around a given point in 4D.
      // Details can be found where this table is used, in the 4D noise method.
      this.simplex = [
        [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],
        [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],
        [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
        [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],
        [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],
        [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
        [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],
        [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]];
    }
  
    dot(g, x, y) {
      return g[0]*x + g[1]*y;
    }
  
    noise(xin, yin) {
      var n0, n1, n2; // Noise contributions from the three corners
      // Skew the input space to determine which simplex cell we're in
      var F2 = 0.5*(Math.sqrt(3.0)-1.0);
      var s = (xin+yin)*F2; // Hairy factor for 2D
      var i = Math.floor(xin+s);
      var j = Math.floor(yin+s);
      var G2 = (3.0-Math.sqrt(3.0))/6.0;
      var t = (i+j)*G2;
      var X0 = i-t; // Unskew the cell origin back to (x,y) space
      var Y0 = j-t;
      var x0 = xin-X0; // The x,y distances from the cell origin
      var y0 = yin-Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var gi0 = this.perm[ii+this.perm[jj]] % 12;
      var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12;
      var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0*x0-y0*y0;
      if(t0<0) n0 = 0.0;
      else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1*x1-y1*y1;
      if(t1<0) n1 = 0.0;
      else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
      }
      var t2 = 0.5 - x2*x2-y2*y2;
      if(t2<0) n2 = 0.0;
      else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    }
  }

var perlin;
perlin = new Perlin()
var t=0

var intensity=5

function updateVertices1(geom) {
    var vertices = geom.geometry.attributes.position.array;
    for (var i = 0; i <= vertices.length; i += 3) {
        vertices[i+2] = perlin.noise(vertices[i]/intensity + t, vertices[i+1]/intensity + t)
    }
    geom.geometry.attributes.position.needsUpdate = true
}

function changewave() {
  const change = document.body.getBoundingClientRect().top;
  var camspeed = 5
  const changed = change - (1000/camspeed)
  
  let intensitychange = 5 + (change *0.015)
  intensitychange = Math.max(5,Math.min(12,-intensitychange))
  intensity=intensitychange
  camera.updateProjectionMatrix();
  if (intensity<5) {
    intensity=5
  }
}

function updateVertices2(geom) {
  var vertices = geom.geometry.attributes.position.array;
  for (var i = 0; i <= vertices.length; i += 3) {
      vertices[i+2] = perlin.noise(vertices[i]/2 + t, vertices[i+1]/2 + t)
  }
  geom.geometry.attributes.position.needsUpdate = true
}


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


function addblocks() {
  const geometry4 = new THREE.BoxGeometry(1,1,1,1)
  const material3 = new THREE.MeshStandardMaterial({color:0xffffff, wireframe:true})
  const blocks = new THREE.Mesh(geometry4,material3)
  const [x,y,z] = Array(3).fill().map((_,i) => {
    if (i==2) {
      return THREE.MathUtils.randFloatSpread(50) + 26
    }
    return THREE.MathUtils.randFloatSpread(100)
  });
  blocks.position.set(x,y,z)
  blocks.material.transparent = true
  scene.add(blocks)
  blocks.material.opacity=0
}

Array(2000).fill().forEach(addblocks)


function blocksopacity() {
  const change = document.body.getBoundingClientRect().top;
  var camspeed = 5
  const changed = change - (1000/camspeed)
  
  let opacitychange = (change *0.0002)
  opacitychange = Math.max(0,Math.min(1,-opacitychange))
  scene.children.forEach(child => {
    if (child instanceof THREE.Mesh) {
      child.material.opacity=opacitychange
    }
  })
}

document.body.onscroll = function() {
  changewave();
  movecamera();
  blocksopacity();
}




function blocksface() {

  const raycaster = new THREE.Raycaster()
  const cameradirection = new THREE.Vector3()


  const cursor3d = new THREE.Vector3(xmouse, ymouse, 0.5)
  cursor3d.unproject(camera)

  scene.children.forEach(child => {
    if (child instanceof THREE.Mesh) {
      child.lookAt(cursor3d)
    }
  })

}



function animate() {
    t += 0.00125;
    requestAnimationFrame(animate);
    camera.rotation.x = rotx
    blocksface()
    updateVertices1(line1)
    updateVertices2(line2)

    renderer.render(scene, camera);
    // controls.update();
}

animate();