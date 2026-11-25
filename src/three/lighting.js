import * as THREE from 'three'

export function createLighting(scene) {

    // 環境光
    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        0.8
    )

    scene.add(ambientLight)

    // 天空與地面反射光
    const hemisphereLight = new THREE.HemisphereLight(
        0xc7efff,
        0x7c9b65,
        1.5
    )

    scene.add(hemisphereLight)

    // 主陽光
    const sunlight = new THREE.DirectionalLight(
        0xfff4dc,
        3.0
    )

    sunlight.position.set(50, 90, 40)
    sunlight.castShadow = true

    sunlight.shadow.mapSize.width = 2048
    sunlight.shadow.mapSize.height = 2048

    sunlight.shadow.camera.left = -100
    sunlight.shadow.camera.right = 100
    sunlight.shadow.camera.top = 100
    sunlight.shadow.camera.bottom = -100

    sunlight.shadow.camera.near = 0.5
    sunlight.shadow.camera.far = 250

    sunlight.shadow.normalBias = 0.03
    sunlight.shadow.bias = -0.0001

    scene.add(sunlight)

    // 補光
    const fillLight = new THREE.DirectionalLight(
        0x9edcff,
        0.8
    )

    fillLight.position.set(-50, 30, -40)

    scene.add(fillLight)

    return {
        ambientLight,
        hemisphereLight,
        sunlight,
        fillLight
    }
}