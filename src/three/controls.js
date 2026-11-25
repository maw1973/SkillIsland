import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export function createControls(camera, renderer) {

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    )

    // 平滑阻尼
    controls.enableDamping = true
    controls.dampingFactor = 0.06

    // 允許操作
    controls.enableZoom = true
    controls.enableRotate = true
    controls.enablePan = true

    // 操作速度
    controls.rotateSpeed = 0.6
    controls.zoomSpeed = 1.0
    controls.panSpeed = 0.8

    // 縮放限制
    controls.minDistance = 15
    controls.maxDistance = 220

    // 防止鏡頭轉入地下
    controls.minPolarAngle = 0.1
    controls.maxPolarAngle = Math.PI / 2.1

    // 場景中心
    controls.target.set(0, 0, 0)

    // 暫不自動旋轉
    controls.autoRotate = false
    controls.autoRotateSpeed = 0.5

    controls.update()

    return controls
}