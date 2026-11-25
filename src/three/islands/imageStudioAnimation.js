import * as THREE from 'three'

// SkillIsland V8.2.3
// 影像技能島動態攝影效果

export function createImageStudioAnimation(island) {

    const group = new THREE.Group()

    group.name = 'ImageStudioAnimation'

    group.position.y = island.groundY

    group.rotation.y = Math.atan2(
        -island.config.x,
        -island.config.z
    )

    island.group.add(group)

    // ==================================
    // 01 動態鏡頭環
    // ==================================

    const lensRing = new THREE.Group()

    lensRing.position.set(
        -0.45, 4.5, 6.61
    )

    group.add(lensRing)

    const ringMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x70dbff,
            emissive: 0x269acb,
            emissiveIntensity: 0.65,
            roughness: 0.35,
            metalness: 0.4
        })

    const ring = new THREE.Mesh(

        new THREE.TorusGeometry(
            2.22, 0.055, 8, 64
        ),

        ringMaterial
    )

    lensRing.add(ring)

    // 鏡頭環刻度

    const tickMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xc9f4ff
        })

    for (let i = 0; i < 24; i++) {

        const angle =
            i * Math.PI * 2 / 24

        const tick = new THREE.Mesh(

            new THREE.BoxGeometry(
                0.07,
                i % 4 === 0 ? 0.23 : 0.12,
                0.045
            ),

            tickMaterial
        )

        tick.position.set(
            Math.cos(angle) * 2.20,
            Math.sin(angle) * 2.20,
            0.06
        )

        tick.rotation.z =
            angle - Math.PI / 2

        lensRing.add(tick)
    }

    // ==================================
    // 02 鏡頭呼吸光圈
    // ==================================

    const irisMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x8cdcff,

            transparent: true,

            opacity: 0.65,

            depthWrite: false

        })

    const iris = new THREE.Mesh(

        new THREE.TorusGeometry(
            1.36, 0.045, 8, 48
        ),

        irisMaterial
    )

    iris.position.set(
        -0.45, 4.5, 6.80
    )

    group.add(iris)

    // ==================================
    // 03 大型相機閃光燈
    // ==================================

    const flashMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xfff9df,

            transparent: true,

            opacity: 0,

            depthWrite: false

        })

    const flash = new THREE.Mesh(

        new THREE.PlaneGeometry(
            1.45, 0.85
        ),

        flashMaterial
    )

    flash.position.set(
        -3.9, 6.75, 3.66
    )

    group.add(flash)

    const flashLight =
        new THREE.PointLight(
            0xfff5db,
            0,
            12,
            2
        )

    flashLight.position.set(
        -3.9, 6.75, 4.1
    )

    group.add(flashLight)

    // ==================================
    // 04 閃光光暈貼圖
    // ==================================

    const canvas =
        document.createElement('canvas')

    canvas.width = 128
    canvas.height = 128

    const ctx = canvas.getContext('2d')

    const gradient =
        ctx.createRadialGradient(
            64, 64, 0,
            64, 64, 64
        )

    gradient.addColorStop(
        0, 'rgba(255,255,255,1)'
    )

    gradient.addColorStop(
        0.25, 'rgba(255,250,220,0.95)'
    )

    gradient.addColorStop(
        0.6, 'rgba(255,225,155,0.35)'
    )

    gradient.addColorStop(
        1, 'rgba(255,225,155,0)'
    )

    ctx.fillStyle = gradient

    ctx.fillRect(0, 0, 128, 128)

    const glowTexture =
        new THREE.CanvasTexture(canvas)

    function createGlow(parent, x, y, z, size) {

        const material =
            new THREE.SpriteMaterial({

                map: glowTexture,

                color: 0xffffff,

                transparent: true,

                opacity: 0,

                depthWrite: false,

                blending:
                    THREE.AdditiveBlending

            })

        const sprite = new THREE.Sprite(
            material
        )

        sprite.position.set(x, y, z)

        sprite.scale.set(size, size, 1)

        parent.add(sprite)

        return sprite
    }

    const mainGlow = createGlow(
        group,
        -3.9, 6.75, 3.75,
        4.2
    )

    // ==================================
    // 05 戶外攝影相機閃光效果
    // ==================================

    const outdoorGlows = []

    if (island.studioDetails) {

        const cameras = []

        island.studioDetails.traverse(object => {

            if (object.name === 'OutdoorCamera') {

                cameras.push(object)
            }
        })

        cameras.forEach(camera => {

            const glow = createGlow(
                camera,
                0, 3.05, 0.42,
                1.7
            )

            outdoorGlows.push(glow)
        })
    }

    // ==================================
    // 06 攝影動畫
    // ==================================

    function pulse(time, period, duration, offset = 0) {

        const phase =
            (time + offset) % period

        if (phase >= duration) {

            return 0
        }

        return Math.pow(
            1 - phase / duration,
            2
        )
    }

    function update(time) {

        // 鏡頭刻度環旋轉

        lensRing.rotation.z =
            time * 0.32

        // 鏡頭光圈呼吸

        const scale =
            1 + Math.sin(time * 1.8) * 0.06

        iris.scale.set(
            scale, scale, 1
        )

        irisMaterial.opacity =
            0.45
            + Math.sin(time * 1.8) * 0.25

        // 大型相機每六秒閃光一次

        const strength =
            pulse(time, 6, 0.24, 1)

        flashMaterial.opacity =
            strength

        mainGlow.material.opacity =
            strength * 0.85

        flashLight.intensity =
            strength * 18

        // 戶外相機交替閃光

        outdoorGlows.forEach((glow, i) => {

            glow.material.opacity =
                pulse(
                    time,
                    8,
                    0.18,
                    i * 4 + 2
                ) * 0.9
        })
    }

    // 沿用原有 Three.js 渲染迴圈

    const startTime = performance.now()

    lensRing.children[0].onBeforeRender = () => {

        update(
            (performance.now() - startTime)
            / 1000
        )
    }

    update(0)

    // 互動識別資料

    group.traverse(object => {

        object.userData.islandId =
            island.config.id

        object.userData.islandConfig =
            island.config
    })

    return group
}
