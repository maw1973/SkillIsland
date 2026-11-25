import * as THREE from 'three'

// SkillIsland V8.7.1
// 巨型彩色立體數據長條圖

export function createGiantDataChart(island) {

    if (!island?.group) return

    const name = 'GiantDataChart_V871'

    const existing =
        island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    island.group.add(group)

    // 島嶼右側展示區
    // 使用實際地面高度

    group.position.set(
        11.5,
        island.groundY + 0.5,
        0
    )

    group.rotation.y = Math.PI / 2

    const colors = [

        0x2196f3,
        0x22c55e,
        0xff9800,
        0xa855f7,
        0xff4081,
        0x00d9d9

    ]

    const heights = [

        3.2,
        4.5,
        5.4,
        6.2,
        7.5,
        9.0

    ]

    const dark = new THREE.MeshStandardMaterial({

        color: 0x142b50,
        metalness: 0.35,
        roughness: 0.45

    })

    const cyan = new THREE.MeshBasicMaterial({

        color: 0x22d3ee

    })

    const gold = new THREE.MeshBasicMaterial({

        color: 0xffd740

    })

    const white = new THREE.MeshBasicMaterial({

        color: 0xffffff

    })

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
    // 01 巨型數據展示平台
    // ==================================

    box(

        11.5, 0.42, 4.6,
        0, 0.21, 0,
        dark

    )

    box(

        11.3, 0.12, 4.4,
        0, 0.48, 0,
        new THREE.MeshStandardMaterial({
            color: 0x24528a
        })

    )

    // 底座科技發光邊框

    for (const side of [-1, 1]) {

        box(

            11.4, 0.09, 0.09,
            0, 0.55, side * 2.2,
            cyan

        )

        box(

            0.09, 0.09, 4.4,
            side * 5.65, 0.55, 0,
            cyan

        )

    }

    // ==================================
    // 02 Canvas 中文數字標籤
    // ==================================

    function createLabel(text, color, width, height) {

        const canvas = document.createElement('canvas')

        canvas.width = 512

        canvas.height = 160

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#10233f'

        ctx.fillRect(0, 0, 512, 160)

        ctx.strokeStyle = color

        ctx.lineWidth = 10

        ctx.strokeRect(6, 6, 500, 148)

        ctx.textAlign = 'center'

        ctx.textBaseline = 'middle'

        ctx.font = 'bold 72px Microsoft JhengHei'

        ctx.fillStyle = color

        ctx.fillText(text, 256, 80)

        const texture = new THREE.CanvasTexture(canvas)

        texture.colorSpace = THREE.SRGBColorSpace

        const sprite = new THREE.Sprite(

            new THREE.SpriteMaterial({

                map: texture,
                transparent: true

            })

        )

        sprite.scale.set(width, height, 1)

        sprite.userData.canvas = canvas

        sprite.userData.texture = texture

        sprite.userData.color = color

        sprite.userData.lastText = text

        return sprite
    }

    function updateLabel(sprite, text) {

        if (sprite.userData.lastText === text) return

        const canvas = sprite.userData.canvas

        const ctx = canvas.getContext('2d')

        const color = sprite.userData.color

        ctx.fillStyle = '#10233f'

        ctx.fillRect(0, 0, 512, 160)

        ctx.strokeStyle = color

        ctx.lineWidth = 10

        ctx.strokeRect(6, 6, 500, 148)

        ctx.textAlign = 'center'

        ctx.textBaseline = 'middle'

        ctx.font = 'bold 72px Microsoft JhengHei'

        ctx.fillStyle = color

        ctx.fillText(text, 256, 80)

        sprite.userData.texture.needsUpdate = true

        sprite.userData.lastText = text

    }

    // ==================================
    // 03 六座巨型彩色數據柱
    // ==================================

    const bars = []

    for (let i = 0; i < 6; i++) {

        const x = -4.5 + i * 1.8

        const h = heights[i]

        const color = colors[i]

        const material =

            new THREE.MeshStandardMaterial({

                color,

                emissive: color,

                emissiveIntensity: 0.2,

                metalness: 0.15,

                roughness: 0.35

            })

        // 數據柱底座

        box(

            1.55, 0.22, 2.6,
            x, 0.66, 0,
            dark

        )

        // 主柱體

        const column = box(

            1.25, h, 2.0,
            x, 0.77 + h / 2, 0,
            material

        )

        // 柱體頂蓋

        const cap = box(

            1.4, 0.15, 2.15,
            x, 0.845 + h, 0,
            white

        )

        const glowMaterial =

            new THREE.MeshBasicMaterial({

                color

            })

        // 正面垂直發光條

        const glowStrip = box(

            0.07, h, 0.045,
            x - 0.46,
            0.77 + h / 2,
            1.025,
            glowMaterial

        )

        // 頂部數字

        const label = createLabel(

            `${Math.round(h * 12)}`,

            '#' + color.toString(16).padStart(6, '0'),

            1.65,
            0.52

        )

        label.position.set(

            x,
            h + 1.42,
            0

        )

        group.add(label)

        // 底部月份

        const month = createLabel(

            `${i + 1}月`,

            '#ffffff',

            1.4,
            0.44

        )

        month.position.set(

            x,
            0.95,
            2.32

        )

        group.add(month)

        bars.push({

            x,
            h,
            column,
            cap,
            glowStrip,
            label,
            material,
            phase: i * 0.8

        })

    }

    // ==================================
    // 04 巨型營收趨勢折線
    // ==================================

    const linePositions = new Float32Array(6 * 3)

    const lineGeometry = new THREE.BufferGeometry()

    lineGeometry.setAttribute(

        'position',

        new THREE.BufferAttribute(
            linePositions,
            3
        ).setUsage(THREE.DynamicDrawUsage)

    )

    const trendLine = new THREE.Line(

        lineGeometry,

        new THREE.LineBasicMaterial({

            color: 0xffd740

        })

    )

    trendLine.frustumCulled = false

    group.add(trendLine)

    // 金色立體連接線

    const trendSegments = []

    const segmentGeometry = new THREE.CylinderGeometry(

        0.065, 0.065, 1, 8

    )

    for (let i = 0; i < 5; i++) {

        const segment = new THREE.Mesh(

            segmentGeometry,

            gold

        )

        group.add(segment)

        trendSegments.push(segment)

    }

    // 折線節點

    const trendNodes = []

    const nodeGeometry =

        new THREE.SphereGeometry(

            0.17, 12, 10

        )

    for (let i = 0; i < 6; i++) {

        const node = new THREE.Mesh(

            nodeGeometry,
            gold

        )

        group.add(node)

        trendNodes.push(node)

    }

    // ==================================
    // 05 大型中文數據看板
    // ==================================

    const title = createLabel(

        '營運成長分析',

        '#67e8f9',

        5.0,
        1.0

    )

    title.position.set(

        0,
        11.7,
        -0.5

    )

    group.add(title)

    const subtitle = createLabel(

        '模擬展示數據',

        '#ffffff',

        3.0,
        0.55

    )

    subtitle.position.set(

        0,
        10.8,
        -0.5

    )

    group.add(subtitle)

    // ==================================
    // 06 展示平台循環光點
    // ==================================

    const lights = []

    const lightGeometry =

        new THREE.SphereGeometry(

            0.085, 8, 6

        )

    for (let i = 0; i < 24; i++) {

        const light = new THREE.Mesh(

            lightGeometry,

            new THREE.MeshBasicMaterial({

                color: 0x22d3ee

            })

        )

        light.position.set(

            -5.35 + i * 0.465,
            0.62,
            2.12

        )

        group.add(light)

        lights.push(light)

    }

    // ==================================
    // 07 動態數據升降
    // ==================================

    const started = performance.now()

    let lastFrame = -1

    let lastLabelUpdate = -1000

    const up = new THREE.Vector3(0, 1, 0)

    const direction = new THREE.Vector3()

    const pointA = new THREE.Vector3()

    const pointB = new THREE.Vector3()

    const lightBlue = new THREE.Color(0x22d3ee)

    const lightGold = new THREE.Color(0xffd740)

    function update() {

        const now = performance.now()

        const t = (now - started) / 1000

        const refreshLabels =

            now - lastLabelUpdate >= 500

        bars.forEach((bar, i) => {

            const ratio = 1 +

                Math.sin(t * 1.45 + bar.phase) * 0.2

            const height = bar.h * ratio

            bar.column.scale.y = ratio

            bar.column.position.y =

                0.77 + height / 2

            bar.cap.position.y =

                0.845 + height

            bar.glowStrip.scale.y = ratio

            bar.glowStrip.position.y =

                0.77 + height / 2

            bar.label.position.y =

                height + 1.42

            bar.material.emissiveIntensity =

                0.22 +

                (Math.sin(t * 2 + i) + 1) * 0.2

            const y = height + 0.98

            linePositions[i * 3] = bar.x

            linePositions[i * 3 + 1] = y

            linePositions[i * 3 + 2] = 1.22

            trendNodes[i].position.set(

                bar.x, y, 1.22

            )

            if (refreshLabels) {

                updateLabel(

                    bar.label,

                    `${Math.round(height * 12)}`

                )

            }

        })

        lineGeometry.attributes.position.needsUpdate = true

        // 更新立體金色折線

        trendSegments.forEach((segment, i) => {

            pointA.copy(trendNodes[i].position)

            pointB.copy(trendNodes[i + 1].position)

            direction.subVectors(pointB, pointA)

            const length = direction.length()

            segment.position

                .copy(pointA)

                .add(pointB)

                .multiplyScalar(0.5)

            segment.scale.y = length

            if (length > 0.0001) {

                segment.quaternion.setFromUnitVectors(

                    up,

                    direction.normalize()

                )

            }

        })

        // 底部循環燈光

        lights.forEach((light, i) => {

            const wave =

                (Math.sin(t * 4 - i * 0.45) + 1) / 2

            light.material.color

                .copy(lightBlue)

                .lerp(lightGold, wave)

            light.scale.setScalar(

                0.8 + wave * 0.7

            )

        })

        if (refreshLabels) {

            lastLabelUpdate = now

        }

    }

    // 沿用既有渲染迴圈

    bars[0].column.onBeforeRender = function (renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    update()

    console.log(

        'SkillIsland V8.7.1 巨型彩色立體數據圖建立完成'

    )

    return group

}
