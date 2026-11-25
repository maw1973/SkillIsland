import * as THREE from 'three'

// SkillIsland V1.4
// 跨海木造橋梁

export function createBridges(scene, islands) {

    const group = new THREE.Group()

    group.name = 'SkillIslandBridges'

    scene.add(group)

    const central = islands.find(
        island => island.config.id === 'central'
    )

    if (!central) return group

    const woodMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xc49158,
            roughness: 0.95
        })

    const darkWoodMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x805332,
            roughness: 0.95
        })

    const railMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xe1b47d,
            roughness: 0.9
        })

    const supportMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x65472e,
            roughness: 1
        })

    // 共用木造元件

    function createBox(
        width,
        height,
        depth,
        material,
        x,
        y,
        z,
        parent
    ) {

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            material
        )

        mesh.position.set(x, y, z)

        mesh.castShadow = true
        mesh.receiveShadow = true

        parent.add(mesh)

        return mesh
    }

    // 單座橋梁

    function createBridge(startIsland, endIsland) {

        const startCenter =
            startIsland.group.position.clone()

        const endCenter =
            endIsland.group.position.clone()

        const direction = endCenter.clone()
            .sub(startCenter)
            .normalize()

        // 橋梁延伸至島嶼草地

        const start = startCenter.clone().addScaledVector(
            direction,
            startIsland.radius * 0.68
        )

        const end = endCenter.clone().addScaledVector(
            direction,
            -endIsland.radius * 0.68
        )

        const length = start.distanceTo(end)

        const bridgeWidth = 4.0

        const deckY = 2.6

        const center = start.clone()
            .add(end)
            .multiplyScalar(0.5)

        const bridge = new THREE.Group()

        bridge.position.set(
            center.x,
            deckY,
            center.z
        )

        bridge.rotation.y = Math.atan2(
            direction.x,
            direction.z
        )

        bridge.name =
            `Bridge_${endIsland.config.id}`

        group.add(bridge)

        // =========================
        // 01 木造地板
        // =========================

        const plankCount = Math.ceil(
            length / 0.65
        )

        const plankDepth =
            length / plankCount

        for (let i = 0; i < plankCount; i++) {

            const z =
                -length / 2 +
                plankDepth / 2 +
                i * plankDepth

            createBox(
                bridgeWidth,
                0.30,
                plankDepth - 0.045,
                i % 4 === 0
                    ? railMaterial
                    : woodMaterial,
                0,
                0,
                z,
                bridge
            )
        }

        // =========================
        // 02 橋梁底部橫梁
        // =========================

        for (const side of [-1, 1]) {

            createBox(
                0.42,
                0.55,
                length,
                darkWoodMaterial,
                side * 1.45,
                -0.35,
                0,
                bridge
            )
        }

        // =========================
        // 03 左右扶手
        // =========================

        for (const side of [-1, 1]) {

            // 上層扶手

            createBox(
                0.22,
                0.25,
                length,
                railMaterial,
                side * 1.92,
                1.25,
                0,
                bridge
            )

            // 下層扶手

            createBox(
                0.16,
                0.18,
                length,
                darkWoodMaterial,
                side * 1.92,
                0.62,
                0,
                bridge
            )
        }

        // =========================
        // 04 扶手立柱
        // =========================

        const postCount =
            Math.ceil(length / 3)

        for (let i = 0; i <= postCount; i++) {

            const z =
                -length / 2 +
                i * length / postCount

            for (const side of [-1, 1]) {

                createBox(
                    0.30,
                    1.55,
                    0.30,
                    darkWoodMaterial,
                    side * 1.92,
                    0.85,
                    z,
                    bridge
                )

                // 立柱頂部

                createBox(
                    0.43,
                    0.16,
                    0.43,
                    railMaterial,
                    side * 1.92,
                    1.65,
                    z,
                    bridge
                )
            }
        }

        // =========================
        // 05 水下支撐柱
        // =========================

        const supportCount =
            Math.max(1, Math.floor(length / 8))

        for (let i = 1; i <= supportCount; i++) {

            const z =
                -length / 2 +
                i * length / (supportCount + 1)

            for (const side of [-1, 1]) {

                createBox(
                    0.55,
                    5.5,
                    0.55,
                    supportMaterial,
                    side * 1.4,
                    -3.0,
                    z,
                    bridge
                )
            }

            createBox(
                3.6,
                0.4,
                0.4,
                darkWoodMaterial,
                0,
                -0.7,
                z,
                bridge
            )
        }

        // =========================
        // 06 橋頭踏板
        // =========================

        for (const side of [-1, 1]) {

            createBox(
                bridgeWidth + 0.3,
                0.22,
                0.8,
                darkWoodMaterial,
                0,
                -0.08,
                side * (length / 2 + 0.35),
                bridge
            )
        }

        return bridge
    }

    // 中央島連接外圍六座技能島

    islands.forEach(island => {

        if (island.config.id !== 'central') {

            createBridge(
                central,
                island
            )
        }
    })

    console.log(
        'SkillIsland V1.4 橋梁數量：',
        group.children.length
    )

    return group
}