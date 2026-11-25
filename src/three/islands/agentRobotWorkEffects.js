import * as THREE from 'three'

// SkillIsland V8.8.5.1
// 智慧機器人工作效果強化

export function createAgentRobotWorkEffects(island) {

    if (!island?.group) return

    const exhibition = island.group.getObjectByName(
        'AgentRobotExhibition_V881'
    )

    if (!exhibition) {
        console.warn('[V8.8.5.1] 找不到機器人展示區')
        return
    }

    const name = 'AgentRobotWorkEffects_V8851'

    const existing = exhibition.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    exhibition.add(group)

    const configs = [
        { id: 'Search', color: 0x00bfff },
        { id: 'Document', color: 0xff9800 },
        { id: 'Coding', color: 0xc084fc },
        { id: 'Analytics', color: 0x39ff88 },
        { id: 'Workflow', color: 0xff4757 }
    ]

    const effects = []

    const cubeGeometry =
        new THREE.BoxGeometry(0.85, 0.85, 0.85)

    const edgeGeometry =
        new THREE.EdgesGeometry(cubeGeometry)

    const edgeMaterial =
        new THREE.LineBasicMaterial({
            color: 0xffffff
        })

    const dummy = new THREE.Vector3()

    configs.forEach((config, index) => {

        const exhibit = exhibition.getObjectByName(
            `AgentExhibit_${config.id}`
        )

        if (!exhibit) return

        const robot = exhibit.getObjectByName(
            `AgentRobot_${config.id}`
        )

        if (!robot) return

        const effect = new THREE.Group()

        effect.name = `WorkEffect_${config.id}`

        exhibit.getWorldPosition(dummy)

        group.worldToLocal(dummy)

        effect.position.copy(dummy)

        group.add(effect)

        const glow = new THREE.MeshBasicMaterial({
            color: config.color,
            toneMapped: false
        })

        // 01 機器人上方大型運算光環

        const upperRing = new THREE.Mesh(

            new THREE.TorusGeometry(
                1.25, 0.085, 8, 48
            ),

            glow

        )

        upperRing.rotation.x = Math.PI / 2

        upperRing.position.y = 6.1

        effect.add(upperRing)

        const lowerRing = new THREE.Mesh(

            new THREE.TorusGeometry(
                0.95, 0.065, 8, 48
            ),

            new THREE.MeshBasicMaterial({
                color: 0xffd740,
                toneMapped: false
            })

        )

        lowerRing.rotation.x = Math.PI / 2

        lowerRing.position.y = 5.05

        effect.add(lowerRing)

        // 02 垂直資料傳輸光束

        const beamMaterial =
            new THREE.MeshBasicMaterial({

                color: config.color,
                transparent: true,
                opacity: 0.15,
                depthWrite: false,
                side: THREE.DoubleSide

            })

        const beam = new THREE.Mesh(

            new THREE.CylinderGeometry(
                1.05, 0.55, 2.4,
                24, 1, true
            ),

            beamMaterial

        )

        beam.position.y = 5.85

        effect.add(beam)

        // 03 大型彩色任務方塊

        const cubes = []

        for (let i = 0; i < 3; i++) {

            const cube = new THREE.Mesh(

                cubeGeometry,

                new THREE.MeshStandardMaterial({

                    color: config.color,
                    emissive: config.color,
                    emissiveIntensity: 0.65,
                    metalness: 0.15,
                    roughness: 0.3

                })

            )

            const edges = new THREE.LineSegments(
                edgeGeometry,
                edgeMaterial
            )

            cube.add(edges)

            effect.add(cube)

            cubes.push(cube)

        }

        // 04 外圍大型資料節點

        const nodes = []

        for (let i = 0; i < 6; i++) {

            const node = new THREE.Mesh(

                new THREE.OctahedronGeometry(0.2),

                glow

            )

            effect.add(node)

            nodes.push(node)

        }

        // 05 取得既有機器人手臂

        const arms = robot.children.filter(child =>

            child.isGroup &&

            Math.abs(
                Math.abs(child.position.x) - 0.83
            ) < 0.03 &&

            Math.abs(child.position.y - 2.12) < 0.03

        )

        const chest = robot.children.find(child =>

            child.isMesh &&

            Math.abs(child.position.y - 1.88) < 0.03 &&

            Math.abs(child.position.z - 0.42) < 0.03

        )

        effects.push({

            effect,
            robot,
            upperRing,
            lowerRing,
            beamMaterial,
            cubes,
            nodes,
            arms,
            chest,
            phase: index * 1.1

        })

    })

    // 06 大幅強化工作動畫

    const start = performance.now()

    let lastFrame = -1

    function animateArms(item, time) {

        const t = time + item.phase

        item.arms.forEach(arm => {

            const side = Math.sign(arm.position.x)

            arm.rotation.x =
                -1.2 + Math.sin(t * 2.6 + side) * 0.65

            arm.rotation.z =
                side * (
                    0.55 + Math.sin(t * 1.8) * 0.22
                )

        })

    }

    function update() {

        const time =
            (performance.now() - start) / 1000

        effects.forEach(item => {

            const t = time + item.phase

            // 大型運算光環

            item.upperRing.position.y =
                6.1 + Math.sin(t * 1.5) * 0.3

            const pulse =
                1 + Math.sin(t * 2) * 0.16

            item.upperRing.scale.set(
                pulse, pulse, 1
            )

            item.lowerRing.rotation.z =
                t * 1.2

            // 任務方塊向上傳輸

            item.cubes.forEach((cube, i) => {

                const progress =
                    (t * 0.38 + i / 3) % 1

                const angle =
                    t * 1.5 + i * Math.PI * 2 / 3

                cube.position.set(

                    Math.cos(angle) * 0.72,

                    4.8 + progress * 2.5,

                    Math.sin(angle) * 0.72

                )

                cube.rotation.x = t * 0.8

                cube.rotation.y = t * 1.5 + i

                const scale =
                    0.7 + Math.sin(progress * Math.PI) * 0.4

                cube.scale.setScalar(scale)

            })

            // 彩色資料節點旋轉

            item.nodes.forEach((node, i) => {

                const angle =
                    t * 1.1 + i * Math.PI / 3

                node.position.set(

                    Math.cos(angle) * 1.45,

                    5.8 + Math.sin(angle * 2) * 0.3,

                    Math.sin(angle) * 1.45

                )

                node.rotation.y = t * 2

            })

            item.beamMaterial.opacity =
                0.18 + Math.sin(t * 3) * 0.08

            animateArms(item, time)

            item.effect.updateMatrixWorld(true)

            item.robot.updateMatrixWorld(true)

        })

    }

    function beforeRender(renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    // 07 沿用原本渲染流程
    // 保留原有機器人動畫

    effects.forEach(item => {

        item.upperRing.onBeforeRender = beforeRender

        if (item.chest) {

            const previous = item.chest.onBeforeRender

            item.chest.onBeforeRender = function(...args) {

                previous?.apply(this, args)

                const time =
                    (performance.now() - start) / 1000

                // 原動畫執行後強化工作手勢

                animateArms(item, time)

                item.robot.updateMatrixWorld(true)

            }

        }

    })

    update()

    console.log(

        '[V8.8.5.1] 機器人工作效果強化完成',

        {
            robots: effects.length,
            dataCubes: effects.length * 3,
            neuralNodes: effects.length * 6,
            animatedArms: effects.reduce(
                (sum, item) => sum + item.arms.length,
                0
            )
        }

    )

    return group

}
