import * as THREE from 'three'

// SkillIsland V8.8.6
// 智慧代理島整體景觀整合

export function createAgentLandscape(island) {

    if (!island?.group) return

    const name = 'AgentLandscape_V886'

    const existing = island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    island.group.add(group)

    const colors = {
        dark: 0x102b3e,
        white: 0xffffff,
        cyan: 0x00e5ff,
        gold: 0xffc107,
        green: 0x39ff88,
        purple: 0xa855f7
    }

    const agents = [
        { id: 'Search', title: '搜尋', color: 0x2196f3 },
        { id: 'Document', title: '文件', color: 0xff9800 },
        { id: 'Coding', title: '程式', color: 0x9333ea },
        { id: 'Analytics', title: '分析', color: 0x22c55e },
        { id: 'Workflow', title: '執行', color: 0xef4444 }
    ]

    const materials = new Map()

    const animatedLights = []

    const statistics = {
        platforms: 0,
        flags: 0,
        headquarters: 0,
        workflow: 0,
        computingCore: 0,
        collaboration: 0
    }

    const boxGeometry =
        new THREE.BoxGeometry(1, 1, 1)

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
                        metalness: 0.2
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
        y,
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

        mesh.rotation.x = Math.PI / 2

        mesh.position.y = y

        parent.add(mesh)

        return mesh

    }

    // ==================================
    // 01 依照既有設施座標配置景觀
    // ==================================

    function createZone(target, zoneName) {

        if (!target) return null

        target.updateWorldMatrix(true, false)

        group.updateWorldMatrix(true, false)

        const matrix = group.matrixWorld
            .clone()
            .invert()
            .multiply(target.matrixWorld)

        const zone = new THREE.Group()

        zone.name = zoneName

        matrix.decompose(
            zone.position,
            zone.quaternion,
            zone.scale
        )

        group.add(zone)

        return zone

    }

    // ==================================
    // 02 共用動態景觀燈
    // ==================================

    function createLight(
        parent,
        w, h, d,
        x, y, z,
        color,
        phase
    ) {

        const lightMaterial =
            new THREE.MeshBasicMaterial({
                color,
                toneMapped: false
            })

        const mesh = new THREE.Mesh(
            boxGeometry,
            lightMaterial
        )

        mesh.scale.set(w, h, d)

        mesh.position.set(x, y, z)

        parent.add(mesh)

        animatedLights.push({
            mesh,
            material: lightMaterial,
            baseColor: new THREE.Color(color),
            phase
        })

        return mesh

    }

    // ==================================
    // 03 機器人專屬功能旗幟
    // ==================================

    function createFlag(parent, config) {

        const flag = new THREE.Group()

        flag.position.set(
            -1.02,
            0.45,
            -1.05
        )

        parent.add(flag)

        // 旗杆

        box(
            flag,
            0.085, 2.85, 0.085,
            0, 1.425, 0,
            colors.dark
        )

        // 旗杆頂端金色裝飾

        const top = new THREE.Mesh(

            new THREE.SphereGeometry(
                0.12, 10, 8
            ),

            material(colors.gold, true)

        )

        top.position.y = 2.91

        flag.add(top)

        const canvas =
            document.createElement('canvas')

        canvas.width = 384
        canvas.height = 512

        const ctx = canvas.getContext('2d')

        const hex = '#' +
            config.color.toString(16).padStart(6, '0')

        ctx.fillStyle = hex

        ctx.fillRect(0, 0, 384, 512)

        ctx.fillStyle = '#102b3e'

        ctx.fillRect(16, 16, 352, 95)

        ctx.textAlign = 'center'

        ctx.fillStyle = '#ffffff'

        ctx.font = 'bold 58px Arial'

        ctx.fillText('AGENT', 192, 83)

        ctx.font = 'bold 130px Microsoft JhengHei'

        ctx.fillText(
            config.title[0],
            192, 260
        )

        ctx.fillText(
            config.title[1],
            192, 410
        )

        ctx.strokeStyle = '#ffffff'

        ctx.lineWidth = 10

        ctx.strokeRect(7, 7, 370, 498)

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const banner = new THREE.Mesh(

            new THREE.PlaneGeometry(
                0.85, 1.15
            ),

            new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                toneMapped: false
            })

        )

        banner.position.set(
            0.43, 2.13, 0
        )

        flag.add(banner)

        statistics.flags++

    }

    // ==================================
    // 04 五座機器人展示平台美化
    // ==================================

    const exhibition =
        island.group.getObjectByName(
            'AgentRobotExhibition_V881'
        )

    agents.forEach((config, index) => {

        const exhibit =
            exhibition?.getObjectByName(
                `AgentExhibit_${config.id}`
            )

        const zone = createZone(
            exhibit,
            `Landscape_${config.id}`
        )

        if (!zone) return

        // 展示平台外圍彩色燈環

        ring(
            zone,
            1.65, 0.065,
            0.28,
            config.color
        )

        // 金色內環

        ring(
            zone,
            1.28, 0.035,
            0.53,
            colors.gold
        )

        // 12組循環景觀燈

        for (let i = 0; i < 12; i++) {

            const angle =
                i / 12 * Math.PI * 2

            const light = createLight(

                zone,

                0.2, 0.065, 0.14,

                Math.cos(angle) * 1.57,
                0.43,
                Math.sin(angle) * 1.57,

                config.color,

                i * 0.45 + index

            )

            light.rotation.y = -angle

        }

        createFlag(zone, config)

        statistics.platforms++

    })

    // ==================================
    // 05 智慧總部底座科技景觀
    // ==================================

    const headquarters =
        island.group.getObjectByName(
            'AgentHeadquarters_V880'
        )

    const headquartersZone = createZone(
        headquarters,
        'Landscape_Headquarters'
    )

    if (headquartersZone) {

        ring(
            headquartersZone,
            6.92, 0.055,
            0.32,
            colors.gold
        )

        // 總部入口兩側科技裝飾

        for (const side of [-1, 1]) {

            for (let i = 0; i < 4; i++) {

                createLight(

                    headquartersZone,

                    0.52, 0.08, 0.15,

                    side * (1.8 + i * 0.5),
                    0.34,
                    5.1,

                    i % 2 === 0
                        ? colors.cyan
                        : colors.gold,

                    i * 0.6

                )

            }

        }

        statistics.headquarters = 1

    }

    // ==================================
    // 06 自動化產線方向指示燈
    // ==================================

    const workflow =
        island.group.getObjectByName(
            'AgentWorkflow_V883'
        )

    const workflowZone = createZone(
        workflow,
        'Landscape_Workflow'
    )

    if (workflowZone) {

        for (let i = 0; i < 12; i++) {

            const arrow = new THREE.Group()

            arrow.position.set(
                -5.7 + i * 1.02,
                0.49,
                1.73
            )

            workflowZone.add(arrow)

            const a = createLight(
                arrow,
                0.32, 0.065, 0.09,
                0, 0, -0.08,
                colors.cyan,
                -i * 0.5
            )

            const b = createLight(
                arrow,
                0.32, 0.065, 0.09,
                0, 0, 0.08,
                colors.cyan,
                -i * 0.5
            )

            a.rotation.y = -0.65

            b.rotation.y = 0.65

        }

        statistics.workflow = 1

    }

    // ==================================
    // 07 智慧運算中心四角科技柱
    // ==================================

    const computingCore =
        island.group.getObjectByName(
            'AgentComputingCore_V884'
        )

    const computingZone = createZone(
        computingCore,
        'Landscape_ComputingCore'
    )

    if (computingZone) {

        let index = 0

        for (const x of [-2.7, 2.7]) {

            for (const z of [-2.7, 2.7]) {

                const pillar = new THREE.Group()

                pillar.position.set(
                    x, 0.48, z
                )

                computingZone.add(pillar)

                box(
                    pillar,
                    0.48, 0.15, 0.48,
                    0, 0.075, 0,
                    colors.dark
                )

                box(
                    pillar,
                    0.24, 0.85, 0.24,
                    0, 0.5, 0,
                    colors.dark
                )

                createLight(
                    pillar,
                    0.13, 0.62, 0.045,
                    0, 0.52, 0.14,
                    colors.cyan,
                    index
                )

                const crystal = new THREE.Mesh(

                    new THREE.OctahedronGeometry(
                        0.22
                    ),

                    material(colors.gold, true)

                )

                crystal.position.y = 1.05

                pillar.add(crystal)

                index++

            }

        }

        statistics.computingCore = 1

    }

    // ==================================
    // 08 多代理控制中心五色燈帶
    // ==================================

    const controlPlatform =
        island.group.getObjectByName(
            'AgentTaskControlPlatform'
        )

    const controlZone = createZone(
        controlPlatform,
        'Landscape_ControlCenter'
    )

    if (controlZone) {

        // 六角形平台邊緣動態燈帶

        for (let i = 0; i < 30; i++) {

            const angle =
                i / 30 * Math.PI * 2

            const sector =
                Math.floor(i / 6)

            const light = createLight(

                controlZone,

                0.18, 0.08, 0.14,

                Math.cos(angle) * 1.76,
                0.5,
                Math.sin(angle) * 1.76,

                agents[sector].color,

                i * 0.3

            )

            light.rotation.y = -angle

        }

        statistics.collaboration = 1

    }

    // ==================================
    // 09 統一景觀燈光動畫
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    const white =
        new THREE.Color(0xffffff)

    function update() {

        const time =
            (performance.now() - start) / 1000

        animatedLights.forEach(item => {

            const wave =
                Math.pow(
                    (Math.sin(
                        time * 3 - item.phase
                    ) + 1) / 2,
                    3
                )

            item.material.color
                .copy(item.baseColor)
                .lerp(white, wave * 0.85)

        })

    }

    function beforeRender(renderer) {

        const frame =
            renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    animatedLights.forEach(item => {

        item.mesh.onBeforeRender =
            beforeRender

    })

    update()

    console.log(
        '[V8.8.6] 智慧代理島景觀整合完成',
        {
            ...statistics,
            landscapeLights: animatedLights.length
        }
    )

    return group

}
