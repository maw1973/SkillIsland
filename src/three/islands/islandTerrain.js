import * as THREE from 'three'

// SkillIsland V1.2
// Low-poly 自然島嶼生成模組

export function createIslandTerrain(scene, options = {}) {

    const {
        x = 0,
        z = 0,
        radius = 22,
        grassColor = 0x75c94f,
        sandColor = 0xf4d394,
        rockColor = 0x9b8066,
        seed = 2026
    } = options

    const group = new THREE.Group()

    group.position.set(x, 0, z)

    scene.add(group)

    const segments = 36

    let randomSeed = seed >>> 0

    function random() {
        randomSeed =
            (Math.imul(1664525, randomSeed) +
                1013904223) >>> 0

        return randomSeed / 4294967296
    }

    const outline = []

    for (let i = 0; i < segments; i++) {

        const angle = i / segments * Math.PI * 2

        const variation =
            1 +
            Math.sin(angle * 3) * 0.08 +
            Math.cos(angle * 5) * 0.06 +
            Math.sin(angle * 7) * 0.03

        outline.push({
            x: Math.cos(angle) * radius * variation,
            z: Math.sin(angle) * radius * variation
        })
    }

    // 建立地形環狀結構

    function createLayer(rings, color) {

        const vertices = []
        const indices = []

        rings.forEach(ring => {

            outline.forEach(point => {

                vertices.push(
                    point.x * ring.scale,
                    ring.y,
                    point.z * ring.scale
                )
            })
        })

        for (let r = 0; r < rings.length - 1; r++) {

            for (let i = 0; i < segments; i++) {

                const next = (i + 1) % segments

                const a = r * segments + i
                const b = r * segments + next
                const c = (r + 1) * segments + i
                const d = (r + 1) * segments + next

                indices.push(a, c, b)
                indices.push(b, c, d)
            }
        }

        const geometry = new THREE.BufferGeometry()

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
        )

        geometry.setIndex(indices)

        geometry.computeVertexNormals()

        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 1,
            flatShading: true,
            side: THREE.DoubleSide
        })

        const mesh = new THREE.Mesh(
            geometry,
            material
        )

        mesh.castShadow = true
        mesh.receiveShadow = true

        group.add(mesh)

        return mesh
    }

    // 01 岩石底層

    createLayer([
        { scale: 0.65, y: -5 },
        { scale: 0.85, y: -3 },
        { scale: 1.00, y: -1 },
        { scale: 1.00, y: 0 }
    ], rockColor)

    // 02 金色沙灘

    createLayer([
        { scale: 1.00, y: 0 },
        { scale: 0.96, y: 0.6 },
        { scale: 0.88, y: 1.3 },
        { scale: 0.82, y: 1.8 }
    ], sandColor)

    // 03 草地平台

    createLayer([
        { scale: 0.82, y: 1.8 },
        { scale: 0.80, y: 2.4 },
        { scale: 0.60, y: 2.4 },
        { scale: 0.00, y: 2.4 }
    ], grassColor)

    // 04 沿岸岩石

    const rockGeometry =
        new THREE.DodecahedronGeometry(1, 0)

    const rockMaterials = [
        new THREE.MeshStandardMaterial({
            color: 0x9b9386,
            flatShading: true
        }),
        new THREE.MeshStandardMaterial({
            color: 0xb4a38a,
            flatShading: true
        }),
        new THREE.MeshStandardMaterial({
            color: 0x817b73,
            flatShading: true
        })
    ]

    for (let i = 0; i < 24; i++) {

        const angle = random() * Math.PI * 2

        const distance =
            radius * (0.87 + random() * 0.13)

        const rock = new THREE.Mesh(
            rockGeometry,
            rockMaterials[i % rockMaterials.length]
        )

        rock.position.set(
            Math.cos(angle) * distance,
            0.5,
            Math.sin(angle) * distance
        )

        const size = 0.45 + random() * 1.1

        rock.scale.set(
            size * 1.4,
            size * 0.65,
            size
        )

        rock.rotation.set(
            random(),
            random() * Math.PI,
            random()
        )

        rock.castShadow = true
        rock.receiveShadow = true

        group.add(rock)
    }

    return {
        group,
        radius,
        groundY: 2.4
    }
}