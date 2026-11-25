import * as THREE from 'three'

// SkillIsland V1.2
// 碎石環形步道

export function createIslandPaths(island) {

    const group = new THREE.Group()

    island.group.add(group)

    const pathMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xe3cda4,
            roughness: 1,
            side: THREE.DoubleSide
        })

    const radius = island.radius * 0.43

    // 環形步道

    const ring = new THREE.Mesh(
        new THREE.RingGeometry(
            radius - 1.25,
            radius + 1.25,
            48
        ),
        pathMaterial
    )

    ring.rotation.x = -Math.PI / 2

    ring.position.y = island.groundY + 0.025

    ring.receiveShadow = true

    group.add(ring)

    // 通往中央建築物的步道

    const path = new THREE.Mesh(
        new THREE.PlaneGeometry(
            2.5,
            radius
        ),
        pathMaterial
    )

    path.rotation.x = -Math.PI / 2

    path.position.set(
        0,
        island.groundY + 0.035,
        radius / 2
    )

    path.receiveShadow = true

    group.add(path)

    // 步道兩側裝飾石

    const stoneGeometry =
        new THREE.DodecahedronGeometry(0.25, 0)

    const stoneMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xd9d2bf,
            flatShading: true
        })

    for (let i = 0; i < 64; i++) {

        const angle = i / 64 * Math.PI * 2

        for (const offset of [-1.4, 1.4]) {

            const distance = radius + offset

            const stone = new THREE.Mesh(
                stoneGeometry,
                stoneMaterial
            )

            stone.position.set(
                Math.cos(angle) * distance,
                island.groundY + 0.1,
                Math.sin(angle) * distance
            )

            stone.scale.y = 0.55

            stone.rotation.y = angle

            group.add(stone)
        }
    }

    return group
}