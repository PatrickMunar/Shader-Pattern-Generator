import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import { Vector2 } from 'three'
import gsap from 'gsap'

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
        uNoiseSeed: {value: 0.1},
        uMouse: {value: new Vector2(0,0)},
        uDetails: {value: 20},
        uBlur: {value: 0},
        uNegative: {value: 0},
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
document.querySelector('.webgl').addEventListener('click', () => {
    if (isUTimePaused == true) {
        isUTimePaused = false
    }
    else {
        isUTimePaused = true
    }
})

// Settings Bar

let detailsValue = document.querySelector('#detailsValue')
let uDetailsValueText = document.querySelector('#uDetailsValueText')

detailsValue.oninput = () => {
    material.uniforms.uDetails.value = detailsValue.value
    uDetailsValueText.innerText = detailsValue.value
}

let seedValue = document.querySelector('#seedValue')
let uNoiseSeedValueText = document.querySelector('#uNoiseSeedValueText')

seedValue.oninput = () => {
    material.uniforms.uNoiseSeed.value = seedValue.value
    uNoiseSeedValueText.innerText = seedValue.value * 10
}

let blurBox = document.querySelector('#blurBox')
let isBlurSelected = false

blurBox.addEventListener('click', () => {
    if (isBlurSelected == false) {
        material.uniforms.uBlur.value = 1
        isBlurSelected = true
        blurBox.style.backgroundColor = 'black'
    }
    else {
        material.uniforms.uBlur.value = 0
        isBlurSelected = false
        blurBox.style.backgroundColor = 'white'
    }
})

let negativeBox = document.querySelector('#negativeBox')
let isNegativeSelected = false

negativeBox.addEventListener('click', () => {
    if (isNegativeSelected == false) {
        material.uniforms.uNegative.value = 1
        isNegativeSelected = true
        negativeBox.style.backgroundColor = 'black'
    }
    else {
        material.uniforms.uNegative.value = 0
        isNegativeSelected = false
        negativeBox.style.backgroundColor = 'white'
    }
})

let blurArrowBox = document.querySelector('#blurArrowBox')
let blurArrow = document.querySelector('#blurArrow')
let isBlurArrowFlipped = false

blurArrowBox.addEventListener('click', () => {
    if (isBlurArrowFlipped == false) {
        isBlurArrowFlipped = true
        gsap.to('#detailsSliderDiv', {ease: 'Power1.easeOut', duration: 0.5, delay: 0, x: 20})
        gsap.to('#detailsSliderDiv', {duration: 0.25, delay: 0.35, opacity: 1})
        blurArrow.classList.add('flipped')
    }
    else {
        isBlurArrowFlipped = false
        gsap.to('#detailsSliderDiv', {ease: 'Power1.easeIn', duration: 0.5, delay: 0, x: -500})
        gsap.to('#detailsSliderDiv', {duration: 0.25, delay: 0, opacity: 0})
        blurArrow.classList.remove('flipped')
    }
})

let seedArrowBox = document.querySelector('#seedArrowBox')
let seedArrow = document.querySelector('#seedArrow')
let isSeedArrowFlipped = false

seedArrowBox.addEventListener('click', () => {
    if (isSeedArrowFlipped == false) {
        isSeedArrowFlipped = true
        gsap.to('#seedSliderDiv', {ease: 'Power1.easeOut', duration: 0.5, delay: 0, x: 20})
        gsap.to('#seedSliderDiv', {duration: 0.25, delay: 0.35, opacity: 1})
        seedArrow.classList.add('flipped')
    }
    else {
        isSeedArrowFlipped = false
        gsap.to('#seedSliderDiv', {ease: 'Power1.easeIn', duration: 0.5, delay: 0, x: -500})
        gsap.to('#seedSliderDiv', {duration: 0.25, delay: 0, opacity: 0})
        seedArrow.classList.remove('flipped')
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

let randomSeed = 0

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
            randomSeed = (Math.floor(Math.random()*99) + 1) * 0.1
            material.uniforms.uNoiseSeed.value = parseFloat(randomSeed.toFixed(2))
            uNoiseSeedValueText.innerText = material.uniforms.uNoiseSeed.value * 10
            seedValue.value = material.uniforms.uNoiseSeed.value
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