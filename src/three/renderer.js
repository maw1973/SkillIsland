import * as THREE from 'three'

export function createRenderer(container) {

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    })

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    )

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    )

    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap

    renderer.outputColorSpace = THREE.SRGBColorSpace

    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    renderer.domElement.style.display = 'block'

    container.appendChild(renderer.domElement)

    return renderer
}
