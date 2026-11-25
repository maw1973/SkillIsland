import * as THREE from 'three'

// SkillIsland V9.1.3
// 動態海洋波光與日月光反射

export function createOceanAppearance({
    scene,
    camera,
    ocean,
    islands,
    worldAppearance,
    weather
}) {

    const profiles = {
        original: {
            color: '#249bc5',
            reflection: '#e6f8ff',
            strength: 0.26
        },
        vivid: {
            color: '#008fbf',
            reflection: '#e5ffff',
            strength: 0.48
        },
        sunset: {
            color: '#916b85',
            reflection: '#ffbd65',
            strength: 0.85
        },
        night: {
            color: '#122b50',
            reflection: '#b9d9ff',
            strength: 0.65
        }
    }

    const weatherProfiles = {
        clear:  { speed: 0.65, waves: 0.7, shade: 0 },
        cloudy: { speed: 0.85, waves: 1.0, shade: 0.2 },
        rain:   { speed: 2.2, waves: 2.4, shade: 0.3 },
        fog:    { speed: 0.4, waves: 0.5, shade: 0.4 }
    }

    // 01 辨識原有海洋網格

    const oceanMeshes = []

    const candidates = [
        ocean,
        ocean?.mesh,
        ocean?.water,
        ocean?.group,
        ocean?.ocean
    ]

    candidates.forEach(object => {

        if (!object?.isObject3D) return

        object.traverse(child => {

            if (
                child.isMesh &&
                !oceanMeshes.includes(child)
            ) {
                oceanMeshes.push(child)
            }
        })
    })

    // 備用辨識方式

    if (!oceanMeshes.length) {

        scene.traverse(object => {

            if (
                object.isMesh &&
                /^(ocean|water|sea)$/i.test(object.name)
            ) {
                oceanMeshes.push(object)
            }
        })
    }

    // 找不到海面時不猜測高度

    if (!oceanMeshes.length) {

        console.warn(
            '[V9.1.3] 尚未辨識原有海洋網格'
        )

        return {
            update() {},
            dispose() {},
            active: false
        }
    }

    scene.updateMatrixWorld(true)

    const bounds = new THREE.Box3()

    oceanMeshes.forEach(mesh => {

        bounds.union(
            new THREE.Box3().setFromObject(mesh)
        )
    })

    const center = bounds.getCenter(
        new THREE.Vector3()
    )

    const size = bounds.getSize(
        new THREE.Vector3()
    )

    // 02 海面動態波光 Shader

    const uniforms = {

        uTime: { value: 0 },

        uSeaColor: {
            value: new THREE.Color('#249bc5')
        },

        uReflection: {
            value: new THREE.Color('#e6f8ff')
        },

        uStrength: { value: 0.26 },

        uWave: { value: 0.7 },

        uShade: { value: 0 },

        uRain: { value: 0 },

        uCamera: {
            value: new THREE.Vector3()
        }
    }

    const material = new THREE.ShaderMaterial({

        uniforms,

        vertexShader: `
            varying vec3 vWorldPosition;

            void main() {

                vec4 worldPosition =
                    modelMatrix * vec4(position, 1.0);

                vWorldPosition = worldPosition.xyz;

                gl_Position =
                    projectionMatrix *
                    viewMatrix *
                    worldPosition;
            }
        `,

        fragmentShader: `
            uniform float uTime;
            uniform vec3 uSeaColor;
            uniform vec3 uReflection;
            uniform float uStrength;
            uniform float uWave;
            uniform float uShade;
            uniform float uRain;
            uniform vec3 uCamera;

            varying vec3 vWorldPosition;

            void main() {

                vec2 p = vWorldPosition.xz;

                float wave1 = sin(
                    p.x * 0.33 +
                    p.y * 0.21 +
                    uTime
                );

                float wave2 = sin(
                    p.x * 0.17 -
                    p.y * 0.46 -
                    uTime * 0.85
                );

                float wave3 = sin(
                    p.x * 0.78 +
                    p.y * 0.56 +
                    uTime * 1.4
                );

                float waves =
                    wave1 * 0.45 +
                    wave2 * 0.35 +
                    wave3 * 0.2;

                float ripple = smoothstep(
                    0.32,
                    0.95,
                    waves
                );

                vec3 viewDirection = normalize(
                    uCamera - vWorldPosition
                );

                float fresnel = pow(
                    1.0 - abs(viewDirection.y),
                    2.0
                );

                float reflectionPath = exp(
                    -pow(
                        (p.x - uCamera.x) * 0.025,
                        2.0
                    )
                );

                float reflection =
                    ripple *
                    reflectionPath *
                    uStrength *
                    (0.5 + fresnel * 0.5);

                float rainRipple = sin(
                    length(
                        fract(p * 0.25) - 0.5
                    ) * 40.0 -
                    uTime * 8.0
                );

                rainRipple =
                    smoothstep(
                        0.75,
                        1.0,
                        rainRipple
                    ) * uRain * 0.16;

                vec3 color = uSeaColor;

                color *=
                    0.9 +
                    waves * 0.12 * uWave;

                color = mix(
                    color,
                    vec3(0.28, 0.38, 0.46),
                    uShade
                );

                color = mix(
                    color,
                    uReflection,
                    clamp(
                        reflection + rainRipple,
                        0.0,
                        0.9
                    )
                );

                gl_FragColor = vec4(
                    color,
                    0.72
                );

                #include <tonemapping_fragment>
                #include <colorspace_fragment>
            }
        `,

        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
    })

    // 03 建立海面波光覆蓋層

    const geometry = new THREE.PlaneGeometry(
        size.x,
        size.z
    )

    const surface = new THREE.Mesh(
        geometry,
        material
    )

    surface.name = 'OceanAppearance_V913'

    surface.rotation.x = -Math.PI / 2

    surface.position.set(
        center.x,
        bounds.max.y + 0.06,
        center.z
    )

    surface.renderOrder = -100

    scene.add(surface)

    let time = 0
    let speed = 0.65
    let disposed = false

    const targetColor = new THREE.Color()
    const targetReflection = new THREE.Color()

    // 04 光影及天氣同步更新

    function update(delta) {

        if (disposed) return

        const profile =
            profiles[worldAppearance.mode] ||
            profiles.original

        const climate =
            weatherProfiles[weather.mode] ||
            weatherProfiles.clear

        const factor =
            1 - Math.exp(-delta * 2.5)

        speed = THREE.MathUtils.lerp(
            speed,
            climate.speed,
            factor
        )

        time += delta * speed

        uniforms.uTime.value = time

        uniforms.uCamera.value.copy(
            camera.position
        )

        targetColor.set(profile.color)

        targetReflection.set(
            profile.reflection
        )

        uniforms.uSeaColor.value.lerp(
            targetColor,
            factor
        )

        uniforms.uReflection.value.lerp(
            targetReflection,
            factor
        )

        uniforms.uStrength.value =
            THREE.MathUtils.lerp(
                uniforms.uStrength.value,
                profile.strength *
                    (1 - climate.shade),
                factor
            )

        uniforms.uWave.value =
            THREE.MathUtils.lerp(
                uniforms.uWave.value,
                climate.waves,
                factor
            )

        uniforms.uShade.value =
            THREE.MathUtils.lerp(
                uniforms.uShade.value,
                climate.shade,
                factor
            )

        uniforms.uRain.value =
            THREE.MathUtils.lerp(
                uniforms.uRain.value,
                weather.mode === 'rain' ? 1 : 0,
                factor
            )
    }

    // 05 資源清理

    function dispose() {

        if (disposed) return

        disposed = true

        surface.removeFromParent()

        geometry.dispose()

        material.dispose()
    }

    console.log(
        '[V9.1.3] 動態海洋波光建立完成',
        {
            oceanMeshes: oceanMeshes.length,
            width: size.x,
            depth: size.z,
            surfaceHeight: surface.position.y
        }
    )

    return {
        surface,
        update,
        dispose,
        active: true
    }
}

