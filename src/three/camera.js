import * as THREE from 'three'

export function createCamera(width, height) {

    const camera = new THREE.PerspectiveCamera(
        45,
        width / Math.max(height, 1),
        0.1,
        1000
    )

    camera.position.set(75, 65, 95)

    camera.lookAt(0, 0, 0)

    return camera
}