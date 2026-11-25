import * as THREE from 'three'

// SkillIsland V8.8.2
// 多代理協作控制中心

export function createAgentCollaborationCenter(island) {

    if (!island?.group) return

    const name = 'AgentCollaborationCenter_V882'

    const existing = island.group.getObjectByName(name)

    if (existing) return existing

    const exhibition = island.group.getObjectByName(
        'AgentRobotExhibition_V881'
    )

    if (!exhibition) {

        console.warn('[V8.8.2] 找不到機器人展示區')

        return
    }

    const group = new THREE.Group()

    group.name = name

    group.position.y = island.groundY

    island.group.add(group)

    const colors = {
        dark: 0x102b3e,
        teal: 0x0097a7,
        cyan: 0x00e5ff,
        white: 0xffffff,
        gold: 0xffc107,
        purple: 0xa855f7
    }

    const agents = [

        {
            id: 'Search',
            title: '資料搜尋',
            color: 0x2196f3
        },

        {
            id: 'Document',
            title: '文件處理',
            color: 0xff9800
        },

        {
            id: 'Coding',
            title: '程式開發',
            color: 0x9333ea
        },

        {
            id: 'Analytics',
            title: '數據分析',
            color: 0x22c55e
        },

        {
            id: 'Workflow',
            title: '自動化執行',
            color: 0xef4444
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
                        roughness: 0.45,
                        metalness: 0.25
                    })

            )

        }

        return materials.get(key)

    }

    function box(
        parent,
        w, h, d,
        x, y, z,
        color,
        glow = false
    ) {

        const mesh = new THREE.Mesh(

            new THREE.BoxGeometry(w, h, d),

            material(color, glow)

        )

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
        segments = 6,
        glow = false
    ) {

        const mesh = new THREE.Mesh(

            new THREE.CylinderGeometry(
                rt, rb, h, segments
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
    // 01 取得既有機器人座標
    // ==================================

    const robotPositions = []

    const worldPoint = new THREE.Vector3()

    agents.forEach(agent => {

        const exhibit = exhibition.getObjectByName(

            `AgentExhibit_${agent.id}`

        )

        if (!exhibit) return

        exhibit.getWorldPosition(worldPoint)

        const local = group.worldToLocal(

            worldPoint.clone()

        )

        robotPositions.push({

            ...agent,

            x: local.x,

            z: local.z

        })

    })

    if (robotPositions.length === 0) {

        island.group.remove(group)

        console.warn('[V8.8.2] 無有效代理節點')

        return

    }

    // ==================================
    // 02 尋找控制中心安全空間
    // ==================================

    const islandRadius = Number(
        island.config?.radius
    ) || 19

    const platformRadius = 2.25

    const safeRadius = islandRadius - 1.8

    const buildingAngle =
        island.building?.rotation.y || 0

    island.group.updateWorldMatrix(true, true)

    const inverse =
        island.group.matrixWorld.clone().invert()

    const occupied = []

    if (island.building) {

        occupied.push(

            new THREE.Box3()

                .setFromObject(island.building)

                .applyMatrix4(inverse)

        )

    }

    robotPositions.forEach(robot => {

        occupied.push(

            new THREE.Box3(

                new THREE.Vector3(
                    robot.x - 1.9,
                    island.groundY,
                    robot.z - 1.9
                ),

                new THREE.Vector3(
                    robot.x + 1.9,
                    island.groundY + 5,
                    robot.z + 1.9
                )

            )

        )

    })

    function canPlace(x, z) {

        if (

            Math.hypot(x, z) +
            platformRadius >
            safeRadius

        ) return false

        const bounds = new THREE.Box3(

            new THREE.Vector3(

                x - platformRadius,
                island.groundY,
                z - platformRadius

            ),

            new THREE.Vector3(

                x + platformRadius,
                island.groundY + 6,
                z + platformRadius

            )

        )

        return !occupied.some(item =>

            item.intersectsBox(bounds)

        )

    }

    const candidates = []

    for (const radius of [10, 11, 12, 9, 8]) {

        for (

            let degree = 180;

            degree < 540;

            degree += 15

        ) {

            const angle =

                THREE.MathUtils.degToRad(degree) +

                buildingAngle

            candidates.push({

                x: Math.sin(angle) * radius,

                z: Math.cos(angle) * radius

            })

        }

    }

    const position = candidates.find(item =>

        canPlace(item.x, item.z)

    )

    if (!position) {

        island.group.remove(group)

        console.warn(

            '[V8.8.2] 控制中心安全空間不足'

        )

        return

    }

    const center = new THREE.Group()

    center.name = 'AgentTaskControlPlatform'

    center.position.set(

        position.x,

        0,

        position.z

    )

    // 控制中心朝島嶼外側

    center.rotation.y = Math.atan2(

        position.x,

        position.z

    )

    group.add(center)

    // ==================================
    // 03 三層六角形控制平台
    // ==================================

    cylinder(

        center,

        2.1, 2.25, 0.3,

        0, 0.15, 0,

        colors.dark

    )

    cylinder(

        center,

        1.95, 2.1, 0.18,

        0, 0.39, 0,

        colors.teal

    )

    cylinder(

        center,

        1.8, 1.8, 0.12,

        0, 0.54, 0,

        colors.dark

    )

    const baseRing = ring(

        center,

        1.72,

        0.065,

        colors.cyan

    )

    baseRing.rotation.x = Math.PI / 2

    baseRing.position.y = 0.63

    // 六角形彩色節點

    for (let i = 0; i < 6; i++) {

        const angle =

            i / 6 * Math.PI * 2

        cylinder(

            center,

            0.17, 0.2, 0.24,

            Math.cos(angle) * 1.75,

            0.68,

            Math.sin(angle) * 1.75,

            i < 5
                ? agents[i].color
                : colors.gold,

            12,

            true

        )

    }

    // ==================================
    // 04 中央智慧運算核心
    // ==================================

    cylinder(

        center,

        0.72, 1.1, 0.65,

        0, 0.9, 0,

        colors.teal

    )

    cylinder(

        center,

        0.8, 0.8, 0.18,

        0, 1.3, 0,

        colors.dark,

        24

    )

    const projectorRing = ring(

        center,

        0.7,

        0.075,

        colors.gold

    )

    projectorRing.rotation.x = Math.PI / 2

    projectorRing.position.y = 1.43

    const coreGroup = new THREE.Group()

    coreGroup.position.y = 3.0

    center.add(coreGroup)

    const core = new THREE.Mesh(

        new THREE.IcosahedronGeometry(0.75, 1),

        new THREE.MeshStandardMaterial({

            color: colors.cyan,

            emissive: colors.cyan,

            emissiveIntensity: 0.8,

            roughness: 0.25,

            metalness: 0.3

        })

    )

    coreGroup.add(core)

    const orbit1 = ring(

        coreGroup,

        1.15, 0.07,

        colors.gold

    )

    const orbit2 = ring(

        coreGroup,

        1.28, 0.055,

        colors.purple

    )

    const orbit3 = ring(

        coreGroup,

        1.42, 0.045,

        colors.cyan

    )

    orbit1.rotation.x = Math.PI / 3

    orbit2.rotation.y = Math.PI / 3

    orbit3.rotation.x = Math.PI / 2

    // 全息投影光束

    const beam = new THREE.Mesh(

        new THREE.CylinderGeometry(

            0.9, 0.4, 1.7, 32, 1, true

        ),

        new THREE.MeshBasicMaterial({

            color: colors.cyan,

            transparent: true,

            opacity: 0.16,

            depthWrite: false,

            side: THREE.DoubleSide

        })

    )

    beam.position.y = 2.15

    center.add(beam)

    // ==================================
    // 05 五大代理彩色任務節點
    // ==================================

    const taskNodes = []

    agents.forEach((agent, i) => {

        const angle =

            i / agents.length * Math.PI * 2

        const node = new THREE.Group()

        node.position.set(

            Math.cos(angle) * 1.65,

            2.5,

            Math.sin(angle) * 1.65

        )

        coreGroup.add(node)

        // 相對核心的高度

        node.position.y = -0.2

        const crystal = new THREE.Mesh(

            new THREE.OctahedronGeometry(0.24),

            material(agent.color, true)

        )

        node.add(crystal)

        taskNodes.push({

            node,

            crystal,

            angle

        })

    })

    // ==================================
    // 06 智慧任務調度看板
    // ==================================

    const canvas = document.createElement('canvas')

    canvas.width = 1024

    canvas.height = 512

    const ctx = canvas.getContext('2d')

    const texture = new THREE.CanvasTexture(canvas)

    texture.colorSpace = THREE.SRGBColorSpace

    const signGroup = new THREE.Group()

    signGroup.position.set(0, 1.35, 1.65)

    center.add(signGroup)

    box(

        signGroup,

        3.05, 1.53, 0.15,

        0, 0, 0,

        colors.dark

    )

    const screen = new THREE.Mesh(

        new THREE.PlaneGeometry(2.92, 1.46),

        new THREE.MeshBasicMaterial({

            map: texture,

            toneMapped: false

        })

    )

    screen.position.z = 0.081

    signGroup.add(screen)

    const tasks = [

        '接收使用者任務',

        '分派搜尋代理',

        '分派文件代理',

        '分派程式代理',

        '分派分析代理',

        '自動化流程執行',

        '整合任務成果'

    ]

    let lastTaskIndex = -1

    function drawDashboard(index) {

        ctx.fillStyle = '#102b3e'

        ctx.fillRect(0, 0, 1024, 512)

        ctx.strokeStyle = '#00e5ff'

        ctx.lineWidth = 12

        ctx.strokeRect(6, 6, 1012, 500)

        ctx.textAlign = 'center'

        ctx.fillStyle = '#ffffff'

        ctx.font = 'bold 76px Microsoft JhengHei'

        ctx.fillText(

            '智慧任務調度中心',

            512, 105

        )

        ctx.font = '32px Arial'

        ctx.fillStyle = '#67e8f9'

        ctx.fillText(

            'MULTI-AGENT CONTROL CENTER',

            512, 158

        )

        ctx.fillStyle = '#173e52'

        ctx.fillRect(45, 190, 934, 115)

        ctx.fillStyle = '#4ade80'

        ctx.font = 'bold 58px Microsoft JhengHei'

        ctx.fillText(

            tasks[index],

            512, 265

        )

        agents.forEach((agent, i) => {

            const x = 75 + i * 190

            const active = index === i + 1

            ctx.fillStyle = active
                ? '#ffffff'
                : '#' + agent.color
                    .toString(16)
                    .padStart(6, '0')

            ctx.beginPath()

            ctx.arc(x + 55, 350, 19, 0, Math.PI * 2)

            ctx.fill()

            ctx.fillStyle = '#ffffff'

            ctx.font = '28px Microsoft JhengHei'

            ctx.fillText(

                agent.title,

                x + 55,

                410

            )

        })

        ctx.font = '27px Microsoft JhengHei'

        ctx.fillStyle = '#94a3b8'

        ctx.fillText(

            '模擬代理協作流程',

            512, 475

        )

        texture.needsUpdate = true

    }

    // ==================================
    // 07 建立代理傳輸連線
    // ==================================

    const routes = []

    robotPositions.forEach(agent => {

        const start = new THREE.Vector3(

            position.x,

            1.0,

            position.z

        )

        const end = new THREE.Vector3(

            agent.x,

            0.65,

            agent.z

        )

        const middle = start.clone()

            .add(end)

            .multiplyScalar(0.5)

        // 弧形傳輸路徑，跨越地面設施

        middle.y = 3.5

        const curve = new THREE.QuadraticBezierCurve3(

            start,

            middle,

            end

        )

        const geometry = new THREE.TubeGeometry(

            curve,

            24,

            0.035,

            6,

            false

        )

        const line = new THREE.Mesh(

            geometry,

            new THREE.MeshBasicMaterial({

                color: agent.color,

                transparent: true,

                opacity: 0.65,

                depthWrite: false,

                toneMapped: false

            })

        )

        group.add(line)

        routes.push({

            curve,

            color: agent.color,

            length: curve.getLength()

        })

    })

    // ==================================
    // 08 批次建立動態傳輸光點
    // ==================================

    const packets = []

    routes.forEach((route, routeIndex) => {

        for (let i = 0; i < 8; i++) {

            packets.push({

                route,

                routeIndex,

                phase: i / 8,

                speed: i % 2 === 0 ? 3 : -2.5

            })

        }

    })

    const packetMesh = new THREE.InstancedMesh(

        new THREE.SphereGeometry(

            0.11, 8, 6

        ),

        new THREE.MeshBasicMaterial({

            color: 0xffffff,

            toneMapped: false

        }),

        packets.length

    )

    packetMesh.name = 'AgentTaskPackets'

    packetMesh.frustumCulled = false

    packetMesh.instanceMatrix.setUsage(

        THREE.DynamicDrawUsage

    )

    group.add(packetMesh)

    const dummy = new THREE.Object3D()

    const packetColor = new THREE.Color()

    packets.forEach((packet, i) => {

        packetColor.setHex(packet.route.color)

        packetMesh.setColorAt(i, packetColor)

    })

    if (packetMesh.instanceColor) {

        packetMesh.instanceColor.needsUpdate = true

    }

    // ==================================
    // 09 智慧代理協作動畫
    // ==================================

    const startTime = performance.now()

    let lastFrame = -1

    function update() {

        const time =

            (performance.now() - startTime) / 1000

        coreGroup.position.y =

            3.0 + Math.sin(time * 1.3) * 0.15

        core.rotation.x = time * 0.5

        core.rotation.y = time * 0.8

        core.material.emissiveIntensity =

            0.7 + Math.sin(time * 2) * 0.3

        orbit1.rotation.y = time * 0.65

        orbit2.rotation.x = -time * 0.8

        orbit3.rotation.z = time * 0.5

        taskNodes.forEach((item, i) => {

            const angle =

                item.angle + time * 0.45

            item.node.position.x =

                Math.cos(angle) * 1.65

            item.node.position.z =

                Math.sin(angle) * 1.65

            item.node.position.y =

                -0.2 +

                Math.sin(time * 2 + i) * 0.16

            item.crystal.rotation.y = time * 1.4

        })

        // 五大代理雙向任務傳輸

        packets.forEach((packet, i) => {

            const progress =

                packet.phase +

                time * packet.speed /

                Math.max(packet.route.length, 1)

            const u =

                ((progress % 1) + 1) % 1

            packet.route.curve.getPointAt(

                u,

                dummy.position

            )

            dummy.scale.setScalar(

                1 +

                Math.sin(time * 4 + i) * 0.25

            )

            dummy.updateMatrix()

            packetMesh.setMatrixAt(

                i,

                dummy.matrix

            )

        })

        packetMesh.instanceMatrix.needsUpdate = true

        // 每2.5秒切換任務階段

        const taskIndex =

            Math.floor(time / 2.5) % tasks.length

        if (taskIndex !== lastTaskIndex) {

            drawDashboard(taskIndex)

            lastTaskIndex = taskIndex

        }

    }

    // ==================================
    // 10 掛載既有Three.js渲染流程
    // ==================================

    packetMesh.onBeforeRender = function(renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    update()

    console.log(

        'SkillIsland V8.8.2 多代理協作控制中心建立完成',

        {

            agents: robotPositions.length,

            routes: routes.length,

            packets: packets.length,

            position

        }

    )

    return group

}
