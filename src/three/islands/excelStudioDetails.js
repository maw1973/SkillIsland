import * as THREE from 'three'

// SkillIsland V8.4.2
// Excel 戶外數據工作區

export function createExcelStudioDetails(island) {

    const group = new THREE.Group()

    group.name = 'ExcelStudioDetails'
    group.position.y = island.groundY

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
                    emissiveIntensity: glow ? 0.65 : 0
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

    function sphere(parent, r, color, x, y, z) {

        return mesh(
            parent,
            new THREE.SphereGeometry(r, 12, 8),
            color, x, y, z
        )
    }

    // ==================================
    // 01 戶外工作平台
    // ==================================

    function createPlatform(x, z) {

        box(
            group,
            4.5, 0.22, 5.2,
            0xc6decf,
            x, 0.11, z
        )

        for (let row = 0; row < 5; row++) {

            for (let col = 0; col < 4; col++) {

                box(
                    group,
                    1.05, 0.04, 0.98,
                    (row + col) % 2 === 0
                        ? 0xe8f4eb
                        : 0xd5eadb,
                    x - 1.62 + col * 1.08,
                    0.24,
                    z - 2 + row
                )
            }
        }
    }

    // ==================================
    // 02 電腦工作站
    // ==================================

    function createWorkstation(x, z, rotation, shirt) {

        const station = new THREE.Group()

        station.name = 'ExcelWorkstation'

        station.position.set(x, 0.26, z)
        station.rotation.y = rotation

        group.add(station)

        // 工作桌

        box(
            station,
            3.3, 0.15, 1.65,
            0xe2e8e4,
            0, 1.35, 0
        )

        for (const px of [-1.4, 1.4]) {

            for (const pz of [-0.65, 0.65]) {

                box(
                    station,
                    0.14, 1.28, 0.14,
                    0x60736b,
                    px, 0.64, pz
                )
            }
        }

        // 雙螢幕

        for (const px of [-0.78, 0.78]) {

            box(
                station,
                1.42, 0.95, 0.13,
                0x263b35,
                px, 2.05, -0.48
            )

            box(
                station,
                0.10, 0.35, 0.10,
                0x52665d,
                px, 1.55, -0.48
            )

            box(
                station,
                0.55, 0.06, 0.40,
                0x52665d,
                px, 1.455, -0.40
            )

            box(
                station,
                1.28, 0.80, 0.025,
                0xd4f1df,
                px, 2.05, -0.40
            )

            // 螢幕資料儲存格

            for (let row = 0; row < 5; row++) {

                for (let col = 0; col < 4; col++) {

                    box(
                        station,
                        0.27, 0.105, 0.012,
                        row === 4
                            ? 0x218b4a
                            : (row + col) % 2
                                ? 0xa8d7b8
                                : 0xf0fff3,
                        px - 0.44 + col * 0.29,
                        1.77 + row * 0.14,
                        -0.38
                    )
                }
            }
        }

        // 鍵盤

        box(
            station,
            1.25, 0.07, 0.48,
            0x34473e,
            0, 1.46, 0.45
        )

        for (let row = 0; row < 3; row++) {

            for (let col = 0; col < 10; col++) {

                box(
                    station,
                    0.09, 0.025, 0.095,
                    0xc5d4cc,
                    -0.52 + col * 0.115,
                    1.51,
                    0.31 + row * 0.12
                )
            }
        }

        // 滑鼠

        const mouse = sphere(
            station,
            0.16,
            0x34473e,
            0.9, 1.46, 0.45
        )

        mouse.scale.set(0.65, 0.3, 1)

        // 電腦主機

        box(
            station,
            0.65, 1.05, 0.85,
            0x30483e,
            1.1, 0.525, -0.2
        )

        box(
            station,
            0.15, 0.08, 0.03,
            0x58eea0,
            1.1, 0.90, 0.24,
            true
        )

        // ==================================
        // 03 電腦椅
        // ==================================

        const chair = new THREE.Group()

        chair.position.set(0, 0, 1.35)

        station.add(chair)

        box(
            chair,
            0.85, 0.14, 0.85,
            0x218b4a,
            0, 0.72, 0
        )

        box(
            chair,
            0.85, 0.83, 0.14,
            0x176638,
            0, 1.12, 0.35
        )

        box(
            chair,
            0.13, 0.65, 0.13,
            0x53685e,
            0, 0.325, 0
        )

        box(
            chair,
            0.95, 0.10, 0.18,
            0x53685e,
            0, 0.09, 0
        )

        box(
            chair,
            0.18, 0.10, 0.95,
            0x53685e,
            0, 0.09, 0
        )

        // ==================================
        // 04 Q版坐姿分析人員
        // ==================================

        const person = new THREE.Group()

        person.position.set(
            0, 0, 1.35
        )

        // 人物正面朝向電腦

        person.rotation.y = Math.PI

        station.add(person)

        const skin = 0xffd3ad
        const pants = 0x34465b

        box(
            person,
            0.53, 0.62, 0.36,
            shirt,
            0, 1.12, 0
        )

        sphere(
            person,
            0.33, skin,
            0, 1.68, 0.04
        )

        const hair = sphere(
            person,
            0.34, 0x322820,
            0, 1.80, -0.02
        )

        hair.scale.y = 0.58

        for (const side of [-1, 1]) {

            // 眼睛

            sphere(
                person,
                0.035, 0x292929,
                side * 0.11,
                1.68, 0.34
            )

            // 大腿

            box(
                person,
                0.23, 0.23, 0.48,
                pants,
                side * 0.14,
                0.82, 0.19
            )

            // 小腿

            box(
                person,
                0.21, 0.53, 0.24,
                pants,
                side * 0.14,
                0.44, 0.40
            )

            // 鞋子

            box(
                person,
                0.25, 0.14, 0.35,
                0x263445,
                side * 0.14,
                0.10, 0.46
            )

            // 手臂伸向鍵盤

            box(
                person,
                0.17, 0.19, 0.42,
                skin,
                side * 0.32,
                1.35, 0.24
            )

            sphere(
                person,
                0.09, skin,
                side * 0.32,
                1.38, 0.48
            )
        }

        return station
    }

    // ==================================
    // 05 資料伺服器
    // ==================================

    function createServer(x, z, rotation) {

        const server = new THREE.Group()

        server.name = 'DataServer'
        server.position.set(x, 0.26, z)
        server.rotation.y = rotation

        group.add(server)

        box(
            server,
            1.35, 2.7, 0.95,
            0x293e35,
            0, 1.35, 0
        )

        for (let i = 0; i < 7; i++) {

            const y = 0.34 + i * 0.34

            box(
                server,
                1.12, 0.27, 0.08,
                0x4e655b,
                0, y, 0.51
            )

            box(
                server,
                0.57, 0.045, 0.02,
                0x25372e,
                -0.17, y, 0.56
            )

            box(
                server,
                0.08, 0.08, 0.03,
                0x5cf29c,
                0.40, y, 0.57,
                true
            )

            box(
                server,
                0.07, 0.07, 0.03,
                0x67caff,
                0.26, y, 0.57,
                true
            )
        }
    }

    // ==================================
    // 06 立體數據展示牆
    // ==================================

    function createDashboard(x, z, rotation) {

        const dashboard = new THREE.Group()

        dashboard.name = 'ExcelDashboard'

        dashboard.position.set(x, 0.26, z)
        dashboard.rotation.y = rotation

        group.add(dashboard)

        // 展示牆

        box(
            dashboard,
            3.55, 2.55, 0.22,
            0x116638,
            0, 2.1, 0
        )

        const canvas =
            document.createElement('canvas')

        canvas.width = 800
        canvas.height = 560

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#effaf2'
        ctx.fillRect(0, 0, 800, 560)

        ctx.fillStyle = '#176b3c'
        ctx.fillRect(0, 0, 800, 90)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 38px Microsoft JhengHei'
        ctx.textAlign = 'center'

        ctx.fillText(
            'DATA DASHBOARD', 400, 59
        )

        ctx.fillStyle = '#226943'
        ctx.font = 'bold 28px Microsoft JhengHei'

        ctx.fillText(
            '數據統計展示', 400, 132
        )

        // 長條圖

        const values = [160, 210, 185, 280, 340]

        const colors = [
            '#42a5f5',
            '#66bb6a',
            '#ffc857',
            '#a78bfa',
            '#218b4a'
        ]

        values.forEach((h, i) => {

            ctx.fillStyle = colors[i]

            ctx.fillRect(
                90 + i * 130,
                485 - h,
                80,
                h
            )

            ctx.fillStyle = '#286545'
            ctx.font = 'bold 24px Arial'

            ctx.fillText(
                String(i + 1),
                130 + i * 130,
                520
            )
        })

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const screen = new THREE.Mesh(

            new THREE.PlaneGeometry(
                3.35, 2.35
            ),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        )

        screen.position.set(
            0, 2.1, 0.125
        )

        dashboard.add(screen)

        // 展示牆支柱

        for (const side of [-1, 1]) {

            box(
                dashboard,
                0.15, 1.2, 0.15,
                0x53685e,
                side * 1.4,
                0.6, 0
            )
        }
    }

    // ==================================
    // 07 左側數據工作區
    // ==================================

    createPlatform(-10.8, 0)

    createWorkstation(
        -10.8, 0.4,
        0, 0x4f9bd9
    )

    // ==================================
    // 08 右側數據展示區
    // ==================================

    createPlatform(10.8, 0)

    createDashboard(
        10.8, -1.5, 0
    )

    createServer(
        9.7, 1.1, 0
    )

    createServer(
        11.6, 1.1, 0
    )

    // ==================================
    // 09 互動識別
    // ==================================

    group.traverse(object => {

        object.userData.islandId =
            island.config.id

        object.userData.islandConfig =
            island.config
    })

    return group
}
