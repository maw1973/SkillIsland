import * as THREE from 'three'

// SkillIsland V8.7.6
// 數據分析島整體景觀最佳化

export function createAnalyticsLandscape(island) {

    if (!island?.group) return

    const name = 'AnalyticsLandscape_V876'

    const existing =
        island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    group.position.y = island.groundY

    island.group.add(group)

    const materials = new Map()

    function material(color, glow = false) {

        const key = `${color}_${glow}`

        if (!materials.has(key)) {

            materials.set(
                key,
                new THREE.MeshStandardMaterial({

                    color,

                    roughness: 0.65,

                    metalness: glow ? 0.2 : 0.05,

                    emissive: glow ? color : 0x000000,

                    emissiveIntensity: glow ? 0.8 : 0

                })
            )

        }

        return materials.get(key)

    }

    const boxGeometry =
        new THREE.BoxGeometry(1, 1, 1)

    const sphereGeometry =
        new THREE.IcosahedronGeometry(1, 1)

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

        mesh.receiveShadow = true

        mesh.castShadow = true

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
                rt, rb, h, 12
            ),

            material(color, glow)

        )

        mesh.position.set(x, y, z)

        mesh.receiveShadow = true

        mesh.castShadow = true

        parent.add(mesh)

        return mesh

    }

    function sphere(
        parent,
        sx, sy, sz,
        x, y, z,
        color
    ) {

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

    const colors = {

        dark: 0x173451,

        cyan: 0x00d9ff,

        gold: 0xffc107,

        purple: 0xa855f7,

        green: 0x00c896,

        stone: 0xcbd5e1,

        soil: 0x70513b,

        wood: 0xc88a4c

    }

    // ==================================
    // 01 安全區域
    // ==================================

    const islandRadius = Number(
        island.config?.radius
    ) || 19

    const safeRadius = Math.min(
        12,
        islandRadius - 4
    )

    const buildingAngle =
        island.building?.rotation.y || 0

    // ==================================
    // 02 科技景觀鋪面
    // ==================================

    function createLandscapePad(
        parent,
        accent
    ) {

        cylinder(
            parent,
            1.65, 1.7, 0.12,
            0, 0.065, 0,
            colors.dark
        )

        cylinder(
            parent,
            1.52, 1.52, 0.06,
            0, 0.15, 0,
            colors.stone
        )

        const ring = new THREE.Mesh(

            new THREE.TorusGeometry(
                1.53, 0.045, 8, 48
            ),

            material(accent, true)

        )

        ring.rotation.x = Math.PI / 2

        ring.position.y = 0.19

        parent.add(ring)

    }

    // ==================================
    // 03 科技花圃
    // ==================================

    function createPlanter(
        parent,
        x,
        z,
        accent
    ) {

        const planter = new THREE.Group()

        planter.position.set(x, 0.18, z)

        parent.add(planter)

        cylinder(
            planter,
            0.58, 0.48, 0.48,
            0, 0.24, 0,
            colors.dark
        )

        cylinder(
            planter,
            0.59, 0.59, 0.075,
            0, 0.49, 0,
            accent,
            true
        )

        cylinder(
            planter,
            0.46, 0.46, 0.055,
            0, 0.53, 0,
            colors.soil
        )

        // 彩色低矮植栽

        const foliage = [

            0x4ade80,
            0x22c55e,
            0x16a34a,
            0x86efac,
            0x65a30d

        ]

        for (let i = 0; i < 5; i++) {

            const angle =
                i / 5 * Math.PI * 2

            sphere(
                planter,
                0.2, 0.31, 0.2,
                Math.cos(angle) * 0.22,
                0.72,
                Math.sin(angle) * 0.22,
                foliage[i]
            )

        }

        // 彩色花朵

        for (let i = 0; i < 5; i++) {

            const angle =
                i / 5 * Math.PI * 2

            sphere(
                planter,
                0.105, 0.105, 0.105,
                Math.cos(angle) * 0.24,
                1.02,
                Math.sin(angle) * 0.24,
                i % 2 === 0
                    ? 0xff70a6
                    : 0xffd54f
            )

        }

    }

    // ==================================
    // 04 科技休息長椅
    // ==================================

    function createBench(
        parent,
        x,
        z,
        rotation,
        accent
    ) {

        const bench = new THREE.Group()

        bench.position.set(x, 0.18, z)

        bench.rotation.y = rotation

        parent.add(bench)

        for (const side of [-1, 1]) {

            box(
                bench,
                0.16, 0.48, 0.52,
                side * 0.65,
                0.24,
                0,
                colors.dark
            )

        }

        // 木質椅面

        for (let i = 0; i < 3; i++) {

            box(
                bench,
                1.65, 0.09, 0.15,
                0,
                0.51,
                -0.18 + i * 0.18,
                colors.wood
            )

        }

        // 椅背

        box(
            bench,
            1.65, 0.35, 0.1,
            0, 0.86, -0.27,
            colors.wood
        )

        // 發光裝飾

        box(
            bench,
            1.62, 0.045, 0.045,
            0, 0.47, 0.28,
            accent,
            true
        )

    }

    // ==================================
    // 05 科技藝術雕塑
    // ==================================

    const sculptures = []

    function createSculpture(
        parent,
        accent,
        index
    ) {

        cylinder(
            parent,
            0.48, 0.62, 0.25,
            0, 0.31, 0,
            colors.dark
        )

        cylinder(
            parent,
            0.43, 0.43, 0.09,
            0, 0.47, 0,
            accent,
            true
        )

        const sculpture = new THREE.Group()

        sculpture.position.y = 1.35

        parent.add(sculpture)

        const core = new THREE.Mesh(

            new THREE.OctahedronGeometry(0.42),

            material(accent, true)

        )

        sculpture.add(core)

        const ring1 = new THREE.Mesh(

            new THREE.TorusGeometry(
                0.68, 0.055, 8, 40
            ),

            material(accent, true)

        )

        ring1.rotation.x = Math.PI / 3

        sculpture.add(ring1)

        const ring2 = new THREE.Mesh(

            new THREE.TorusGeometry(
                0.81, 0.04, 8, 40
            ),

            material(colors.gold, true)

        )

        ring2.rotation.y = Math.PI / 3

        sculpture.add(ring2)

        sculptures.push({

            core,

            ring1,

            ring2,

            sculpture,

            phase: index * Math.PI / 2

        })

    }

    // ==================================
    // 06 檢查既有物件的占用空間
    // ==================================

    island.group.updateWorldMatrix(true, true)

    const occupiedNames = [

        'Building_analytics',

        'OutdoorBusinessIntelligence_V862',

        'HolographicEarth_V870',

        'GiantDataChart_V871',

        'CurvedDataWall_V873',

        'AnalyticsPeople_V875',

        'GroundDataNetwork_V874'

    ]

    const occupied = []

    const localInverse =
        island.group.matrixWorld.clone().invert()

    occupiedNames.forEach(name => {

        const object =
            island.group.getObjectByName(name)

        if (!object) return

        // 人物及傳輸網路分別檢查
        // 避免整座島被單一大包圍盒占滿

        const objects = name === 'AnalyticsPeople_V875' ||
            name === 'GroundDataNetwork_V874'
            ? object.children
            : [object]

        objects.forEach(item => {

            const bounds = new THREE.Box3()
                .setFromObject(item)

            if (bounds.isEmpty()) return

            bounds.applyMatrix4(localInverse)

            occupied.push(bounds)

        })

    })

    function canPlace(x, z, radius) {

        if (
            Math.hypot(x, z) + radius >
            safeRadius
        ) return false

        const footprint = new THREE.Box3(

            new THREE.Vector3(
                x - radius,
                island.groundY - 0.1,
                z - radius
            ),

            new THREE.Vector3(
                x + radius,
                island.groundY + 2.5,
                z + radius
            )

        )

        return !occupied.some(bounds =>
            bounds.intersectsBox(footprint)
        )

    }

    // ==================================
    // 07 配置四組景觀區
    // ==================================

    const accents = [

        colors.cyan,

        colors.gold,

        colors.purple,

        colors.green

    ]

    let createdCount = 0

    for (let i = 0; i < 4; i++) {

        const baseAngle =
            Math.PI / 4 +
            i * Math.PI / 2 +
            buildingAngle

        const candidates = []

        for (const radius of [9.8, 10.1, 9.2]) {

            for (const shift of [0, 0.15, -0.15, 0.3, -0.3]) {

                const angle = baseAngle + shift

                candidates.push({

                    x: Math.cos(angle) * radius,

                    z: Math.sin(angle) * radius

                })

            }

        }

        const position = candidates.find(p =>
            canPlace(p.x, p.z, 1.75)
        )

        if (!position) {

            console.warn(
                '[V8.7.6] 景觀區空間不足，略過：',
                i + 1
            )

            continue

        }

        const zone = new THREE.Group()

        zone.name = `AnalyticsLandscapeZone_${i}`

        zone.position.set(
            position.x,
            0,
            position.z
        )

        zone.rotation.y = Math.atan2(
            -position.x,
            -position.z
        )

        group.add(zone)

        const accent = accents[i]

        createLandscapePad(
            zone,
            accent
        )

        createSculpture(
            zone,
            accent,
            i
        )

        createPlanter(
            zone,
            -0.95,
            -0.65,
            accent
        )

        createPlanter(
            zone,
            0.95,
            -0.65,
            accent
        )

        createBench(
            zone,
            0,
            1.0,
            Math.PI,
            accent
        )

        occupied.push(
            new THREE.Box3(
                new THREE.Vector3(
                    position.x - 1.75,
                    island.groundY,
                    position.z - 1.75
                ),
                new THREE.Vector3(
                    position.x + 1.75,
                    island.groundY + 2.5,
                    position.z + 1.75
                )
            )
        )

        createdCount++

    }

    // ==================================
    // 08 科技雕塑動畫
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    function update() {

        const time =
            (performance.now() - start) / 1000

        sculptures.forEach(item => {

            const t = time + item.phase

            item.sculpture.position.y =
                1.35 + Math.sin(t * 1.5) * 0.12

            item.core.rotation.y =
                t * 0.8

            item.core.rotation.z =
                t * 0.3

            item.ring1.rotation.y =
                t * 0.55

            item.ring2.rotation.x =
                -t * 0.65

        })

    }

    sculptures.forEach(item => {

        item.core.onBeforeRender =
            function(renderer) {

                const frame =
                    renderer.info.render.frame

                if (frame === lastFrame) return

                lastFrame = frame

                update()

            }

    })

    update()

    console.log(

        'SkillIsland V8.7.6 數據分析島景觀最佳化完成',

        {

            zones: createdCount,

            sculptures: sculptures.length

        }

    )

    return group

}
