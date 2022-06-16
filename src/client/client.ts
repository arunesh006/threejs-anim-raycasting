import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
//import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

//const light = new THREE.PointLight()
//light.position.set(2.5, 7.5, 15)
const light = new THREE.AmbientLight()
scene.add(light)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0.8, 1.4, 1.0)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

const sceneMeshes: THREE.Mesh[] = []
let mixer: THREE.AnimationMixer
let modelMesh:THREE.Group
let modelReady = false
const animationActions: THREE.AnimationAction[] = []
let activeAction: THREE.AnimationAction
let lastAction: THREE.AnimationAction
const fbxLoader: FBXLoader = new FBXLoader()

fbxLoader.load(
    'models/newstg.fbx',
    (object) => {
        object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                sceneMeshes.push(child as THREE.Mesh)
                }
            })
        scene.add(object)
        fbxLoader.load(
            'models/tallboi.fbx',
            (thing) => {
                thing.position.set(0,120,0)
                object.add(thing)
                modelMesh=thing
        mixer = new THREE.AnimationMixer(thing)

        const animationAction = mixer.clipAction(
            (thing as THREE.Object3D).animations[0]
        )
        animationActions.push(animationAction)
        animationsFolder.add(animations, 'default')
        activeAction = animationActions[0]
        })

        //add an animation from another file
        fbxLoader.load(
            'models/vanguard@samba.fbx',
            (object) => {
                console.log('loaded samba')

                const animationAction = mixer.clipAction(
                    (object as THREE.Object3D).animations[0]
                )
                animationActions.push(animationAction)
                animationsFolder.add(animations, 'samba')

                //add an animation from another file
                fbxLoader.load(
                    'models/vanguard@bellydance.fbx',
                    (object) => {
                        console.log('loaded bellydance')
                        const animationAction = mixer.clipAction(
                            (object as THREE.Object3D).animations[0]
                        )
                        animationActions.push(animationAction)
                        animationsFolder.add(animations, 'bellydance')

                        //add an animation from another file
                        fbxLoader.load(
                            'models/vanguard@goofyrunning.fbx',
                            (object) => {
                                console.log('loaded goofyrunning');
                                (object as THREE.Object3D).animations[0].tracks.shift() //delete the specific track that moves the object forward while running
                                //console.dir((object as THREE.Object3D).animations[0])
                                const animationAction = mixer.clipAction(
                                    (object as THREE.Object3D).animations[0]
                                )
                                animationActions.push(animationAction)
                                animationsFolder.add(animations, 'goofyrunning')

                                modelReady = true
                            },
                            (xhr) => {
                                console.log(
                                    (xhr.loaded / xhr.total) * 100 + '% loaded'
                                )
                            },
                            (error) => {
                                console.log(error)
                            }
                        )
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },
                    (error) => {
                        console.log(error)
                    }
                )
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const raycaster = new THREE.Raycaster()
//let v1 = new THREE.Vector3(0, 0, 0)
renderer.domElement.addEventListener('dblclick', onDoubleClick, false)
function onDoubleClick(event: MouseEvent) {
    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    }
    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(sceneMeshes, false)
    //console.log(sceneMeshes)

    if (intersects.length > 0) {

        const p = intersects[0].point
        //const distance = modelMesh.position.distanceTo(p)
        setAction(animationActions[3])
        p.y=120
        modelMesh.lookAt(p)
        modelMesh.position.lerp(p,0.5) 
        setAction(animationActions[0]) 
        
    }
}

const stats = Stats()
document.body.appendChild(stats.dom)

const animations = {
    default: function () {
        setAction(animationActions[0])
    },
    samba: function () {
        setAction(animationActions[1])
    },
    bellydance: function () {
        setAction(animationActions[2])
    },
    goofyrunning: function () {
        setAction(animationActions[3])
    }
}

const setAction = (toAction: THREE.AnimationAction) => {
    if (toAction != activeAction) {
        lastAction = activeAction
        activeAction = toAction
        //lastAction.stop()
        lastAction.fadeOut(1)
        activeAction.reset()
        activeAction.fadeIn(1)
        activeAction.play()
    }
}

const gui = new GUI()
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    if (modelReady) mixer.update(clock.getDelta())

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()