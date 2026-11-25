import * as THREE from 'three'

export function createClouds(scene) {

    const clouds = []

    const cloudMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xffffff,
            roughness: 1,
            flatShading: true
        })

    const cloudGeometry =
        new THREE.IcosahedronGeometry(1, 1)

    function createCloud(x, y, z, scale) {

        const group = new THREE.Group()

        const pieces = [

            [-4, 0, 0, 3.0],
            [0, 0, 0, 4.2],
            [4, 0, 0, 3.2],
            [-1, 2, 0, 3.2],
            [2, 1.5, 1, 3.0],
            [-2, -0.5, 2, 2.6]
        ]

        pieces.forEach(piece => {

            const mesh = new THREE.Mesh(
                cloudGeometry,
                cloudMaterial
            )

            mesh.position.set(
                piece[0],
                piece[1],
                piece[2]
            )

            mesh.scale.set(
                piece[3] * 1.3,
                piece[3] * 0.75,
                piece[3]
            )

            group.add(mesh)
        })

        group.position.set(x, y, z)

        group.scale.setScalar(scale)

        scene.add(group)

        clouds.push({

            mesh: group,

            speed: 0.4 + Math.random() * 0.8,

            baseY: y,

            phase: Math.random() * Math.PI * 2
        })
    }

    createCloud(-60, 35, -45, 1.2)
    createCloud(45, 40, -55, 1.5)
    createCloud(-85, 45, 25, 1.4)
    createCloud(80, 38, 35, 1.2)
    createCloud(0, 55, -95, 1.8)
    createCloud(100, 50, -80, 1.5)
    createCloud(-100, 50, -90, 1.6)
    createCloud(25, 45, 85, 1.1)

    function update(time, delta) {

        clouds.forEach(cloud => {

            cloud.mesh.position.x +=
                cloud.speed * delta

            cloud.mesh.position.y =
                cloud.baseY +
                Math.sin(time * 0.4 + cloud.phase) * 0.5

            if (cloud.mesh.position.x > 150) {

                cloud.mesh.position.x = -150
            }
        })
    }

    return {
        clouds,
        update
    }
}