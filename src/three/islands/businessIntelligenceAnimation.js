import * as THREE from 'three'

// SkillIsland V8.6.3
// 戶外商業智慧數據動態展示

export function createBusinessIntelligenceAnimation({

    group,
    barGroup,
    donutGroup,
    desk,
    screen,
    canvas,
    texture,
    materials

}) {

    if (!group || !screen || !canvas || !texture) return

    if (group.userData.biAnimationMounted) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    group.userData.biAnimationMounted = true

    const startTime = performance.now()

    let lastDashboardUpdate = -1000

    const colors = [

        '#38bdf8',
        '#22c55e',
        '#f59e0b',
        '#a78bfa',
        '#f472b6',
        '#2dd4bf'

    ]

    // 01 取得既有立體長條圖

    const bars = []

    const baseHeights = [0.65, 1.15, 1.65, 1.35, 2.35]

    for (let i = 0; i < 5; i++) {

        const bar = barGroup.children[1 + i * 2]

        const cap = barGroup.children[2 + i * 2]

        if (!bar || !cap) continue

        bars.push({

            mesh: bar,

            cap,

            baseHeight: baseHeights[i],

            phase: i * 0.85

        })

    }

    // 02 取得環形分析圖

    const donutSegments = donutGroup.children.filter(

        item => item.geometry?.type === 'ExtrudeGeometry'

    )

    const donutRotation = new THREE.Group()

    donutRotation.name = 'AnimatedDonutSegments'

    donutGroup.add(donutRotation)

    donutSegments.forEach(mesh => {

        donutRotation.attach(mesh)

    })

    // 03 操作台彩色按鈕

    const buttons = desk.children.filter(mesh => {

        return mesh.isMesh &&

            mesh.geometry?.parameters?.width === 0.2 &&

            mesh.geometry?.parameters?.height === 0.06

    })

    buttons.forEach(button => {

        button.material = button.material.clone()

        button.material.emissive =

            button.material.color.clone()

        button.material.emissiveIntensity = 0.25

    })

    // 04 KPI 數據動態更新

    function drawDashboard(time) {

        const revenue =

            128.6 + Math.sin(time * 0.65) * 5.8

        const growth =

            18.5 + Math.sin(time * 0.48) * 2.1

        const achievement =

            96.8 + Math.sin(time * 0.35) * 1.5

        const customers =

            2560 + Math.floor(Math.sin(time * 0.4) * 85)

        const kpis = [

            [
                '營收表現',
                `${revenue.toFixed(1)}萬`,
                '#22c55e'
            ],

            [
                '成長率',
                `+${growth.toFixed(1)}%`,
                '#38bdf8'
            ],

            [
                '達成率',
                `${achievement.toFixed(1)}%`,
                '#f59e0b'
            ],

            [
                '客戶數',
                customers.toLocaleString('en-US'),
                '#c084fc'
            ]

        ]

        kpis.forEach((item, i) => {

            const x = 40 + i * 290

            ctx.fillStyle = '#1e3a5f'

            ctx.fillRect(x, 145, 260, 135)

            ctx.fillStyle = '#cbd5e1'

            ctx.font = '26px Microsoft JhengHei'

            ctx.fillText(item[0], x + 20, 185)

            ctx.fillStyle = item[2]

            ctx.font = 'bold 43px Microsoft JhengHei'

            ctx.fillText(item[1], x + 20, 245)

        })

        // 05 重繪營運趨勢圖背景

        const bg = ctx.createLinearGradient(

            0, 0, 1200, 720

        )

        bg.addColorStop(0, '#07152f')

        bg.addColorStop(1, '#173e69')

        ctx.fillStyle = bg

        ctx.fillRect(40, 365, 620, 315)

        // 趨勢圖水平格線

        ctx.strokeStyle = '#29496b'

        ctx.lineWidth = 1

        for (let y = 400; y <= 640; y += 60) {

            ctx.beginPath()

            ctx.moveTo(50, y)

            ctx.lineTo(650, y)

            ctx.stroke()

        }

        const baseValues = [95, 130, 110, 180, 155, 220]

        const trendPoints = []

        baseValues.forEach((base, i) => {

            const value = base +

                Math.sin(time * 0.9 + i * 0.8) * 24

            const x = 65 + i * 91

            const y = 640 - value

            ctx.fillStyle = colors[i]

            ctx.fillRect(x, y, 58, value)

            ctx.fillStyle = '#ffffff'

            ctx.font = '20px Microsoft JhengHei'

            ctx.fillText(`${i + 1}月`, x, 675)

            trendPoints.push({

                x: x + 29,

                y: y - 10

            })

        })

        // 06 營收趨勢折線

        ctx.beginPath()

        trendPoints.forEach((point, i) => {

            if (i === 0) {

                ctx.moveTo(point.x, point.y)

            } else {

                ctx.lineTo(point.x, point.y)

            }

        })

        ctx.strokeStyle = '#f8fafc'

        ctx.lineWidth = 4

        ctx.stroke()

        trendPoints.forEach(point => {

            ctx.beginPath()

            ctx.arc(

                point.x,

                point.y,

                6,

                0,

                Math.PI * 2

            )

            ctx.fillStyle = '#ffffff'

            ctx.fill()

        })

        // 07 動態市場占有率

        ctx.fillStyle = bg

        ctx.fillRect(755, 365, 420, 315)

        const change = Math.sin(time * 0.45) * 0.025

        const portions = [

            0.42 + change,

            0.28 - change,

            0.18,

            0.12

        ]

        let angle = -Math.PI / 2

        portions.forEach((portion, i) => {

            const end = angle + portion * Math.PI * 2

            ctx.beginPath()

            ctx.arc(940, 500, 115, angle, end)

            ctx.lineWidth = 48

            ctx.strokeStyle = colors[i]

            ctx.stroke()

            angle = end

        })

        ctx.fillStyle = '#ffffff'

        ctx.font = 'bold 42px Arial'

        ctx.textAlign = 'center'

        ctx.fillText('100%', 940, 515)

        ctx.textAlign = 'left'

        // 08 動態資料狀態

        ctx.fillStyle = '#22c55e'

        ctx.beginPath()

        ctx.arc(800, 660, 7, 0, Math.PI * 2)

        ctx.fill()

        ctx.font = '20px Microsoft JhengHei'

        ctx.fillText('模擬數據更新中', 820, 667)

        texture.needsUpdate = true

    }

    // 09 立體模型動畫

    function updateAnimation() {

        const now = performance.now()

        const time = (now - startTime) / 1000

        // 長條圖升降

        bars.forEach(item => {

            const ratio = 1 +

                Math.sin(time * 1.35 + item.phase) * 0.22

            const height = item.baseHeight * ratio

            item.mesh.scale.y = ratio

            item.mesh.position.y =

                0.28 + height / 2

            item.cap.position.y =

                0.315 + height

        })

        // 環形分析圖水平旋轉

        donutRotation.rotation.y = time * 0.24

        // 操作台按鈕呼吸燈

        buttons.forEach((button, i) => {

            button.material.emissiveIntensity =

                0.35 +

                (Math.sin(time * 2.4 + i * 0.9) + 1) * 0.65

        })

        // 戶外照明

        if (materials?.light) {

            materials.light.emissiveIntensity =

                1.3 + Math.sin(time * 0.8) * 0.25

        }

        // 每750毫秒更新一次Canvas儀表板
        // 避免每個影格重新繪製紋理

        if (now - lastDashboardUpdate >= 750) {

            drawDashboard(time)

            lastDashboardUpdate = now

        }

    }

    // 10 掛載至既有Three.js渲染流程

    const previousBeforeRender = screen.onBeforeRender

    screen.onBeforeRender = function (...args) {

        previousBeforeRender?.apply(this, args)

        updateAnimation()

    }

    drawDashboard(0)

    console.log(

        'SkillIsland V8.6.3 數據視覺化動畫掛載完成'

    )

    return {

        update: updateAnimation

    }

}
