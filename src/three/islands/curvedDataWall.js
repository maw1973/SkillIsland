import * as THREE from 'three'

// SkillIsland V8.7.3
// 巨型弧形數據展示牆

export function createCurvedDataWall(island) {

    if (!island?.group) return

    const name = 'CurvedDataWall_V873'

    const existing = island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    island.group.add(group)

    // 數據分析島左側

    group.position.set(
        -11.5,
        island.groundY + 0.5,
        0
    )

    // 展示牆朝向島嶼外側

    group.rotation.y = -Math.PI / 2

    const colors = [

        '#22d3ee',
        '#22c55e',
        '#fbbf24',
        '#a78bfa',
        '#f472b6'

    ]

    const materials = {

        dark: new THREE.MeshStandardMaterial({
            color: 0x102440,
            metalness: 0.35,
            roughness: 0.45
        }),

        blue: new THREE.MeshStandardMaterial({
            color: 0x24528a
        }),

        cyan: new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            toneMapped: false
        }),

        gold: new THREE.MeshStandardMaterial({
            color: 0xd99b28,
            metalness: 0.5,
            roughness: 0.35
        }),

        white: new THREE.MeshBasicMaterial({
            color: 0xffffff
        })

    }

    function box(
        w, h, d,
        x, y, z,
        material,
        parent = group
    ) {

        const mesh = new THREE.Mesh(

            new THREE.BoxGeometry(w, h, d),

            material

        )

        mesh.position.set(x, y, z)

        mesh.castShadow = true

        mesh.receiveShadow = true

        parent.add(mesh)

        return mesh

    }

    // ==================================
    // 01 弧形展示平台
    // ==================================

    box(
        12.8, 0.3, 4.4,
        0, 0.15, 0.5,
        materials.dark
    )

    box(
        12.5, 0.12, 4.1,
        0, 0.36, 0.5,
        materials.blue
    )

    box(
        12.5, 0.08, 0.08,
        0, 0.44, 2.55,
        materials.cyan
    )

    // ==================================
    // 02 五大商業分析主題
    // ==================================

    const panels = [

        {
            title: '全球市場分析',
            english: 'GLOBAL MARKET',
            color: colors[0]
        },

        {
            title: '企業營收趨勢',
            english: 'REVENUE TREND',
            color: colors[1]
        },

        {
            title: '營運績效指標',
            english: 'KPI PERFORMANCE',
            color: colors[2]
        },

        {
            title: '客戶分布分析',
            english: 'CUSTOMER ANALYTICS',
            color: colors[3]
        },

        {
            title: '即時數據監控',
            english: 'LIVE DATA STREAM',
            color: colors[4]
        }

    ]

    const screens = []

    // ==================================
    // 03 建立五面大型弧形螢幕
    // ==================================

    panels.forEach((panel, index) => {

        const pivot = new THREE.Group()

        const offset = index - 2

        pivot.position.set(

            offset * 2.5,

            0,

            offset * offset * 0.28

        )

        pivot.rotation.y = -offset * 0.18

        group.add(pivot)

        const accent = new THREE.MeshBasicMaterial({

            color: panel.color,

            toneMapped: false

        })

        // 金色支撐柱

        box(
            0.18, 1.35, 0.25,
            -0.8, 1.05, -0.15,
            materials.gold,
            pivot
        )

        box(
            0.18, 1.35, 0.25,
            0.8, 1.05, -0.15,
            materials.gold,
            pivot
        )

        // 螢幕外框

        box(
            2.48, 3.9, 0.32,
            0, 3.55, 0,
            materials.dark,
            pivot
        )

        // 彩色頂部燈條

        box(
            2.38, 0.12, 0.08,
            0, 5.43, 0.19,
            accent,
            pivot
        )

        // 底部科技燈條

        box(
            2.38, 0.08, 0.08,
            0, 1.66, 0.19,
            materials.cyan,
            pivot
        )

        // 左右外框

        for (const side of [-1, 1]) {

            box(
                0.055, 3.7, 0.06,
                side * 1.19, 3.55, 0.19,
                accent,
                pivot
            )

        }

        const canvas = document.createElement('canvas')

        canvas.width = 512

        canvas.height = 768

        const ctx = canvas.getContext('2d')

        const texture = new THREE.CanvasTexture(canvas)

        texture.colorSpace = THREE.SRGBColorSpace

        const screen = new THREE.Mesh(

            new THREE.PlaneGeometry(2.3, 3.45),

            new THREE.MeshBasicMaterial({

                map: texture,

                toneMapped: false

            })

        )

        screen.position.set(0, 3.55, 0.18)

        pivot.add(screen)

        screens.push({

            screen,

            canvas,

            ctx,

            texture,

            panel,

            index

        })

    })

    // ==================================
    // 04 共用儀表板背景
    // ==================================

    function drawBackground(item) {

        const { ctx, panel } = item

        const gradient = ctx.createLinearGradient(
            0, 0, 512, 768
        )

        gradient.addColorStop(0, '#07152e')

        gradient.addColorStop(1, '#12365a')

        ctx.fillStyle = gradient

        ctx.fillRect(0, 0, 512, 768)

        ctx.fillStyle = panel.color

        ctx.fillRect(0, 0, 512, 12)

        ctx.fillStyle = '#ffffff'

        ctx.font = 'bold 39px Microsoft JhengHei'

        ctx.fillText(panel.title, 25, 65)

        ctx.fillStyle = panel.color

        ctx.font = '21px Arial'

        ctx.fillText(panel.english, 25, 100)

        ctx.strokeStyle = '#315477'

        ctx.lineWidth = 2

        ctx.beginPath()

        ctx.moveTo(25, 125)

        ctx.lineTo(487, 125)

        ctx.stroke()

        // 所有數字均為展示用模擬資料

        ctx.fillStyle = '#94a3b8'

        ctx.font = '19px Microsoft JhengHei'

        ctx.fillText(
            '展示用模擬數據',
            25, 742
        )

    }

    // ==================================
    // 05 全球市場分析
    // ==================================

    function drawGlobalMarket(ctx, time) {

        const markets = [

            ['亞洲市場', 42, colors[0]],

            ['北美市場', 25, colors[1]],

            ['歐洲市場', 18, colors[2]],

            ['其他市場', 15, colors[3]]

        ]

        const shift = Math.sin(time * 0.45) * 3

        markets[0][1] += shift

        markets[1][1] -= shift

        ctx.font = 'bold 32px Microsoft JhengHei'

        ctx.fillStyle = '#ffffff'

        ctx.fillText('區域市場占比', 28, 180)

        let angle = -Math.PI / 2

        markets.forEach(item => {

            const end = angle +

                item[1] / 100 * Math.PI * 2

            ctx.beginPath()

            ctx.arc(256, 340, 115, angle, end)

            ctx.strokeStyle = item[2]

            ctx.lineWidth = 55

            ctx.stroke()

            angle = end

        })

        ctx.textAlign = 'center'

        ctx.fillStyle = '#ffffff'

        ctx.font = 'bold 50px Arial'

        ctx.fillText('100%', 256, 355)

        ctx.textAlign = 'left'

        markets.forEach((item, i) => {

            const y = 505 + i * 49

            ctx.fillStyle = item[2]

            ctx.fillRect(30, y - 20, 22, 22)

            ctx.fillStyle = '#ffffff'

            ctx.font = '25px Microsoft JhengHei'

            ctx.fillText(item[0], 68, y)

            ctx.textAlign = 'right'

            ctx.fillText(

                item[1].toFixed(1) + '%',

                475, y

            )

            ctx.textAlign = 'left'

        })

    }

    // ==================================
    // 06 企業營收趨勢
    // ==================================

    function drawRevenue(ctx, time) {

        const values = [95, 135, 122, 175, 208, 260]

        const points = []

        ctx.fillStyle = '#22c55e'

        ctx.font = 'bold 62px Arial'

        ctx.fillText(

            (18.5 + Math.sin(time * 0.6) * 2)

                .toFixed(1) + '%',

            28, 210

        )

        ctx.fillStyle = '#cbd5e1'

        ctx.font = '26px Microsoft JhengHei'

        ctx.fillText('模擬營收成長率', 30, 255)

        // 水平網格

        ctx.strokeStyle = '#284968'

        ctx.lineWidth = 1

        for (let y = 320; y <= 640; y += 64) {

            ctx.beginPath()

            ctx.moveTo(25, y)

            ctx.lineTo(487, y)

            ctx.stroke()

        }

        values.forEach((base, i) => {

            const h = base +

                Math.sin(time * 1.2 + i) * 30

            const x = 35 + i * 75

            ctx.fillStyle = colors[i % colors.length]

            ctx.fillRect(x, 640 - h, 48, h)

            points.push([x + 24, 630 - h])

            ctx.fillStyle = '#ffffff'

            ctx.font = '22px Microsoft JhengHei'

            ctx.fillText(`${i + 1}月`, x, 675)

        })

        ctx.beginPath()

        points.forEach((point, i) => {

            if (i === 0) {

                ctx.moveTo(...point)

            } else {

                ctx.lineTo(...point)

            }

        })

        ctx.strokeStyle = '#fbbf24'

        ctx.lineWidth = 5

        ctx.stroke()

        points.forEach(([x, y]) => {

            ctx.beginPath()

            ctx.arc(x, y, 7, 0, Math.PI * 2)

            ctx.fillStyle = '#ffffff'

            ctx.fill()

        })

    }

    // ==================================
    // 07 KPI 營運績效
    // ==================================

    function drawKPI(ctx, time) {

        const kpis = [

            ['營收達成率', 96.8, colors[0]],

            ['客戶滿意度', 92.5, colors[1]],

            ['作業效率', 88.6, colors[2]],

            ['專案完成率', 94.2, colors[3]]

        ]

        kpis.forEach((item, i) => {

            const y = 155 + i * 140

            const value = THREE.MathUtils.clamp(

                item[1] +

                Math.sin(time * 0.8 + i) * 2,

                0, 100

            )

            ctx.fillStyle = '#1e3a5f'

            ctx.fillRect(24, y, 464, 120)

            ctx.font = '28px Microsoft JhengHei'

            ctx.fillStyle = '#ffffff'

            ctx.fillText(item[0], 40, y + 36)

            ctx.font = 'bold 38px Arial'

            ctx.fillStyle = item[2]

            ctx.fillText(

                value.toFixed(1) + '%',

                40, y + 80

            )

            ctx.fillStyle = '#0f2038'

            ctx.fillRect(40, y + 93, 430, 12)

            ctx.fillStyle = item[2]

            ctx.fillRect(

                40, y + 93,

                430 * value / 100,

                12

            )

        })

    }

    // ==================================
    // 08 客戶分布分析
    // ==================================

    function drawCustomers(ctx, time) {

        const customers = [

            ['一般消費者', 950],

            ['企業客戶', 720],

            ['長期會員', 580],

            ['新進客戶', 310]

        ]

        const values = customers.map((item, i) => {

            return Math.round(

                item[1] +

                Math.sin(time * 0.7 + i) * 28

            )

        })

        const total = values.reduce(

            (sum, value) => sum + value,

            0

        )

        ctx.fillStyle = '#a78bfa'

        ctx.font = 'bold 65px Arial'

        ctx.fillText(

            total.toLocaleString('en-US'),

            28, 220

        )

        ctx.fillStyle = '#cbd5e1'

        ctx.font = '28px Microsoft JhengHei'

        ctx.fillText('模擬客戶總人數', 30, 265)

        customers.forEach((item, i) => {

            const y = 320 + i * 95

            const value = values[i]

            ctx.fillStyle = '#ffffff'

            ctx.font = '25px Microsoft JhengHei'

            ctx.fillText(item[0], 30, y)

            ctx.textAlign = 'right'

            ctx.fillText(String(value), 475, y)

            ctx.textAlign = 'left'

            ctx.fillStyle = '#1e3a5f'

            ctx.fillRect(30, y + 15, 450, 25)

            ctx.fillStyle = colors[i]

            ctx.fillRect(

                30, y + 15,

                450 * value / 1100,

                25

            )

        })

    }

    // ==================================
    // 09 即時數據瀑布
    // ==================================

    function drawLiveData(ctx, time) {

        const rows = 17

        const columns = 20

        const step = Math.floor(time * 5)

        ctx.font = '22px monospace'

        for (let x = 0; x < columns; x++) {

            const head = (step + x * 3) % rows

            for (let y = 0; y < rows; y++) {

                const distance =

                    (head - y + rows) % rows

                const opacity =

                    Math.max(0.12, 1 - distance / 9)

                ctx.fillStyle =

                    `rgba(34,211,238,${opacity})`

                const digit =

                    (x * 7 + y * 3 + step) % 10

                ctx.fillText(

                    String(digit),

                    22 + x * 24,

                    170 + y * 30

                )

            }

        }

        ctx.fillStyle = '#22c55e'

        ctx.beginPath()

        ctx.arc(42, 690, 9, 0, Math.PI * 2)

        ctx.fill()

        ctx.font = '25px Microsoft JhengHei'

        ctx.fillText(

            '模擬數據串流中',

            65, 699

        )

    }

    // ==================================
    // 10 大型科技展示牆標題
    // ==================================

    const titleCanvas = document.createElement('canvas')

    titleCanvas.width = 1024

    titleCanvas.height = 180

    const titleCtx = titleCanvas.getContext('2d')

    titleCtx.fillStyle = '#102440'

    titleCtx.fillRect(0, 0, 1024, 180)

    titleCtx.strokeStyle = '#22d3ee'

    titleCtx.lineWidth = 10

    titleCtx.strokeRect(5, 5, 1014, 170)

    titleCtx.textAlign = 'center'

    titleCtx.fillStyle = '#ffffff'

    titleCtx.font = 'bold 68px Microsoft JhengHei'

    titleCtx.fillText(

        '全球商業智慧數據中心',

        512, 82

    )

    titleCtx.fillStyle = '#67e8f9'

    titleCtx.font = '30px Arial'

    titleCtx.fillText(

        'BUSINESS INTELLIGENCE CENTER',

        512, 135

    )

    const titleTexture =

        new THREE.CanvasTexture(titleCanvas)

    titleTexture.colorSpace = THREE.SRGBColorSpace

    const titleMesh = new THREE.Mesh(

        new THREE.PlaneGeometry(8.2, 1.44),

        new THREE.MeshBasicMaterial({

            map: titleTexture,

            side: THREE.DoubleSide,

            toneMapped: false

        })

    )

    titleMesh.position.set(0, 6.5, 0.2)

    group.add(titleMesh)

    // 標題支架

    for (const side of [-1, 1]) {

        box(
            0.13, 0.8, 0.18,
            side * 3.5, 5.65, 0.15,
            materials.gold
        )

    }

    // ==================================
    // 11 科技廣場循環燈
    // ==================================

    const lights = []

    const lightGeometry = new THREE.BoxGeometry(

        0.25, 0.08, 0.2

    )

    const lightMaterial = new THREE.MeshBasicMaterial({

        color: 0xffffff,

        toneMapped: false

    })

    const lightInstances = new THREE.InstancedMesh(

        lightGeometry,

        lightMaterial,

        25

    )

    const dummy = new THREE.Object3D()

    for (let i = 0; i < 25; i++) {

        dummy.position.set(

            -6 + i * 0.5,

            0.48,

            2.2

        )

        dummy.updateMatrix()

        lightInstances.setMatrixAt(i, dummy.matrix)

        lights.push(i)

    }

    lightInstances.instanceMatrix.needsUpdate = true

    group.add(lightInstances)

    // ==================================
    // 12 動態更新五面數據螢幕
    // ==================================

    const start = performance.now()

    let lastUpdate = -1000

    let lastFrame = -1

    const cyanColor = new THREE.Color(0x22d3ee)

    const goldColor = new THREE.Color(0xfbbf24)

    const currentColor = new THREE.Color()

    const drawFunctions = [

        drawGlobalMarket,

        drawRevenue,

        drawKPI,

        drawCustomers,

        drawLiveData

    ]

    function update(force = false) {

        const now = performance.now()

        const time = (now - start) / 1000

        // 地板循環科技燈

        lights.forEach(i => {

            const wave =

                (Math.sin(time * 3 - i * 0.4) + 1) / 2

            currentColor.copy(cyanColor)

                .lerp(goldColor, wave)

            lightInstances.setColorAt(

                i,

                currentColor

            )

        })

        if (lightInstances.instanceColor) {

            lightInstances.instanceColor.needsUpdate = true

        }

        // 每秒更新兩次Canvas
        // 降低GPU紋理傳輸負擔

        if (!force && now - lastUpdate < 500) {

            return

        }

        screens.forEach(item => {

            drawBackground(item)

            drawFunctions[item.index](

                item.ctx,

                time

            )

            item.texture.needsUpdate = true

        })

        lastUpdate = now

    }

    // 沿用既有Three.js渲染流程

    screens.forEach(item => {

        item.screen.onBeforeRender = function(renderer) {

            const frame = renderer.info.render.frame

            if (frame === lastFrame) return

            lastFrame = frame

            update()

        }

    })

    update(true)

    console.log(

        'SkillIsland V8.7.3 巨型弧形數據展示牆建立完成'

    )

    return group

}

