import * as THREE from 'three'

// SkillIsland V9.0.6.1
// 四大場景視覺模式

export function optimizeWorldAppearance({
    scene,
    renderer,
    islands,
    lighting
}) {

    const profiles = {
        vivid: {
            sky: '#38bdf8',
            fog: '#a9e3fa',
            sun: '#fff2c2',
            hemisphere: '#dff5ff',
            ground: '#9fbe80',
            ambient: '#e5f5ff',
            sunPower: 2.8,
            hemiPower: 1.6,
            ambientPower: 0.5,
            exposure: 1.15,
            saturation: 0.18,
            lightness: 0.045
        },
        sunset: {
            sky: '#efa179',
            fog: '#efb29a',
            sun: '#ffad55',
            hemisphere: '#ffd1ad',
            ground: '#a87c62',
            ambient: '#e8b5c5',
            sunPower: 2.0,
            hemiPower: 0.9,
            ambientPower: 0.35,
            exposure: 1.05,
            saturation: 0.08,
            lightness: -0.015
        },
        night: {
            sky: '#09152f',
            fog: '#172849',
            sun: '#8daaff',
            hemisphere: '#496ca8',
            ground: '#203348',
            ambient: '#718ac5',
            sunPower: 0.18,
            hemiPower: 0.55,
            ambientPower: 0.22,
            exposure: 0.95,
            saturation: 0.02,
            lightness: -0.06
        }
    }

    const original = {
        background: scene.background,
        fog: scene.fog,
        exposure: renderer.toneMappingExposure,
        toneMapping: renderer.toneMapping,
        colorSpace: renderer.outputColorSpace
    }

    const originalSky = scene.background?.isColor
        ? scene.background.clone()
        : new THREE.Color('#87ceeb')

    const sky = originalSky.clone()

    const fog = new THREE.Fog(
        original.fog?.color || originalSky,
        180,
        650
    )

    const originalFogColor = fog.color.clone()

    const lights = []
    const materials = []
    const seen = new Set()

    // 01 保存原始光線

    scene.traverse(object => {
        if (
            object.isHemisphereLight ||
            object.isAmbientLight ||
            object === lighting?.sunlight
        ) {
            lights.push({
                object,
                color: object.color.clone(),
                ground: object.groundColor?.clone(),
                intensity: object.intensity
            })
        }
    })

    // 02 保存原始島嶼材質

    islands.forEach(island => {
        island.group.traverse(object => {
            if (!object.isMesh) return

            const list = Array.isArray(object.material)
                ? object.material
                : [object.material]

            list.forEach(material => {
                if (!material?.color || seen.has(material)) return

                if (
                    material.transparent ||
                    material.map ||
                    material.isShaderMaterial ||
                    material.isMeshBasicMaterial ||
                    material.emissive?.getHex() > 0
                ) return

                seen.add(material)

                materials.push({
                    material,
                    color: material.color.clone()
                })
            })
        })
    })

    let mode = 'original'
    let transitioning = false
    let elapsed = 0
    let channels = []
    let numbers = []

    const duration = 1.5

    function addColor(object, target) {
        channels.push({
            object,
            from: object.clone(),
            to: target.clone()
        })
    }

    function addNumber(object, key, target) {
        numbers.push({
            object,
            key,
            from: object[key],
            to: target
        })
    }

    // 03 切換視覺模式

    function setMode(id, instant = false) {

        if (id !== 'original' && !profiles[id]) {
            return false
        }

        const profile = profiles[id]

        if (scene.background?.isColor) {
            sky.copy(scene.background)
        }

        if (scene.fog?.color) {
            fog.color.copy(scene.fog.color)
        }

        mode = id
        elapsed = 0
        channels = []
        numbers = []

        scene.background = sky
        scene.fog = fog

        renderer.outputColorSpace = THREE.SRGBColorSpace

        if (profile) {
            renderer.toneMapping =
                THREE.NeutralToneMapping ??
                THREE.ACESFilmicToneMapping
        }

        addColor(
            sky,
            profile
                ? new THREE.Color(profile.sky)
                : originalSky
        )

        addColor(
            fog.color,
            profile
                ? new THREE.Color(profile.fog)
                : originalFogColor
        )

        addNumber(
            renderer,
            'toneMappingExposure',
            profile?.exposure ?? original.exposure
        )

        // 04 調整天空光與陽光

        lights.forEach(item => {

            const object = item.object

            if (!profile) {

                addColor(object.color, item.color)

                addNumber(
                    object,
                    'intensity',
                    item.intensity
                )

                if (item.ground) {
                    addColor(
                        object.groundColor,
                        item.ground
                    )
                }

                return
            }

            if (object.isHemisphereLight) {

                addColor(
                    object.color,
                    new THREE.Color(profile.hemisphere)
                )

                addColor(
                    object.groundColor,
                    new THREE.Color(profile.ground)
                )

                addNumber(
                    object,
                    'intensity',
                    profile.hemiPower
                )

            } else if (object.isAmbientLight) {

                addColor(
                    object.color,
                    new THREE.Color(profile.ambient)
                )

                addNumber(
                    object,
                    'intensity',
                    profile.ambientPower
                )

            } else {

                addColor(
                    object.color,
                    new THREE.Color(profile.sun)
                )

                addNumber(
                    object,
                    'intensity',
                    profile.sunPower
                )
            }

        })

        // 05 保留島嶼主題色

        materials.forEach(item => {

            const target = item.color.clone()

            const hsl = { h: 0, s: 0, l: 0 }

            target.getHSL(hsl)

            if (
                profile &&
                hsl.s > 0.12 &&
                hsl.l > 0.1 &&
                hsl.l < 0.9
            ) {

                target.setHSL(
                    hsl.h,
                    THREE.MathUtils.clamp(
                        hsl.s + profile.saturation,
                        0, 1
                    ),
                    THREE.MathUtils.clamp(
                        hsl.l + profile.lightness,
                        0, 1
                    )
                )
            }

            addColor(item.material.color, target)

        })

        transitioning = true

        try {
            localStorage.setItem(
                'SkillIslandAppearance',
                mode
            )
        } catch {}

        if (instant) update(duration)

        console.log('[V9.0.6.1] 場景模式：', mode)

        return true

    }

    // 06 平滑光影過渡

    function update(delta) {

        if (!transitioning) return

        elapsed += Math.max(0, delta)

        const t = Math.min(
            elapsed / duration,
            1
        )

        const ease = t * t * (3 - 2 * t)

        channels.forEach(item => {
            item.object.lerpColors(
                item.from,
                item.to,
                ease
            )
        })

        numbers.forEach(item => {
            item.object[item.key] =
                THREE.MathUtils.lerp(
                    item.from,
                    item.to,
                    ease
                )
        })

        if (t >= 1) {

            transitioning = false

            channels = []
            numbers = []

            // 完整還原原始模式

            if (mode === 'original') {

                scene.background = original.background
                scene.fog = original.fog

                renderer.toneMapping =
                    original.toneMapping

                renderer.toneMappingExposure =
                    original.exposure

                renderer.outputColorSpace =
                    original.colorSpace

            }

        }

    }

    // 07 記憶上次使用的模式

    let savedMode = 'original'

    try {
        savedMode =
            localStorage.getItem(
                'SkillIslandAppearance'
            ) || 'original'
    } catch {}

    if (!setMode(savedMode, true)) {
        setMode('original', true)
    }

    console.log(
        '[V9.0.6.1] 四大場景視覺模式初始化完成',
        {
            lights: lights.length,
            materials: materials.length
        }
    )

    return {
        setMode,
        update,
        get mode() {
            return mode
        }
    }

}
