import * as THREE from 'three'

// SkillIsland V8.4.3
// Excel 動態數據運算

export function createExcelStudioAnimation(island) {

    const group = new THREE.Group()

    group.name = 'ExcelStudioAnimation'
    group.position.y = island.groundY

    group.rotation.y = Math.atan2(
        -island.config.x,
        -island.config.z
    )

    island.group.add(group)

    // ==================================
    // 01 動態試算表
    // ==================================

    const canvas = document.createElement('canvas')

    canvas.width = 1024
    canvas.height = 800

    const ctx = canvas.getContext('2d')

    const texture =
        new THREE.CanvasTexture(canvas)

    texture.colorSpace =
        THREE.SRGBColorSpace

    const screen = new THREE.Mesh(

        new THREE.PlaneGeometry(9, 7.05),

        new THREE.MeshBasicMaterial({
            map: texture
        })
    )

    // 疊加在原本試算表前方

    screen.position.set(
        0, 5.65, 4.32
    )

    group.add(screen)

    function drawSheet(step) {

        ctx.fillStyle = '#f4fff6'
        ctx.fillRect(0, 0, 1024, 800)

        // 功能列

        ctx.fillStyle = '#176b3c'
        ctx.fillRect(0, 0, 1024, 80)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px Microsoft JhengHei'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'

        ctx.fillText(
            '檔案    常用    插入    資料    公式',
            35, 40
        )

        // 公式列

        ctx.fillStyle = '#dcefe1'
        ctx.fillRect(0, 80, 1024, 68)

        const formulas = [
            '=SUM(B2:B5)',
            '=AVERAGE(B2:B5)',
            '=MAX(B2:B5)',
            '=MIN(B2:B5)'
        ]

        ctx.fillStyle = '#205d39'
        ctx.font = 'bold 29px Arial'

        ctx.fillText(
            'fx    ' +
            formulas[Math.floor(step / 4) % 4],
            35, 114
        )

        const startX = 75
        const startY = 203
        const cellW = 189
        const cellH = 91

        ctx.textAlign = 'center'

        // 欄位名稱

        ;['A', 'B', 'C', 'D', 'E'].forEach(
            (name, i) => {

                const x = startX + i * cellW

                ctx.fillStyle = '#c6e5cf'

                ctx.fillRect(
                    x, 150,
                    cellW - 3, 49
                )

                ctx.fillStyle = '#225d3b'
                ctx.font = 'bold 31px Arial'

                ctx.fillText(
                    name,
                    x + cellW / 2,
                    175
                )
            }
        )

        // 模擬營收數據

        const revenue = [
            850, 920, 980, 1050
        ].map((value, i) => {

            return value + Math.round(
                Math.sin(step * 0.55 + i) * 35
            )
        })

        const costs = [
            520, 560, 590, 610
        ]

        const profit = revenue.map(
            (value, i) => value - costs[i]
        )

        const sum = values =>
            values.reduce(
                (a, b) => a + b,
                0
            )

        const rows = [

            ['月份', '營收', '成本', '毛利', '毛利率'],

            ...revenue.map((value, i) => [

                '0' + (i + 1),

                String(value),

                String(costs[i]),

                String(profit[i]),

                (
                    profit[i] / value * 100
                ).toFixed(1) + '%'
            ]),

            [

                '合計',

                String(sum(revenue)),

                String(sum(costs)),

                String(sum(profit)),

                (
                    sum(profit)
                    / sum(revenue) * 100
                ).toFixed(1) + '%'

            ]

        ]

        const activeRow = 1 + step % 4
        const activeCol = 1 + Math.floor(step / 4) % 4

        rows.forEach((row, r) => {

            const y = startY + r * cellH

            ctx.fillStyle = '#d6eadb'

            ctx.fillRect(
                0, y,
                72, cellH - 3
            )

            ctx.fillStyle = '#38734b'
            ctx.font = 'bold 27px Arial'

            ctx.fillText(
                String(r + 1),
                36, y + cellH / 2
            )

            row.forEach((value, c) => {

                const x =
                    startX + c * cellW

                const active =
                    r === activeRow
                    && c === activeCol

                ctx.fillStyle =
                    r === 0
                        ? '#218b4a'
                        : r === 5
                            ? '#a7deb5'
                            : active
                                ? '#d9ef9e'
                                : r % 2
                                    ? '#ffffff'
                                    : '#e8f5eb'

                ctx.fillRect(
                    x, y,
                    cellW - 3,
                    cellH - 3
                )

                if (active) {

                    ctx.strokeStyle = '#16803d'
                    ctx.lineWidth = 7

                    ctx.strokeRect(
                        x + 4,
                        y + 4,
                        cellW - 11,
                        cellH - 11
                    )
                }

                ctx.fillStyle =
                    r === 0
                        ? '#ffffff'
                        : '#245c38'

                ctx.font =
                    'bold 30px Microsoft JhengHei'

                ctx.fillText(
                    value,
                    x + cellW / 2,
                    y + cellH / 2
                )
            })
        })

        // 工作表標籤

        ctx.fillStyle = '#d3e9d9'

        ctx.fillRect(
            0, 752, 1024, 48
        )

        ctx.fillStyle = '#176b3c'

        ctx.font =
            'bold 23px Microsoft JhengHei'

        ctx.fillText(
            '動態數據展示',
            145, 776
        )

        ctx.fillText(
            '模擬資料',
            875, 776
        )

        texture.needsUpdate = true
    }

    // ==================================
    // 02 伺服器運作指示燈
    // ==================================

    const serverLights = []

    if (island.excelDetails) {

        island.excelDetails.traverse(object => {

            if (object.name !== 'DataServer') {

                return
            }

            object.traverse(child => {

                if (
                    child.isMesh
                    && child.material
                    && child.material.emissiveIntensity > 0
                ) {

                    // 獨立材質避免所有燈同步

                    child.material =
                        child.material.clone()

                    serverLights.push(child)
                }
            })
        })
    }

    // ==================================
    // 03 動態資料傳輸粒子
    // ==================================

    const particleCount = 48

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

            color: 0x78f7ab,
            size: 0.17,
            transparent: true,
            opacity: 0.85,
            depthWrite: false

        })
    )

    particles.frustumCulled = false

    group.add(particles)

    // ==================================
    // 04 建築正面動態光條
    // ==================================

    const scanMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xa5ffd2,
            transparent: true,
            opacity: 0.45,
            depthWrite: false

        })

    const scanLine = new THREE.Mesh(

        new THREE.BoxGeometry(
            8.9, 0.055, 0.035
        ),

        scanMaterial
    )

    scanLine.position.set(
        0, 5.65, 4.37
    )

    group.add(scanLine)

    // ==================================
    // 05 動態更新
    // ==================================

    let lastStep = -1

    function update(time) {

        // 每秒更新一次畫面
        // 避免每個影格重新繪製貼圖

        const step = Math.floor(time)

        if (step !== lastStep) {

            drawSheet(step)

            lastStep = step
        }

        // 伺服器指示燈交替閃爍

        serverLights.forEach((light, i) => {

            light.material.emissiveIntensity =

                0.2 +

                (
                    Math.sin(
                        time * 3.5 + i * 1.7
                    ) + 1
                ) * 0.45
        })

        // 資料傳輸粒子
        // 限制於建築正面範圍

        for (let i = 0; i < particleCount; i++) {

            const t = (
                time * 0.22
                + i / particleCount
            ) % 1

            positions[i * 3] =
                -5.2 + t * 10.4

            positions[i * 3 + 1] =
                9.15 + Math.sin(
                    t * Math.PI
                ) * 0.45

            positions[i * 3 + 2] =
                4.5 + Math.sin(i * 1.8) * 0.12
        }

        geometry.attributes.position
            .needsUpdate = true

        // 掃描光線

        scanLine.position.y =
            2.2 + (time * 0.65 % 6.8)

        scanMaterial.opacity =
            0.25
            + Math.sin(time * 1.5) * 0.12
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
    // 06 互動識別
    // ==================================

    group.traverse(object => {

        object.userData.islandId =
            island.config.id

        object.userData.islandConfig =
            island.config
    })

    return group
}
