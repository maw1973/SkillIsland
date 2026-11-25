import * as THREE from 'three'

// SkillIsland V9.1.2
// 夜間建築自動亮燈

export function createNightBuildingLights({
    islands,
    worldAppearance
}) {

    const colors = {
        central: '#ffd580',
        image: '#ff6ca8',
        document: '#72b8ff',
        excel: '#5cff98',
        code: '#b593ff',
        analytics: '#ffb84d',
        agent: '#55f5ef'
    }

    const entries = []
    const clonedMaterials = new Map()
    const report = []

    let level = 0
    let previousLevel = -1
    let disposed = false

    // 01 辨識可發光的建築部件

    function isLightSurface(object, building) {

        let current = object

        while (current && current !== building) {

            if (
                /window|glass|lamp|lantern|lightstrip|signboard|neon|窗戶|玻璃|路燈|燈帶|招牌/i
                    .test(current.name || '')
            ) {
                return true
            }

            current = current.parent
        }

        return false
    }

    // 02 建立獨立發光材質

    islands.forEach(island => {

        const id = island.config?.id
        const building = island.building

        if (!building || !colors[id]) return

        let count = 0

        const glowColor = new THREE.Color(
            colors[id]
        )

        building.traverse(object => {

            if (!object.isMesh) return

            if (!isLightSurface(object, building)) {
                return
            }

            const originalMaterial = object.material

            const list = Array.isArray(originalMaterial)
                ? originalMaterial
                : [originalMaterial]

            let changed = false

            const updated = list.map(material => {

                if (!material?.emissive) {
                    return material
                }

                const cloned = material.clone()

                entries.push({
                    material: cloned,
                    originalColor: material.emissive.clone(),
                    originalIntensity: material.emissiveIntensity,
                    targetColor: glowColor.clone(),
                    intensity: 1.65
                })

                changed = true
                count++

                return cloned
            })

            if (!changed) return

            clonedMaterials.set(
                object,
                originalMaterial
            )

            object.material =
                Array.isArray(originalMaterial)
                    ? updated
                    : updated[0]

        })

        report.push({
            island: id,
            emissiveSurfaces: count,
            status: count > 0
                ? '發光部件已建立'
                : '使用建築外部燈帶'
        })

    })

    // 03 建立夜間建築外部燈帶

    const strips = []

    const stripGeometry =
        new THREE.BoxGeometry(1, 0.12, 0.12)

    islands.forEach(island => {

        const id = island.config?.id
        const building = island.building

        if (!building || !colors[id]) return

        building.updateWorldMatrix(true, true)

        const bounds = new THREE.Box3()
        const inverse = building.matrixWorld
            .clone()
            .invert()

        building.traverse(object => {

            if (!object.isMesh || !object.geometry) {
                return
            }

            if (
                /antenna|particle|label|hologram/i
                    .test(object.name || '')
            ) return

            if (!object.geometry.boundingBox) {
                object.geometry.computeBoundingBox()
            }

            if (!object.geometry.boundingBox) return

            const matrix = new THREE.Matrix4()
                .multiplyMatrices(
                    inverse,
                    object.matrixWorld
                )

            const box = object.geometry.boundingBox
                .clone()
                .applyMatrix4(matrix)

            bounds.union(box)
        })

        if (bounds.isEmpty()) return

        const size = bounds.getSize(
            new THREE.Vector3()
        )

        const center = bounds.getCenter(
            new THREE.Vector3()
        )

        if (size.x < 1 || size.z < 1) return

        const group = new THREE.Group()

        group.name = `NightLightStrips_${id}`

        const material = new THREE.MeshBasicMaterial({
            color: colors[id],
            transparent: true,
            opacity: 0,
            depthWrite: false,
            toneMapped: false
        })

        const width = size.x * 0.85
        const depth = size.z * 0.85

        const y = bounds.min.y + 0.4

        function addStrip(x, z, length, angle) {

            const mesh = new THREE.Mesh(
                stripGeometry,
                material
            )

            mesh.position.set(x, y, z)

            mesh.scale.x = length

            mesh.rotation.y = angle

            group.add(mesh)
        }

        // 建築底部四周主題燈帶

        addStrip(
            center.x,
            bounds.max.z + 0.08,
            width,
            0
        )

        addStrip(
            center.x,
            bounds.min.z - 0.08,
            width,
            0
        )

        addStrip(
            bounds.max.x + 0.08,
            center.z,
            depth,
            Math.PI / 2
        )

        addStrip(
            bounds.min.x - 0.08,
            center.z,
            depth,
            Math.PI / 2
        )

        group.visible = false

        building.add(group)

        strips.push({
            group,
            material
        })

    })

    // 04 平滑切換日夜燈光

    function update(delta) {

        if (disposed) return

        const target =
            worldAppearance.mode === 'night'
                ? 1 : 0

        level = THREE.MathUtils.lerp(
            level,
            target,
            1 - Math.exp(-delta * 2.5)
        )

        if (Math.abs(level - target) < 0.001) {
            level = target
        }

        if (
            Math.abs(level - previousLevel) < 0.001
        ) return

        previousLevel = level

        entries.forEach(item => {

            item.material.emissive.lerpColors(
                item.originalColor,
                item.targetColor,
                level
            )

            item.material.emissiveIntensity =
                THREE.MathUtils.lerp(
                    item.originalIntensity,
                    item.intensity,
                    level
                )
        })

        strips.forEach(item => {

            item.group.visible = level > 0.002

            item.material.opacity = level * 0.95

        })
    }

    // 05 資源清理

    function dispose() {

        if (disposed) return

        disposed = true

        clonedMaterials.forEach(
            (original, object) => {

                object.material = original

            }
        )

        entries.forEach(item => {
            item.material.dispose()
        })

        strips.forEach(item => {

            item.group.removeFromParent()

            item.material.dispose()

        })

        stripGeometry.dispose()

        clonedMaterials.clear()
    }

    console.group(
        'SkillIsland V9.1.2 夜間建築燈光'
    )

    console.table(report)

    console.log('發光材質數量：', entries.length)

    console.log('建築燈帶群組：', strips.length)

    console.log('新增即時光源：0')

    console.groupEnd()

    return {
        update,
        dispose,
        report
    }

}
