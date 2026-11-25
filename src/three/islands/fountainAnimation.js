import * as THREE from 'three'

// SkillIsland V8.1.3
// 動態噴水池模組

export function createFountainAnimation(island) {

    const group = new THREE.Group()

    group.name = 'FountainAnimation'

    group.position.y = island.groundY

    island.group.add(group)

    const fountainZ = 13.5

    const streamCount = 8
    const dropsPerStream = 24

    const particleCount =
        streamCount * dropsPerStream

    const positions =
        new Float32Array(particleCount * 3)

    const phases =
        new Float32Array(particleCount)

    const speeds =
        new Float32Array(particleCount)

    // ==================================
    // 01 建立水滴粒子
    // ==================================

    const geometry =
        new THREE.BufferGeometry()

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions, 3
        ).setUsage(THREE.DynamicDrawUsage)
    )

    const canvas =
        document.createElement('canvas')

    canvas.width = 64
    canvas.height = 64

    const ctx = canvas.getContext('2d')

    const gradient =
        ctx.createRadialGradient(
            32, 32, 0,
            32, 32, 32
        )

    gradient.addColorStop(
        0, 'rgba(255,255,255,1)'
    )

    gradient.addColorStop(
        0.35, 'rgba(210,247,255,0.95)'
    )

    gradient.addColorStop(
        0.75, 'rgba(112,220,255,0.5)'
    )

    gradient.addColorStop(
        1, 'rgba(112,220,255,0)'
    )

    ctx.fillStyle = gradient

    ctx.fillRect(0, 0, 64, 64)

    const texture =
        new THREE.CanvasTexture(canvas)

    const material =
        new THREE.PointsMaterial({

            color: 0xc9f5ff,

            size: 0.18,

            map: texture,

            transparent: true,

            opacity: 0.95,

            depthWrite: false,

            sizeAttenuation: true,

            blending: THREE.AdditiveBlending

        })

    const particles =
        new THREE.Points(
            geometry,
            material
        )

    particles.frustumCulled = false

    group.add(particles)

    // 初始化水滴

    for (let i = 0; i < particleCount; i++) {

        phases[i] =
            (i % dropsPerStream)
            / dropsPerStream

        speeds[i] =
            0.55 + Math.random() * 0.18
    }

    // ==================================
    // 02 水面漣漪
    // ==================================

    const ripples = []

    for (let i = 0; i < 4; i++) {

        const rippleGeometry =
            new THREE.RingGeometry(
                0.92, 1, 64
            )

        const rippleMaterial =
            new THREE.MeshBasicMaterial({

                color: 0xd4f8ff,

                transparent: true,

                opacity: 0.65,

                depthWrite: false,

                side: THREE.DoubleSide

            })

        const ripple =
            new THREE.Mesh(
                rippleGeometry,
                rippleMaterial
            )

        ripple.rotation.x =
            -Math.PI / 2

        ripple.position.set(
            0, 0.76, fountainZ
        )

        group.add(ripple)

        ripples.push(ripple)
    }

    // ==================================
    // 03 水滴流動動畫
    // ==================================

    function update(time) {

        for (
            let stream = 0;
            stream < streamCount;
            stream++
        ) {

            const angle =
                stream * Math.PI * 2
                / streamCount

            for (
                let j = 0;
                j < dropsPerStream;
                j++
            ) {

                const index =
                    stream * dropsPerStream + j

                const t = (
                    time * speeds[index]
                    + phases[index]
                ) % 1

                const radius =
                    0.15 + t * 2.45

                const height =
                    2.4
                    + Math.sin(t * Math.PI) * 1.25
                    - t * 1.65

                positions[index * 3] =
                    Math.cos(angle) * radius

                positions[index * 3 + 1] =
                    height

                positions[index * 3 + 2] =
                    fountainZ
                    + Math.sin(angle) * radius
            }
        }

        geometry.attributes.position
            .needsUpdate = true

        // 水面漣漪擴散

        ripples.forEach((ripple, i) => {

            const progress = (
                time * 0.6
                + i / ripples.length
            ) % 1

            const scale =
                0.45 + progress * 2.35

            ripple.scale.set(
                scale,
                scale,
                1
            )

            ripple.material.opacity =
                (1 - progress) * 0.55
        })
    }

    // 初始化畫面

    update(0)

    // 配合 Three.js 現有渲染迴圈
    // 不另外建立 requestAnimationFrame

    const startTime = performance.now()

    particles.onBeforeRender = () => {

        const elapsed =
            (performance.now() - startTime)
            / 1000

        update(elapsed)
    }

    // ==================================
    // 04 互動資料
    // ==================================

    group.traverse(object => {

        object.userData.islandId =
            'central'

        object.userData.islandConfig =
            island.config

    })

    return group
}