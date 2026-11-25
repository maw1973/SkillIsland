import * as THREE from 'three'

// SkillIsland V8.3.2
// 文件技能島戶外數位閱讀區

export function createDocumentCenterDetails(island) {

    const group = new THREE.Group()

    group.name = 'DocumentCenterDetails'

    group.position.y = island.groundY

    group.rotation.y = Math.atan2(
        -island.config.x,
        -island.config.z
    )

    island.group.add(group)

    const materials = new Map()

    function mat(color) {

        if (!materials.has(color)) {

            materials.set(
                color,
                new THREE.MeshStandardMaterial({
                    color,
                    roughness: 0.8,
                    flatShading: true
                })
            )
        }

        return materials.get(color)
    }

    function mesh(parent, geometry, color, x, y, z) {

        const object = new THREE.Mesh(
            geometry,
            mat(color)
        )

        object.position.set(x, y, z)

        object.castShadow = true
        object.receiveShadow = true

        parent.add(object)

        return object
    }

    function box(parent, w, h, d, color, x, y, z) {

        return mesh(
            parent,
            new THREE.BoxGeometry(w, h, d),
            color, x, y, z
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

    function sphere(parent, r, color, x, y, z) {

        return mesh(
            parent,
            new THREE.SphereGeometry(r, 12, 8),
            color, x, y, z
        )
    }

    // ==================================
    // 01 閱讀區平台
    // ==================================

    function createPlatform(x, z) {

        box(
            group,
            4.5, 0.22, 5.2,
            0xd9e6ef,
            x, 0.11, z
        )

        for (let row = 0; row < 5; row++) {

            for (let col = 0; col < 4; col++) {

                box(
                    group,
                    1.05, 0.04, 0.98,
                    (row + col) % 2 === 0
                        ? 0xf0f4fa
                        : 0xe1e9f2,
                    x - 1.62 + col * 1.08,
                    0.24,
                    z - 2 + row
                )
            }
        }
    }

    // ==================================
    // 02 戶外遮陽閱讀亭
    // ==================================

    function createPavilion(x, z) {

        const pavilion = new THREE.Group()

        pavilion.name = 'ReadingPavilion'

        pavilion.position.set(x, 0.26, z)

        group.add(pavilion)

        // 四根支柱

        for (const px of [-1.85, 1.85]) {

            for (const pz of [-2.05, 2.05]) {

                box(
                    pavilion,
                    0.16, 3.55, 0.16,
                    0x60758d,
                    px, 1.775, pz
                )

                box(
                    pavilion,
                    0.35, 0.15, 0.35,
                    0x9caebe,
                    px, 0.075, pz
                )
            }
        }

        // 平面遮陽屋頂

        box(
            pavilion,
            4.25, 0.24, 4.65,
            0x386ac4,
            0, 3.67, 0
        )

        // 屋頂白色裝飾條

        for (let i = 0; i < 5; i++) {

            box(
                pavilion,
                0.12, 0.08, 4.65,
                0xd6ebff,
                -1.7 + i * 0.85,
                3.82, 0
            )
        }

        return pavilion
    }

    // ==================================
    // 03 閱讀桌
    // ==================================

    function createDesk(parent, x, z) {

        const desk = new THREE.Group()

        desk.position.set(x, 0, z)

        parent.add(desk)

        // 木質桌面

        box(
            desk,
            2.45, 0.16, 1.45,
            0xc58c57,
            0, 1.25, 0
        )

        // 桌腳

        for (const px of [-0.95, 0.95]) {

            for (const pz of [-0.52, 0.52]) {

                box(
                    desk,
                    0.13, 1.17, 0.13,
                    0x596979,
                    px, 0.585, pz
                )
            }
        }

        return desk
    }

    // ==================================
    // 04 閱讀椅
    // ==================================

    function createChair(parent, x, z, rotation) {

        const chair = new THREE.Group()

        chair.position.set(x, 0, z)

        chair.rotation.y = rotation

        parent.add(chair)

        box(
            chair,
            0.85, 0.12, 0.80,
            0x9cbde5,
            0, 0.66, 0
        )

        box(
            chair,
            0.85, 0.65, 0.12,
            0x6997d2,
            0, 1.05, -0.34
        )

        for (const px of [-0.32, 0.32]) {

            for (const pz of [-0.28, 0.28]) {

                box(
                    chair,
                    0.09, 0.60, 0.09,
                    0x526273,
                    px, 0.30, pz
                )
            }
        }

        return chair
    }

    // ==================================
    // 05 筆記型電腦
    // ==================================

    function createLaptop(parent, x, z, rotation) {

        const laptop = new THREE.Group()

        laptop.position.set(
            x, 1.34, z
        )

        laptop.rotation.y = rotation

        parent.add(laptop)

        // 鍵盤底座

        box(
            laptop,
            0.96, 0.065, 0.70,
            0x929eae,
            0, 0.04, 0
        )

        // 鍵盤

        for (let row = 0; row < 3; row++) {

            for (let col = 0; col < 8; col++) {

                box(
                    laptop,
                    0.075, 0.025, 0.075,
                    0x394555,
                    -0.31 + col * 0.09,
                    0.085,
                    -0.15 + row * 0.10
                )
            }
        }

        // 螢幕

        const screen = new THREE.Group()

        screen.position.set(
            0, 0.08, 0.32
        )

        screen.rotation.x = 0.18

        laptop.add(screen)

        box(
            screen,
            0.96, 0.70, 0.065,
            0x394555,
            0, 0.35, 0
        )

        box(
            screen,
            0.84, 0.58, 0.025,
            0x83c7ed,
            0, 0.35, -0.045
        )

        // 模擬文件內容

        for (let i = 0; i < 4; i++) {

            box(
                screen,
                i === 3 ? 0.35 : 0.65,
                0.035, 0.012,
                0xf5f9ff,
                0, 0.53 - i * 0.12,
                -0.065
            )
        }
    }

    // ==================================
    // 06 桌面翻開書本
    // ==================================

    function createOpenBook(parent, x, z) {

        const book = new THREE.Group()

        book.position.set(
            x, 1.35, z
        )

        parent.add(book)

        box(
            book,
            0.95, 0.055, 0.65,
            0x386ac4,
            0, 0.03, 0
        )

        for (const side of [-1, 1]) {

            box(
                book,
                0.44, 0.07, 0.61,
                0xfff8e8,
                side * 0.23,
                0.085, 0
            )

            for (let i = 0; i < 5; i++) {

                box(
                    book,
                    0.29, 0.008, 0.018,
                    0x9aa5b4,
                    side * 0.23,
                    0.125,
                    -0.20 + i * 0.10
                )
            }
        }
    }

    // ==================================
    // 07 開放式書架
    // ==================================

    function createBookshelf(parent, x, z) {

        const shelf = new THREE.Group()

        shelf.position.set(x, 0, z)

        parent.add(shelf)

        const wood = 0xb7895f

        box(
            shelf,
            2.7, 2.65, 0.12,
            wood,
            0, 1.325, -0.32
        )

        for (const side of [-1, 1]) {

            box(
                shelf,
                0.13, 2.65, 0.72,
                wood,
                side * 1.28,
                1.325, 0
            )
        }

        for (let level = 0; level < 4; level++) {

            box(
                shelf,
                2.7, 0.12, 0.75,
                wood,
                0, 0.08 + level * 0.84, 0
            )
        }

        const colors = [
            0xe66b65,
            0x386ac4,
            0x4dbd91,
            0xf5c34d,
            0xa88ae5
        ]

        for (let level = 0; level < 3; level++) {

            for (let i = 0; i < 9; i++) {

                const height =
                    0.48 + (i % 3) * 0.08

                box(
                    shelf,
                    0.21, height, 0.48,
                    colors[(i + level) % colors.length],
                    -1.04 + i * 0.26,
                    0.14 + level * 0.84
                        + height / 2,
                    0.04
                )

                box(
                    shelf,
                    0.15, 0.045, 0.02,
                    0xf7efe2,
                    -1.04 + i * 0.26,
                    0.32 + level * 0.84,
                    0.29
                )
            }
        }
    }

    // ==================================
    // 08 Q版坐姿閱讀人物
    // ==================================

    function createReader(parent, x, z, rotation, shirt) {

        const person = new THREE.Group()

        person.position.set(x, 0, z)

        person.rotation.y = rotation

        parent.add(person)

        const skin = 0xffd3ad
        const pants = 0x40516a

        // 坐姿身體

        box(
            person,
            0.52, 0.58, 0.35,
            shirt,
            0, 1.10, 0
        )

        // 頭部

        sphere(
            person,
            0.32, skin,
            0, 1.63, 0.04
        )

        const hair = sphere(
            person,
            0.33, 0x3c3028,
            0, 1.75, -0.02
        )

        hair.scale.y = 0.60

        // 眼睛

        for (const side of [-1, 1]) {

            sphere(
                person,
                0.035, 0x252525,
                side * 0.11,
                1.62, 0.33
            )
        }

        // 坐姿雙腿

        for (const side of [-1, 1]) {

            box(
                person,
                0.22, 0.22, 0.43,
                pants,
                side * 0.14,
                0.78, 0.16
            )

            box(
                person,
                0.20, 0.48, 0.22,
                pants,
                side * 0.14,
                0.42, 0.34
            )

            box(
                person,
                0.23, 0.14, 0.34,
                0x263445,
                side * 0.14,
                0.10, 0.43
            )

            // 手臂

            box(
                person,
                0.16, 0.18, 0.35,
                skin,
                side * 0.32,
                1.25, 0.23
            )

            sphere(
                person,
                0.09, skin,
                side * 0.32,
                1.25, 0.43
            )
        }

        return person
    }

    // ==================================
    // 09 左側戶外閱讀區
    // ==================================

    createPlatform(-10.8, 0)

    const left = createPavilion(
        -10.8, 0
    )

    const readingDesk = createDesk(
        left, 0, 0
    )

    createChair(
        left, 0, 1.25, Math.PI
    )

    createReader(
        left, 0, 1.25,
        Math.PI, 0xf28ba8
    )

    createOpenBook(
        readingDesk, 0, 0.10
    )

    createBookshelf(
        left, 0, -1.75
    )

    // ==================================
    // 10 右側數位學習區
    // ==================================

    createPlatform(10.8, 0)

    const right = createPavilion(
        10.8, 0
    )

    const digitalDesk = createDesk(
        right, 0, 0
    )

    createChair(
        right, 0, 1.25, Math.PI
    )

    createReader(
        right, 0, 1.25,
        Math.PI, 0x4f9bd9
    )

    createLaptop(
        digitalDesk, 0, 0.03, Math.PI
    )

    createBookshelf(
        right, 0, -1.75
    )

    // ==================================
    // 11 互動識別資料
    // ==================================

    group.traverse(object => {

        object.userData.islandId =
            island.config.id

        object.userData.islandConfig =
            island.config
    })

    return group
}
