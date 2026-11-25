import * as THREE from 'three'

// SkillIsland V8.5.3
// 動態軟體開發中心

export function createCodeLabAnimation(island) {

    const group = new THREE.Group()

    group.name = 'CodeLabAnimation'
    group.position.y = island.groundY

    group.rotation.y = Math.atan2(
        -island.config.x,
        -island.config.z
    )

    island.group.add(group)

    // ==================================
    // 01 動態程式編輯器
    // ==================================

    const canvas = document.createElement('canvas')

    canvas.width = 1280
    canvas.height = 880

    const ctx = canvas.getContext('2d')

    const texture =
        new THREE.CanvasTexture(canvas)

    texture.colorSpace =
        THREE.SRGBColorSpace

    const screen = new THREE.Mesh(

        new THREE.PlaneGeometry(
            11.5, 7.85
        ),

        new THREE.MeshBasicMaterial({
            map: texture
        })
    )

    screen.position.set(
        0, 8.2, 0.84
    )

    group.add(screen)

    const lines = [

        ["import { ref } from 'vue'", '#c4b5fd'],

        ["import { loadSkills } from './api.js'", '#c4b5fd'],

        ['', '#ffffff'],

        ['const skills = ref([])', '#7dd3fc'],

        ['const ready = ref(false)', '#7dd3fc'],

        ['', '#ffffff'],

        ['async function initialize() {', '#fde68a'],

        ['    skills.value = await loadSkills()', '#86efac'],

        ['    ready.value = true', '#f9a8d4'],

        ["    console.log('System ready')", '#86efac'],

        ['}', '#fde68a'],

        ['initialize()', '#93c5fd']

    ]

    const totalCharacters = lines.reduce(
        (sum, line) => sum + line[0].length + 1,
        0
    )

    // ==================================
    // 02 繪製程式開發畫面
    // ==================================

    function drawEditor(time) {

        const cycle = time % 24

        const typedCount = Math.min(

            totalCharacters,

            Math.floor(cycle * 30)
        )

        // 編輯器背景

        ctx.fillStyle = '#182235'
        ctx.fillRect(0, 0, 1280, 880)

        // 視窗標題列

        ctx.fillStyle = '#344056'
        ctx.fillRect(0, 0, 1280, 65)

        const buttons = [

            '#f87171',
            '#facc15',
            '#4ade80'

        ]

        buttons.forEach((color, i) => {

            ctx.fillStyle = color

            ctx.beginPath()

            ctx.arc(
                28 + i * 38,
                32, 11,
                0, Math.PI * 2
            )

            ctx.fill()
        })

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 25px Arial'
        ctx.textAlign = 'center'

        ctx.fillText(
            'SkillIsland - Code Editor',
            640, 42
        )

        // 檔案總管

        ctx.fillStyle = '#263247'

        ctx.fillRect(
            0, 65, 260, 780
        )

        ctx.textAlign = 'left'

        ctx.fillStyle = '#94a3b8'
        ctx.font = 'bold 24px Arial'

        ctx.fillText(
            'EXPLORER', 25, 108
        )

        ctx.fillStyle = '#ffffff'

        ctx.fillText(
            'SKILL ISLAND', 25, 155
        )

        const files = [

            ['src', '#facc15'],
            ['  main.js', '#facc15'],
            ['  App.vue', '#4ade80'],
            ['  api.js', '#facc15'],
            ['  skills.js', '#facc15'],
            ['  style.css', '#60a5fa'],
            ['public', '#a78bfa'],
            ['package.json', '#fb923c'],
            ['vite.config.js', '#facc15']

        ]

        files.forEach(([name, color], i) => {

            const y = 202 + i * 43

            if (i === 2) {

                ctx.fillStyle = '#405473'

                ctx.fillRect(
                    0, y - 28, 260, 40
                )
            }

            ctx.fillStyle = color
            ctx.font = '23px Arial'

            ctx.fillText(name, 28, y)
        })

        // 編輯器分頁

        ctx.fillStyle = '#303c51'

        ctx.fillRect(
            260, 65, 1020, 54
        )

        ctx.fillStyle = '#182235'

        ctx.fillRect(
            260, 65, 220, 54
        )

        ctx.fillStyle = '#c4b5fd'

        ctx.fillRect(
            260, 65, 220, 4
        )

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '25px Arial'

        ctx.fillText(
            'App.vue', 286, 100
        )

        // ==================================
        // 03 程式碼逐字輸入
        // ==================================

        let remaining = typedCount

        let cursorX = 337
        let cursorY = 158

        ctx.font =
            '27px Consolas, monospace'

        lines.forEach(([text, color], i) => {

            const y = 158 + i * 34

            ctx.fillStyle = '#62748c'

            ctx.fillText(
                String(i + 1),
                280, y
            )

            if (remaining <= 0) return

            const visibleText =
                text.slice(0, remaining)

            ctx.fillStyle = color

            ctx.fillText(
                visibleText,
                337, y
            )

            cursorX =
                337
                + ctx.measureText(visibleText).width

            cursorY = y

            remaining -= text.length + 1
        })

        // 游標閃動

        if (Math.floor(time * 2) % 2 === 0) {

            ctx.fillStyle = '#e2e8f0'

            ctx.fillRect(
                cursorX + 3,
                cursorY - 25,
                3, 29
            )
        }

        // ==================================
        // 04 終端機編譯動畫
        // ==================================

        ctx.fillStyle = '#303c51'

        ctx.fillRect(
            260, 585, 1020, 45
        )

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 23px Arial'

        ctx.fillText(
            'TERMINAL', 282, 616
        )

        ctx.fillStyle = '#101827'

        ctx.fillRect(
            260, 630, 1020, 215
        )

        ctx.font =
            '25px Consolas, monospace'

        const typingFinished =
            typedCount >= totalCharacters

        if (!typingFinished) {

            ctx.fillStyle = '#94a3b8'

            ctx.fillText(
                'Waiting for source code...',
                285, 670
            )

        } else {

            const messages = [

                [
                    'PS D:\\SkillIsland> npm run build',
                    '#e2e8f0'
                ],

                [
                    'Building production environment...',
                    '#94a3b8'
                ],

                [
                    'Modules transformed successfully',
                    '#86efac'
                ],

                [
                    'Build successful - Simulation',
                    '#86efac'
                ]

            ]

            const buildTime =
                cycle - totalCharacters / 30

            messages.forEach(
                ([text, color], i) => {

                    if (buildTime >= i * 0.8) {

                        ctx.fillStyle = color

                        ctx.fillText(
                            text,
                            285,
                            670 + i * 42
                        )
                    }
                }
            )
        }

        // 底部狀態列

        ctx.fillStyle = '#7952cc'

        ctx.fillRect(
            0, 845, 1280, 35
        )

        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Arial'

        ctx.fillText(
            'main    UTF-8    JavaScript    Vue 3',
            25, 870
        )

        ctx.fillText(
            'DEMO',
            1180, 870
        )

        texture.needsUpdate = true
    }

    // ==================================
    // 05 伺服器指示燈
    // ==================================

    const serverLights = []

    if (island.codeDetails) {

        island.codeDetails.traverse(object => {

            if (object.name !== 'CodeServer') {

                return
            }

            object.traverse(child => {

                if (

                    child.isMesh

                    && child.material

                    && child.material.emissiveIntensity > 0

                ) {

                    child.material =
                        child.material.clone()

                    serverLights.push(child)
                }
            })
        })
    }

    // ==================================
    // 06 紫色資料傳輸粒子
    // ==================================

    const particleCount = 40

    const positions =
        new Float32Array(
            particleCount * 3
        )

    const geometry =
        new THREE.BufferGeometry()

    geometry.setAttribute(

        'position',

        new THREE.BufferAttribute(
            positions, 3
        ).setUsage(
            THREE.DynamicDrawUsage
        )
    )

    const particles = new THREE.Points(

        geometry,

        new THREE.PointsMaterial({

            color: 0xc4b5fd,

            size: 0.17,

            transparent: true,

            opacity: 0.8,

            depthWrite: false

        })
    )

    particles.frustumCulled = false

    group.add(particles)

    // ==================================
    // 07 動態鍵盤燈光
    // ==================================

    const keyboardLights = []

    for (let i = 0; i < 12; i++) {

        const light = new THREE.Mesh(

            new THREE.BoxGeometry(
                0.48, 0.025, 0.40
            ),

            new THREE.MeshBasicMaterial({

                color: 0xc4b5fd,

                transparent: true,

                opacity: 0.1,

                depthWrite: false

            })
        )

        light.position.set(

            -4.575 + i * 0.75,

            1.315,

            2.35
        )

        group.add(light)

        keyboardLights.push(light)
    }

    // ==================================
    // 08 動態更新
    // ==================================

    let lastStep = -1

    function update(time) {

        // 每秒最多更新10次貼圖

        const step = Math.floor(time * 10)

        if (step !== lastStep) {

            drawEditor(time)

            lastStep = step
        }

        // 伺服器指示燈

        serverLights.forEach((light, i) => {

            light.material.emissiveIntensity =

                0.25

                + (

                    Math.sin(
                        time * 3 + i * 1.6
                    ) + 1

                ) * 0.5
        })

        // 螢幕上方資料傳輸

        for (let i = 0; i < particleCount; i++) {

            const t = (

                time * 0.20
                + i / particleCount

            ) % 1

            positions[i * 3] =
                -5.7 + t * 11.4

            positions[i * 3 + 1] =

                12.85

                + Math.sin(
                    t * Math.PI
                ) * 0.3

            positions[i * 3 + 2] =
                -0.7 + Math.sin(i * 1.8) * 0.25
        }

        geometry.attributes.position
            .needsUpdate = true

        // 鍵盤波浪燈光

        keyboardLights.forEach((light, i) => {

            light.material.opacity =

                0.10

                + (

                    Math.sin(
                        time * 2.8 - i * 0.65
                    ) + 1

                ) * 0.32
        })
    }

    // 沿用原有 Three.js 渲染迴圈

    const startTime = performance.now()

    particles.onBeforeRender = () => {

        update(

            (performance.now() - startTime)

            / 1000
        )
    }

    update(0)

    // ==================================
    // 09 互動識別資料
    // ==================================

    group.traverse(object => {

        object.userData.islandId =
            island.config.id

        object.userData.islandConfig =
            island.config
    })

    return group
}
