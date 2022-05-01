import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import { Matrix3, Vector2 } from 'three'

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test mesh
 */
// Parameters
const parameters = {
    width: 20,
    height: 20,
}

// Geometry
const geometry = new THREE.PlaneGeometry(parameters.width, parameters.height, 32 * parameters.width, 32 * parameters.height)

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: {value: 0},
        uNoiseSeed: {value: 1},
        uMouse: {value: new Vector2(0,0)}
    },
    // wireframe: true
})

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Mouse
document.addEventListener('mousemove', (client) => {
    material.uniforms.uMouse.value.x = client.x - sizes.width * 0.5
    material.uniforms.uMouse.value.y = - (client.y - sizes.width * 0.5)
})

let isUTimePaused = true

// Click
document.addEventListener('click', () => {
    if (isUTimePaused == true) {
        isUTimePaused = false
    }
    else {
        isUTimePaused = true
    }
})

/**
 * Animate
 */
const clock = new THREE.Clock()

let resetTime = 0
let cycleTime = 0
let backTrackTime = 0
let prevBackTrackTime = 0
let pauseTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    resetTime = elapsedTime

    // Update materials
    if (isUTimePaused == false) {
        pauseTime = 0
        material.uniforms.uTime.value = elapsedTime - backTrackTime
        if (backTrackTime !== 0) {
            prevBackTrackTime = backTrackTime
        }
        if ((resetTime - cycleTime - backTrackTime) >= Math.PI*2) {
            cycleTime += Math.PI*2
            material.uniforms.uNoiseSeed.value = Math.random()*100 + 1
        }
    }
    else {
        if (pauseTime == 0) {
            pauseTime = elapsedTime
        }
        backTrackTime = elapsedTime - pauseTime + prevBackTrackTime
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()