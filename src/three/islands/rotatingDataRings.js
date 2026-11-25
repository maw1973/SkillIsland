import * as THREE from 'three'

// SkillIsland V8.7.2
// 多層旋轉數據光環

export function createRotatingDataRings(island) {

    if (!island?.group) return

    const earth = island.group.getObjectByName(
        'HolographicEarth_V870'
    )

    if (!earth) {

        console.warn(
            '[V8.7.2] 找不到全息地球，無法建立數據光環'
        )

        return

    }

    const name = 'RotatingDataRings_V872'

    const existing = earth.getObjectByName(name)

    if (existing) return existing

    const group = new THREE.Group()

    group.name = name

    group.position.y = 8

    earth.add(group)

    const colors = {

        cyan: 0x00e5ff,

        orange: 0xff9100,

        purple: 0xd946ef,

        green: 0x39ff88,

        white: 0xffffff

    }

    const materials = {}

    Object.entries(colors).forEach(([key, color]) => {

        materials[key] = new THREE.MeshBasicMaterial({

            color,

            toneMapped: false

        })

    })

    const ringLayers = []

    const satellites = []

    // ==================================
    // 01 分段式科技光環
    // ==================================

    function createSegmentedRing({

        radius,

        thickness,

        segments,

        material,

        tiltX,

        tiltZ,

        speed,

        coverage = 0.76

    }) {

        const pivot = new THREE.Group()

        pivot.rotation.set(

            tiltX,

            0,

            tiltZ

        )

        group.add(pivot)

        const rotor = new THREE.Group()

        pivot.add(rotor)

        const angleStep =

            Math.PI * 2 / segments

        const geometry = new THREE.TorusGeometry(

            radius,

            thickness,

            8,

            24,

            angleStep * coverage

        )

        const instances = new THREE.InstancedMesh(

            geometry,

            material,

            segments

        )

        const dummy = new THREE.Object3D()

        for (let i = 0; i < segments; i++) {

            dummy.rotation.set(

                0,

                0,

                i * angleStep

            )

            dummy.updateMatrix()

            instances.setMatrixAt(

                i,

                dummy.matrix

            )

        }

        instances.instanceMatrix.needsUpdate = true

        rotor.add(instances)

        ringLayers.push({

            pivot,

            rotor,

            radius,

            speed,

            tiltX,

            tiltZ

        })

        return rotor

    }

    // ==================================
    // 02 青藍色主要數據環
    // ==================================

    const ring1 = createSegmentedRing({

        radius: 6.45,

        thickness: 0.16,

        segments: 24,

        material: materials.cyan,

        tiltX: Math.PI / 2,

        tiltZ: 0.12,

        speed: 0.48

    })

    // ==================================
    // 03 金橘色反向數據環
    // ==================================

    const ring2 = createSegmentedRing({

        radius: 7.05,

        thickness: 0.19,

        segments: 18,

        material: materials.orange,

        tiltX: Math.PI / 3,

        tiltZ: -0.55,

        speed: -0.65

    })

    // ==================================
    // 04 紫色傾斜數據環
    // ==================================

    const ring3 = createSegmentedRing({

        radius: 7.6,

        thickness: 0.2,

        segments: 16,

        material: materials.purple,

        tiltX: Math.PI / 5,

        tiltZ: 0.8,

        speed: 0.38

    })

    // ==================================
    // 05 綠色掃描數據環
    // ==================================

    const scanMaterial =

        new THREE.MeshBasicMaterial({

            color: colors.green,

            transparent: true,

            opacity: 0.9,

            depthWrite: false,

            toneMapped: false

        })

    const scanRing = new THREE.Mesh(

        new THREE.TorusGeometry(

            5.25,

            0.13,

            12,

            96

        ),

        scanMaterial

    )

    scanRing.rotation.x = Math.PI / 2

    group.add(scanRing)

    // ==================================
    // 06 科技刻度
    // ==================================

    const tickGeometry = new THREE.BoxGeometry(

        0.12,

        0.38,

        0.12

    )

    const ticks = new THREE.InstancedMesh(

        tickGeometry,

        materials.white,

        72

    )

    const tickDummy = new THREE.Object3D()

    for (let i = 0; i < 72; i++) {

        const angle =

            i / 72 * Math.PI * 2

        tickDummy.position.set(

            Math.cos(angle) * 6.85,

            Math.sin(angle) * 6.85,

            0

        )

        tickDummy.rotation.set(

            0,

            0,

            angle - Math.PI / 2

        )

        tickDummy.scale.set(

            1,

            i % 6 === 0 ? 1.8 : 0.8,

            1

        )

        tickDummy.updateMatrix()

        ticks.setMatrixAt(

            i,

            tickDummy.matrix

        )

    }

    ticks.instanceMatrix.needsUpdate = true

    ring1.add(ticks)

    // ==================================
    // 07 大型移動數據節點
    // ==================================

    const satelliteGeometry =

        new THREE.SphereGeometry(

            0.24,

            12,

            10

        )

    function createSatellites(

        parent,

        radius,

        material,

        count,

        speed

    ) {

        for (let i = 0; i < count; i++) {

            const satellite = new THREE.Mesh(

                satelliteGeometry,

                material

            )

            const phase =

                i / count * Math.PI * 2

            parent.add(satellite)

            satellites.push({

                mesh: satellite,

                radius,

                phase,

                speed

            })

        }

    }

    createSatellites(

        ring1,

        6.45,

        materials.white,

        8,

        0.85

    )

    createSatellites(

        ring2,

        7.05,

        materials.orange,

        8,

        -0.7

    )

    createSatellites(

        ring3,

        7.6,

        materials.purple,

        8,

        0.55

    )

    // ==================================
    // 08 地球下方垂直能量光柱
    // ==================================

    const beams = []

    const beamGeometry =

        new THREE.CylinderGeometry(

            0.055,

            0.055,

            1,

            8

        )

    for (let i = 0; i < 12; i++) {

        const angle =

            i / 12 * Math.PI * 2

        const material =

            new THREE.MeshBasicMaterial({

                color: i % 3 === 0

                    ? colors.orange

                    : colors.cyan,

                transparent: true,

                opacity: 0.75,

                depthWrite: false,

                toneMapped: false

            })

        const beam = new THREE.Mesh(

            beamGeometry,

            material

        )

        beam.position.set(

            Math.cos(angle) * 1.5,

            -4.5,

            Math.sin(angle) * 1.5

        )

        group.add(beam)

        beams.push(beam)

    }

    // ==================================
    // 09 外圍能量脈衝環
    // ==================================

    const pulseMaterial =

        new THREE.MeshBasicMaterial({

            color: colors.cyan,

            transparent: true,

            opacity: 0.6,

            depthWrite: false,

            toneMapped: false

        })

    const pulseRing = new THREE.Mesh(

        new THREE.TorusGeometry(

            5.5,

            0.09,

            8,

            80

        ),

        pulseMaterial

    )

    pulseRing.rotation.x = Math.PI / 2

    pulseRing.position.y = -4.5

    group.add(pulseRing)

    // ==================================
    // 10 動態數據效果
    // ==================================

    const start = performance.now()

    let lastFrame = -1

    function update() {

        const time =

            (performance.now() - start) / 1000

        // 跟隨既有全息地球的懸浮高度

        const sphere = earth.getObjectByName(

            'HolographicEarthSphere'

        )

        if (sphere) {

            group.position.y = sphere.position.y

        }

        // 三層數據環不同方向旋轉

        ringLayers.forEach((layer, i) => {

            layer.rotor.rotation.z =

                time * layer.speed

            layer.pivot.rotation.y =

                time * (i % 2 === 0 ? 0.15 : -0.18)

            layer.pivot.rotation.x =

                layer.tiltX +

                Math.sin(time * 0.45 + i) * 0.12

            layer.pivot.rotation.z =

                layer.tiltZ +

                Math.sin(time * 0.35 + i) * 0.1

        })

        // 24個移動數據節點

        satellites.forEach(item => {

            const angle =

                time * item.speed + item.phase

            item.mesh.position.set(

                Math.cos(angle) * item.radius,

                Math.sin(angle) * item.radius,

                0

            )

            item.mesh.scale.setScalar(

                1 +

                Math.sin(time * 3 + item.phase) * 0.25

            )

        })

        // 綠色垂直掃描光環

        const scanY =

            Math.sin(time * 1.1) * 3.8

        const scanRadius = Math.sqrt(

            Math.max(

                0.5,

                5.25 * 5.25 - scanY * scanY

            )

        )

        scanRing.position.y = scanY

        scanRing.scale.set(

            scanRadius / 5.25,

            scanRadius / 5.25,

            1

        )

        scanMaterial.opacity =

            0.7 + Math.sin(time * 2) * 0.2

        // 垂直能量光柱

        beams.forEach((beam, i) => {

            const wave =

                (Math.sin(time * 3 + i * 0.7) + 1) / 2

            const height =

                0.5 + wave * 2.4

            beam.scale.y = height

            beam.position.y =

                -5.8 + height / 2

            beam.material.opacity =

                0.35 + wave * 0.55

        })

        // 能量環向外擴散

        const pulse =

            (time * 0.65) % 1

        const scale =

            0.85 + pulse * 0.45

        pulseRing.scale.set(

            scale,

            scale,

            1

        )

        pulseMaterial.opacity =

            (1 - pulse) * 0.8

    }

    // ==================================
    // 11 接入既有渲染流程
    // ==================================

    ticks.onBeforeRender = function (renderer) {

        const frame = renderer.info.render.frame

        if (frame === lastFrame) return

        lastFrame = frame

        update()

    }

    ticks.frustumCulled = false

    update()

    console.log(

        'SkillIsland V8.7.2 多層旋轉數據光環建立完成'

    )

    return group

}
