import * as THREE from 'three'

// SkillIsland V9.1.1
// 夜間星空、月亮與動態流星

export function createNightSky({
    scene,
    camera,
    worldAppearance,
    weather
}) {

    const group = new THREE.Group()
    group.name = 'NightSky_V911'
    group.visible = false
    scene.add(group)

    const skyRadius = Math.min(450, camera.far * 0.65)

    // 01 星空粒子

    const starCount = 3000
    const positions = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    const phases = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {

        const angle = Math.random() * Math.PI * 2
        const y = 0.08 + Math.random() * 0.92
        const r = Math.sqrt(1 - y * y) * skyRadius

        positions[i * 3] = Math.cos(angle) * r
        positions[i * 3 + 1] = y * skyRadius
        positions[i * 3 + 2] = Math.sin(angle) * r

        sizes[i] = 1.0 + Math.random() * 2.5
        phases[i] = Math.random() * Math.PI * 2
    }

    const starGeometry = new THREE.BufferGeometry()

    starGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    )

    starGeometry.setAttribute(
        'aSize',
        new THREE.BufferAttribute(sizes, 1)
    )

    starGeometry.setAttribute(
        'aPhase',
        new THREE.BufferAttribute(phases, 1)
    )

    const starMaterial = new THREE.ShaderMaterial({

        uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 0 }
        },

        vertexShader: `
            attribute float aSize;
            attribute float aPhase;

            uniform float uTime;

            varying float vBrightness;

            void main() {

                vBrightness =
                    0.65 + sin(uTime * 1.8 + aPhase) * 0.35;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(position, 1.0);

                gl_PointSize = aSize;
            }
        `,

        fragmentShader: `
            uniform float uOpacity;

            varying float vBrightness;

            void main() {

                float d =
                    length(gl_PointCoord - vec2(0.5));

                float alpha =
                    1.0 - smoothstep(0.05, 0.5, d);

                gl_FragColor = vec4(
                    0.83,
                    0.91,
                    1.0,
                    alpha * vBrightness * uOpacity
                );
            }
        `,

        transparent: true,
        depthWrite: false,
        toneMapped: false,
        fog: false,
        blending: THREE.AdditiveBlending
    })

    const stars = new THREE.Points(
        starGeometry,
        starMaterial
    )

    stars.name = 'NightSkyStars'
    stars.frustumCulled = false

    group.add(stars)

    // 02 月亮與柔和光暈

    const moonCanvas = document.createElement('canvas')

    moonCanvas.width = 256
    moonCanvas.height = 256

    const ctx = moonCanvas.getContext('2d')

    const glow = ctx.createRadialGradient(
        128, 128, 35,
        128, 128, 128
    )

    glow.addColorStop(0, 'rgba(220,235,255,0.85)')
    glow.addColorStop(0.4, 'rgba(170,200,255,0.25)')
    glow.addColorStop(1, 'rgba(100,150,255,0)')

    ctx.fillStyle = glow
    ctx.fillRect(0, 0, 256, 256)

    const moonGradient = ctx.createRadialGradient(
        110, 105, 10,
        128, 128, 65
    )

    moonGradient.addColorStop(0, '#ffffff')
    moonGradient.addColorStop(0.65, '#eff6ff')
    moonGradient.addColorStop(1, '#b9cbe5')

    ctx.beginPath()
    ctx.arc(128, 128, 62, 0, Math.PI * 2)
    ctx.fillStyle = moonGradient
    ctx.fill()

    // 月球表面紋理

    const craters = [
        [105, 105, 13],
        [147, 95, 9],
        [155, 135, 16],
        [108, 150, 11],
        [135, 169, 8],
        [90, 130, 7]
    ]

    craters.forEach(([x, y, r]) => {

        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(125,145,175,0.18)'
        ctx.fill()
    })

    const moonTexture = new THREE.CanvasTexture(
        moonCanvas
    )

    moonTexture.colorSpace = THREE.SRGBColorSpace

    const moonMaterial = new THREE.SpriteMaterial({
        map: moonTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        toneMapped: false
    })

    const moon = new THREE.Sprite(moonMaterial)

    moon.name = 'NightSkyMoon'

    moon.position.set(
        skyRadius * 0.55,
        skyRadius * 0.48,
        -skyRadius * 0.56
    )

    moon.scale.setScalar(skyRadius * 0.19)

    group.add(moon)

    // 03 動態流星

    const meteorCount = 12

    const meteorPositions = new Float32Array(
        meteorCount * 3
    )

    const meteorColors = new Float32Array(
        meteorCount * 3
    )

    for (let i = 0; i < meteorCount; i++) {

        const brightness = i / (meteorCount - 1)

        meteorColors[i * 3] = brightness * 0.65
        meteorColors[i * 3 + 1] = brightness * 0.85
        meteorColors[i * 3 + 2] = brightness
    }

    const meteorGeometry = new THREE.BufferGeometry()

    const meteorAttribute = new THREE.BufferAttribute(
        meteorPositions, 3
    )

    meteorAttribute.setUsage(THREE.DynamicDrawUsage)

    meteorGeometry.setAttribute(
        'position',
        meteorAttribute
    )

    meteorGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(meteorColors, 3)
    )

    const meteorMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending
    })

    const meteor = new THREE.Line(
        meteorGeometry,
        meteorMaterial
    )

    meteor.name = 'NightSkyMeteor'
    meteor.visible = false
    meteor.frustumCulled = false

    group.add(meteor)

    const meteorHead = new THREE.Vector3()
    const meteorDirection = new THREE.Vector3()

    let meteorActive = false
    let meteorAge = 0
    let nextMeteor = 4
    let opacity = 0
    let time = 0

    function startMeteor() {

        const angle = Math.random() * Math.PI * 2

        meteorHead.set(
            Math.cos(angle) * skyRadius * 0.65,
            skyRadius * (0.45 + Math.random() * 0.25),
            Math.sin(angle) * skyRadius * 0.65
        )

        meteorDirection.set(
            -Math.sin(angle),
            -0.45,
            Math.cos(angle)
        ).normalize()

        meteorAge = 0
        meteorActive = true
        meteor.visible = true
    }

    // 04 天氣影響星空能見度

    const visibility = {
        clear: 1,
        cloudy: 0.18,
        rain: 0.015,
        fog: 0.025
    }

    // 05 動畫更新

    function update(delta) {

        time += delta

        const isNight =
            worldAppearance.mode === 'night'

        const weatherVisibility =
            visibility[weather.mode] ?? 1

        const targetOpacity =
            isNight ? weatherVisibility : 0

        opacity = THREE.MathUtils.lerp(
            opacity,
            targetOpacity,
            1 - Math.exp(-delta * 2.8)
        )

        group.visible = opacity > 0.002

        if (!group.visible) {

            meteorActive = false
            meteor.visible = false
            return
        }

        group.position.copy(camera.position)

        starMaterial.uniforms.uTime.value = time

        starMaterial.uniforms.uOpacity.value = opacity

        moonMaterial.opacity = opacity * 0.95

        // 陰雨天不出現流星

        if (!isNight || weather.mode !== 'clear') {

            meteorActive = false
            meteor.visible = false
            return
        }

        if (!meteorActive) {

            nextMeteor -= delta

            if (nextMeteor <= 0) {
                startMeteor()
            }

            return
        }

        meteorAge += delta

        meteorHead.addScaledVector(
            meteorDirection,
            delta * skyRadius * 0.28
        )

        const tailLength = skyRadius * 0.12

        for (let i = 0; i < meteorCount; i++) {

            const offset =
                (1 - i / (meteorCount - 1)) *
                tailLength

            meteorPositions[i * 3] =
                meteorHead.x -
                meteorDirection.x * offset

            meteorPositions[i * 3 + 1] =
                meteorHead.y -
                meteorDirection.y * offset

            meteorPositions[i * 3 + 2] =
                meteorHead.z -
                meteorDirection.z * offset
        }

        meteorAttribute.needsUpdate = true

        meteorMaterial.opacity =
            Math.sin(
                Math.PI * Math.min(meteorAge / 1.4, 1)
            ) * opacity

        if (meteorAge >= 1.4) {

            meteorActive = false
            meteor.visible = false
            nextMeteor = 6 + Math.random() * 10
        }
    }

    // 06 資源清理

    function dispose() {

        group.removeFromParent()

        starGeometry.dispose()
        starMaterial.dispose()

        moonTexture.dispose()
        moonMaterial.dispose()

        meteorGeometry.dispose()
        meteorMaterial.dispose()
    }

    console.log(
        '[V9.1.1] 夜間星空系統建立完成',
        {
            stars: starCount,
            moon: 1,
            meteor: 1
        }
    )

    return {
        group,
        update,
        dispose
    }
}
