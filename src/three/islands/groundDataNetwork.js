import * as THREE from 'three'

// SkillIsland V8.7.4
// 地面動態數據傳輸網路

export function createGroundDataNetwork(island) {

    if (!island?.group) return

    const name = 'GroundDataNetwork_V874'

    const existing =
        island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    island.group.add(group)

    group.position.y = island.groundY + 0.12

    const colors = {

        cyan: 0x00e5ff,

        gold: 0xffc107,

        purple: 0xd946ef,

        green: 0x00e676,

        blue: 0x448aff,

        white: 0xffffff

    }

    const dark = new THREE.MeshStandardMaterial({

        color: 0x17304d,

        roughness: 0.65,

        metalness: 0.25

    })

    const materials = new Map()

    function glowMaterial(color) {

        if (!materials.has(color)) {

            materials.set(

                color,

                new THREE.MeshBasicMaterial({

                    color,

                    toneMapped: false

                })

            )

        }

        return materials.get(color)

    }

    const routes = []

    const stations = []

    const pulseRings = []

    const worldPosition = new THREE.Vector3()

    // ==================================
    // 01 取得現有設施實際座標
    // ==================================

    function getLocalPosition(objectName) {

        const object =
            island.group.getObjectByName(objectName)

        if (!object) return null

        object.getWorldPosition(worldPosition)

        const local = island.group.worldToLocal(

            worldPosition.clone()

        )

        return new THREE.Vector3(

            local.x,

            0.18,

            local.z

        )

    }

    // ==================================
    // 02 地面傳輸線路
    // ==================================

    function createRoute(points, color, width = 0.28) {

        if (points.length < 2) return

        const vectors = points.map(point => {

            return new THREE.Vector3(

                point[0],

                0.18,

                point[1]

            )

        })

        const curve = new THREE.CurvePath()

        for (let i = 0; i < vectors.length - 1; i++) {

            const start = vectors[i]

            const end = vectors[i + 1]

            if (start.distanceTo(end) < 0.001) continue

            curve.add(

                new THREE.LineCurve3(start, end)

            )

            const direction =

                new THREE.Vector3()

                    .subVectors(end, start)

            const length = direction.length()

            const center =

                start.clone().add(end)

                    .multiplyScalar(0.5)

            // 深色底部傳輸槽

            const base = new THREE.Mesh(

                new THREE.BoxGeometry(

                    width + 0.22,

                    0.12,

                    length

                ),

                dark

            )

            base.position.copy(center)

            base.position.y = 0.07

            base.rotation.y = Math.atan2(

                direction.x,

                direction.z

            )

            group.add(base)

            // 彩色發光傳輸線

            const strip = new THREE.Mesh(

                new THREE.BoxGeometry(

                    width,

                    0.07,

                    length

                ),

                glowMaterial(color)

            )

            strip.position.copy(center)

            strip.rotation.y = base.rotation.y

            group.add(strip)

        }

        if (curve.curves.length === 0) return

        routes.push({

            curve,

            color,

            length: curve.getLength()

        })

    }

    // ==================================
    // 03 科技數據中繼站
    // ==================================

    function createStation(x, z, color) {

        const station = new THREE.Group()

        station.position.set(x, 0.1, z)

        group.add(station)

        const base = new THREE.Mesh(

            new THREE.CylinderGeometry(

                0.72,

                0.82,

                0.24,

                8

            ),

            dark

        )

        station.add(base)

        const ring = new THREE.Mesh(

            new THREE.TorusGeometry(

                0.6,

                0.07,

                8,

                40

            ),

            glowMaterial(color)

        )

        ring.rotation.x = Math.PI / 2

        ring.position.y = 0.16

        station.add(ring)

        const coreMaterial =

            new THREE.MeshBasicMaterial({

                color,

                transparent: true,

                opacity: 0.95,

                toneMapped: false

            })

        const core = new THREE.Mesh(

            new THREE.OctahedronGeometry(

                0.32

            ),

            coreMaterial

        )

        core.position.y = 0.62

        station.add(core)

        stations.push({

            core,

            material: coreMaterial,

            phase: stations.length * 0.7

        })

        // 中繼站擴散脈衝環

        const pulseMaterial =

            new THREE.MeshBasicMaterial({

                color,

                transparent: true,

                opacity: 0.7,

                depthWrite: false,

                toneMapped: false

            })

        const pulse = new THREE.Mesh(

            new THREE.TorusGeometry(

                0.72,

                0.035,

                8,

                40

            ),

            pulseMaterial

        )

        pulse.rotation.x = Math.PI / 2

        pulse.position.y = 0.18

        station.add(pulse)

        pulseRings.push({

            mesh: pulse,

            material: pulseMaterial,

            phase: pulseRings.length * 0.22

        })

    }

    // ==================================
    // 04 取得四大展示設施
    // ==================================

    const facilities = [

        {

            name: 'HolographicEarth_V870',

            color: colors.cyan

        },

        {

            name: 'GiantDataChart_V871',

            color: colors.gold

        },

        {

            name: 'CurvedDataWall_V873',

            color: colors.purple

        },

        {

            name: 'OutdoorBusinessIntelligence_V862',

            color: colors.green

        }

    ]

    // ==================================
    // 05 外圍環形數據傳輸網路
    // ==================================

    const networkRadius = 8.4

    const segments = 48

    const ringPoints = []

    for (let i = 0; i <= segments; i++) {

        const angle =

            i / segments * Math.PI * 2

        ringPoints.push([

            Math.cos(angle) * networkRadius,

            Math.sin(angle) * networkRadius

        ])

    }

    createRoute(

        ringPoints,

        colors.blue,

        0.22

    )

    // ==================================
    // 06 建立四大設施連接路線
    // ==================================

    facilities.forEach(facility => {

        const target =

            getLocalPosition(facility.name)

        if (!target) {

            console.warn(

                '[V8.7.4] 找不到設施：',

                facility.name

            )

            return

        }

        const angle = Math.atan2(

            target.z,

            target.x

        )

        const dx = Math.cos(angle)

        const dz = Math.sin(angle)

        // 環形主網路連接位置

        const ringX = dx * networkRadius

        const ringZ = dz * networkRadius

        // 主建築外圍連接位置

        const innerX = dx * 6.8

        const innerZ = dz * 5.2

        // 設施內側連接位置

        const distance = Math.hypot(

            target.x,

            target.z

        )

        const endDistance =

            Math.max(

                networkRadius + 0.8,

                distance - 2.2

            )

        const endX = dx * endDistance

        const endZ = dz * endDistance

        createRoute(

            [

                [innerX, innerZ],

                [ringX, ringZ],

                [endX, endZ]

            ],

            facility.color,

            0.34

        )

        createStation(

            ringX,

            ringZ,

            facility.color

        )

        console.log(

            '[V8.7.4] 數據路線建立：',

            facility.name

        )

    })

    // ==================================
    // 07 外圍四座附加中繼站
    // ==================================

    for (let i = 0; i < 4; i++) {

        const angle =

            Math.PI / 4 +

            i * Math.PI / 2

        createStation(

            Math.cos(angle) * networkRadius,

            Math.sin(angle) * networkRadius,

            colors.blue

        )

    }

    // ==================================
    // 08 批次建立移動數據光點
    // ==================================

    const packets = []

    routes.forEach((route, routeIndex) => {

        const count = Math.max(

            4,

            Math.ceil(route.length * 1.15)

        )

        for (let i = 0; i < count; i++) {

            packets.push({

                route,

                phase: i / count,

                speed: i % 2 === 0 ? 2.8 : -2.2,

                color: i % 3 === 0

                    ? colors.white

                    : route.color,

                routeIndex

            })

        }

    })

    const packetGeometry =

        new THREE.SphereGeometry(

            0.15,

            8,

            6

        )

    const packetMaterial =

        new THREE.MeshBasicMaterial({

            color: 0xffffff,

            toneMapped: false

        })

    const packetMesh = new THREE.InstancedMesh(

        packetGeometry,

        packetMaterial,

        packets.length

    )

    packetMesh.name = 'MovingDataPackets'

    packetMesh.frustumCulled = false

    packetMesh.instanceMatrix.setUsage(

        THREE.DynamicDrawUsage

    )

    group.add(packetMesh)

    const dummy = new THREE.Object3D()

    const packetColor = new THREE.Color()

    packets.forEach((packet, i) => {

        packetColor.setHex(packet.color)

        packetMesh.setColorAt(

            i,

            packetColor

        )

    })

    if (packetMesh.instanceColor) {

        packetMesh.instanceColor.needsUpdate = true

    }

    // ==================================
    // 09 地面動態掃描效果
    // ==================================

    const scanMaterial =

        new THREE.MeshBasicMaterial({

            color: colors.cyan,

            transparent: true,

            opacity: 0.4,

            depthWrite: false,

            toneMapped: false

        })

    const groundScan = new THREE.Mesh(

        new THREE.TorusGeometry(

            networkRadius,

            0.07,

            8,

            96

        ),

        scanMaterial

    )

    groundScan.rotation.x = Math.PI / 2

    groundScan.position.y = 0.23

    group.add(groundScan)

    // ==================================
    // 10 動態數據傳輸
    // ==================================

    const startTime = performance.now()

    let lastFrame = -1

    function update() {

        const time =

            (performance.now() - startTime) / 1000

        // 雙向移動數據光點

        packets.forEach((packet, i) => {

            const progress =

                packet.phase +

                time * packet.speed /

                Math.max(packet.route.length, 1)

            const u =

                ((progress % 1) + 1) % 1

            const point =

                packet.route.curve.getPointAt(u)

            dummy.position.copy(point)

            dummy.position.y =

                0.32 +

                Math.sin(time * 4 + i) * 0.04

            const size =

                0.85 +

                (Math.sin(time * 5 + i) + 1) * 0.3

            dummy.scale.setScalar(size)

            dummy.updateMatrix()

            packetMesh.setMatrixAt(

                i,

                dummy.matrix

            )

        })

        packetMesh.instanceMatrix.needsUpdate = true

        // 中繼站核心旋轉與懸浮

        stations.forEach(station => {

            station.core.rotation.y =

                time * 1.8 + station.phase

            station.core.position.y =

                0.62 +

                Math.sin(time * 2.5 + station.phase)

                * 0.12

            station.material.opacity =

                0.75 +

                (Math.sin(time * 3 + station.phase) + 1)

                * 0.12

        })

        // 中繼站脈衝向外擴散

        pulseRings.forEach(item => {

            const p =

                (time * 0.8 + item.phase) % 1

            const scale =

                1 + p * 1.1

            item.mesh.scale.set(

                scale,

                scale,

                1

            )

            item.material.opacity =

                (1 - p) * 0.7

        })

        // 全島環形掃描脈衝

        const pulse =

            (time * 0.4) % 1

        const scale =

            0.94 + pulse * 0.16

        groundScan.scale.set(

            scale,

            scale,

            1

        )

        scanMaterial.opacity =

            (1 - pulse) * 0.55

    }

    // ==================================
    // 11 掛載既有渲染流程
    // ==================================

    packetMesh.onBeforeRender = function(renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    update()

    console.log(

        'SkillIsland V8.7.4 地面動態數據傳輸網路建立完成',

        {

            routes: routes.length,

            packets: packets.length,

            stations: stations.length

        }

    )

    return group

}
