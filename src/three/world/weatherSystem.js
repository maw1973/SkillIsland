import * as THREE from 'three'

// SkillIsland V9.1.0
// 動態天氣系統

export function createWeatherSystem({
    scene,
    islands
}) {

    const profiles = {
        clear: {
            density: 0,
            rain: false,
            shade: 0
        },
        cloudy: {
            density: 0.0025,
            rain: false,
            shade: 0.25
        },
        rain: {
            density: 0.0045,
            rain: true,
            shade: 0.35
        },
        fog: {
            density: 0.009,
            rain: false,
            shade: 0.12
        }
    }

    const center = new THREE.Vector3()

    const central = islands.find(
        i => i.config.id === 'central'
    )

    central?.group.getWorldPosition(center)

    let radius = 60

    islands.forEach(island => {
        const p = island.group.getWorldPosition(
            new THREE.Vector3()
        )

        radius = Math.max(
            radius,
            Math.hypot(
                p.x - center.x,
                p.z - center.z
            ) + 30
        )
    })

    // 01 雨滴粒子

    const rainCount = 6500

    const rainHeight = 100

    const positions = new Float32Array(
        rainCount * 3
    )

    const velocities = new Float32Array(
        rainCount
    )

    function resetDrop(i, randomHeight = false) {

        const angle = Math.random() * Math.PI * 2

        const distance =
            Math.sqrt(Math.random()) * radius

        const j = i * 3

        positions[j] =
            Math.cos(angle) * distance

        positions[j + 1] = randomHeight
            ? Math.random() * rainHeight
            : rainHeight

        positions[j + 2] =
            Math.sin(angle) * distance

        velocities[i] = 45 + Math.random() * 35
    }

    for (let i = 0; i < rainCount; i++) {
        resetDrop(i, true)
    }

    const geometry = new THREE.BufferGeometry()

    const positionAttribute =
        new THREE.BufferAttribute(positions, 3)

    positionAttribute.setUsage(
        THREE.DynamicDrawUsage
    )

    geometry.setAttribute(
        'position',
        positionAttribute
    )

    // 02 建立細長雨滴貼圖

    const canvas = document.createElement('canvas')

    canvas.width = 16
    canvas.height = 64

    const ctx = canvas.getContext('2d')

    const gradient =
        ctx.createLinearGradient(0, 0, 0, 64)

    gradient.addColorStop(
        0, 'rgba(210,235,255,0)'
    )

    gradient.addColorStop(
        0.4, 'rgba(210,235,255,0.4)'
    )

    gradient.addColorStop(
        1, 'rgba(235,250,255,0.95)'
    )

    ctx.fillStyle = gradient

    ctx.fillRect(6, 0, 4, 64)

    const texture = new THREE.CanvasTexture(canvas)

    const material = new THREE.PointsMaterial({
        color: '#cfeaff',
        size: 1.4,
        map: texture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        sizeAttenuation: true,
        toneMapped: false
    })

    const rain = new THREE.Points(
        geometry,
        material
    )

    rain.name = 'SkillIslandWeatherRain'

    rain.position.copy(center)

    rain.frustumCulled = false
    rain.visible = false

    scene.add(rain)

    // 03 天氣狀態

    let mode = 'clear'

    let density = 0

    let shade = 0

    let baseFog = scene.fog

    let applied = false

    const fogColor = new THREE.Color()

    const tint = new THREE.Color()

    const weatherFog = new THREE.FogExp2(
        '#cbd5e1',
        0
    )

    const originalSky = new THREE.Color()

    const weatherSky = new THREE.Color()

    let baseSky = null

    const lightStates = []

    // 04 切換天氣

    function setMode(id) {

        if (!profiles[id]) return false

        mode = id

        try {
            localStorage.setItem(
                'SkillIslandWeather',
                mode
            )
        } catch {}

        console.log(
            '[V9.1.0] 天氣模式：',
            mode
        )

        return true
    }

    // 05 還原光影模組的原始輸出
    // 避免反覆疊加天氣效果

    function beforeUpdate() {

        if (!applied) return

        scene.fog = baseFog

        scene.background = baseSky

        lightStates.forEach(item => {
            item.light.intensity = item.intensity
        })

        lightStates.length = 0

        applied = false
    }

    // 06 每幀更新天氣

    function update(delta) {

        beforeUpdate()

        const profile = profiles[mode]

        const factor = 1 - Math.exp(-delta * 3)

        density = THREE.MathUtils.lerp(
            density,
            profile.density,
            factor
        )

        shade = THREE.MathUtils.lerp(
            shade,
            profile.shade,
            factor
        )

        baseFog = scene.fog
        baseSky = scene.background

        if (
            density > 0.00001 ||
            shade > 0.001
        ) {

            if (baseSky?.isColor) {

                originalSky.copy(baseSky)

                tint.copy(originalSky)
                    .lerp(
                        new THREE.Color('#94a3b8'),
                        0.35
                    )

                weatherSky.copy(originalSky)
                    .lerp(tint, shade)

                scene.background = weatherSky
            }

            if (density > 0.00001) {

                if (baseFog?.color) {
                    fogColor.copy(baseFog.color)
                } else if (baseSky?.isColor) {
                    fogColor.copy(baseSky)
                } else {
                    fogColor.set('#cbd5e1')
                }

                weatherFog.color.copy(fogColor)

                weatherFog.density = density

                scene.fog = weatherFog
            }

            scene.children.forEach(light => {

                if (
                    light.isDirectionalLight ||
                    light.isHemisphereLight
                ) {

                    lightStates.push({
                        light,
                        intensity: light.intensity
                    })

                    light.intensity *= 1 - shade
                }

            })

            applied = true
        }

        // 07 雨滴動畫

        rain.visible = profile.rain

        if (rain.visible) {

            for (let i = 0; i < rainCount; i++) {

                const j = i * 3

                positions[j] += delta * 5

                positions[j + 1] -=
                    velocities[i] * delta

                positions[j + 2] += delta * 1.5

                if (
                    positions[j + 1] < -5 ||
                    Math.hypot(
                        positions[j],
                        positions[j + 2]
                    ) > radius
                ) {

                    resetDrop(i)

                }

            }

            positionAttribute.needsUpdate = true
        }
    }

    // 08 清理資源

    function dispose() {

        beforeUpdate()

        rain.removeFromParent()

        geometry.dispose()

        material.dispose()

        texture.dispose()
    }

    // 09 恢復上次天氣設定

    try {

        const saved = localStorage.getItem(
            'SkillIslandWeather'
        )

        if (profiles[saved]) {
            mode = saved
        }

    } catch {}

    console.log(
        '[V9.1.0] 動態天氣系統建立完成',
        {
            rainParticles: rainCount,
            radius,
            mode
        }
    )

    return {
        setMode,
        beforeUpdate,
        update,
        dispose,

        get mode() {
            return mode
        }
    }
}
