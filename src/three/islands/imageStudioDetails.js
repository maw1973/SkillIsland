import * as THREE from 'three'

// SkillIsland V8.2.2
// 影像技能島戶外攝影區

export function createImageStudioDetails(island) {

    const group = new THREE.Group()

    group.name = 'ImageStudioDetails'
    group.position.y = island.groundY

    // 與大型相機保持相同朝向

    group.rotation.y = Math.atan2(
        -island.config.x,
        -island.config.z
    )

    island.group.add(group)

    const materials = new Map()

    function mat(color, glow = false) {

        const key = `${color}_${glow}`

        if (!materials.has(key)) {

            materials.set(
                key,
                new THREE.MeshStandardMaterial({
                    color,
                    roughness: 0.75,
                    flatShading: true,
                    emissive: glow ? color : 0x000000,
                    emissiveIntensity: glow ? 0.8 : 0
                })
            )
        }

        return materials.get(key)
    }

    function mesh(parent, geometry, color,
        x, y, z, glow = false) {

        const object = new THREE.Mesh(
            geometry,
            mat(color, glow)
        )

        object.position.set(x, y, z)

        object.castShadow = true
        object.receiveShadow = true

        parent.add(object)

        return object
    }

    function box(parent, w, h, d, color,
        x, y, z, glow = false) {

        return mesh(
            parent,
            new THREE.BoxGeometry(w, h, d),
            color, x, y, z, glow
        )
    }

    function cylinder(parent, rt, rb, h,
        color, x, y, z, sides = 12) {

        return mesh(
            parent,
            new THREE.CylinderGeometry(
                rt, rb, h, sides
            ),
            color, x, y, z
        )
    }

    function sphere(parent, r, color,
        x, y, z, glow = false) {

        return mesh(
            parent,
            new THREE.IcosahedronGeometry(r, 1),
            color, x, y, z, glow
        )
    }

    // 連接兩點的金屬支架

    function rod(parent, start, end, radius, color) {

        const direction =
            end.clone().sub(start)

        const center =
            start.clone().add(end)
                .multiplyScalar(0.5)

        const object = cylinder(
            parent,
            radius,
            radius,
            direction.length(),
            color,
            center.x,
            center.y,
            center.z
        )

        object.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        )

        return object
    }

    // ==================================
    // 01 攝影設備三腳架
    // ==================================

    function createTripod(parent, height) {

        const top = new THREE.Vector3(
            0, height, 0
        )

        for (let i = 0; i < 3; i++) {

            const angle =
                i * Math.PI * 2 / 3

            const foot = new THREE.Vector3(
                Math.cos(angle) * 0.65,
                0.09,
                Math.sin(angle) * 0.65
            )

            rod(
                parent,
                top,
                foot,
                0.065,
                0x394554
            )

            sphere(
                parent,
                0.105,
                0x242c38,
                foot.x,
                foot.y,
                foot.z
            )
        }

        cylinder(
            parent,
            0.10, 0.10, 0.45,
            0xcbd5e1,
            0, height + 0.15, 0
        )

        box(
            parent,
            0.48, 0.12, 0.48,
            0x293241,
            0, height + 0.4, 0
        )
    }

    // ==================================
    // 02 專業攝影相機
    // ==================================

    function createCamera(x, z, rotation) {

        const camera = new THREE.Group()

        camera.name = 'OutdoorCamera'

        createTripod(camera, 1.75)

        box(
            camera,
            1.25, 0.8, 0.62,
            0x293241,
            0, 2.62, 0
        )

        box(
            camera,
            1.27, 0.16, 0.65,
            0xbcc8d5,
            0, 3.02, 0
        )

        box(
            camera,
            0.36, 0.24, 0.35,
            0x3b4556,
            -0.1, 3.20, -0.08
        )

        // 多層攝影鏡頭

        const lens1 = cylinder(
            camera,
            0.38, 0.38, 0.45,
            0x475569,
            0, 2.62, 0.47,
            24
        )

        lens1.rotation.x = Math.PI / 2

        const lens2 = cylinder(
            camera,
            0.32, 0.32, 0.16,
            0x1d293b,
            0, 2.62, 0.73,
            24
        )

        lens2.rotation.x = Math.PI / 2

        const glass = cylinder(
            camera,
            0.27, 0.27, 0.05,
            0x69c9eb,
            0, 2.62, 0.83,
            24
        )

        glass.rotation.x = Math.PI / 2

        // 背面 LCD

        box(
            camera,
            0.8, 0.5, 0.05,
            0x759cc5,
            0, 2.62, -0.34
        )

        // 快門

        cylinder(
            camera,
            0.12, 0.12, 0.08,
            0xe5e7eb,
            0.42, 3.15, 0.06
        )

        camera.position.set(x, 0.16, z)
        camera.rotation.y = rotation

        group.add(camera)

        return camera
    }

    // ==================================
    // 03 攝影棚柔光燈
    // ==================================

    function createSoftbox(x, z, rotation) {

        const lamp = new THREE.Group()

        lamp.name = 'PhotographySoftbox'

        createTripod(lamp, 2.1)

        const head = new THREE.Group()

        head.position.y = 3.15

        box(
            head,
            1.5, 1.8, 0.55,
            0x263244,
            0, 0, 0
        )

        box(
            head,
            1.28, 1.58, 0.12,
            0xeaf4ff,
            0, 0, 0.34,
            true
        )

        head.rotation.x = -0.18

        lamp.add(head)

        lamp.position.set(x, 0.16, z)
        lamp.rotation.y = rotation

        group.add(lamp)

        return lamp
    }

    // ==================================
    // 04 攝影背景棚
    // ==================================

    function createBackdrop(x, z, rotation) {

        const stage = new THREE.Group()

        stage.name = 'PhotographyBackdrop'

        // 攝影背景布

        box(
            stage,
            3.4, 2.8, 0.10,
            0x9ccee8,
            0, 1.65, 0
        )

        box(
            stage,
            3.4, 0.07, 1.7,
            0x9ccee8,
            0, 0.27, 0.85
        )

        // 金屬支撐架

        for (const side of [-1, 1]) {

            cylinder(
                stage,
                0.055, 0.075, 3.5,
                0x536172,
                side * 1.85,
                1.75,
                0
            )

            box(
                stage,
                0.16, 0.14, 1.2,
                0x465264,
                side * 1.85,
                0.12,
                0
            )
        }

        const top = cylinder(
            stage,
            0.07, 0.07, 3.9,
            0x536172,
            0, 3.45, 0
        )

        top.rotation.z = Math.PI / 2

        stage.position.set(x, 0.16, z)
        stage.rotation.y = rotation

        group.add(stage)
    }

    // ==================================
    // 05 攝影反光板
    // ==================================

    function createReflector(x, z, rotation) {

        const reflector = new THREE.Group()

        reflector.name = 'PhotographyReflector'

        createTripod(reflector, 1.6)

        const panel = cylinder(
            reflector,
            0.86, 0.86, 0.07,
            0xffedb0,
            0, 2.7, 0,
            36
        )

        panel.rotation.x = Math.PI / 2

        mesh(
            reflector,
            new THREE.TorusGeometry(
                0.86, 0.045, 8, 40
            ),
            0x475569,
            0, 2.7, 0.05
        )

        reflector.position.set(
            x, 0.16, z
        )

        reflector.rotation.y = rotation

        group.add(reflector)
    }

    // ==================================
    // 06 戶外攝影平台
    // ==================================

    box(
        group,
        4.8, 0.16, 4.8,
        0xf1e5e9,
        -10.8, 0.08, 0
    )

    box(
        group,
        4.8, 0.16, 4.8,
        0xe7edf2,
        10.8, 0.08, 0
    )

    // 左側攝影區

    createBackdrop(
        -10.8, -1.5, 0
    )

    createCamera(
        -10.8, 1.65, Math.PI
    )

    createSoftbox(
        -12.45, 0.85, 2.3
    )

    createSoftbox(
        -9.15, 0.85, -2.3
    )

    // 右側設備展示區

    createCamera(
        10.2, -0.85, -Math.PI / 3
    )

    createReflector(
        11.9, 0.9, -Math.PI / 3
    )

    // 攝影器材收納箱

    box(
        group,
        1.3, 0.65, 0.8,
        0x414b5d,
        9.5, 0.49, 1.5
    )

    box(
        group,
        1.34, 0.08, 0.84,
        0x9ba9b9,
        9.5, 0.86, 1.5
    )

    // ==================================
    // 07 互動識別資料
    // ==================================

    group.traverse(object => {

        object.userData.islandId =
            island.config.id

        object.userData.islandConfig =
            island.config
    })

    return group
}
