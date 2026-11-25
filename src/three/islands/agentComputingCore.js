import * as THREE from 'three'

// SkillIsland V8.8.4
// 巨型智慧運算核心

export function createAgentComputingCore(island) {

    if (!island?.group) return

    const name = 'AgentComputingCore_V884'

    const existing =
        island.group.getObjectByName(name)

    if (existing) return existing

    const groundY = Number(island.groundY)

    if (!Number.isFinite(groundY)) {

        console.warn('[V8.8.4] 無法取得地面高度')

        return

    }

    const group = new THREE.Group()

    group.name = name

    const colors = {

        dark: 0x102b3e,
        board: 0x00695c,
        teal: 0x0097a7,
        cyan: 0x00e5ff,
        gold: 0xffc107,
        purple: 0xa855f7,
        green: 0x22c55e,
        orange: 0xff7043,
        pink: 0xec4899,
        white: 0xffffff

    }

    const materials = new Map()

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
                        roughness: 0.38,
                        metalness: 0.35

                    })

            )

        }

        return materials.get(key)

    }

    const boxGeometry =
        new THREE.BoxGeometry(1, 1, 1)

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
    // 01 搜尋安全放置位置
    // ==================================

    island.group.updateWorldMatrix(true, true)

    const radius =
        Number(island.config?.radius) || 19

    const safeRadius = radius - 2.0

    const inverse =
        island.group.matrixWorld.clone().invert()

    const blockers = []

    function addBlocker(object) {

        if (!object) return

        const bounds = new THREE.Box3()

            .setFromObject(object)

            .applyMatrix4(inverse)

        if (!bounds.isEmpty()) {

            blockers.push(bounds)

        }

    }

    addBlocker(island.building)

    const exhibition =
        island.group.getObjectByName(

            'AgentRobotExhibition_V881'

        )

    exhibition?.children.forEach(child => {

        if (child.name.startsWith('AgentExhibit_')) {

            addBlocker(child)

        }

    })

    addBlocker(

        island.group.getObjectByName(

            'AgentTaskControlPlatform'

        )

    )

    addBlocker(

        island.group.getObjectByName(

            'AgentWorkflow_V883'

        )

    )

    function canPlace(x, z, scale) {

        const half = 3.45 * scale

        for (const a of [-half, half]) {

            for (const b of [-half, half]) {

                if (

                    Math.hypot(x + a, z + b) >
                    safeRadius

                ) return false

            }

        }

        const bounds = new THREE.Box3(

            new THREE.Vector3(

                x - half,
                groundY,
                z - half

            ),

            new THREE.Vector3(

                x + half,
                groundY + 8 * scale,
                z + half

            )

        )

        return !blockers.some(

            blocker => blocker.intersectsBox(bounds)

        )

    }

    let placement = null

    search:

    for (const scale of [1, 0.85, 0.7, 0.55]) {

        for (const distance of [10, 11, 12, 9, 8]) {

            for (

                let degree = 0;
                degree < 360;
                degree += 10

            ) {

                const angle =
                    THREE.MathUtils.degToRad(degree)

                const x =
                    Math.sin(angle) * distance

                const z =
                    Math.cos(angle) * distance

                if (canPlace(x, z, scale)) {

                    placement = {

                        x,
                        z,
                        scale

                    }

                    break search

                }

            }

        }

    }

    if (!placement) {

        console.warn(

            '[V8.8.4] 智慧運算核心安全空間不足'

        )

        boxGeometry.dispose()

        return

    }

    group.position.set(

        placement.x,
        groundY,
        placement.z

    )

    group.scale.setScalar(placement.scale)

    group.rotation.y = Math.atan2(

        placement.x,
        placement.z

    )

    island.group.add(group)

    // ==================================
    // 02 巨型科技主機板底座
    // ==================================

    box(

        group,
        6.4, 0.32, 6.4,
        0, 0.16, 0,
        colors.dark

    )

    box(

        group,
        6.1, 0.16, 6.1,
        0, 0.4, 0,
        colors.board

    )

    // 外圍金色科技邊框

    for (const side of [-1, 1]) {

        box(

            group,
            6.15, 0.08, 0.08,
            0, 0.52, side * 3,
            colors.gold,
            true

        )

        box(

            group,
            0.08, 0.08, 6.15,
            side * 3, 0.52, 0,
            colors.cyan,
            true

        )

    }

    // ==================================
    // 03 四座高架支撐柱
    // ==================================

    for (const x of [-1.9, 1.9]) {

        for (const z of [-1.9, 1.9]) {

            box(

                group,
                0.65, 1.6, 0.65,
                x, 1.25, z,
                colors.dark

            )

            box(

                group,
                0.24, 1.35, 0.07,
                x, 1.25, z + 0.34,
                colors.cyan,
                true

            )

            box(

                group,
                0.84, 0.16, 0.84,
                x, 2.02, z,
                colors.gold

            )

        }

    }

    // ==================================
    // 04 巨型 AI 晶片主體
    // ==================================

    const chip = new THREE.Group()

    chip.name = 'AgentGiantAIChip'

    chip.position.y = 2.15

    group.add(chip)

    box(

        chip,
        4.2, 0.42, 4.2,
        0, 0.21, 0,
        colors.dark

    )

    box(

        chip,
        3.8, 0.22, 3.8,
        0, 0.53, 0,
        colors.teal

    )

    box(

        chip,
        3.45, 0.08, 3.45,
        0, 0.68, 0,
        colors.dark

    )

    // ==================================
    // 05 晶片48支金色接腳
    // ==================================

    for (let i = 0; i < 12; i++) {

        const offset = -1.76 + i * 0.32

        for (const side of [-1, 1]) {

            box(

                chip,
                0.65, 0.12, 0.14,
                side * 2.28, 0.24, offset,
                colors.gold

            )

            box(

                chip,
                0.14, 0.12, 0.65,
                offset, 0.24, side * 2.28,
                colors.gold

            )

        }

    }

    // ==================================
    // 06 智慧運算矩陣
    // 36個獨立彩色運算單元
    // ==================================

    const matrixColors = [

        colors.cyan,
        colors.green,
        colors.purple,
        colors.orange,
        colors.pink,
        colors.gold

    ]

    const matrixCount = 36

    const matrixCells = new THREE.InstancedMesh(

        new THREE.BoxGeometry(

            0.4, 0.13, 0.4

        ),

        new THREE.MeshBasicMaterial({

            color: 0xffffff,
            toneMapped: false

        }),

        matrixCount

    )

    const dummy = new THREE.Object3D()

    const matrixColor = new THREE.Color()

    const whiteColor = new THREE.Color(0xffffff)

    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 6; col++) {

            const index = row * 6 + col

            dummy.position.set(

                -1.3 + col * 0.52,
                0.8,
                -1.3 + row * 0.52

            )

            dummy.rotation.set(0, 0, 0)

            dummy.scale.set(1, 1, 1)

            dummy.updateMatrix()

            matrixCells.setMatrixAt(

                index,
                dummy.matrix

            )

            matrixColor.setHex(

                matrixColors[(row + col) % 6]

            )

            matrixCells.setColorAt(

                index,
                matrixColor

            )

        }

    }

    matrixCells.instanceMatrix.needsUpdate = true

    matrixCells.instanceColor.needsUpdate = true

    matrixCells.instanceColor.setUsage(

        THREE.DynamicDrawUsage

    )

    chip.add(matrixCells)

    // ==================================
    // 07 中文智慧運算中心標牌
    // ==================================

    const canvas =
        document.createElement('canvas')

    canvas.width = 1024

    canvas.height = 320

    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#102b3e'

    ctx.fillRect(0, 0, 1024, 320)

    ctx.strokeStyle = '#00e5ff'

    ctx.lineWidth = 12

    ctx.strokeRect(6, 6, 1012, 308)

    ctx.textAlign = 'center'

    ctx.fillStyle = '#ffffff'

    ctx.font = 'bold 100px Microsoft JhengHei'

    ctx.fillText(

        '智慧運算中心',
        512, 122

    )

    ctx.fillStyle = '#67e8f9'

    ctx.font = 'bold 45px Arial'

    ctx.fillText(

        'AI COMPUTING CORE',
        512, 202

    )

    ctx.fillStyle = '#fbbf24'

    ctx.font = '30px Microsoft JhengHei'

    ctx.fillText(

        '神經網路・平行運算・智慧推論',
        512, 273

    )

    const texture =
        new THREE.CanvasTexture(canvas)

    texture.colorSpace =
        THREE.SRGBColorSpace

    box(

        group,
        4.9, 1.5, 0.16,
        0, 1.3, 2.8,
        colors.dark

    )

    const sign = new THREE.Mesh(

        new THREE.PlaneGeometry(

            4.75, 1.45

        ),

        new THREE.MeshBasicMaterial({

            map: texture,
            toneMapped: false

        })

    )

    sign.position.set(

        0, 1.3, 2.89

    )

    group.add(sign)

    // ==================================
    // 08 懸浮智慧運算核心
    // ==================================

    const coreGroup = new THREE.Group()

    coreGroup.name = 'FloatingAIProcessor'

    coreGroup.position.y = 5.15

    group.add(coreGroup)

    const core = new THREE.Mesh(

        new THREE.IcosahedronGeometry(

            0.85, 1

        ),

        new THREE.MeshStandardMaterial({

            color: colors.cyan,
            emissive: colors.cyan,
            emissiveIntensity: 0.85,
            metalness: 0.45,
            roughness: 0.2

        })

    )

    coreGroup.add(core)

    const orbit1 = ring(

        coreGroup,
        1.3, 0.095,
        colors.cyan

    )

    const orbit2 = ring(

        coreGroup,
        1.6, 0.075,
        colors.gold

    )

    const orbit3 = ring(

        coreGroup,
        1.85, 0.055,
        colors.purple

    )

    orbit1.rotation.x = Math.PI / 2

    orbit2.rotation.y = Math.PI / 3

    orbit3.rotation.x = Math.PI / 4

    // ==================================
    // 09 神經網路24個運算節點
    // ==================================

    const neuralGroup = new THREE.Group()

    coreGroup.add(neuralGroup)

    const neuralNodes = []

    const neuralGeometry =
        new THREE.SphereGeometry(

            0.14, 10, 8

        )

    const goldenAngle =
        Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < 24; i++) {

        const y = 1 - (i + 0.5) / 24 * 2

        const r = Math.sqrt(1 - y * y)

        const theta = i * goldenAngle

        const node = new THREE.Mesh(

            neuralGeometry,

            material(

                matrixColors[i % 6],
                true

            )

        )

        node.position.set(

            Math.cos(theta) * r * 1.5,
            y * 1.5,
            Math.sin(theta) * r * 1.5

        )

        neuralGroup.add(node)

        neuralNodes.push(node)

    }

    // 神經網路節點連線

    const neuralPositions = []

    for (let i = 0; i < neuralNodes.length; i++) {

        const a = neuralNodes[i].position

        const b = neuralNodes[

            (i + 5) % neuralNodes.length

        ].position

        neuralPositions.push(

            a.x, a.y, a.z,
            b.x, b.y, b.z

        )

    }

    const neuralLines = new THREE.LineSegments(

        new THREE.BufferGeometry()

            .setAttribute(

                'position',

                new THREE.Float32BufferAttribute(

                    neuralPositions, 3

                )

            ),

        new THREE.LineBasicMaterial({

            color: colors.cyan,
            transparent: true,
            opacity: 0.5

        })

    )

    neuralGroup.add(neuralLines)

    // ==================================
    // 10 垂直智慧運算光束
    // ==================================

    const beam = new THREE.Mesh(

        new THREE.CylinderGeometry(

            1.1, 1.45, 1.9,
            24, 1, true

        ),

        new THREE.MeshBasicMaterial({

            color: colors.cyan,
            transparent: true,
            opacity: 0.13,
            depthWrite: false,
            side: THREE.DoubleSide

        })

    )

    beam.position.y = 3.9

    group.add(beam)

    // ==================================
    // 11 主機板電路與資料傳輸
    // ==================================

    const routes = []

    for (let i = 0; i < 12; i++) {

        const angle =
            i / 12 * Math.PI * 2

        const dx = Math.cos(angle)

        const dz = Math.sin(angle)

        const a = new THREE.Vector3(

            dx * 0.9,
            0.55,
            dz * 0.9

        )

        const b = new THREE.Vector3(

            dx * 2.75,
            0.55,
            dz * 2.75

        )

        const curve = new THREE.LineCurve3(

            a, b

        )

        const track = new THREE.Mesh(

            new THREE.TubeGeometry(

                curve,
                1,
                0.055,
                6,
                false

            ),

            material(

                matrixColors[i % 6],
                true

            )

        )

        group.add(track)

        routes.push(curve)

    }

    const packets = []

    const packetGeometry =
        new THREE.SphereGeometry(

            0.09, 8, 6

        )

    routes.forEach((curve, i) => {

        for (let j = 0; j < 2; j++) {

            const packet = new THREE.Mesh(

                packetGeometry,

                material(colors.white, true)

            )

            group.add(packet)

            packets.push({

                mesh: packet,
                curve,
                phase: j / 2 + i * 0.07

            })

        }

    })

    // ==================================
    // 12 動態智慧運算效果
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    let lastMatrixUpdate = -1000

    function update() {

        const now = performance.now()

        const time = (now - start) / 1000

        // 智慧核心懸浮旋轉

        coreGroup.position.y =

            5.15 + Math.sin(time * 1.4) * 0.2

        core.rotation.x = time * 0.5

        core.rotation.y = time * 0.8

        core.material.emissiveIntensity =

            0.8 + Math.sin(time * 2) * 0.3

        orbit1.rotation.y = time * 0.8

        orbit2.rotation.x = -time * 0.6

        orbit3.rotation.z = time * 0.45

        // 神經網路旋轉

        neuralGroup.rotation.y = time * 0.35

        neuralGroup.rotation.x =

            Math.sin(time * 0.6) * 0.2

        neuralNodes.forEach((node, i) => {

            const wave =

                (Math.sin(time * 3 + i * 0.6) + 1)
                / 2

            node.scale.setScalar(

                0.8 + wave * 0.7

            )

        })

        // 運算矩陣掃描動畫
        // 每100毫秒更新一次色彩

        if (now - lastMatrixUpdate >= 100) {

            for (let i = 0; i < matrixCount; i++) {

                const wave =

                    (Math.sin(time * 4 - i * 0.4) + 1)
                    / 2

                matrixColor.setHex(

                    matrixColors[i % 6]

                )

                matrixColor.lerp(

                    whiteColor,
                    wave * 0.7

                )

                matrixCells.setColorAt(

                    i,
                    matrixColor

                )

            }

            matrixCells.instanceColor.needsUpdate = true

            lastMatrixUpdate = now

        }

        // 主機板資料光點傳輸

        packets.forEach(packet => {

            const u =

                ((time * 0.65 + packet.phase) % 1 + 1)
                % 1

            packet.curve.getPoint(

                u,
                packet.mesh.position

            )

        })

        beam.material.opacity =

            0.13 + Math.sin(time * 2) * 0.045

    }

    function beforeRender(renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    core.onBeforeRender = beforeRender

    matrixCells.onBeforeRender = beforeRender

    update()

    console.log(

        'SkillIsland V8.8.4 巨型智慧運算核心建立完成',

        {

            matrixCells: 36,

            neuralNodes: 24,

            chipPins: 48,

            packets: packets.length,

            placement

        }

    )

    return group

}
