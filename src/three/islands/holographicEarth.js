import * as THREE from 'three'

// SkillIsland V8.7.0
// 巨型全息地球分析地標

export function createHolographicEarth(island) {

    if (!island?.group) return

    const name = 'HolographicEarth_V870'

    const existing = island.group.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    island.group.add(group)

    // 島嶼相對位置
    // 日後可依實際畫面調整

    group.position.set(0, island.groundY + 0.5, -11)

    const radius = 4.8

    const centerY = 8

    const materials = {

        dark: new THREE.MeshStandardMaterial({

            color: 0x102344,

            metalness: 0.65,

            roughness: 0.3

        }),

        blue: new THREE.MeshStandardMaterial({

            color: 0x2563eb,

            metalness: 0.4

        }),

        cyan: new THREE.MeshBasicMaterial({

            color: 0x22d3ee

        }),

        green: new THREE.MeshBasicMaterial({

            color: 0x34d399

        }),

        gold: new THREE.MeshBasicMaterial({

            color: 0xfbbf24

        }),

        purple: new THREE.MeshBasicMaterial({

            color: 0xa78bfa

        }),

        white: new THREE.MeshBasicMaterial({

            color: 0xffffff

        })

    }

    function cylinder(

        rt, rb, height,

        y, material,

        parent = group

    ) {

        const mesh = new THREE.Mesh(

            new THREE.CylinderGeometry(

                rt, rb, height, 64

            ),

            material

        )

        mesh.position.y = y

        mesh.castShadow = true

        mesh.receiveShadow = true

        parent.add(mesh)

        return mesh

    }

    function ring(

        r, thickness, material,

        parent = group

    ) {

        const mesh = new THREE.Mesh(

            new THREE.TorusGeometry(

                r, thickness, 12, 96

            ),

            material

        )

        parent.add(mesh)

        return mesh

    }

    // 01 三層科技圓形底座

    cylinder(

        5.6, 5.9, 0.42,

        0.21, materials.dark

    )

    cylinder(

        5.2, 5.5, 0.35,

        0.59, materials.blue

    )

    cylinder(

        4.7, 5.0, 0.4,

        0.96, materials.dark

    )

    const baseRing1 = ring(

        5.3, 0.09, materials.cyan

    )

    baseRing1.rotation.x = Math.PI / 2

    baseRing1.position.y = 0.78

    const baseRing2 = ring(

        4.6, 0.12, materials.gold

    )

    baseRing2.rotation.x = Math.PI / 2

    baseRing2.position.y = 1.2

    // 02 中央全息投影裝置

    cylinder(

        2.3, 3.1, 0.7,

        1.5, materials.blue

    )

    cylinder(

        1.8, 2.3, 0.28,

        1.99, materials.dark

    )

    const projectorRing = ring(

        1.7, 0.13, materials.cyan

    )

    projectorRing.rotation.x = Math.PI / 2

    projectorRing.position.y = 2.16

    // 03 全息投射光束

    const beam = new THREE.Mesh(

        new THREE.CylinderGeometry(

            3.5, 0.8, 4.6, 48,

            1, true

        ),

        new THREE.MeshBasicMaterial({

            color: 0x38bdf8,

            transparent: true,

            opacity: 0.08,

            side: THREE.DoubleSide,

            depthWrite: false,

            blending: THREE.AdditiveBlending

        })

    )

    beam.position.y = 4.46

    group.add(beam)

    // 04 巨型全息地球

    const earthGroup = new THREE.Group()

    earthGroup.name = 'HolographicEarthSphere'

    earthGroup.position.y = centerY

    group.add(earthGroup)

    const globe = new THREE.Mesh(

        new THREE.SphereGeometry(

            radius, 48, 32

        ),

        new THREE.MeshBasicMaterial({

            color: 0x1263c9,

            transparent: true,

            opacity: 0.24,

            depthWrite: false

        })

    )

    earthGroup.add(globe)

    // 05 外層科技光罩

    const atmosphere = new THREE.Mesh(

        new THREE.SphereGeometry(

            radius + 0.13, 48, 32

        ),

        new THREE.MeshBasicMaterial({

            color: 0x22d3ee,

            transparent: true,

            opacity: 0.08,

            side: THREE.BackSide,

            depthWrite: false,

            blending: THREE.AdditiveBlending

        })

    )

    earthGroup.add(atmosphere)

    // 06 地球經緯線

    const gridMaterial = new THREE.LineBasicMaterial({

        color: 0x67e8f9,

        transparent: true,

        opacity: 0.78,

        depthWrite: false

    })

    function createLine(points, material) {

        const geometry =

            new THREE.BufferGeometry()

                .setFromPoints(points)

        const line = new THREE.LineLoop(

            geometry, material

        )

        earthGroup.add(line)

        return line

    }

    // 緯線

    for (

        let latitude = -75;

        latitude <= 75;

        latitude += 15

    ) {

        const lat = THREE.MathUtils.degToRad(

            latitude

        )

        const points = []

        const r = radius * Math.cos(lat)

        const y = radius * Math.sin(lat)

        for (let i = 0; i < 96; i++) {

            const angle =

                i / 96 * Math.PI * 2

            points.push(

                new THREE.Vector3(

                    Math.cos(angle) * r,

                    y,

                    Math.sin(angle) * r

                )

            )

        }

        createLine(points, gridMaterial)

    }

    // 經線

    for (let j = 0; j < 12; j++) {

        const longitude =

            j / 12 * Math.PI

        const points = []

        for (let i = 0; i < 96; i++) {

            const angle =

                i / 96 * Math.PI * 2

            points.push(

                new THREE.Vector3(

                    radius *

                    Math.sin(angle) *

                    Math.cos(longitude),

                    radius * Math.cos(angle),

                    radius *

                    Math.sin(angle) *

                    Math.sin(longitude)

                )

            )

        }

        createLine(points, gridMaterial)

    }

    // 07 全球數據節點

    const nodeGeometry =

        new THREE.SphereGeometry(

            0.12, 10, 8

        )

    const nodes = []

    const goldenAngle =

        Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < 48; i++) {

        const y = 1 - (i + 0.5) / 48 * 2

        const r = Math.sqrt(1 - y * y)

        const theta = goldenAngle * i

        const material = (

            i % 3 === 0

                ? materials.gold

                : i % 3 === 1

                    ? materials.green

                    : materials.white

        )

        const node = new THREE.Mesh(

            nodeGeometry,

            material

        )

        node.position.set(

            Math.cos(theta) * r * radius,

            y * radius,

            Math.sin(theta) * r * radius

        )

        node.position.multiplyScalar(1.015)

        earthGroup.add(node)

        nodes.push(node)

    }

    // 08 全球數據連線
    // 使用模擬節點，不代表真實地理資料

    const connectionMaterial =

        new THREE.LineBasicMaterial({

            color: 0xfbbf24,

            transparent: true,

            opacity: 0.65,

            depthWrite: false

        })

    for (let i = 0; i < 12; i++) {

        const a = nodes[i * 2].position

        const b = nodes[(i * 7 + 17) % 48].position

        const middle = a.clone().add(b)

        if (middle.lengthSq() < 0.001) continue

        middle.normalize()

        middle.multiplyScalar(radius + 1.3)

        const curve =

            new THREE.QuadraticBezierCurve3(

                a.clone(),

                middle,

                b.clone()

            )

        const geometry =

            new THREE.BufferGeometry()

                .setFromPoints(

                    curve.getPoints(32)

                )

        const connection = new THREE.Line(

            geometry,

            connectionMaterial

        )

        earthGroup.add(connection)

    }

    // 09 三組巨型旋轉軌道

    function createOrbit(

        orbitRadius,

        material,

        rotationX,

        rotationZ

    ) {

        const pivot = new THREE.Group()

        pivot.position.y = centerY

        pivot.rotation.set(

            rotationX, 0, rotationZ

        )

        group.add(pivot)

        const orbitalRing = ring(

            orbitRadius,

            0.075,

            material,

            pivot

        )

        const satellite = new THREE.Mesh(

            new THREE.SphereGeometry(

                0.21, 12, 10

            ),

            material

        )

        satellite.position.x = orbitRadius

        pivot.add(satellite)

        return {

            pivot,

            orbitalRing,

            satellite,

            orbitRadius,

            rotationX,

            rotationZ

        }

    }

    const orbit1 = createOrbit(

        5.4,

        materials.cyan,

        Math.PI / 2.7,

        0.3

    )

    const orbit2 = createOrbit(

        5.8,

        materials.gold,

        Math.PI / 4,

        -0.65

    )

    const orbit3 = createOrbit(

        6.2,

        materials.purple,

        Math.PI / 1.8,

        0.8

    )

    const orbits = [

        orbit1,

        orbit2,

        orbit3

    ]

    // 10 底座資料傳輸燈

    const baseLights = []

    for (let i = 0; i < 24; i++) {

        const angle =

            i / 24 * Math.PI * 2

        const light = new THREE.Mesh(

            new THREE.BoxGeometry(

                0.22, 0.12, 0.55

            ),

            new THREE.MeshBasicMaterial({

                color: 0x22d3ee

            })

        )

        light.position.set(

            Math.cos(angle) * 4.2,

            1.23,

            Math.sin(angle) * 4.2

        )

        light.rotation.y =

            -angle + Math.PI / 2

        group.add(light)

        baseLights.push(light)

    }

    // 11 動態掃描光環

    const scanRing = ring(

        radius,

        0.06,

        materials.green,

        earthGroup

    )

    scanRing.rotation.x = Math.PI / 2

    // 12 動態效果
    // 沿用現有Three.js渲染流程

    const start = performance.now()

    let lastFrame = -1

    const cyanColor = new THREE.Color(0x22d3ee)

    const goldColor = new THREE.Color(0xfbbf24)

    globe.onBeforeRender = function (renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        const t =

            (performance.now() - start) / 1000

        // 地球自轉

        earthGroup.rotation.y = t * 0.22

        // 地球懸浮

        earthGroup.position.y =

            centerY + Math.sin(t * 1.2) * 0.18

        // 三組軌道公轉

        orbits.forEach((orbit, i) => {

            const angle = t * (0.6 + i * 0.22)

            orbit.pivot.position.y =

                earthGroup.position.y

            orbit.pivot.rotation.y =

                t * (i % 2 === 0 ? 0.2 : -0.25)

            orbit.satellite.position.set(

                Math.cos(angle) * orbit.orbitRadius,

                Math.sin(angle) * orbit.orbitRadius,

                0

            )

        })

        // 全球數據節點閃爍

        nodes.forEach((node, i) => {

            const scale =

                0.8 +

                (Math.sin(t * 2.2 + i * 0.7) + 1)

                * 0.5

            node.scale.setScalar(scale)

        })

        // 綠色掃描環上下移動

        const scanY =

            Math.sin(t * 0.85) * 4.4

        const scanRadius = Math.sqrt(

            Math.max(

                0.1,

                radius * radius - scanY * scanY

            )

        )

        scanRing.position.y = scanY

        scanRing.scale.set(

            scanRadius / radius,

            scanRadius / radius,

            1

        )

        // 底座循環數據燈

        baseLights.forEach((light, i) => {

            const wave =

                (Math.sin(t * 3 - i * 0.45) + 1) / 2

            light.material.color

                .copy(cyanColor)

                .lerp(goldColor, wave)

        })

        // 全息投影亮度變化

        beam.material.opacity =

            0.075 + Math.sin(t * 1.6) * 0.025

    }

    console.log(

        'SkillIsland V8.7.0 巨型全息地球建立完成'

    )

    return group

}


