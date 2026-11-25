import * as THREE from 'three'

// SkillIsland V1.2
// 島嶼自然景觀

export function createIslandNature(island) {

    const group = new THREE.Group()

    island.group.add(group)

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xa87642,
            flatShading: true
        })

    const leafMaterials = [
        new THREE.MeshStandardMaterial({
            color: 0x249d48,
            flatShading: true
        }),
        new THREE.MeshStandardMaterial({
            color: 0x49c65a,
            flatShading: true
        })
    ]

    const coconutMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x80502c
        })

    // 椰子樹生成器

    function createPalmTree(x, z, scale = 1) {

        const tree = new THREE.Group()

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.22,
                0.48,
                5.5,
                7
            ),
            trunkMaterial
        )

        trunk.position.y = 2.75

        trunk.castShadow = true

        tree.add(trunk)

        // 椰子樹葉

        for (let i = 0; i < 8; i++) {

            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry(
                    1, 6, 4
                ),
                leafMaterials[i % 2]
            )

            const angle = i * Math.PI / 4

            leaf.scale.set(0.65, 0.16, 2.3)

            leaf.position.set(
                Math.sin(angle) * 1.65,
                5.5,
                Math.cos(angle) * 1.65
            )

            leaf.rotation.y = angle
            leaf.rotation.x = 0.18

            leaf.castShadow = true

            tree.add(leaf)
        }

        // 椰子

        for (let i = 0; i < 3; i++) {

            const coconut = new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.35, 6, 5
                ),
                coconutMaterial
            )

            const angle = i * Math.PI * 2 / 3

            coconut.position.set(
                Math.cos(angle) * 0.4,
                5.05,
                Math.sin(angle) * 0.4
            )

            tree.add(coconut)
        }

        tree.position.set(
            x,
            island.groundY,
            z
        )

        tree.scale.setScalar(scale)

        group.add(tree)
    }

    // 椰子樹位置

    const r = island.radius

    createPalmTree(-r * 0.55, -r * 0.35, 1.1)
    createPalmTree(-r * 0.60, 0, 0.85)
    createPalmTree(r * 0.55, -r * 0.25, 1.2)
    createPalmTree(r * 0.50, r * 0.35, 0.95)
    createPalmTree(-r * 0.30, r * 0.55, 0.9)
    createPalmTree(r * 0.15, -r * 0.60, 1.0)

    // 草叢

    const grassGeometry =
        new THREE.ConeGeometry(0.18, 0.8, 3)

    const grassMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x398f35,
            flatShading: true
        })

    for (let i = 0; i < 100; i++) {

        const angle = Math.random() * Math.PI * 2

        const distance =
            r * (0.38 + Math.random() * 0.34)

        const grass = new THREE.Mesh(
            grassGeometry,
            grassMaterial
        )

        grass.position.set(
            Math.cos(angle) * distance,
            island.groundY + 0.25,
            Math.sin(angle) * distance
        )

        grass.rotation.z =
            (Math.random() - 0.5) * 0.5

        grass.scale.setScalar(
            0.4 + Math.random() * 0.7
        )

        group.add(grass)
    }

    // 彩色花朵

    const flowerColors = [
        0xff6b9d,
        0xffd54f,
        0xffffff,
        0xa78bfa,
        0xff884d
    ]

    const flowerMaterials =
        flowerColors.map(color =>
            new THREE.MeshStandardMaterial({ color })
        )

    const flowerGeometry =
        new THREE.IcosahedronGeometry(0.23, 0)

    for (let i = 0; i < 48; i++) {

        const angle = Math.random() * Math.PI * 2

        const distance =
            r * (0.40 + Math.random() * 0.29)

        const flower = new THREE.Mesh(
            flowerGeometry,
            flowerMaterials[i % flowerMaterials.length]
        )

        flower.position.set(
            Math.cos(angle) * distance,
            island.groundY + 0.25,
            Math.sin(angle) * distance
        )

        group.add(flower)
    }

    return group
}