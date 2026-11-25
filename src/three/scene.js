import * as THREE from 'three'

// SkillIsland V1.0
// Three.js 核心場景

export function createScene() {

    const scene = new THREE.Scene()

    // 天空背景
    scene.background = new THREE.Color('#87CEEB')

    // 遠方霧化效果
    scene.fog = new THREE.Fog(
        '#B5E3F5',
        80,
        280
    )

    return scene
}