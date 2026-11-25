import * as THREE from 'three'

// SkillIsland V8.8.3
// 立體自動化任務工作流程

export function createAgentWorkflow(island) {

    if (!island?.group) return

    const name = 'AgentWorkflow_V883'

    const existing =
        island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    const groundY = Number(island.groundY)

    if (!Number.isFinite(groundY)) {

        console.warn('[V8.8.3] 無法取得地面高度')

        return

    }

    const colors = {

        dark: 0x163447,
        steel: 0x607d8b,
        white: 0xf1f5f9,
        cyan: 0x00e5ff,
        gold: 0xffc107,
        green: 0x22c55e

    }

    const configs = [

        {
            title: '任務輸入',
            english: 'INPUT',
            color: 0x2196f3
        },

        {
            title: '智慧解析',
            english: 'ANALYZE',
            color: 0x9333ea
        },

        {
            title: '代理分派',
            english: 'DISPATCH',
            color: 0xff9800
        },

        {
            title: '自動執行',
            english: 'EXECUTE',
            color: 0x00bfa5
        },

        {
            title: '成果輸出',
            english: 'OUTPUT',
            color: 0xffc107
        }

    ]

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
                        roughness: 0.48,
                        metalness: 0.2

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

    function cylinder(

        parent,
        rt, rb, h,
        x, y, z,
        color,
        glow = false

    ) {

        const mesh = new THREE.Mesh(

            new THREE.CylinderGeometry(
                rt, rb, h, 16
            ),

            material(color, glow)

        )

        mesh.position.set(x, y, z)

        mesh.castShadow = !glow

        parent.add(mesh)

        return mesh

    }

    // ==================================
    // 01 整體科技產線底座
    // ==================================

    box(

        group,
        13.6, 0.3, 4.0,
        0, 0.15, 0,
        colors.dark

    )

    box(

        group,
        13.3, 0.12, 3.7,
        0, 0.36, 0,
        colors.steel

    )

    for (const side of [-1, 1]) {

        box(

            group,
            13.4, 0.075, 0.1,
            0, 0.44, side * 1.93,
            colors.cyan,
            true

        )

    }

    // ==================================
    // 02 任務輸送軌道
    // ==================================

    box(

        group,
        12.8, 0.35, 1.5,
        0, 0.68, 0,
        colors.dark

    )

    box(

        group,
        12.7, 0.08, 1.16,
        0, 0.895, 0,
        0x263746

    )

    for (const side of [-1, 1]) {

        box(

            group,
            12.8, 0.14, 0.12,
            0, 0.98, side * 0.72,
            colors.gold,
            true

        )

    }

    // 共用輸送滾輪

    const rollerGeometry =
        new THREE.CylinderGeometry(
            0.075, 0.075, 1.12, 8
        )

    const rollers = new THREE.InstancedMesh(

        rollerGeometry,
        material(0x90a4ae),
        44

    )

    const dummy = new THREE.Object3D()

    for (let i = 0; i < 44; i++) {

        dummy.position.set(

            -6.25 + i * 12.5 / 43,
            0.95,
            0

        )

        dummy.rotation.set(
            Math.PI / 2, 0, 0
        )

        dummy.updateMatrix()

        rollers.setMatrixAt(i, dummy.matrix)

    }

    rollers.instanceMatrix.needsUpdate = true

    group.add(rollers)

    // ==================================
    // 03 中文任務工作站標牌
    // ==================================

    function createLabel(parent, config, index) {

        const canvas =
            document.createElement('canvas')

        canvas.width = 640
        canvas.height = 320

        const ctx = canvas.getContext('2d')

        const hex = '#' +
            config.color.toString(16).padStart(6, '0')

        ctx.fillStyle = '#102b3e'

        ctx.fillRect(0, 0, 640, 320)

        ctx.strokeStyle = hex

        ctx.lineWidth = 12

        ctx.strokeRect(6, 6, 628, 308)

        ctx.textAlign = 'center'

        ctx.fillStyle = hex

        ctx.font = 'bold 42px Arial'

        ctx.fillText(
            `STEP 0${index + 1}`,
            320, 65
        )

        ctx.fillStyle = '#ffffff'

        ctx.font =
            'bold 88px Microsoft JhengHei'

        ctx.fillText(config.title, 320, 175)

        ctx.font = 'bold 40px Arial'

        ctx.fillStyle = hex

        ctx.fillText(config.english, 320, 260)

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        box(

            parent,
            2.3, 1.15, 0.16,
            0, 3.4, 0.4,
            colors.dark

        )

        const sign = new THREE.Mesh(

            new THREE.PlaneGeometry(2.2, 1.1),

            new THREE.MeshBasicMaterial({

                map: texture,
                toneMapped: false

            })

        )

        sign.position.set(0, 3.4, 0.485)

        parent.add(sign)

    }

    // ==================================
    // 04 五座智慧處理工作站
    // ==================================

    const stations = []

    configs.forEach((config, index) => {

        const station = new THREE.Group()

        station.name =
            `AgentWorkflowStation_${index + 1}`

        station.position.x =
            -5 + index * 2.5

        group.add(station)

        // 左右機械支柱

        for (const side of [-1, 1]) {

            box(

                station,
                0.3, 2.45, 0.32,
                0, 1.65, side * 1.12,
                config.color

            )

            box(

                station,
                0.13, 1.8, 0.05,
                0, 1.7, side * 1.3,
                colors.cyan,
                true

            )

        }

        // 頂部處理機箱

        box(

            station,
            1.9, 0.48, 2.55,
            0, 2.95, 0,
            config.color

        )

        box(

            station,
            2.0, 0.09, 2.65,
            0, 3.23, 0,
            colors.white

        )

        // 任務完成指示燈

        const statusMaterial =
            new THREE.MeshBasicMaterial({

                color: 0x64748b,
                toneMapped: false

            })

        const statusLight = new THREE.Mesh(

            new THREE.SphereGeometry(
                0.17, 12, 8
            ),

            statusMaterial

        )

        statusLight.position.set(
            0.72, 3.96, 0
        )

        station.add(statusLight)

        // 工作站標籤

        createLabel(station, config, index)

        // ==================================
        // 05 動態智慧機械處理頭
        // ==================================

        const processor = new THREE.Group()

        processor.position.set(
            0, 2.72, 0
        )

        station.add(processor)

        cylinder(

            processor,
            0.13, 0.13, 0.7,
            0, -0.35, 0,
            colors.steel

        )

        box(

            processor,
            0.72, 0.32, 0.72,
            0, -0.82, 0,
            config.color

        )

        box(

            processor,
            0.62, 0.08, 0.62,
            0, -1.02, 0,
            colors.cyan,
            true

        )

        // 半透明掃描光束

        const beamMaterial =
            new THREE.MeshBasicMaterial({

                color: config.color,
                transparent: true,
                opacity: 0.12,
                depthWrite: false

            })

        const beam = new THREE.Mesh(

            new THREE.CylinderGeometry(

                0.32, 0.48, 0.65,
                16, 1, true

            ),

            beamMaterial

        )

        beam.position.y = -1.35

        processor.add(beam)

        stations.push({

            station,
            processor,
            statusLight,
            statusMaterial,
            beamMaterial,
            config

        })

    })

    // ==================================
    // 06 動態任務資料方塊
    // ==================================

    const packets = []

    const packetGeometry =
        new THREE.BoxGeometry(
            0.55, 0.55, 0.55
        )

    for (let i = 0; i < 8; i++) {

        const packetMaterial =
            new THREE.MeshStandardMaterial({

                color: colors.cyan,
                emissive: colors.cyan,
                emissiveIntensity: 0.35,
                roughness: 0.3,
                metalness: 0.2

            })

        const packet = new THREE.Mesh(

            packetGeometry,
            packetMaterial

        )

        packet.position.set(
            0, 1.3, 0
        )

        group.add(packet)

        const edges = new THREE.LineSegments(

            new THREE.EdgesGeometry(
                packetGeometry
            ),

            new THREE.LineBasicMaterial({
                color: 0xffffff
            })

        )

        packet.add(edges)

        packets.push({

            mesh: packet,
            material: packetMaterial,
            phase: i / 8

        })

    }

    // ==================================
    // 07 成果完成展示裝置
    // ==================================

    const output = new THREE.Group()

    output.position.set(5.9, 0.43, 1.3)

    group.add(output)

    cylinder(

        output,
        0.42, 0.53, 0.23,
        0, 0.115, 0,
        colors.dark

    )

    const trophy = new THREE.Mesh(

        new THREE.OctahedronGeometry(
            0.46
        ),

        material(colors.gold, true)

    )

    trophy.position.y = 0.82

    output.add(trophy)

    const outputRing = new THREE.Mesh(

        new THREE.TorusGeometry(
            0.6, 0.055, 8, 32
        ),

        material(colors.green, true)

    )

    outputRing.rotation.x = Math.PI / 2

    outputRing.position.y = 0.4

    output.add(outputRing)

    // ==================================
    // 08 自動搜尋安全放置區域
    // ==================================

    island.group.updateWorldMatrix(true, true)

    const radius = Number(
        island.config?.radius
    ) || 19

    const safeRadius = radius - 1.8

    const blockers = []

    const inverse =
        island.group.matrixWorld.clone().invert()

    const occupiedNames = [

        'Building_agent',

        'AgentRobotExhibition_V881',

        'AgentCollaborationCenter_V882'

    ]

    occupiedNames.forEach(objectName => {

        const object =
            island.group.getObjectByName(objectName)

        if (!object) return

        let objects = [object]

        if (
            objectName ===
            'AgentRobotExhibition_V881'
        ) {

            objects = object.children.filter(
                child => child.name.startsWith(
                    'AgentExhibit_'
                )
            )

        }

        if (
            objectName ===
            'AgentCollaborationCenter_V882'
        ) {

            const platform =
                object.getObjectByName(
                    'AgentTaskControlPlatform'
                )

            objects = platform ? [platform] : []

        }

        objects.forEach(item => {

            const bounds =
                new THREE.Box3()
                    .setFromObject(item)
                    .applyMatrix4(inverse)

            if (!bounds.isEmpty()) {

                blockers.push(bounds)

            }

        })

    })

    const footprint = new THREE.Box3(

        new THREE.Vector3(-7, 0, -2.25),

        new THREE.Vector3(7, 4.4, 2.25)

    )

    const matrix = new THREE.Matrix4()

    const scaleVector = new THREE.Vector3()

    const quaternion = new THREE.Quaternion()

    const yAxis = new THREE.Vector3(0, 1, 0)

    const translation = new THREE.Vector3()

    function canPlace(x, z, rotation, scale) {

        const cos = Math.cos(rotation)

        const sin = Math.sin(rotation)

        // 四個角落都必須位於安全範圍內

        for (const a of [-7, 7]) {

            for (const b of [-2.25, 2.25]) {

                const px =
                    x + (a * cos + b * sin) * scale

                const pz =
                    z + (-a * sin + b * cos) * scale

                if (Math.hypot(px, pz) > safeRadius) {

                    return false

                }

            }

        }

        translation.set(x, groundY, z)

        quaternion.setFromAxisAngle(
            yAxis, rotation
        )

        scaleVector.setScalar(scale)

        matrix.compose(
            translation,
            quaternion,
            scaleVector
        )

        const bounds =
            footprint.clone().applyMatrix4(matrix)

        return !blockers.some(
            blocker => blocker.intersectsBox(bounds)
        )

    }

    let placement = null

    // 優先使用完整尺寸
    // 空間不足才縮小至80%或65%

    search:

    for (const scale of [1, 0.8, 0.65]) {

        for (const distance of [11, 12, 13, 10, 9]) {

            for (let degree = 0; degree < 360; degree += 10) {

                const angle =
                    THREE.MathUtils.degToRad(degree)

                const x = Math.sin(angle) * distance

                const z = Math.cos(angle) * distance

                if (canPlace(x, z, angle, scale)) {

                    placement = {

                        x,
                        z,
                        rotation: angle,
                        scale

                    }

                    break search

                }

            }

        }

    }

    if (!placement) {

        // 未掛載的模型釋放資源

        const geometries = new Set()

        const usedMaterials = new Set()

        const textures = new Set()

        group.traverse(object => {

            if (object.geometry) {

                geometries.add(object.geometry)

            }

            if (object.material) {

                const list = Array.isArray(
                    object.material
                )
                    ? object.material
                    : [object.material]

                list.forEach(mat => {

                    usedMaterials.add(mat)

                    if (mat.map) textures.add(mat.map)

                })

            }

        })

        geometries.forEach(g => g.dispose())

        usedMaterials.forEach(m => m.dispose())

        textures.forEach(t => t.dispose())

        console.warn(

            '[V8.8.3] 安全空間不足，暫不建立任務產線'

        )

        return

    }

    group.position.set(

        placement.x,
        groundY,
        placement.z

    )

    // 中文工作站看板朝向島嶼外側

    group.rotation.y = placement.rotation

    group.scale.setScalar(placement.scale)

    island.group.add(group)

    // ==================================
    // 09 動態智慧任務流程
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    function update() {

        const time =
            (performance.now() - start) / 1000

        const activeStations =
            [false, false, false, false, false]

        packets.forEach((packet, index) => {

            const progress =
                (packet.phase + time * 0.065) % 1

            const x =
                -6.1 + progress * 12.2

            packet.mesh.position.x = x

            const stage = THREE.MathUtils.clamp(

                Math.floor((x + 6.25) / 2.5),

                0, 4

            )

            const station = stations[stage]

            const color = station.config.color

            packet.material.color.setHex(color)

            packet.material.emissive.setHex(color)

            const distance = Math.abs(

                x - station.station.position.x

            )

            const processing = distance < 0.55

            packet.mesh.position.y =

                1.3 +

                (processing
                    ? Math.sin(time * 5 + index) * 0.07
                    : 0)

            if (processing) {

                activeStations[stage] = true

                packet.mesh.rotation.y += 0.025

            } else {

                packet.mesh.rotation.y *= 0.96

            }

        })

        // 工作站接收到任務才啟動處理

        stations.forEach((item, index) => {

            const active = activeStations[index]

            const target = active

                ? 2.48 + Math.sin(time * 6) * 0.12

                : 2.72

            item.processor.position.y =

                THREE.MathUtils.lerp(

                    item.processor.position.y,
                    target,
                    0.15

                )

            item.statusMaterial.color.setHex(

                active
                    ? 0x39ff88
                    : 0x64748b

            )

            item.beamMaterial.opacity = active

                ? 0.25 + Math.sin(time * 8) * 0.08

                : 0.04

        })

        // 成果完成裝置

        trophy.rotation.y = time * 1.2

        trophy.rotation.x =
            Math.sin(time) * 0.2

        trophy.position.y =
            0.82 + Math.sin(time * 2) * 0.12

        const pulse =
            1 + Math.sin(time * 3) * 0.12

        outputRing.scale.set(
            pulse, pulse, 1
        )

    }

    // 沿用既有Three.js渲染流程

    function onBeforeRender(renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    packets.forEach(packet => {

        packet.mesh.onBeforeRender =
            onBeforeRender

    })

    rollers.onBeforeRender =
        onBeforeRender

    update()

    console.log(

        'SkillIsland V8.8.3 自動化任務工作流程建立完成',

        {

            stations: stations.length,

            packets: packets.length,

            placement

        }

    )

    return group

}
