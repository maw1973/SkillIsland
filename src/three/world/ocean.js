import * as THREE from 'three'

export function createOcean(scene) {

    const geometry = new THREE.PlaneGeometry(
        600, 600, 100, 100
    )

    const material = new THREE.ShaderMaterial({

        uniforms: {

            uTime: { value: 0 },

            uDeepColor: {
                value: new THREE.Color('#168bc4')
            },

            uShallowColor: {
                value: new THREE.Color('#72e4e8')
            }
        },

        vertexShader: `
            uniform float uTime;

            varying vec2 vUv;
            varying float vWave;

            void main() {

                vUv = uv;

                vec3 pos = position;

                float wave =
                    sin(pos.x * 0.12 + uTime * 0.8) * 0.35 +
                    cos(pos.y * 0.10 + uTime * 0.6) * 0.25;

                pos.z += wave;

                vWave = wave;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(pos, 1.0);
            }
        `,

        fragmentShader: `
            uniform float uTime;
            uniform vec3 uDeepColor;
            uniform vec3 uShallowColor;

            varying vec2 vUv;
            varying float vWave;

            void main() {

                float wave =
                    sin(vUv.x * 110.0 + uTime * 0.5) *
                    cos(vUv.y * 90.0 + uTime * 0.4);

                float blend =
                    clamp(0.35 + wave * 0.12 + vWave * 0.35,
                    0.0, 1.0);

                vec3 color = mix(
                    uDeepColor,
                    uShallowColor,
                    blend
                );

                float ripple = pow(
                    max(0.0, wave),
                    18.0
                );

                color += ripple * 0.12;

                gl_FragColor = vec4(color, 1.0);

                #include <tonemapping_fragment>
                #include <colorspace_fragment>
            }
        `
    })

    const ocean = new THREE.Mesh(
        geometry,
        material
    )

    ocean.rotation.x = -Math.PI / 2
    ocean.position.y = -2

    scene.add(ocean)

    function update(time) {

        material.uniforms.uTime.value = time
    }

    return {
        ocean,
        update
    }
}