import * as THREE from 'three'

// SkillIsland V8.1.6
// 中央管理大樓景觀照明

export function createCentralLighting(island) {

    const group = new THREE.Group()

    group.name = 'CentralLighting'

    group.position.y = island.groundY

    island.group.add(group)

    const darkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x435363,
            roughness: 0.75
        })

    const goldMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffdfa0,
            emissive: 0xffbc59,
            emissiveIntensity: 1.5
        })

    const blueMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x9aeaff,
            emissive: 0x49cfff,
            emissiveIntensity: 1.2
        })

    function box(w, h, d, material, x, y, z) {

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            material
        )

        mesh.position.set(x, y, z)

        group.add(mesh)

        return mesh
    }

    // ==================================
    // 01 建築入口照明
    // ==================================

    for (const side of [-1, 1]) {

        box(
            0.45, 0.85, 0.35,
            darkMaterial,
            side * 2.05,
            3.3, 4.28
        )

        box(
            0.32, 0.58, 0.12,
            goldMaterial,
            side * 2.05,
            3.3, 4.52
        )

        const light = new THREE.PointLight(
            0xffd59a,
            12,
            7,
            2
        )

        light.position.set(
            side * 2.05,
            3.3,
            4.8
        )

        group.add(light)
    }

    // ==================================
    // 02 柱廊頂部燈條
    // ==================================

    box(
        6.8, 0.09, 0.12,
        goldMaterial,
        0, 5.64, 6.1
    )

    // ==================================
    // 03 建築屋簷燈條
    // ==================================

    for (const side of [-1, 1]) {

        box(
            12.5, 0.10, 0.12,
            goldMaterial,
            0,
            7.96,
            side * 4.35
        )
    }

    // ==================================
    // 04 中央廣場水池照明
    // ==================================

    for (let i = 0; i < 8; i++) {

        const angle =
            i * Math.PI * 2 / 8

        const x =
            Math.cos(angle) * 2.8

        const z =
            13.5 + Math.sin(angle) * 2.8

        const light = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.13, 0.16, 0.08, 12
            ),
            blueMaterial
        )

        light.position.set(
            x, 0.80, z
        )

        group.add(light)
    }

    // ==================================
    // 05 廣場燈光效果
    // ==================================

    const fountainLight =
        new THREE.PointLight(
            0x66d9ff,
            8,
            8,
            2
        )

    fountainLight.position.set(
        0, 1.2, 13.5
    )

    group.add(fountainLight)

    // ==================================
    // 06 入口階梯照明
    // ==================================

    for (const side of [-1, 1]) {

        for (let i = 0; i < 4; i++) {

            const h =
                0.25 * (4 - i)

            box(
                0.18, 0.09, 0.30,
                goldMaterial,
                side * 3.4,
                h + 0.06,
                6 + i * 0.7
            )
        }
    }

    // ==================================
    // 07 島嶼互動資料
    // ==================================

    group.traverse(object => {

        object.userData.islandId =
            'central'

        object.userData.islandConfig =
            island.config
    })

    return group
}
