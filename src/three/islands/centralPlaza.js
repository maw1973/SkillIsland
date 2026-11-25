import * as THREE from 'three'

// SkillIsland V8.1.2
// 中央技能管理島景觀廣場

export function createCentralPlaza(island) {

    const group = new THREE.Group()

    group.name = 'CentralPlaza'
    group.position.y = island.groundY

    island.group.add(group)

    const materials = new Map()

    function material(color) {

        if (!materials.has(color)) {

            materials.set(
                color,
                new THREE.MeshStandardMaterial({
                    color,
                    roughness: 0.75,
                    flatShading: true
                })
            )
        }

        return materials.get(color)
    }

    function mesh(geometry, color, x, y, z) {

        const object = new THREE.Mesh(
            geometry,
            material(color)
        )

        object.position.set(x, y, z)

        object.castShadow = true
        object.receiveShadow = true

        group.add(object)

        return object
    }

    function box(w, h, d, color, x, y, z) {

        return mesh(
            new THREE.BoxGeometry(w, h, d),
            color, x, y, z
        )
    }

    function cylinder(
        rt, rb, h, color, x, y, z, sides = 24
    ) {

        return mesh(
            new THREE.CylinderGeometry(
                rt, rb, h, sides
            ),
            color, x, y, z
        )
    }

    function sphere(r, color, x, y, z) {

        return mesh(
            new THREE.IcosahedronGeometry(r, 1),
            color, x, y, z
        )
    }

    // ==================================
    // 01 景觀廣場地板
    // ==================================

    box(
        14.4, 0.12, 10.2,
        0xd4d1c9,
        0, 0.08, 13.8
    )

    // 廣場地磚

    for (let row = 0; row < 7; row++) {

        for (let col = 0; col < 10; col++) {

            const color =
                (row + col) % 2 === 0
                    ? 0xf0ebe2
                    : 0xe0ddd5

            box(
                1.38, 0.06, 1.38,
                color,
                -6.3 + col * 1.4,
                0.17,
                9.6 + row * 1.4
            )
        }
    }

    // ==================================
    // 02 中央噴水池
    // ==================================

    const fountainZ = 13.5

    // 水池底座

    cylinder(
        3.4, 3.6, 0.3,
        0xb9c4c9,
        0, 0.35, fountainZ,
        48
    )

    // 池底

    cylinder(
        3, 3, 0.2,
        0x83c8df,
        0, 0.55, fountainZ,
        48
    )

    // 水池外牆

    const rim = mesh(
        new THREE.TorusGeometry(
            3.05, 0.24, 10, 64
        ),
        0xf6f0e5,
        0, 0.78, fountainZ
    )

    rim.rotation.x = Math.PI / 2

    // 水面

    const water = new THREE.Mesh(

        new THREE.CircleGeometry(2.9, 64),

        new THREE.MeshStandardMaterial({
            color: 0x39bce4,
            transparent: true,
            opacity: 0.85,
            roughness: 0.2,
            metalness: 0.1,
            side: THREE.DoubleSide
        })
    )

    water.rotation.x = -Math.PI / 2

    water.position.set(
        0, 0.72, fountainZ
    )

    group.add(water)

    // 中央噴水台

    cylinder(
        0.85, 1.05, 0.45,
        0xe8e5de,
        0, 0.85, fountainZ
    )

    cylinder(
        0.35, 0.55, 1.35,
        0xf8f5eb,
        0, 1.7, fountainZ
    )

    sphere(
        0.35,
        0xb6efff,
        0, 2.5, fountainZ
    )

    // ==================================
    // 03 立體噴水弧線
    // ==================================

    const waterMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xb5efff,
            transparent: true,
            opacity: 0.85
        })

    for (let i = 0; i < 8; i++) {

        const angle =
            i * Math.PI * 2 / 8

        const points = []

        for (let j = 0; j <= 24; j++) {

            const t = j / 24

            const radius =
                0.15 + t * 2.45

            const height =
                2.4
                + Math.sin(t * Math.PI) * 1.25
                - t * 1.65

            points.push(
                new THREE.Vector3(
                    Math.cos(angle) * radius,
                    height,
                    fountainZ
                    + Math.sin(angle) * radius
                )
            )
        }

        const curve =
            new THREE.CatmullRomCurve3(points)

        const stream = new THREE.Mesh(

            new THREE.TubeGeometry(
                curve, 24, 0.045, 6, false
            ),

            waterMaterial
        )

        group.add(stream)
    }

    // ==================================
    // 04 景觀路燈
    // ==================================

    function createLamp(x, z) {

        cylinder(
            0.25, 0.35, 0.25,
            0x526475,
            x, 0.32, z, 12
        )

        cylinder(
            0.075, 0.11, 2.7,
            0x425566,
            x, 1.75, z, 12
        )

        cylinder(
            0.28, 0.28, 0.12,
            0x425566,
            x, 3.15, z, 12
        )

        const bulb = sphere(
            0.24, 0xffe9a6,
            x, 3.43, z
        )

        bulb.material =
            new THREE.MeshStandardMaterial({
                color: 0xffe9a6,
                emissive: 0xffd166,
                emissiveIntensity: 0.8
            })

        cylinder(
            0.08, 0.36, 0.22,
            0x425566,
            x, 3.75, z, 12
        )
    }

    for (const x of [-6.1, 6.1]) {

        for (const z of [9.8, 17.5]) {

            createLamp(x, z)
        }
    }

    // ==================================
    // 05 休憩座椅
    // ==================================

    function createBench(x, z, rotation) {

        const bench = new THREE.Group()

        function part(w, h, d, color, px, py, pz) {

            const object = new THREE.Mesh(
                new THREE.BoxGeometry(w, h, d),
                material(color)
            )

            object.position.set(px, py, pz)

            object.castShadow = true
            object.receiveShadow = true

            bench.add(object)
        }

        // 金屬椅腳

        for (const side of [-1, 1]) {

            part(
                0.15, 0.6, 0.75,
                0x495766,
                side * 0.85, 0.3, 0
            )

            part(
                0.15, 1.05, 0.15,
                0x495766,
                side * 0.85, 0.9, -0.35
            )
        }

        // 木質座面

        for (let i = 0; i < 4; i++) {

            part(
                2.15, 0.13, 0.16,
                0xc48a54,
                0, 0.65, -0.28 + i * 0.19
            )
        }

        // 木質椅背

        for (let i = 0; i < 3; i++) {

            part(
                2.15, 0.19, 0.12,
                0xb77945,
                0, 0.9 + i * 0.23, -0.4
            )
        }

        bench.position.set(x, 0.2, z)
        bench.rotation.y = rotation

        group.add(bench)
    }

    createBench(-5.6, 13.5, Math.PI / 2)

    createBench(5.6, 13.5, -Math.PI / 2)

    createBench(-3.5, 17.4, Math.PI)

    createBench(3.5, 17.4, Math.PI)

    // ==================================
    // 06 彩色景觀花圃
    // ==================================

    const flowerColors = [

        0xff6b9d,
        0xffcf4d,
        0xb58aef,
        0xfff1dc,
        0xff835e

    ]

    function createFlowerBed(x, z) {

        // 花圃外框

        box(
            2.5, 0.35, 1.8,
            0xd4bb92,
            x, 0.25, z
        )

        // 泥土

        box(
            2.2, 0.12, 1.5,
            0x78563c,
            x, 0.47, z
        )

        for (let row = 0; row < 3; row++) {

            for (let col = 0; col < 5; col++) {

                const px =
                    x - 0.85 + col * 0.42

                const pz =
                    z - 0.5 + row * 0.5

                const height =
                    0.3 + ((row + col) % 3) * 0.08

                cylinder(
                    0.025, 0.04, height,
                    0x39834c,
                    px, 0.52 + height / 2, pz,
                    6
                )

                const color =
                    flowerColors[
                        (row + col) % flowerColors.length
                    ]

                sphere(
                    0.14,
                    color,
                    px, 0.55 + height, pz
                )

                sphere(
                    0.065,
                    0xffdf65,
                    px, 0.68 + height, pz
                )
            }
        }
    }

    createFlowerBed(-8.4, 10.5)

    createFlowerBed(8.4, 10.5)

    createFlowerBed(-8.4, 15.5)

    createFlowerBed(8.4, 15.5)

    // ==================================
    // 07 互動識別資料
    // ==================================

    group.traverse(object => {

        object.userData.islandId = 'central'

    })

    return group
}