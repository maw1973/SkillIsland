import { createHolographicEarth } from './holographicEarth.js'
import { createBusinessIntelligenceAnimation } from './businessIntelligenceAnimation.js'
import * as THREE from 'three'

// SkillIsland V8.6.2
// 戶外商業智慧分析區

export function createOutdoorBusinessIntelligence(island) {

    if (!island || !island.group) return

    const group = new THREE.Group()

    group.name = 'OutdoorBusinessIntelligence_V862'

    const old = island.group.getObjectByName(group.name)

    if (old) return old

    island.group.add(group)

    group.position.set(0, island.groundY + 0.5, 11.5)

    const materials = {

        floor: new THREE.MeshStandardMaterial({
            color: 0xdbeafe,
            roughness: 0.85
        }),

        edge: new THREE.MeshStandardMaterial({
            color: 0x2563eb
        }),

        dark: new THREE.MeshStandardMaterial({
            color: 0x172554
        }),

        white: new THREE.MeshStandardMaterial({
            color: 0xffffff
        }),

        glass: new THREE.MeshStandardMaterial({
            color: 0x67e8f9,
            transparent: true,
            opacity: 0.65,
            metalness: 0.2
        }),

        pole: new THREE.MeshStandardMaterial({
            color: 0x475569,
            metalness: 0.5
        }),

        light: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x93c5fd,
            emissiveIntensity: 1.5
        })

    }

    function box(w, h, d, x, y, z, material, parent = group) {

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

    function cylinder(rt, rb, h, x, y, z, material, parent = group) {

        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(rt, rb, h, 32),
            material
        )

        mesh.position.set(x, y, z)

        mesh.castShadow = true
        mesh.receiveShadow = true

        parent.add(mesh)

        return mesh

    }

    // 01 戶外展示區地板

    box(12.4, 0.24, 7.4, 0, 0, 0, materials.edge)

    box(12, 0.2, 7, 0, 0.2, 0, materials.floor)

    for (let x = -5; x <= 5; x += 1) {

        box(
            0.025, 0.015, 6.8,
            x, 0.31, 0,
            materials.white
        )

    }

    for (let z = -3; z <= 3; z += 1) {

        box(
            11.8, 0.015, 0.025,
            0, 0.31, z,
            materials.white
        )

    }

    // 02 戶外 BI 儀表板

    const canvas = document.createElement('canvas')

    canvas.width = 1200
    canvas.height = 720

    const ctx = canvas.getContext('2d')

    const bg = ctx.createLinearGradient(0, 0, 1200, 720)

    bg.addColorStop(0, '#07152f')
    bg.addColorStop(1, '#173e69')

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 1200, 720)

    ctx.fillStyle = '#ffffff'

    ctx.font = 'bold 48px Microsoft JhengHei'

    ctx.fillText('商業智慧分析中心', 45, 70)

    ctx.font = '23px Arial'

    ctx.fillStyle = '#93c5fd'

    ctx.fillText(
        'BUSINESS INTELLIGENCE DASHBOARD',
        48, 110
    )

    const kpis = [

        ['營收表現', '128.6萬', '#22c55e'],

        ['成長率', '+18.5%', '#38bdf8'],

        ['達成率', '96.8%', '#f59e0b'],

        ['客戶數', '2,560', '#c084fc']

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

    // 03 儀表板內的長條分析圖

    ctx.fillStyle = '#ffffff'

    ctx.font = 'bold 28px Microsoft JhengHei'

    ctx.fillText('每月營運趨勢', 50, 340)

    const values = [95, 130, 110, 180, 155, 220]

    const colors = [

        '#38bdf8',
        '#22c55e',
        '#f59e0b',
        '#a78bfa',
        '#f472b6',
        '#2dd4bf'

    ]

    for (let i = 0; i < values.length; i++) {

        const x = 65 + i * 91

        ctx.fillStyle = colors[i]

        ctx.fillRect(
            x,
            640 - values[i],
            58,
            values[i]
        )

        ctx.fillStyle = '#ffffff'

        ctx.font = '20px Microsoft JhengHei'

        ctx.fillText(`${i + 1}月`, x, 675)

    }

    // 04 儀表板圓環分析圖

    ctx.font = 'bold 28px Microsoft JhengHei'

    ctx.fillText('市場占有率', 780, 340)

    let start = -Math.PI / 2

    const portions = [0.42, 0.28, 0.18, 0.12]

    portions.forEach((value, i) => {

        const end = start + value * Math.PI * 2

        ctx.beginPath()

        ctx.arc(940, 500, 115, start, end)

        ctx.strokeStyle = colors[i]

        ctx.lineWidth = 48

        ctx.stroke()

        start = end

    })

    ctx.fillStyle = '#ffffff'

    ctx.font = 'bold 42px Arial'

    ctx.fillText('100%', 882, 515)

    ctx.font = '18px Microsoft JhengHei'

    ctx.fillStyle = '#94a3b8'

    ctx.fillText('展示用模擬數據', 940, 695)

    const texture = new THREE.CanvasTexture(canvas)

    texture.colorSpace = THREE.SRGBColorSpace

    box(8.8, 5.3, 0.32, 0, 3.5, -3.1, materials.dark)

    const screen = new THREE.Mesh(

        new THREE.PlaneGeometry(8.4, 5.04),

        new THREE.MeshBasicMaterial({
            map: texture
        })

    )

    screen.position.set(0, 3.5, -2.925)

    group.add(screen)

    box(0.35, 1.2, 0.35, -3.5, 0.9, -3.1, materials.pole)

    box(0.35, 1.2, 0.35, 3.5, 0.9, -3.1, materials.pole)

    // 05 立體營收長條圖

    const barGroup = new THREE.Group()

    barGroup.position.set(-3.6, 0.32, 0.8)

    group.add(barGroup)

    box(
        4.3, 0.28, 2.3,
        0, 0.14, 0,
        materials.dark,
        barGroup
    )

    const heights = [0.65, 1.15, 1.65, 1.35, 2.35]

    heights.forEach((height, i) => {

        const material = new THREE.MeshStandardMaterial({

            color: colors[i],

            roughness: 0.35,

            metalness: 0.12

        })

        const x = -1.55 + i * 0.78

        box(
            0.58, height, 0.85,
            x, height / 2 + 0.28, 0,
            material,
            barGroup
        )

        box(
            0.62, 0.07, 0.9,
            x, height + 0.315, 0,
            materials.white,
            barGroup
        )

    })

    // 06 立體環形比例圖

    const donutGroup = new THREE.Group()

    donutGroup.position.set(3.65, 0.32, 0.9)

    group.add(donutGroup)

    cylinder(
        1.65, 1.65, 0.3,
        0, 0.15, 0,
        materials.dark,
        donutGroup
    )

    let angle = 0

    portions.forEach((portion, i) => {

        const arc = portion * Math.PI * 2 - 0.035

        const shape = new THREE.Shape()

        shape.absarc(
            0, 0, 1.35,
            angle, angle + arc, false
        )

        shape.lineTo(
            Math.cos(angle + arc) * 0.65,
            Math.sin(angle + arc) * 0.65
        )

        shape.absarc(
            0, 0, 0.65,
            angle + arc, angle, true
        )

        shape.closePath()

        const geometry = new THREE.ExtrudeGeometry(
            shape,
            {
                depth: 0.5,
                bevelEnabled: false,
                curveSegments: 32
            }
        )

        const mesh = new THREE.Mesh(

            geometry,

            new THREE.MeshStandardMaterial({
                color: colors[i],
                roughness: 0.3
            })

        )

        mesh.rotation.x = -Math.PI / 2

        mesh.position.y = 0.31

        mesh.castShadow = true

        donutGroup.add(mesh)

        angle += portion * Math.PI * 2

    })

    // 07 商業智慧操作台

    const desk = new THREE.Group()

    desk.position.set(0, 0.32, 2.3)

    group.add(desk)

    box(2.4, 0.9, 0.85, 0, 0.45, 0, materials.dark, desk)

    box(2.65, 0.15, 1, 0, 0.98, 0, materials.white, desk)

    const terminal = box(
        1.9, 0.65, 0.12,
        0, 1.42, -0.2,
        materials.glass,
        desk
    )

    terminal.rotation.x = -0.3

    // 操作台按鈕

    for (let i = 0; i < 5; i++) {

        box(
            0.2, 0.06, 0.18,
            -0.7 + i * 0.35,
            1.085,
            0.25,
            new THREE.MeshStandardMaterial({
                color: colors[i]
            }),
            desk
        )

    }

    // 08 戶外照明

    function createLamp(x, z) {

        cylinder(
            0.18, 0.24, 0.2,
            x, 0.42, z,
            materials.dark
        )

        cylinder(
            0.055, 0.075, 2.8,
            x, 1.92, z,
            materials.pole
        )

        box(
            0.65, 0.14, 0.5,
            x, 3.35, z,
            materials.light
        )

    }

    createLamp(-5.5, 2.8)

    createLamp(5.5, 2.8)

    createLamp(-5.5, -2.8)

    createLamp(5.5, -2.8)

    console.log(
        'SkillIsland V8.6.2 戶外商業智慧分析區建立完成'
    )


    // V8.6.3 戶外商業智慧動畫

    createBusinessIntelligenceAnimation({

        group,

        barGroup,

        donutGroup,

        desk,

        screen,

        canvas,

        texture,

        materials

    })



    // V8.7.0 巨型全息地球

    createHolographicEarth(island)


    return group

}




