import * as THREE from 'three'

// SkillIsland V8.8.0
// AI 智慧代理總部建築升級

export function createAgentHeadquarters(island) {

    if (!island?.group) return

    const building = island.building ||
        island.group.getObjectByName('Building_agent')

    if (!building) {

        console.warn('[V8.8.0] 找不到智慧代理主建築')

        return

    }

    const name = 'AgentHeadquarters_V880'

    const existing = building.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    building.add(group)

    const colors = {

        dark: 0x163447,

        teal: 0x0097a7,

        cyan: 0x00e5ff,

        white: 0xf4fdff,

        gold: 0xffc107,

        orange: 0xff7043,

        purple: 0xa855f7,

        green: 0x39e58c

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

        glow = false

    ) {

        const mesh = new THREE.Mesh(

            new THREE.CylinderGeometry(

                rt, rb, h, 40

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

                10,

                64

            ),

            material(color, true)

        )

        parent.add(mesh)

        return mesh

    }

    // ==================================
    // 01 智慧總部科技底座
    // ==================================

    const base = new THREE.Group()

    base.name = 'AgentTechnologyBase'

    group.add(base)

    cylinder(

        base,

        6.7, 7.0, 0.22,

        0, 0.15, 0,

        colors.dark

    )

    const baseRing = ring(

        base,

        6.5,

        0.075,

        colors.cyan

    )

    baseRing.rotation.x = Math.PI / 2

    baseRing.position.y = 0.3

    const baseRing2 = ring(

        base,

        6.85,

        0.055,

        colors.gold

    )

    baseRing2.rotation.x = Math.PI / 2

    baseRing2.position.y = 0.23

    // ==================================
    // 02 底座環形科技燈
    // ==================================

    const baseLights = []

    const lightGeometry =

        new THREE.BoxGeometry(

            0.35, 0.1, 0.18

        )

    for (let i = 0; i < 32; i++) {

        const angle =

            i / 32 * Math.PI * 2

        const light = new THREE.Mesh(

            lightGeometry,

            new THREE.MeshBasicMaterial({

                color: colors.cyan,

                toneMapped: false

            })

        )

        light.position.set(

            Math.cos(angle) * 6.65,

            0.32,

            Math.sin(angle) * 6.65

        )

        light.rotation.y =

            -angle + Math.PI / 2

        base.add(light)

        baseLights.push(light)

    }

    // ==================================
    // 03 巨型智慧能量核心
    // ==================================

    const coreGroup = new THREE.Group()

    coreGroup.name = 'AgentIntelligenceCore'

    // 依既有機器人胸前位置配置

    coreGroup.position.set(

        0,

        6.2,

        3.15

    )

    group.add(coreGroup)

    const coreBase = cylinder(

        coreGroup,

        1.55, 1.55, 0.35,

        0, 0, 0,

        colors.dark

    )

    coreBase.rotation.x = Math.PI / 2

    const coreFrame = ring(

        coreGroup,

        1.4,

        0.12,

        colors.cyan

    )

    coreFrame.position.z = 0.22

    const goldFrame = ring(

        coreGroup,

        1.15,

        0.075,

        colors.gold

    )

    goldFrame.position.z = 0.28

    const core = new THREE.Mesh(

        new THREE.IcosahedronGeometry(

            0.78, 1

        ),

        new THREE.MeshStandardMaterial({

            color: colors.cyan,

            emissive: colors.cyan,

            emissiveIntensity: 0.8,

            metalness: 0.3,

            roughness: 0.25

        })

    )

    core.position.z = 0.6

    coreGroup.add(core)

    const coreOrbit1 = ring(

        coreGroup,

        1.05,

        0.065,

        colors.purple

    )

    coreOrbit1.position.z = 0.6

    const coreOrbit2 = ring(

        coreGroup,

        1.05,

        0.065,

        colors.green

    )

    coreOrbit2.position.z = 0.6

    coreOrbit2.rotation.y = Math.PI / 2

    // ==================================
    // 04 胸前智慧運算節點
    // ==================================

    const coreNodes = []

    for (let i = 0; i < 8; i++) {

        const angle =

            i / 8 * Math.PI * 2

        const node = new THREE.Mesh(

            new THREE.SphereGeometry(

                0.13, 10, 8

            ),

            material(

                i % 2 === 0

                    ? colors.gold

                    : colors.white,

                true

            )

        )

        node.position.set(

            Math.cos(angle) * 1.38,

            Math.sin(angle) * 1.38,

            0.4

        )

        coreGroup.add(node)

        coreNodes.push(node)

    }

    // ==================================
    // 05 機械肩部科技裝甲
    // ==================================

    for (const side of [-1, 1]) {

        const shoulder = new THREE.Group()

        shoulder.position.set(

            side * 4.1,

            9.4,

            0

        )

        group.add(shoulder)

        box(

            shoulder,

            1.8, 0.38, 1.9,

            0, 0.3, 0,

            colors.white

        )

        box(

            shoulder,

            1.85, 0.13, 1.95,

            0, 0.08, 0,

            colors.gold,

            true

        )

        box(

            shoulder,

            1.5, 0.12, 1.5,

            0, 0.55, 0,

            colors.teal

        )

        for (let i = 0; i < 3; i++) {

            box(

                shoulder,

                0.22, 0.15, 0.08,

                -0.45 + i * 0.45,

                0.31,

                0.98,

                [

                    colors.cyan,

                    colors.green,

                    colors.orange

                ][i],

                true

            )

        }

    }

    // ==================================
    // 06 頭部天線訊號傳輸
    // ==================================

    const antenna = new THREE.Group()

    antenna.name = 'AgentSignalAntenna'

    antenna.position.set(

        0, 12.9, 0

    )

    group.add(antenna)

    const antennaRings = []

    for (let i = 0; i < 3; i++) {

        const pulseMaterial =

            new THREE.MeshBasicMaterial({

                color: [

                    colors.cyan,

                    colors.gold,

                    colors.purple

                ][i],

                transparent: true,

                opacity: 0.8,

                depthWrite: false,

                toneMapped: false

            })

        const pulse = new THREE.Mesh(

            new THREE.TorusGeometry(

                0.8, 0.055, 8, 48

            ),

            pulseMaterial

        )

        pulse.rotation.x = Math.PI / 2

        antenna.add(pulse)

        antennaRings.push(pulse)

    }

    // ==================================
    // 07 智慧代理總部入口看板
    // ==================================

    const canvas = document.createElement('canvas')

    canvas.width = 1024

    canvas.height = 256

    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(

        0, 0, 1024, 256

    )

    gradient.addColorStop(0, '#092b36')

    gradient.addColorStop(1, '#006b78')

    ctx.fillStyle = gradient

    ctx.fillRect(0, 0, 1024, 256)

    ctx.strokeStyle = '#00e5ff'

    ctx.lineWidth = 12

    ctx.strokeRect(6, 6, 1012, 244)

    ctx.textAlign = 'center'

    ctx.fillStyle = '#ffffff'

    ctx.font = 'bold 88px Microsoft JhengHei'

    ctx.fillText(

        '智慧代理控制中心',

        512, 113

    )

    ctx.fillStyle = '#67e8f9'

    ctx.font = '36px Arial'

    ctx.fillText(

        'AI AGENT HEADQUARTERS',

        512, 177

    )

    ctx.fillStyle = '#fbbf24'

    ctx.font = '24px Microsoft JhengHei'

    ctx.fillText(

        '任務規劃・智慧協作・自動執行',

        512, 224

    )

    const texture =

        new THREE.CanvasTexture(canvas)

    texture.colorSpace = THREE.SRGBColorSpace

    const signGroup = new THREE.Group()

    signGroup.name = 'AgentHeadquartersSign'

    signGroup.position.set(

        0, 2.2, 4.15

    )

    group.add(signGroup)

    box(

        signGroup,

        6.6, 1.75, 0.28,

        0, 0, 0,

        colors.dark

    )

    const sign = new THREE.Mesh(

        new THREE.PlaneGeometry(

            6.4, 1.6

        ),

        new THREE.MeshBasicMaterial({

            map: texture,

            toneMapped: false

        })

    )

    sign.position.z = 0.151

    signGroup.add(sign)

    for (const side of [-1, 1]) {

        box(

            signGroup,

            0.18, 1.35, 0.22,

            side * 2.9,

            -1.4,

            0,

            colors.teal

        )

    }

    // ==================================
    // 08 入口科技光柱
    // ==================================

    const entranceLights = []

    for (const side of [-1, 1]) {

        const pillar = new THREE.Group()

        pillar.position.set(

            side * 4.2,

            0.3,

            4.3

        )

        group.add(pillar)

        cylinder(

            pillar,

            0.46, 0.6, 0.25,

            0, 0.125, 0,

            colors.dark

        )

        box(

            pillar,

            0.42, 2.6, 0.42,

            0, 1.55, 0,

            colors.teal

        )

        const light = box(

            pillar,

            0.18, 2.3, 0.06,

            0, 1.55, 0.24,

            colors.cyan,

            true

        )

        const top = new THREE.Mesh(

            new THREE.OctahedronGeometry(

                0.34

            ),

            material(colors.gold, true)

        )

        top.position.y = 3.05

        pillar.add(top)

        entranceLights.push({

            light,

            top

        })

    }

    // ==================================
    // 09 動態智慧核心
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    const cyanColor = new THREE.Color(

        colors.cyan

    )

    const goldColor = new THREE.Color(

        colors.gold

    )

    function update() {

        const time =

            (performance.now() - start) / 1000

        // 智慧核心旋轉

        core.rotation.x = time * 0.45

        core.rotation.y = time * 0.75

        core.scale.setScalar(

            1 + Math.sin(time * 2) * 0.08

        )

        core.material.emissiveIntensity =

            0.65 +

            (Math.sin(time * 2) + 1) * 0.35

        coreOrbit1.rotation.x = time * 0.75

        coreOrbit1.rotation.y = time * 0.45

        coreOrbit2.rotation.x = -time * 0.55

        coreOrbit2.rotation.y =

            Math.PI / 2 + time * 0.7

        // 胸前核心運算節點

        coreNodes.forEach((node, i) => {

            const angle =

                i / 8 * Math.PI * 2 +

                time * 0.6

            node.position.x =

                Math.cos(angle) * 1.38

            node.position.y =

                Math.sin(angle) * 1.38

            node.scale.setScalar(

                0.8 +

                (Math.sin(time * 4 + i) + 1)

                * 0.3

            )

        })

        // 頭部天線向外傳送訊號

        antennaRings.forEach((pulse, i) => {

            const p =

                (time * 0.6 + i / 3) % 1

            const scale =

                0.45 + p * 2.1

            pulse.scale.set(

                scale,

                scale,

                1

            )

            pulse.position.y =

                0.2 + p * 1.9

            pulse.material.opacity =

                (1 - p) * 0.85

        })

        // 底座循環資料燈

        baseLights.forEach((light, i) => {

            const wave =

                (Math.sin(time * 4 - i * 0.4) + 1)

                / 2

            light.material.color

                .copy(cyanColor)

                .lerp(goldColor, wave)

        })

        // 入口科技光柱

        entranceLights.forEach((item, i) => {

            item.top.rotation.y =

                time * 1.2 + i

            item.top.position.y =

                3.05 +

                Math.sin(time * 2 + i) * 0.12

        })

    }

    // ==================================
    // 10 沿用既有渲染流程
    // ==================================

    core.onBeforeRender = function(renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    update()

    console.log(

        'SkillIsland V8.8.0 智慧代理總部建築升級完成'

    )

    return group

}
