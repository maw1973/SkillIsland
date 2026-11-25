import * as THREE from 'three'

// SkillIsland V8.1.5
// 中央技能島 Q版人物

export function createCentralPeople(island) {

    const group = new THREE.Group()

    group.name = 'CentralPeople'
    group.position.y = island.groundY

    island.group.add(group)

    const materials = new Map()

    function mat(color) {

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

    function mesh(parent, geometry, color, x, y, z) {

        const object = new THREE.Mesh(
            geometry,
            mat(color)
        )

        object.position.set(x, y, z)
        object.castShadow = true
        object.receiveShadow = true

        parent.add(object)

        return object
    }

    function box(parent, w, h, d, color, x, y, z) {

        return mesh(
            parent,
            new THREE.BoxGeometry(w, h, d),
            color, x, y, z
        )
    }

    function sphere(parent, r, color, x, y, z) {

        return mesh(
            parent,
            new THREE.SphereGeometry(r, 12, 8),
            color, x, y, z
        )
    }

    // ==================================
    // 01 人物角色配置
    // ==================================

    const configs = [

        {
            name: 'MaleStudent01',
            shirt: 0x4285db,
            pants: 0x334155,
            hair: 0x30251f,
            female: false,
            bag: true,
            phase: 0,
            speed: 0.20,
            rx: 3.95,
            rz: 3.95,
            direction: 1
        },

        {
            name: 'FemaleStudent01',
            shirt: 0xf472b6,
            pants: 0x475569,
            hair: 0x69432b,
            female: true,
            bag: true,
            phase: 1.1,
            speed: 0.20,
            rx: 3.95,
            rz: 3.95,
            direction: 1
        },

        {
            name: 'MaleStudent02',
            shirt: 0x34b87c,
            pants: 0x334155,
            hair: 0x272727,
            female: false,
            bag: true,
            phase: 2.2,
            speed: 0.20,
            rx: 3.95,
            rz: 3.95,
            direction: 1
        },

        {
            name: 'FemaleStudent02',
            shirt: 0xb58aef,
            pants: 0x34465c,
            hair: 0x503322,
            female: true,
            bag: true,
            phase: 3.3,
            speed: 0.20,
            rx: 3.95,
            rz: 3.95,
            direction: 1
        },

        {
            name: 'OfficeWorker01',
            shirt: 0xffffff,
            pants: 0x24384b,
            hair: 0x353535,
            female: false,
            bag: false,
            phase: 4.4,
            speed: 0.20,
            rx: 3.95,
            rz: 3.95,
            direction: 1
        },

        {
            name: 'OfficeWorker02',
            shirt: 0xf6b94e,
            pants: 0x475569,
            hair: 0x382c25,
            female: true,
            bag: false,
            phase: 5.5,
            speed: 0.20,
            rx: 3.95,
            rz: 3.95,
            direction: 1
        }

    ]

    // ==================================
    // 02 建立 Q版人物
    // ==================================

    function createPerson(config) {

        const person = new THREE.Group()

        person.name = config.name

        const skin = 0xffd3ad

        // 身體

        box(
            person,
            0.62, 0.78, 0.38,
            config.shirt,
            0, 1.12, 0
        )

        // 頸部

        sphere(
            person,
            0.13, skin,
            0, 1.58, 0
        )

        // Q版大頭

        sphere(
            person,
            0.39, skin,
            0, 1.94, 0
        )

        // 頭髮

        const hair = sphere(
            person,
            0.405,
            config.hair,
            0, 2.09, -0.045
        )

        hair.scale.set(1, 0.58, 1)

        // 女性長髮

        if (config.female) {

            for (const side of [-1, 1]) {

                const strand = sphere(
                    person,
                    0.21,
                    config.hair,
                    side * 0.31,
                    1.83,
                    -0.13
                )

                strand.scale.set(
                    0.65, 1.65, 0.85
                )
            }
        }

        // 眼睛

        for (const side of [-1, 1]) {

            sphere(
                person,
                0.045, 0x292929,
                side * 0.135,
                1.96, 0.357
            )

            sphere(
                person,
                0.016, 0xffffff,
                side * 0.135 - 0.012,
                1.975, 0.394
            )
        }

        // 微笑

        box(
            person,
            0.12, 0.035, 0.035,
            0xad6657,
            0, 1.8, 0.36
        )

        // 雙臂

        const arms = []

        for (const side of [-1, 1]) {

            const arm = new THREE.Group()

            arm.position.set(
                side * 0.39,
                1.43,
                0
            )

            box(
                arm,
                0.2, 0.28, 0.22,
                config.shirt,
                0, -0.1, 0
            )

            box(
                arm,
                0.16, 0.39, 0.18,
                skin,
                0, -0.39, 0
            )

            sphere(
                arm,
                0.105, skin,
                0, -0.59, 0
            )

            person.add(arm)
            arms.push(arm)
        }

        // 雙腳

        const legs = []

        for (const side of [-1, 1]) {

            const leg = new THREE.Group()

            leg.position.set(
                side * 0.16,
                0.76,
                0
            )

            box(
                leg,
                0.25, 0.57, 0.27,
                config.pants,
                0, -0.29, 0
            )

            box(
                leg,
                0.28, 0.18, 0.42,
                0x293746,
                0, -0.67, 0.08
            )

            person.add(leg)
            legs.push(leg)
        }

        // 學生背包

        if (config.bag) {

            box(
                person,
                0.46, 0.56, 0.28,
                0xe7a94c,
                0, 1.15, -0.29
            )

            for (const side of [-1, 1]) {

                box(
                    person,
                    0.075, 0.58, 0.05,
                    0x70502c,
                    side * 0.2,
                    1.15, 0.22
                )
            }
        }

        person.scale.setScalar(0.72)

        group.add(person)

        return {
            person,
            config,
            arms,
            legs
        }
    }

    const people = configs.map(createPerson)

    // ==================================
    // 03 廣場行走動畫
    // ==================================

    function update(time) {

        // V8.1.5.2 安全行走區域
        // 避開橋梁、噴水池、座椅及路燈

        const routes = [

            { x: -4.65, z: 10.8 },
            { x:  4.65, z: 10.8 },
            { x: -4.65, z: 12.5 },
            { x:  4.65, z: 12.5 },
            { x: -4.65, z: 14.2 },
            { x:  4.65, z: 14.2 }

        ]

        people.forEach((item, index) => {

            const {
                person,
                config,
                arms,
                legs
            } = item

            const route = routes[index]

            const phase =
                time * 0.85 + config.phase

            // 小範圍獨立行走

            const x =
                route.x
                + Math.sin(phase) * 0.30

            const z =
                route.z
                + Math.cos(phase) * 0.55

            // 對應行走方向

            const dx =
                Math.cos(phase) * 0.30

            const dz =
                -Math.sin(phase) * 0.55

            person.rotation.y =
                Math.atan2(dx, dz)

            const walk =
                time * 6 + config.phase

            person.position.set(

                x,

                0.21
                + Math.abs(Math.sin(walk)) * 0.025,

                z

            )

            legs[0].rotation.x =
                Math.sin(walk) * 0.28

            legs[1].rotation.x =
                -Math.sin(walk) * 0.28

            arms[0].rotation.x =
                -Math.sin(walk) * 0.24

            arms[1].rotation.x =
                Math.sin(walk) * 0.24
        })
    }


    // ==================================
    // 04 沿用現有渲染迴圈
    // ==================================

    const start = performance.now()

    const animationDriver = new THREE.Mesh(
        new THREE.BoxGeometry(0.001, 0.001, 0.001),
        new THREE.MeshBasicMaterial({
            colorWrite: false,
            depthWrite: false
        })
    )

    animationDriver.frustumCulled = false

    animationDriver.onBeforeRender = () => {

        update(
            (performance.now() - start) / 1000
        )
    }

    group.add(animationDriver)

    update(0)

    // ==================================
    // 05 互動識別資料
    // ==================================

    group.traverse(object => {

        object.userData.islandId = 'central'

        object.userData.islandConfig =
            island.config
    })

    return group
}



