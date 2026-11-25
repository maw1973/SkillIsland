import * as THREE from 'three'

// SkillIsland V8.8.5
// 智慧機器人動態工作情境

export function createAgentRobotWorkers(island) {

    if (!island?.group) return

    const name = 'AgentRobotWorkers_V885'

    const existing =
        island.group.getObjectByName(name)

    if (existing) return existing

    const groundY = Number(island.groundY)

    if (!Number.isFinite(groundY)) return

    const group = new THREE.Group()

    group.name = name

    group.position.y = groundY

    island.group.add(group)

    const colors = {

        dark: 0x173447,
        white: 0xf1f5f9,
        silver: 0x90a4ae,
        cyan: 0x00e5ff,
        teal: 0x0097a7,
        blue: 0x2196f3,
        orange: 0xff9800,
        purple: 0xa855f7,
        green: 0x22c55e,
        gold: 0xffc107,
        red: 0xef4444

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
                        roughness: 0.55,
                        metalness: 0.2

                    })

            )

        }

        return materials.get(key)

    }

    const boxGeometry =
        new THREE.BoxGeometry(1, 1, 1)

    const sphereGeometry =
        new THREE.SphereGeometry(1, 12, 10)

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
                rt, rb, h, 16
            ),

            material(color, glow)

        )

        mesh.position.set(x, y, z)

        mesh.castShadow = !glow

        parent.add(mesh)

        return mesh

    }

    function ring(parent, radius, thickness, color) {

        const mesh = new THREE.Mesh(

            new THREE.TorusGeometry(
                radius, thickness, 8, 32
            ),

            material(color, true)

        )

        parent.add(mesh)

        return mesh

    }

    // ==================================
    // 01 安全區域與設施碰撞篩選
    // ==================================

    island.group.updateWorldMatrix(true, true)

    const islandRadius = Number(
        island.config?.radius
    ) || 19

    const safeRadius = Math.min(
        islandRadius - 3,
        14
    )

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

    addBlocker(
        island.group.getObjectByName(
            'AgentComputingCore_V884'
        )
    )

    function canPlace(x, z, size = 0.9) {

        if (

            Math.hypot(x, z) + size >
            safeRadius

        ) return false

        const bounds = new THREE.Box3(

            new THREE.Vector3(
                x - size,
                groundY,
                z - size
            ),

            new THREE.Vector3(
                x + size,
                groundY + 3,
                z + size
            )

        )

        return !blockers.some(item =>
            item.intersectsBox(bounds)
        )

    }

    function reserveArea(x, z, size) {

        blockers.push(

            new THREE.Box3(

                new THREE.Vector3(
                    x - size,
                    groundY,
                    z - size
                ),

                new THREE.Vector3(
                    x + size,
                    groundY + 3,
                    z + size
                )

            )

        )

    }

    function findPosition(size) {

        for (const radius of [10, 11, 12, 9, 8]) {

            for (
                let degree = 0;
                degree < 360;
                degree += 10
            ) {

                const angle =
                    THREE.MathUtils.degToRad(degree)

                const x =
                    Math.sin(angle) * radius

                const z =
                    Math.cos(angle) * radius

                if (canPlace(x, z, size)) {

                    reserveArea(x, z, size)

                    return { x, z }

                }

            }

        }

        return null

    }

    // ==================================
    // 02 尋找安全移動路線
    // ==================================

    function findRoute(size = 0.95) {

        for (const radius of [11, 12, 10, 13, 9]) {

            for (
                let degree = 0;
                degree < 360;
                degree += 15
            ) {

                const angle =
                    THREE.MathUtils.degToRad(degree)

                const centerX =
                    Math.sin(angle) * radius

                const centerZ =
                    Math.cos(angle) * radius

                const dx = Math.cos(angle)

                const dz = -Math.sin(angle)

                for (const length of [3.2, 2.4, 1.6]) {

                    const points = []

                    let valid = true

                    for (let i = 0; i <= 12; i++) {

                        const offset =
                            (i / 12 - 0.5) * length

                        const x =
                            centerX + dx * offset

                        const z =
                            centerZ + dz * offset

                        if (!canPlace(x, z, size)) {

                            valid = false

                            break

                        }

                        points.push({ x, z })

                    }

                    if (!valid) continue

                    points.forEach(point => {

                        reserveArea(
                            point.x,
                            point.z,
                            size
                        )

                    })

                    return {

                        start: points[0],

                        end: points[points.length - 1]

                    }

                }

            }

        }

        return null

    }

    const movingRobots = []

    const maintenanceArms = []

    const serviceRobots = []

    // ==================================
    // 03 共用移動機器人底盤
    // ==================================

    function createChassis(parent, color) {

        box(
            parent,
            1.25, 0.32, 1.45,
            0, 0.35, 0,
            colors.dark
        )

        box(
            parent,
            1.12, 0.27, 1.25,
            0, 0.63, 0,
            color
        )

        const wheels = []

        for (const side of [-1, 1]) {

            for (const z of [-0.47, 0.47]) {

                const axle = new THREE.Group()

                axle.position.set(
                    side * 0.65,
                    0.25,
                    z
                )

                parent.add(axle)

                const wheel = cylinder(

                    axle,
                    0.25, 0.25, 0.17,
                    0, 0, 0,
                    colors.dark

                )

                wheel.rotation.z = Math.PI / 2

                const hub = cylinder(

                    axle,
                    0.12, 0.12, 0.18,
                    0, 0, 0,
                    colors.silver

                )

                hub.rotation.z = Math.PI / 2

                box(

                    axle,
                    0.19, 0.045, 0.25,
                    0, 0, 0,
                    color

                )

                wheels.push(axle)

            }

        }

        // 前方照明

        for (const side of [-1, 1]) {

            box(
                parent,
                0.23, 0.13, 0.06,
                side * 0.35, 0.65, 0.65,
                colors.cyan,
                true
            )

        }

        return wheels

    }

    // ==================================
    // 04 智慧巡邏機器人
    // ==================================

    function createPatrolRobot(route, index) {

        const robot = new THREE.Group()

        robot.name = `AgentPatrolRobot_${index}`

        group.add(robot)

        const wheels = createChassis(
            robot,
            colors.blue
        )

        box(
            robot,
            0.86, 0.72, 0.85,
            0, 1.08, 0,
            colors.white
        )

        box(
            robot,
            0.73, 0.4, 0.08,
            0, 1.18, 0.47,
            colors.dark
        )

        for (const side of [-1, 1]) {

            sphere(
                robot,
                0.09, 0.11, 0.045,
                side * 0.19, 1.22, 0.525,
                colors.cyan,
                true
            )

        }

        const radar = new THREE.Group()

        radar.position.y = 1.55

        robot.add(radar)

        cylinder(
            radar,
            0.06, 0.07, 0.45,
            0, 0.225, 0,
            colors.silver
        )

        box(
            radar,
            0.72, 0.14, 0.23,
            0, 0.48, 0,
            colors.blue
        )

        box(
            radar,
            0.6, 0.06, 0.08,
            0, 0.5, 0.13,
            colors.cyan,
            true
        )

        movingRobots.push({

            robot,
            wheels,
            radar,
            route,
            phase: index * 1.4,
            speed: 0.65

        })

    }

    // ==================================
    // 05 任務搬運機器人
    // ==================================

    function createCargoRobot(route, index) {

        const robot = new THREE.Group()

        robot.name = `AgentCargoRobot_${index}`

        group.add(robot)

        const wheels = createChassis(
            robot,
            colors.orange
        )

        box(
            robot,
            1.05, 0.12, 1.15,
            0, 0.82, 0,
            colors.silver
        )

        const cargo = new THREE.Group()

        cargo.position.y = 0.89

        robot.add(cargo)

        const cargoColors = [

            colors.purple,
            colors.gold,
            colors.green

        ]

        for (let i = 0; i < 3; i++) {

            const x = i === 0
                ? -0.23
                : i === 1 ? 0.23 : 0

            const y =
                i === 2 ? 0.61 : 0.23

            box(
                cargo,
                0.42, 0.42, 0.65,
                x, y, 0,
                cargoColors[i]
            )

            box(
                cargo,
                0.1, 0.42, 0.66,
                x, y, 0,
                colors.white
            )

        }

        sphere(
            robot,
            0.12, 0.12, 0.12,
            0.44, 0.98, 0.48,
            colors.gold,
            true
        )

        movingRobots.push({

            robot,
            wheels,
            cargo,
            route,
            phase: index * 1.2,
            speed: 0.48

        })

    }

    // ==================================
    // 06 智慧維修機械臂
    // ==================================

    function createMaintenanceArm(position) {

        const station = new THREE.Group()

        station.name = 'AgentMaintenanceStation'

        station.position.set(
            position.x, 0, position.z
        )

        station.rotation.y = Math.atan2(
            position.x,
            position.z
        )

        group.add(station)

        box(
            station,
            2.4, 0.24, 2.3,
            0, 0.12, 0,
            colors.dark
        )

        box(
            station,
            2.2, 0.08, 2.1,
            0, 0.28, 0,
            colors.silver
        )

        cylinder(
            station,
            0.48, 0.58, 0.24,
            0, 0.44, 0,
            colors.orange
        )

        const turntable = new THREE.Group()

        turntable.position.y = 0.56

        station.add(turntable)

        cylinder(
            turntable,
            0.31, 0.38, 0.45,
            0, 0.225, 0,
            colors.dark
        )

        const shoulder = new THREE.Group()

        shoulder.position.y = 0.48

        turntable.add(shoulder)

        sphere(
            shoulder,
            0.22, 0.22, 0.22,
            0, 0, 0,
            colors.silver
        )

        box(
            shoulder,
            0.3, 0.92, 0.32,
            0, 0.46, 0,
            colors.orange
        )

        const elbow = new THREE.Group()

        elbow.position.y = 0.92

        shoulder.add(elbow)

        sphere(
            elbow,
            0.2, 0.2, 0.2,
            0, 0, 0,
            colors.dark
        )

        box(
            elbow,
            0.25, 0.72, 0.26,
            0, 0.36, 0,
            colors.gold
        )

        const tool = new THREE.Group()

        tool.position.y = 0.72

        elbow.add(tool)

        box(
            tool,
            0.4, 0.18, 0.27,
            0, 0.08, 0,
            colors.dark
        )

        for (const side of [-1, 1]) {

            box(
                tool,
                0.1, 0.28, 0.14,
                side * 0.16, 0.28, 0,
                colors.silver
            )

        }

        // 維修工作台

        box(
            station,
            0.65, 0.6, 0.65,
            0, 0.62, 0.72,
            colors.teal
        )

        box(
            station,
            0.7, 0.12, 0.7,
            0, 0.97, 0.72,
            colors.dark
        )

        const repairCore = sphere(
            station,
            0.22, 0.22, 0.22,
            0, 1.25, 0.72,
            colors.cyan,
            true
        )

        const statusMaterial =
            new THREE.MeshBasicMaterial({

                color: colors.green,
                toneMapped: false

            })

        const status = new THREE.Mesh(

            new THREE.SphereGeometry(
                0.12, 10, 8
            ),

            statusMaterial

        )

        status.position.set(
            0.9, 0.55, 0.9
        )

        station.add(status)

        maintenanceArms.push({

            turntable,
            shoulder,
            elbow,
            tool,
            repairCore,
            statusMaterial

        })

    }

    // ==================================
    // 07 智慧服務機器人
    // ==================================

    function createServiceRobot(position) {

        const robot = new THREE.Group()

        robot.name = 'AgentServiceRobot'

        robot.position.set(
            position.x, 0, position.z
        )

        robot.rotation.y = Math.atan2(
            position.x,
            position.z
        )

        group.add(robot)

        cylinder(
            robot,
            0.46, 0.55, 0.25,
            0, 0.125, 0,
            colors.dark
        )

        box(
            robot,
            0.75, 1.0, 0.65,
            0, 0.75, 0,
            colors.white
        )

        box(
            robot,
            0.5, 0.48, 0.07,
            0, 0.88, 0.36,
            colors.teal
        )

        box(
            robot,
            0.36, 0.32, 0.035,
            0, 0.88, 0.41,
            colors.cyan,
            true
        )

        const head = new THREE.Group()

        head.position.y = 1.58

        robot.add(head)

        box(
            head,
            1.0, 0.68, 0.76,
            0, 0, 0,
            colors.teal
        )

        box(
            head,
            0.82, 0.46, 0.07,
            0, 0, 0.4,
            colors.dark
        )

        for (const side of [-1, 1]) {

            sphere(
                head,
                0.1, 0.13, 0.045,
                side * 0.2, 0.04, 0.45,
                colors.cyan,
                true
            )

        }

        box(
            head,
            0.23, 0.045, 0.04,
            0, -0.13, 0.45,
            colors.cyan,
            true
        )

        const arm = new THREE.Group()

        arm.position.set(
            0.46, 1.08, 0
        )

        robot.add(arm)

        sphere(
            arm,
            0.14, 0.14, 0.14,
            0, 0, 0,
            colors.silver
        )

        box(
            arm,
            0.2, 0.6, 0.23,
            0, -0.3, 0,
            colors.teal
        )

        sphere(
            arm,
            0.14, 0.14, 0.14,
            0, -0.65, 0,
            colors.white
        )

        const signal = ring(
            robot,
            0.52, 0.055,
            colors.green
        )

        signal.rotation.x = Math.PI / 2

        signal.position.y = 2.15

        serviceRobots.push({

            robot,
            head,
            arm,
            signal

        })

    }

    // ==================================
    // 08 建立工作情境
    // ==================================

    for (let i = 0; i < 2; i++) {

        const route = findRoute(0.95)

        if (route) {

            createPatrolRobot(route, i)

        }

    }

    for (let i = 0; i < 2; i++) {

        const route = findRoute(0.95)

        if (route) {

            createCargoRobot(route, i + 2)

        }

    }

    const maintenancePosition =
        findPosition(1.5)

    if (maintenancePosition) {

        createMaintenanceArm(
            maintenancePosition
        )

    }

    const servicePosition =
        findPosition(0.95)

    if (servicePosition) {

        createServiceRobot(
            servicePosition
        )

    }

    // ==================================
    // 09 動態機器人工作動畫
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    function update() {

        const time =
            (performance.now() - start) / 1000

        movingRobots.forEach(item => {

            const t =
                time * item.speed + item.phase

            // 平滑往返移動

            const u =
                (1 - Math.cos(t)) / 2

            const a = item.route.start

            const b = item.route.end

            item.robot.position.x =
                THREE.MathUtils.lerp(a.x, b.x, u)

            item.robot.position.z =
                THREE.MathUtils.lerp(a.z, b.z, u)

            const direction = Math.sin(t)

            const rotation = Math.atan2(
                b.x - a.x,
                b.z - a.z
            )

            item.robot.rotation.y =

                rotation +

                (direction < 0 ? Math.PI : 0)

            const distance = Math.hypot(
                b.x - a.x,
                b.z - a.z
            )

            item.wheels.forEach(wheel => {

                wheel.rotation.x =
                    u * distance / 0.25

            })

            if (item.radar) {

                item.radar.rotation.y =
                    time * 2.2

            }

            if (item.cargo) {

                item.cargo.rotation.y =
                    Math.sin(time * 1.2) * 0.025

            }

        })

        // 維修機械臂

        maintenanceArms.forEach(item => {

            item.turntable.rotation.y =
                Math.sin(time * 0.85) * 0.4

            item.shoulder.rotation.x =
                0.35 + Math.sin(time * 1.1) * 0.2

            item.elbow.rotation.x =
                0.9 + Math.sin(time * 1.5) * 0.3

            item.tool.rotation.y =
                time * 0.8

            item.repairCore.scale.setScalar(

                0.22 *

                (1 + Math.sin(time * 3) * 0.2)

            )

            item.statusMaterial.color.setHex(

                Math.sin(time * 2) > 0

                    ? colors.green

                    : colors.gold

            )

        })

        // 服務機器人招手

        serviceRobots.forEach(item => {

            item.head.rotation.y =
                Math.sin(time * 0.8) * 0.3

            item.arm.rotation.z =
                2.3 + Math.sin(time * 3) * 0.35

            item.signal.rotation.z =
                time * 0.8

            const pulse =
                1 + Math.sin(time * 2) * 0.12

            item.signal.scale.set(
                pulse, pulse, 1
            )

        })

    }

    // ==================================
    // 10 接入既有渲染流程
    // ==================================

    function beforeRender(renderer) {

        const frame =
            renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    group.traverse(object => {

        if (object.isMesh) {

            object.onBeforeRender = beforeRender

        }

    })

    update()

    console.log(

        'SkillIsland V8.8.5 機器人動態工作情境建立完成',

        {

            movingRobots: movingRobots.length,

            maintenanceArms: maintenanceArms.length,

            serviceRobots: serviceRobots.length

        }

    )

    return group

}
