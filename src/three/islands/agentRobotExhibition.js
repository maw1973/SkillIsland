import * as THREE from 'three'

// SkillIsland V8.8.1
// 戶外智慧機器人展示區

export function createAgentRobotExhibition(island) {

    if (!island?.group) return

    const name = 'AgentRobotExhibition_V881'

    const existing =
        island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    group.position.y = island.groundY

    island.group.add(group)

    const robots = []

    const materials = new Map()

    const colors = {

        dark: 0x173447,

        white: 0xf1f8ff,

        silver: 0xb0bec5,

        cyan: 0x00e5ff,

        gold: 0xffc107,

        black: 0x14212d

    }

    function material(color, glow = false) {

        const key = `${color}_${glow}`

        if (!materials.has(key)) {

            materials.set(

                key,

                glow

                    ? new THREE.MeshBasicMaterial({

                        color,

                        toneMapped: false

                    })

                    : new THREE.MeshStandardMaterial({

                        color,

                        roughness: 0.45,

                        metalness: 0.15,

                        flatShading: true

                    })

            )

        }

        return materials.get(key)

    }

    // 共用幾何模型

    const boxGeometry =
        new THREE.BoxGeometry(1, 1, 1)

    const sphereGeometry =
        new THREE.SphereGeometry(1, 16, 12)

    function box(

        parent,

        w, h, d,

        x, y, z,

        color,

        glow = false

    ) {

        const mesh = new THREE.Mesh(

            boxGeometry,

            material(color, glow)

        )

        mesh.scale.set(w, h, d)

        mesh.position.set(x, y, z)

        mesh.castShadow = !glow

        mesh.receiveShadow = !glow

        parent.add(mesh)

        return mesh

    }

    function sphere(

        parent,

        sx, sy, sz,

        x, y, z,

        color,

        glow = false

    ) {

        const mesh = new THREE.Mesh(

            sphereGeometry,

            material(color, glow)

        )

        mesh.scale.set(sx, sy, sz)

        mesh.position.set(x, y, z)

        mesh.castShadow = !glow

        parent.add(mesh)

        return mesh

    }

    function cylinder(

        parent,

        rt, rb, h,

        x, y, z,

        color,

        glow = false

    ) {

        const mesh = new THREE.Mesh(

            new THREE.CylinderGeometry(

                rt, rb, h, 24

            ),

            material(color, glow)

        )

        mesh.position.set(x, y, z)

        mesh.castShadow = !glow

        mesh.receiveShadow = !glow

        parent.add(mesh)

        return mesh

    }

    function ring(

        parent,

        radius,

        thickness,

        color

    ) {

        const mesh = new THREE.Mesh(

            new THREE.TorusGeometry(

                radius,

                thickness,

                8,

                48

            ),

            material(color, true)

        )

        parent.add(mesh)

        return mesh

    }

    // ==================================
    // 01 五種智慧代理機器人設定
    // ==================================

    const configs = [

        {

            id: 'Search',

            title: '資料搜尋',

            english: 'SEARCH BOT',

            color: 0x2196f3,

            accent: 0x67e8f9

        },

        {

            id: 'Document',

            title: '文件處理',

            english: 'DOCUMENT BOT',

            color: 0xff9800,

            accent: 0xffd54f

        },

        {

            id: 'Coding',

            title: '程式開發',

            english: 'CODING BOT',

            color: 0x9333ea,

            accent: 0xd8b4fe

        },

        {

            id: 'Analytics',

            title: '數據分析',

            english: 'ANALYTICS BOT',

            color: 0x22c55e,

            accent: 0x86efac

        },

        {

            id: 'Workflow',

            title: '自動化執行',

            english: 'WORKFLOW BOT',

            color: 0xef4444,

            accent: 0xfda4af

        }

    ]

    // ==================================
    // 02 中文展示看板
    // ==================================

    function createSign(parent, config) {

        const canvas =
            document.createElement('canvas')

        canvas.width = 768

        canvas.height = 320

        const ctx = canvas.getContext('2d')

        const hex = '#' +

            config.color.toString(16).padStart(6, '0')

        ctx.fillStyle = '#102b3e'

        ctx.fillRect(0, 0, 768, 320)

        ctx.strokeStyle = hex

        ctx.lineWidth = 14

        ctx.strokeRect(7, 7, 754, 306)

        ctx.textAlign = 'center'

        ctx.fillStyle = '#ffffff'

        ctx.font = 'bold 94px Microsoft JhengHei'

        ctx.fillText(config.title, 384, 125)

        ctx.fillStyle = hex

        ctx.font = 'bold 42px Arial'

        ctx.fillText(config.english, 384, 195)

        ctx.fillStyle = '#67e8f9'

        ctx.font = '30px Microsoft JhengHei'

        ctx.fillText('智慧任務代理', 384, 265)

        const texture = new THREE.CanvasTexture(canvas)

        texture.colorSpace = THREE.SRGBColorSpace

        box(

            parent,

            2.65, 1.1, 0.16,

            0, 0.83, 1.52,

            colors.dark

        )

        const sign = new THREE.Mesh(

            new THREE.PlaneGeometry(

                2.5, 1.04

            ),

            new THREE.MeshBasicMaterial({

                map: texture,

                toneMapped: false

            })

        )

        sign.position.set(

            0, 0.83, 1.611

        )

        parent.add(sign)

    }

    // ==================================
    // 03 機器人胸前專屬功能圖案
    // ==================================

    function createRobotSymbol(parent, config) {

        const canvas =
            document.createElement('canvas')

        canvas.width = 256

        canvas.height = 256

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#102b3e'

        ctx.fillRect(0, 0, 256, 256)

        ctx.strokeStyle = '#ffffff'

        ctx.fillStyle = '#67e8f9'

        ctx.lineWidth = 16

        ctx.lineCap = 'round'

        ctx.lineJoin = 'round'

        // 資料搜尋：放大鏡

        if (config.id === 'Search') {

            ctx.beginPath()

            ctx.arc(

                105, 105, 54,

                0, Math.PI * 2

            )

            ctx.stroke()

            ctx.beginPath()

            ctx.moveTo(145, 145)

            ctx.lineTo(207, 207)

            ctx.stroke()

        }

        // 文件處理：文件圖示

        else if (config.id === 'Document') {

            ctx.strokeRect(

                65, 35, 126, 185

            )

            for (let i = 0; i < 3; i++) {

                ctx.beginPath()

                ctx.moveTo(90, 90 + i * 42)

                ctx.lineTo(165, 90 + i * 42)

                ctx.stroke()

            }

        }

        // 程式開發：程式符號

        else if (config.id === 'Coding') {

            ctx.font = 'bold 105px monospace'

            ctx.textAlign = 'center'

            ctx.fillText('</>', 128, 165)

        }

        // 數據分析：彩色長條圖

        else if (config.id === 'Analytics') {

            const values = [65, 110, 165]

            values.forEach((h, i) => {

                ctx.fillStyle = [

                    '#22d3ee',

                    '#fbbf24',

                    '#4ade80'

                ][i]

                ctx.fillRect(

                    40 + i * 64,

                    215 - h,

                    45,

                    h

                )

            })

        }

        // 自動化：流程節點

        else {

            const points = [

                [128, 50],

                [65, 125],

                [191, 125],

                [128, 205]

            ]

            ctx.beginPath()

            ctx.moveTo(...points[0])

            ctx.lineTo(...points[1])

            ctx.lineTo(...points[3])

            ctx.lineTo(...points[2])

            ctx.closePath()

            ctx.stroke()

            points.forEach(([x, y]) => {

                ctx.beginPath()

                ctx.arc(x, y, 22, 0, Math.PI * 2)

                ctx.fill()

            })

        }

        const texture = new THREE.CanvasTexture(canvas)

        texture.colorSpace = THREE.SRGBColorSpace

        const symbol = new THREE.Mesh(

            new THREE.PlaneGeometry(

                0.68, 0.68

            ),

            new THREE.MeshBasicMaterial({

                map: texture,

                toneMapped: false

            })

        )

        symbol.position.set(

            0, 1.88, 0.476

        )

        parent.add(symbol)

    }

    // ==================================
    // 04 機器人展示平台
    // ==================================

    function createPlatform(parent, config) {

        cylinder(

            parent,

            1.65, 1.75, 0.25,

            0, 0.125, 0,

            colors.dark

        )

        cylinder(

            parent,

            1.5, 1.6, 0.16,

            0, 0.33, 0,

            config.color

        )

        const baseRing = ring(

            parent,

            1.55, 0.06,

            config.accent

        )

        baseRing.rotation.x = Math.PI / 2

        baseRing.position.y = 0.42

        cylinder(

            parent,

            1.2, 1.2, 0.1,

            0, 0.46, 0,

            colors.white

        )

        // 平台彩色燈光

        for (let i = 0; i < 12; i++) {

            const angle =

                i / 12 * Math.PI * 2

            const light = box(

                parent,

                0.15, 0.065, 0.14,

                Math.cos(angle) * 1.4,

                0.43,

                Math.sin(angle) * 1.4,

                i % 3 === 0

                    ? colors.gold

                    : config.accent,

                true

            )

            light.rotation.y = -angle

        }

    }

    // ==================================
    // 05 建立Q版智慧機器人
    // ==================================

    function createRobot(config, x, z, index) {

        const exhibit = new THREE.Group()

        exhibit.name = `AgentExhibit_${config.id}`

        exhibit.position.set(x, 0, z)

        // 所有展示機器人朝島嶼外側

        exhibit.rotation.y = Math.atan2(x, z)

        group.add(exhibit)

        createPlatform(exhibit, config)

        const robot = new THREE.Group()

        robot.name = `AgentRobot_${config.id}`

        robot.position.y = 0.51

        exhibit.add(robot)

        // 雙腳及鞋子

        for (const side of [-1, 1]) {

            box(

                robot,

                0.42, 0.25, 0.7,

                side * 0.32,

                0.125,

                0.12,

                colors.dark

            )

            box(

                robot,

                0.33, 0.66, 0.42,

                side * 0.32,

                0.58,

                0,

                colors.silver

            )

            box(

                robot,

                0.36, 0.16, 0.45,

                side * 0.32,

                0.43,

                0,

                config.color

            )

        }

        // 腰部

        box(

            robot,

            0.8, 0.24, 0.65,

            0, 0.94, 0,

            colors.dark

        )

        // 主身體

        box(

            robot,

            1.35, 1.35, 0.9,

            0, 1.65, 0,

            config.color

        )

        // 白色裝甲

        box(

            robot,

            1.45, 0.16, 0.95,

            0, 2.34, 0,

            colors.white

        )

        box(

            robot,

            1.42, 0.15, 0.95,

            0, 1.02, 0,

            colors.white

        )

        // 胸前數據面板

        const chest = box(

            robot,

            0.84, 0.84, 0.1,

            0, 1.88, 0.42,

            colors.dark

        )

        createRobotSymbol(robot, config)

        // 胸前狀態燈

        for (let i = 0; i < 3; i++) {

            box(

                robot,

                0.14, 0.08, 0.05,

                -0.25 + i * 0.25,

                1.25,

                0.48,

                i === 1

                    ? colors.gold

                    : config.accent,

                true

            )

        }

        // ==================================
        // 06 頭部與數位表情
        // ==================================

        cylinder(

            robot,

            0.26, 0.3, 0.2,

            0, 2.47, 0,

            colors.dark

        )

        const head = new THREE.Group()

        head.position.y = 2.98

        robot.add(head)

        box(

            head,

            1.42, 0.92, 1.02,

            0, 0, 0,

            config.color

        )

        box(

            head,

            1.48, 0.12, 1.08,

            0, 0.44, 0,

            colors.white

        )

        // 黑色數位臉部

        box(

            head,

            1.16, 0.66, 0.08,

            0, 0, 0.52,

            colors.black

        )

        // 發光眼睛

        const eyes = []

        for (const side of [-1, 1]) {

            const eye = sphere(

                head,

                0.14, 0.17, 0.04,

                side * 0.28,

                0.09,

                0.58,

                config.accent,

                true

            )

            eyes.push(eye)

        }

        // 微笑

        box(

            head,

            0.36, 0.055, 0.045,

            0, -0.2, 0.58,

            config.accent,

            true

        )

        // 耳部通訊裝置

        for (const side of [-1, 1]) {

            const ear = cylinder(

                head,

                0.25, 0.25, 0.18,

                side * 0.77,

                0,

                0,

                colors.dark

            )

            ear.rotation.z = Math.PI / 2

            sphere(

                head,

                0.055, 0.13, 0.13,

                side * 0.88,

                0,

                0,

                config.accent,

                true

            )

        }

        // ==================================
        // 07 五種不同頭部天線
        // ==================================

        const antenna = new THREE.Group()

        antenna.position.y = 0.5

        head.add(antenna)

        cylinder(

            antenna,

            0.055, 0.075, 0.37,

            0, 0.185, 0,

            colors.dark

        )

        const antennaTop = sphere(

            antenna,

            0.13, 0.13, 0.13,

            0, 0.4, 0,

            config.accent,

            true

        )

        if (config.id === 'Search') {

            const radar = ring(

                antenna,

                0.29, 0.045,

                config.accent

            )

            radar.position.y = 0.4

        }

        if (config.id === 'Coding') {

            box(

                antenna,

                0.48, 0.12, 0.12,

                0, 0.28, 0,

                config.accent,

                true

            )

        }

        if (config.id === 'Workflow') {

            for (const side of [-1, 1]) {

                sphere(

                    antenna,

                    0.09, 0.09, 0.09,

                    side * 0.22,

                    0.32,

                    0,

                    colors.gold,

                    true

                )

            }

        }

        // ==================================
        // 08 機械手臂
        // ==================================

        function createArm(side) {

            const arm = new THREE.Group()

            arm.position.set(

                side * 0.83,

                2.12,

                0

            )

            robot.add(arm)

            sphere(

                arm,

                0.25, 0.25, 0.25,

                0, 0, 0,

                colors.white

            )

            box(

                arm,

                0.34, 0.67, 0.38,

                0, -0.35, 0,

                config.color

            )

            sphere(

                arm,

                0.21, 0.21, 0.21,

                0, -0.72, 0,

                colors.dark

            )

            box(

                arm,

                0.31, 0.42, 0.33,

                0, -0.96, 0,

                colors.silver

            )

            // 機械手掌

            box(

                arm,

                0.4, 0.26, 0.36,

                0, -1.25, 0,

                colors.dark

            )

            for (const finger of [-1, 1]) {

                box(

                    arm,

                    0.12, 0.26, 0.17,

                    finger * 0.14,

                    -1.46,

                    0.02,

                    colors.white

                )

            }

            return arm
        }

        const leftArm = createArm(-1)

        const rightArm = createArm(1)

        leftArm.rotation.z = -0.12

        rightArm.rotation.z = 0.12

        // ==================================
        // 09 展示區功能看板
        // ==================================

        createSign(exhibit, config)

        // 機器人上方訊號光環

        const signalMaterial =
            new THREE.MeshBasicMaterial({

                color: config.accent,

                transparent: true,

                opacity: 0.7,

                depthWrite: false,

                toneMapped: false

            })

        const signalRing = new THREE.Mesh(

            new THREE.TorusGeometry(

                0.45, 0.035, 8, 40

            ),

            signalMaterial

        )

        signalRing.rotation.x = Math.PI / 2

        signalRing.position.y = 4.15

        robot.add(signalRing)

        robots.push({

            robot,

            chest,

            head,

            eyes,

            leftArm,

            rightArm,

            antennaTop,

            signalRing,

            signalMaterial,

            phase: index * 1.25

        })

    }

    // ==================================
    // 10 安全範圍與展示區配置
    // ==================================

    const islandRadius = Number(

        island.config?.radius

    ) || 19

    const safeRadius = Math.min(

        12,

        islandRadius - 3.5

    )

    const buildingAngle =

        island.building?.rotation.y || 0

    if (safeRadius >= 9.2) {

        // 保留主建築入口正中央的空間

        const angles = [

            -135,

            -80,

            -25,

            30,

            85

        ]

        configs.forEach((config, index) => {

            const angle =

                THREE.MathUtils.degToRad(

                    angles[index]

                ) + buildingAngle

            const x = Math.sin(angle) * safeRadius

            const z = Math.cos(angle) * safeRadius

            createRobot(

                config,

                x,

                z,

                index

            )

        })

    } else {

        console.warn(

            '[V8.8.1] 島嶼安全空間不足，略過機器人展示區'

        )

    }

    // ==================================
    // 11 機器人動態展示
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    function update() {

        const time =

            (performance.now() - start) / 1000

        robots.forEach((item, index) => {

            const t = time + item.phase

            // 頭部左右觀察

            item.head.rotation.y =

                Math.sin(t * 0.9) * 0.28

            item.head.rotation.x =

                Math.sin(t * 0.7) * 0.06

            // 數位眼睛眨眼

            const blink = (t % 4.5) < 0.15

            item.eyes.forEach(eye => {

                eye.scale.y =

                    blink ? 0.025 : 0.17

            })

            // 不同機器人工作手勢

            item.leftArm.rotation.x =

                -0.28 +

                Math.sin(t * 1.5) * 0.25

            item.rightArm.rotation.x =

                -0.48 +

                Math.sin(t * 1.7 + index) * 0.38

            item.rightArm.rotation.z =

                0.18 +

                Math.sin(t * 1.2) * 0.12

            // 天線訊號節點

            const scale =

                0.13 *

                (1 + Math.sin(t * 3) * 0.18)

            item.antennaTop.scale.setScalar(scale)

            // 訊號光環擴散

            const pulse = (t * 0.65) % 1

            const ringScale =

                0.6 + pulse * 1.8

            item.signalRing.scale.set(

                ringScale,

                ringScale,

                1

            )

            item.signalRing.position.y =

                3.95 + pulse * 0.65

            item.signalMaterial.opacity =

                (1 - pulse) * 0.8

        })

    }

    // ==================================
    // 12 接入既有渲染流程
    // ==================================

    robots.forEach(item => {

        item.chest.onBeforeRender =

            function(renderer) {

                const frame =

                    renderer.info.render.frame

                if (frame === lastFrame) return

                lastFrame = frame

                update()

            }

    })

    update()

    console.log(

        'SkillIsland V8.8.1 戶外智慧機器人展示區建立完成',

        {

            robots: robots.length

        }

    )

    return group

}
