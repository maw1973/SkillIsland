import * as THREE from 'three'

// SkillIsland V8.7.5
// 數據分析島 Q 版工作人員

export function createAnalyticsPeople(island) {

    if (!island?.group) return

    const name = 'AnalyticsPeople_V875'

    const existing = island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    group.position.y = island.groundY

    island.group.add(group)

    const people = []

    const materials = new Map()

    const skinColors = [
        0xffd4ad,
        0xe8b18a,
        0xf5c49c
    ]

    const shirtColors = [
        0x2563eb,
        0x00a896,
        0xf97316,
        0x9333ea,
        0xec4899,
        0xfacc15
    ]

    const hairColors = [
        0x252525,
        0x493323,
        0x303846
    ]

    function material(color) {

        if (!materials.has(color)) {

            materials.set(

                color,

                new THREE.MeshStandardMaterial({

                    color,

                    roughness: 0.8,

                    flatShading: true

                })

            )

        }

        return materials.get(color)

    }

    const sphereGeometry = new THREE.SphereGeometry(
        1, 12, 10
    )

    const boxGeometry = new THREE.BoxGeometry(
        1, 1, 1
    )

    function sphere(parent, sx, sy, sz, x, y, z, color) {

        const mesh = new THREE.Mesh(

            sphereGeometry,

            material(color)

        )

        mesh.scale.set(sx, sy, sz)

        mesh.position.set(x, y, z)

        mesh.castShadow = true

        parent.add(mesh)

        return mesh

    }

    function box(parent, w, h, d, x, y, z, color) {

        const mesh = new THREE.Mesh(

            boxGeometry,

            material(color)

        )

        mesh.scale.set(w, h, d)

        mesh.position.set(x, y, z)

        mesh.castShadow = true

        parent.add(mesh)

        return mesh

    }

    // ==================================
    // 01 建立 Q 版分析人員
    // 人物正面為 local +Z
    // ==================================

    function createPerson({

        x,

        z,

        targetX,

        targetZ,

        index,

        role = 'standing',

        height = 1

    }) {

        const person = new THREE.Group()

        person.name = `AnalyticsPerson_${index}`

        person.position.set(x, 0, z)

        person.scale.setScalar(height)

        person.rotation.y = Math.atan2(

            targetX - x,

            targetZ - z

        )

        group.add(person)

        const skin = skinColors[
            index % skinColors.length
        ]

        const shirt = shirtColors[
            index % shirtColors.length
        ]

        const hair = hairColors[
            index % hairColors.length
        ]

        const pants = 0x26364a

        const shoes = 0x172033

        // 身體

        const torso = box(

            person,

            0.64, 0.78, 0.4,

            0, 1.12, 0,

            shirt

        )

        // 衣領

        box(

            person,

            0.28, 0.1, 0.06,

            0, 1.45, 0.21,

            0xffffff

        )

        // 識別證

        box(

            person,

            0.13, 0.2, 0.035,

            0.16, 1.2, 0.225,

            0xffffff

        )

        box(

            person,

            0.085, 0.07, 0.038,

            0.16, 1.23, 0.248,

            0x38bdf8

        )

        // 頸部

        sphere(

            person,

            0.14, 0.14, 0.13,

            0, 1.54, 0,

            skin

        )

        // 頭部群組

        const head = new THREE.Group()

        head.position.y = 1.91

        person.add(head)

        sphere(

            head,

            0.39, 0.43, 0.36,

            0, 0, 0,

            skin

        )

        // 頭髮

        sphere(

            head,

            0.405, 0.245, 0.375,

            0, 0.24, -0.045,

            hair

        )

        // 左右耳朵

        for (const side of [-1, 1]) {

            sphere(

                head,

                0.09, 0.12, 0.075,

                side * 0.37,

                -0.01,

                0,

                skin

            )

        }

        // 眼睛

        for (const side of [-1, 1]) {

            sphere(

                head,

                0.045, 0.055, 0.03,

                side * 0.14,

                0.035,

                0.337,

                0x172033

            )

        }

        // 鼻子

        sphere(

            head,

            0.065, 0.065, 0.055,

            0, -0.04, 0.35,

            skin

        )

        // 微笑

        box(

            head,

            0.13, 0.025, 0.025,

            0, -0.145, 0.328,

            0x9a513c

        )

        // 部分人物戴眼鏡

        if (index % 3 === 0) {

            for (const side of [-1, 1]) {

                const frame = new THREE.Mesh(

                    new THREE.TorusGeometry(

                        0.092, 0.016, 6, 18

                    ),

                    material(0x263238)

                )

                frame.position.set(

                    side * 0.14,

                    0.035,

                    0.375

                )

                head.add(frame)

            }

            box(

                head,

                0.11, 0.025, 0.025,

                0, 0.035, 0.375,

                0x263238

            )

        }

        // ==================================
        // 02 手臂及工作姿勢
        // ==================================

        function createArm(side) {

            const arm = new THREE.Group()

            arm.position.set(

                side * 0.39,

                1.42,

                0

            )

            person.add(arm)

            box(

                arm,

                0.21, 0.36, 0.23,

                0, -0.18, 0,

                shirt

            )

            box(

                arm,

                0.16, 0.29, 0.17,

                0, -0.48, 0,

                skin

            )

            sphere(

                arm,

                0.1, 0.12, 0.1,

                0, -0.65, 0,

                skin

            )

            return arm

        }

        const leftArm = createArm(-1)

        const rightArm = createArm(1)

        // ==================================
        // 03 雙腳及鞋子
        // ==================================

        function createLeg(side) {

            const leg = new THREE.Group()

            leg.position.set(

                side * 0.17,

                0.76,

                0

            )

            person.add(leg)

            box(

                leg,

                0.25, 0.59, 0.27,

                0, -0.29, 0,

                pants

            )

            box(

                leg,

                0.29, 0.16, 0.43,

                0, -0.68, 0.08,

                shoes

            )

            return leg

        }

        const leftLeg = createLeg(-1)

        const rightLeg = createLeg(1)

        // ==================================
        // 04 平板電腦及簡報設備
        // ==================================

        let tablet = null

        if (

            role === 'tablet' ||

            role === 'researcher' ||

            role === 'operator'

        ) {

            tablet = new THREE.Group()

            tablet.position.set(

                0, 1.08, 0.55

            )

            tablet.rotation.x = -0.48

            person.add(tablet)

            box(

                tablet,

                0.57, 0.4, 0.07,

                0, 0, 0,

                0x15263d

            )

            const screen = new THREE.Mesh(

                new THREE.PlaneGeometry(

                    0.49, 0.32

                ),

                new THREE.MeshBasicMaterial({

                    color: 0x38bdf8,

                    toneMapped: false

                })

            )

            screen.position.z = 0.041

            tablet.add(screen)

            for (let i = 0; i < 4; i++) {

                const h = 0.07 + i * 0.045

                box(

                    tablet,

                    0.055, h, 0.012,

                    -0.16 + i * 0.1,

                    -0.12 + h / 2,

                    0.052,

                    shirtColors[i]

                )

            }

            leftArm.rotation.x = -0.95

            rightArm.rotation.x = -0.95

            leftArm.rotation.z = 0.5

            rightArm.rotation.z = -0.5

        }

        if (role === 'presenter') {

            rightArm.rotation.x = -1.4

            rightArm.rotation.z = 0.35

        }

        const data = {

            person,

            torso,

            head,

            leftArm,

            rightArm,

            leftLeg,

            rightLeg,

            tablet,

            role,

            phase: index * 0.75,

            startX: x,

            startZ: z,

            initialRotation: person.rotation.y

        }

        people.push(data)

        return data

    }

    // ==================================
    // 05 依實際設施方向安排人員
    // ==================================

    function facilityPoint(name, offsetX, offsetZ) {

        const facility =

            island.group.getObjectByName(name)

        if (!facility) return null

        const point = new THREE.Vector3(

            offsetX, 0, offsetZ

        )

        facility.localToWorld(point)

        group.worldToLocal(point)

        return {

            x: point.x,

            z: point.z

        }

    }

    function addAtFacility(

        name,

        offsetX,

        offsetZ,

        index,

        role,

        height = 1,

        targetOffsetX = 0,

        targetOffsetZ = 0

    ) {

        const position = facilityPoint(

            name,

            offsetX,

            offsetZ

        )

        const target = facilityPoint(

            name,

            targetOffsetX,

            targetOffsetZ

        )

        if (!position || !target) {

            console.warn(

                '[V8.7.5] 找不到人員配置設施：',

                name

            )

            return

        }

        createPerson({

            x: position.x,

            z: position.z,

            targetX: target.x,

            targetZ: target.z,

            index,

            role,

            height

        })

    }

    // ==================================
    // 06 全息地球分析師
    // ==================================

    addAtFacility(

        'HolographicEarth_V870',

        -4.2, 4.8,

        0, 'tablet', 1.02

    )

    addAtFacility(

        'HolographicEarth_V870',

        4.2, 4.8,

        1, 'standing', 0.97

    )

    // ==================================
    // 07 巨型數據柱研究員
    // ==================================

    addAtFacility(

        'GiantDataChart_V871',

        -2.6, 2.9,

        2, 'researcher', 1.04

    )

    addAtFacility(

        'GiantDataChart_V871',

        2.6, 2.9,

        3, 'standing', 0.98

    )

    // ==================================
    // 08 弧形展示牆簡報人員
    // 使用展示牆旋轉後的正面方向
    // ==================================

    addAtFacility(

        'CurvedDataWall_V873',

        -2.2, 2.9,

        4, 'presenter', 1.06,

        0, 4.8

    )

    addAtFacility(

        'CurvedDataWall_V873',

        -0.6, 4.0,

        5, 'standing', 0.98,

        0, 0

    )

    addAtFacility(

        'CurvedDataWall_V873',

        1.2, 4.0,

        6, 'standing', 1.0,

        0, 0

    )

    // ==================================
    // 09 戶外商業智慧區操作員
    // ==================================

    addAtFacility(

        'OutdoorBusinessIntelligence_V862',

        -2.05, 3.8,

        7, 'operator', 1.02,

        0, 2.3

    )

    addAtFacility(

        'OutdoorBusinessIntelligence_V862',

        2.05, 3.8,

        8, 'operator', 0.96,

        0, 2.3

    )

    // ==================================
    // 10 園區巡迴人員
    // ==================================

    createPerson({

        x: -8.3,

        z: 7.7,

        targetX: -8.3,

        targetZ: 10,

        index: 9,

        role: 'walking',

        height: 0.98

    })

    createPerson({

        x: 8.3,

        z: -7.7,

        targetX: 8.3,

        targetZ: -10,

        index: 10,

        role: 'walking',

        height: 1.03

    })

    // ==================================
    // 11 人物工作動畫
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    function update() {

        const time =

            (performance.now() - start) / 1000

        people.forEach(item => {

            const t = time + item.phase

            // 頭部自然轉動

            item.head.rotation.y =

                Math.sin(t * 0.8) * 0.12

            item.head.rotation.x =

                Math.sin(t * 1.1) * 0.045

            // 平板操作與資料研究

            if (

                item.role === 'tablet' ||

                item.role === 'researcher' ||

                item.role === 'operator'

            ) {

                item.head.rotation.x =

                    0.15 + Math.sin(t * 1.1) * 0.08

                item.rightArm.rotation.x =

                    -0.95 + Math.sin(t * 4) * 0.07

                item.leftArm.rotation.x =

                    -0.95

                item.tablet.rotation.x =

                    -0.48 + Math.sin(t * 0.9) * 0.035

            }

            // 戶外簡報手勢

            else if (item.role === 'presenter') {

                item.rightArm.rotation.x =

                    -1.35 + Math.sin(t * 2) * 0.35

                item.rightArm.rotation.z =

                    0.35 + Math.sin(t * 1.2) * 0.22

                item.leftArm.rotation.x =

                    Math.sin(t * 1.5) * 0.12

            }

            // 園區巡迴走動

            else if (item.role === 'walking') {

                const speed = 0.65

                const distance = 1.8

                const offset =

                    Math.sin(t * speed) * distance

                const direction =

                    Math.cos(t * speed)

                item.person.position.z =

                    item.startZ + offset

                item.person.rotation.y =

                    direction >= 0

                        ? 0

                        : Math.PI

                const step = Math.sin(t * 6)

                const amplitude =

                    Math.abs(direction) * 0.48

                item.leftLeg.rotation.x =

                    step * amplitude

                item.rightLeg.rotation.x =

                    -step * amplitude

                item.leftArm.rotation.x =

                    -step * amplitude

                item.rightArm.rotation.x =

                    step * amplitude

                item.person.position.y =

                    Math.abs(step) * 0.035 * Math.abs(direction)

            }

            // 站立與聽講

            else {

                item.leftArm.rotation.x =

                    Math.sin(t * 1.3) * 0.1

                item.rightArm.rotation.x =

                    Math.sin(t * 1.1 + 1) * 0.12

                item.person.rotation.y =

                    item.initialRotation +

                    Math.sin(t * 0.65) * 0.035

            }

        })

    }

    // ==================================
    // 12 沿用 Three.js 渲染流程
    // ==================================

    people.forEach(item => {

        item.torso.onBeforeRender = function(renderer) {

            const frame = renderer.info.render.frame

            if (frame === lastFrame) return

            lastFrame = frame

            update()

        }

    })

    update()

    console.log(

        'SkillIsland V8.7.5 科技廣場分析人員建立完成',

        {

            people: people.length

        }

    )

    return group

}

