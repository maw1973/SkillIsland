import * as THREE from 'three'

// SkillIsland V8.5.2
// 戶外軟體開發工作區

export function createCodeLabDetails(island) {

    const group = new THREE.Group()

    group.name = 'CodeLabDetails'
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

                    emissive:
                        glow ? color : 0x000000,

                    emissiveIntensity:
                        glow ? 0.85 : 0

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
    // 01 科技工作平台
    // ==================================

    function createPlatform(x, z) {

        box(
            group,
            4.6, 0.22, 5.3,
            0xc9bbdf,
            x, 0.11, z
        )

        for (let row = 0; row < 5; row++) {

            for (let col = 0; col < 4; col++) {

                box(
                    group,
                    1.08, 0.04, 1.0,

                    (row + col) % 2
                        ? 0xe6dff3
                        : 0xf4effa,

                    x - 1.65 + col * 1.1,
                    0.24,
                    z - 2 + row
                )
            }
        }

        // 紫色平台裝飾燈條

        for (const side of [-1, 1]) {

            box(
                group,
                0.065, 0.045, 5.0,
                0xb794f6,
                x + side * 2.25,
                0.25, z,
                true
            )
        }
    }

    // ==================================
    // 02 程式開發螢幕
    // ==================================

    function createMonitor(
        parent, x, z, rotation, type
    ) {

        const monitor = new THREE.Group()

        monitor.position.set(x, 0, z)
        monitor.rotation.y = rotation

        parent.add(monitor)

        // 螢幕外框

        box(
            monitor,
            1.25, 0.95, 0.12,
            0x252c40,
            0, 2.05, 0
        )

        // 螢幕支架

        box(
            monitor,
            0.10, 0.38, 0.12,
            0x596177,
            0, 1.43, 0
        )

        box(
            monitor,
            0.48, 0.07, 0.40,
            0x596177,
            0, 1.40, 0
        )

        // Canvas 程式畫面

        const canvas =
            document.createElement('canvas')

        canvas.width = 640
        canvas.height = 480

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#172033'
        ctx.fillRect(0, 0, 640, 480)

        ctx.fillStyle = '#344056'
        ctx.fillRect(0, 0, 640, 48)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 22px Arial'

        const titles = [
            'App.vue',
            'Terminal',
            'API Service'
        ]

        ctx.fillText(
            titles[type],
            20, 32
        )

        const contents = [

            [
                "import { ref } from 'vue'",
                '',
                'const skills = ref([])',
                '',
                'async function init() {',
                '  await loadSkills()',
                '}',
                '',
                'init()'
            ],

            [
                '$ npm run build',
                '',
                'Building project...',
                '',
                'Modules transformed',
                '',
                'Build successful',
                '',
                '$ npm run dev'
            ],

            [
                "app.get('/api/skills',",
                '  async (req, res) => {',
                '',
                '    const data = await',
                '      getSkills()',
                '',
                '    res.json(data)',
                '  }',
                ')'
            ]

        ]

        const colors = [

            '#c4b5fd',
            '#7dd3fc',
            '#86efac',
            '#fde68a',
            '#f9a8d4'

        ]

        ctx.font =
            '25px Consolas, monospace'

        contents[type].forEach((line, i) => {

            ctx.fillStyle =
                colors[i % colors.length]

            ctx.fillText(
                line,
                20,
                95 + i * 39,
                600
            )
        })

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const screen = new THREE.Mesh(

            new THREE.PlaneGeometry(
                1.15, 0.85
            ),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        )

        screen.position.set(
            0, 2.05, 0.075
        )

        monitor.add(screen)
    }

    // ==================================
    // 03 Q版軟體工程師
    // ==================================

    function createDeveloper(parent) {

        const person = new THREE.Group()

        person.name = 'SoftwareDeveloper'

        person.position.set(
            0, 0, 1.48
        )

        // 人物正面朝向 -Z 電腦方向

        person.rotation.y = Math.PI

        parent.add(person)

        const skin = 0xffd3ad
        const shirt = 0x9275d6
        const pants = 0x354258

        // 坐姿身體

        box(
            person,
            0.53, 0.62, 0.36,
            shirt,
            0, 1.12, 0
        )

        // 頭部

        sphere(
            person,
            0.33, skin,
            0, 1.68, 0.04
        )

        const hair = sphere(
            person,
            0.34, 0x332820,
            0, 1.80, -0.02
        )

        hair.scale.y = 0.58

        // 眼鏡

        for (const side of [-1, 1]) {

            box(
                person,
                0.20, 0.14, 0.035,
                0x30323b,
                side * 0.125,
                1.69, 0.33
            )

            box(
                person,
                0.15, 0.10, 0.025,
                0x9fc9e3,
                side * 0.125,
                1.69, 0.36
            )

            // 坐姿大腿

            box(
                person,
                0.23, 0.22, 0.43,
                pants,
                side * 0.14,
                0.81, 0.19
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
                0.17, 0.19, 0.45,
                skin,
                side * 0.32,
                1.35, 0.27
            )

            sphere(
                person,
                0.09, skin,
                side * 0.32,
                1.37, 0.51
            )
        }

        // 眼鏡鼻橋

        box(
            person,
            0.08, 0.035, 0.03,
            0x30323b,
            0, 1.70, 0.35
        )

        return person
    }

    // ==================================
    // 04 三螢幕程式工作站
    // ==================================

    function createWorkstation(x, z) {

        const station = new THREE.Group()

        station.name = 'CodeWorkstation'

        station.position.set(
            x, 0.26, z
        )

        group.add(station)

        // 桌面

        box(
            station,
            3.8, 0.15, 1.8,
            0xe1d9f1,
            0, 1.32, 0
        )

        // 桌腳

        for (const px of [-1.65, 1.65]) {

            for (const pz of [-0.72, 0.72]) {

                box(
                    station,
                    0.14, 1.25, 0.14,
                    0x56466f,
                    px, 0.625, pz
                )
            }
        }

        // 三螢幕

        createMonitor(
            station,
            -1.25, -0.40,
            0.20, 0
        )

        createMonitor(
            station,
            0, -0.55,
            0, 1
        )

        createMonitor(
            station,
            1.25, -0.40,
            -0.20, 2
        )

        // 鍵盤

        box(
            station,
            1.30, 0.065, 0.50,
            0x39334e,
            0, 1.44, 0.72
        )

        for (let row = 0; row < 3; row++) {

            for (let col = 0; col < 11; col++) {

                box(
                    station,
                    0.085, 0.025, 0.10,
                    0xc4b5fd,
                    -0.56 + col * 0.112,
                    1.485,
                    0.58 + row * 0.13
                )
            }
        }

        // 滑鼠

        const mouse = sphere(
            station,
            0.16,
            0x7952cc,
            0.95, 1.44, 0.65
        )

        mouse.scale.set(
            0.65, 0.3, 1
        )

        // 電腦主機

        box(
            station,
            0.65, 1.10, 0.85,
            0x29263c,
            1.3, 0.55, 0
        )

        for (let i = 0; i < 3; i++) {

            box(
                station,
                0.36, 0.05, 0.03,
                0xb794f6,
                1.3,
                0.45 + i * 0.20,
                0.44,
                true
            )
        }

        // 電腦椅

        box(
            station,
            0.85, 0.13, 0.85,
            0x7952cc,
            0, 0.72, 1.48
        )

        box(
            station,
            0.85, 0.83, 0.14,
            0x59408d,
            0, 1.12, 1.86
        )

        box(
            station,
            0.15, 0.65, 0.15,
            0x536172,
            0, 0.325, 1.48
        )

        box(
            station,
            0.95, 0.10, 0.18,
            0x536172,
            0, 0.09, 1.48
        )

        box(
            station,
            0.18, 0.10, 0.95,
            0x536172,
            0, 0.09, 1.48
        )

        createDeveloper(station)
    }

    // ==================================
    // 05 科技伺服器機櫃
    // ==================================

    function createServer(x, z) {

        const server = new THREE.Group()

        server.name = 'CodeServer'

        server.position.set(
            x, 0.26, z
        )

        group.add(server)

        box(
            server,
            1.45, 3.0, 1.05,
            0x2c2940,
            0, 1.50, 0
        )

        for (let i = 0; i < 8; i++) {

            const y =
                0.25 + i * 0.35

            box(
                server,
                1.23, 0.27, 0.07,
                0x504863,
                0, y, 0.55
            )

            // 散熱孔

            for (let j = 0; j < 5; j++) {

                box(
                    server,
                    0.09, 0.12, 0.025,
                    0x242337,
                    -0.45 + j * 0.14,
                    y, 0.60
                )
            }

            // 發光指示燈

            box(
                server,
                0.08, 0.08, 0.03,
                0x86efac,
                0.36, y, 0.61,
                true
            )

            box(
                server,
                0.08, 0.08, 0.03,
                0xa78bfa,
                0.50, y, 0.61,
                true
            )
        }
    }

    // ==================================
    // 06 程式技術展示牆
    // ==================================

    function createTechnologyWall(x, z) {

        const wall = new THREE.Group()

        wall.name = 'TechnologyWall'

        wall.position.set(
            x, 0.26, z
        )

        group.add(wall)

        box(
            wall,
            3.85, 2.70, 0.25,
            0x59408d,
            0, 2.25, 0
        )

        const canvas =
            document.createElement('canvas')

        canvas.width = 960
        canvas.height = 640

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#232038'
        ctx.fillRect(0, 0, 960, 640)

        ctx.fillStyle = '#7952cc'
        ctx.fillRect(0, 0, 960, 105)

        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.font = 'bold 45px Arial'

        ctx.fillText(
            'DEVELOPMENT STACK',
            480, 68
        )

        const technologies = [

            ['Vue 3', '#42b883'],
            ['JavaScript', '#e8bf42'],
            ['Node.js', '#69ad53'],
            ['SQL Server', '#d85e73'],
            ['Three.js', '#538fd3'],
            ['Vite', '#9a7bed']

        ]

        technologies.forEach(
            ([name, color], i) => {

                const col = i % 2
                const row = Math.floor(i / 2)

                const x =
                    35 + col * 460

                const y =
                    135 + row * 160

                ctx.fillStyle = '#3b3355'

                ctx.fillRect(
                    x, y, 430, 135
                )

                ctx.fillStyle = color

                ctx.fillRect(
                    x, y, 12, 135
                )

                ctx.fillStyle = '#ffffff'
                ctx.font = 'bold 43px Arial'

                ctx.fillText(
                    name,
                    x + 215,
                    y + 82
                )
            }
        )

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const screen = new THREE.Mesh(

            new THREE.PlaneGeometry(
                3.65, 2.50
            ),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        )

        screen.position.set(
            0, 2.25, 0.14
        )

        wall.add(screen)

        for (const side of [-1, 1]) {

            box(
                wall,
                0.16, 1.1, 0.18,
                0x56466f,
                side * 1.50,
                0.55, 0
            )
        }
    }

    // ==================================
    // 07 左側程式開發區
    // ==================================

    createPlatform(-10.8, 0)

    createWorkstation(
        -10.8, 0
    )

    // ==================================
    // 08 右側科技展示區
    // ==================================

    createPlatform(10.8, 0)

    createTechnologyWall(
        10.8, -1.6
    )

    createServer(
        9.8, 1.0
    )

    createServer(
        11.8, 1.0
    )

    // ==================================
    // 09 島嶼互動識別
    // ==================================

    group.traverse(object => {

        object.userData.islandId =
            island.config.id

        object.userData.islandConfig =
            island.config
    })

    return group
}
