import { createScenePhotography } from './world/scenePhotography.js'
import { createAmbientAudio } from './world/ambientAudio.js'
import { createOceanAppearance } from './world/oceanAppearance.js'
import { createNightBuildingLights } from './world/nightBuildingLights.js'
import { createNightSky } from './world/nightSky.js'
import { createWeatherSystem } from './world/weatherSystem.js'
import { optimizeWorldAppearance } from './world/worldAppearance.js'
import { createIslandTour } from './islandTour.js'
import { createCinematicIntro } from './cinematicIntro.js'
import { createScene } from './scene.js'
import { createCamera } from './camera.js'
import { createRenderer } from './renderer.js'
import { createLighting } from './lighting.js'
import { createControls } from './controls.js'

import { createOcean } from './world/ocean.js'
import { createClouds } from './world/clouds.js'
import { createBridges } from './world/bridges.js'

import { createSkillIslands } from './islands/skillIslands.js'
import { createIslandLabels } from './islands/islandLabels.js'

import { createIslandInteraction } from './interaction/islandInteraction.js'

// SkillIsland V9.0.6.1
// 全群島渲染效能最佳化

export function initSkillIsland(container) {

    const scene = createScene()

    const camera = createCamera(
        container.clientWidth,
        container.clientHeight
    )

    const renderer = createRenderer(container)

    const lighting = createLighting(scene)

    const controls = createControls(
        camera,
        renderer
    )

    // ==================================
    // 01 渲染品質設定
    // ==================================

    const maxPixelRatio = Math.min(
        window.devicePixelRatio || 1,
        1.5
    )

    const minPixelRatio = 0.75

    let pixelRatio = maxPixelRatio

    renderer.setPixelRatio(pixelRatio)

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    )

    // ==================================
    // 02 建立既有場景
    // ==================================

    const ocean = createOcean(scene)

    const clouds = createClouds(scene)

    const islands = createSkillIslands(scene)

    const bridges = createBridges(
        scene,
        islands
    )

    const islandLabels = createIslandLabels(
        scene,
        islands
    )

    // V9131_LABEL_FIX
    // 島嶼標籤與海洋透明渲染分離

    islandLabels.labels.forEach(label => {

        const sprite = label.sprite

        if (!sprite) return

        sprite.renderOrder = 10000

        if (sprite.material) {

            sprite.material.depthTest = false

            sprite.material.depthWrite = false

            sprite.material.needsUpdate = true

        }

    })


    const interaction = createIslandInteraction({

        container,
        camera,
        renderer,
        controls,
        islands,
        islandLabels

    })

    // ==================================
    // 03 效能監測資料
    // ==================================

    const performanceStats = {

        fps: 0,

        frameMs: 0,

        cpuFrameMs: 0,

        drawCalls: 0,

        triangles: 0,

        geometries: 0,

        textures: 0,

        pixelRatio,

        quality: 'HIGH'

    }

    let performancePanel = null

    let originalPosition = ''

    let positionChanged = false

    // 僅開發模式顯示效能監測面板

    if (import.meta.env.DEV) {

        originalPosition = container.style.position

        if (
            getComputedStyle(container).position ===
            'static'
        ) {

            container.style.position = 'relative'

            positionChanged = true

        }

        performancePanel =
            document.createElement('div')

        performancePanel.id =
            'skillIslandPerformance'

        performancePanel.style.cssText = `
            position:absolute;
            right:16px;
            bottom:16px;
            z-index:999;
            min-width:175px;
            padding:12px 16px;
            background:rgba(10,25,42,0.88);
            color:#ffffff;
            border:1px solid rgba(103,232,249,0.6);
            border-radius:12px;
            font-family:Arial,"Microsoft JhengHei",sans-serif;
            font-size:12px;
            line-height:1.8;
            pointer-events:none;
            box-shadow:0 4px 15px rgba(0,0,0,0.2);
        `

        container.appendChild(performancePanel)

    }

    function updatePerformancePanel() {

        if (!performancePanel) return

        const fps = performanceStats.fps

        const color = fps >= 50

            ? '#4ade80'

            : fps >= 30

                ? '#facc15'

                : '#fb7185'

        performancePanel.innerHTML = `
            <div style="
                color:#67e8f9;
                font-weight:bold;
                margin-bottom:5px;
            ">
                SkillIsland V9.0.6.1
            </div>

            <div style="
                font-size:26px;
                color:${color};
                font-weight:bold;
            ">
                ${fps} FPS
            </div>

            <div>
                畫面間隔：
                ${performanceStats.frameMs} ms
            </div>

            <div>
                CPU 幀耗時：
                ${performanceStats.cpuFrameMs} ms
            </div>

            <div>
                Draw Calls：
                ${performanceStats.drawCalls.toLocaleString()}
            </div>

            <div>
                三角面：
                ${performanceStats.triangles.toLocaleString()}
            </div>

            <div>
                幾何資源：
                ${performanceStats.geometries}
            </div>

            <div>
                貼圖資源：
                ${performanceStats.textures}
            </div>

            <div>
                解析度倍率：
                ${performanceStats.pixelRatio.toFixed(2)}
            </div>

            <div>
                畫質：
                ${performanceStats.quality}
            </div>
        `

    }

    // ==================================
    // 04 視窗尺寸調整
    // ==================================

    function onResize() {

        const width = container.clientWidth

        const height = container.clientHeight

        if (!width || !height) return

        camera.aspect = width / height

        camera.updateProjectionMatrix()

        renderer.setSize(width, height)

    }

    const resizeObserver =
        new ResizeObserver(onResize)

    resizeObserver.observe(container)

    // ==================================
    // 05 自動畫質調整
    // ==================================

    let lowFpsCount = 0

    let highFpsCount = 0

    let lastQualityChange = performance.now()

    function adjustQuality(fps, now) {

        if (fps < 35) {

            lowFpsCount++

            highFpsCount = 0

        } else if (fps >= 55) {

            highFpsCount++

            lowFpsCount = 0

        } else {

            lowFpsCount = 0

            highFpsCount = 0

        }

        // 避免畫質頻繁切換

        if (now - lastQualityChange < 5000) {

            return

        }

        let nextRatio = pixelRatio

        if (lowFpsCount >= 3) {

            nextRatio = Math.max(
                minPixelRatio,
                pixelRatio - 0.15
            )

        } else if (highFpsCount >= 8) {

            nextRatio = Math.min(
                maxPixelRatio,
                pixelRatio + 0.1
            )

        }

        if (
            Math.abs(nextRatio - pixelRatio) <
            0.01
        ) return

        pixelRatio = nextRatio

        renderer.setPixelRatio(pixelRatio)

        onResize()

        performanceStats.pixelRatio = pixelRatio

        performanceStats.quality =
            pixelRatio >= maxPixelRatio - 0.01

                ? 'HIGH'

                : pixelRatio >= 0.95

                    ? 'MEDIUM'

                    : 'PERFORMANCE'

        lowFpsCount = 0

        highFpsCount = 0

        lastQualityChange = now

        if (import.meta.env.DEV) {

            console.log(
                '[V9.0.1] 自動畫質調整',
                {
                    fps,
                    pixelRatio,
                    quality: performanceStats.quality
                }
            )

        }

    }

    // ==================================
    // 06 動畫時間管理
    // ==================================

    const targetFPS = 60

    const frameInterval = 1000 / targetFPS

    const worldUpdateInterval = 1 / 30

    let lastTime = performance.now()

    let nextFrameTime = lastTime

    let elapsedTime = 0

    let worldAccumulator = 0

    let frameCounter = 0

    let frameSampleTime = lastTime

    let totalCpuTime = 0

    let disposed = false

    // ==================================
    // 07 全群島主要動畫循環
    // ==================================


    // V9.0.4 電影式鏡頭導覽

    const cinematicIntro = createCinematicIntro({

        container,

        camera,

        controls,

        islands

    })


    // V9.0.5 七大技能島自動巡覽

    const islandTour = createIslandTour({
        container,
        camera,
        controls,
        islands
    })


    // V9.0.6 全群島光影與色彩最佳化

    const worldAppearance = optimizeWorldAppearance({
        scene,
        renderer,
        islands,
        lighting
    })


    // V9.1.0 動態天氣系統

    const weather = createWeatherSystem({
        scene,
        islands
    })


    // V9.1.1 夜間星空系統

    const nightSky = createNightSky({
        scene,
        camera,
        worldAppearance,
        weather
    })


    // V9.1.2 夜間建築燈光

    const nightBuildingLights =
        createNightBuildingLights({
            islands,
            worldAppearance
        })


    // V9.1.3 動態海洋波光

    const oceanAppearance =
        createOceanAppearance({
            scene,
            camera,
            ocean,
            islands,
            worldAppearance,
            weather
        })


    const ambientAudio = createAmbientAudio({
        worldAppearance,
        weather
    })


    // V9.1.5 3D場景攝影

    const photography = createScenePhotography({
        scene,
        camera,
        renderer,
        islandLabels,
        worldAppearance,
        weather
    })

    renderer.setAnimationLoop(() => {

        if (disposed || document.hidden) return

        const now = performance.now()

        // 避免高更新率螢幕造成過多渲染

        if (now + 0.5 < nextFrameTime) {

            return

        }

        nextFrameTime += frameInterval

        if (nextFrameTime < now) {

            nextFrameTime = now + frameInterval

        }

        const cpuStart = performance.now()

        const delta = Math.min(
            Math.max(
                (now - lastTime) / 1000,
                0
            ),
            0.1
        )

        lastTime = now

        elapsedTime += delta

        worldAccumulator += delta

        // 海洋及雲朵限制最高30次/秒

        if (
            worldAccumulator >=
            worldUpdateInterval
        ) {

            ocean.update(elapsedTime)

            clouds.update(
                elapsedTime,
                worldAccumulator
            )

            worldAccumulator = 0

        }

        // 標籤及鏡頭保持即時更新

        islandLabels.update(elapsedTime)

        if (islandTour.active) {

            islandTour.update(now)

        } else if (cinematicIntro.active) {

            cinematicIntro.update(now)

        } else {

            controls.update()

        }

        // 單一場景渲染入口

        weather.beforeUpdate()

        worldAppearance.update(delta)

        weather.update(delta)
        nightSky.update(delta)
        nightBuildingLights.update(delta)
        oceanAppearance.update(delta)
        ambientAudio.update(delta)
        renderer.render(scene, camera)

        totalCpuTime +=
            performance.now() - cpuStart

        frameCounter++

        // 每秒更新效能統計

        const sampleDuration =
            now - frameSampleTime

        if (sampleDuration >= 1000) {

            performanceStats.fps = Math.round(
                frameCounter * 1000 /
                sampleDuration
            )

            performanceStats.frameMs = Number(
                (
                    sampleDuration /
                    Math.max(frameCounter, 1)
                ).toFixed(1)
            )

            performanceStats.cpuFrameMs = Number(
                (
                    totalCpuTime /
                    Math.max(frameCounter, 1)
                ).toFixed(1)
            )

            performanceStats.drawCalls =
                renderer.info.render.calls

            performanceStats.triangles =
                renderer.info.render.triangles

            performanceStats.geometries =
                renderer.info.memory.geometries

            performanceStats.textures =
                renderer.info.memory.textures

            adjustQuality(
                performanceStats.fps,
                now
            )

            updatePerformancePanel()

            frameCounter = 0

            totalCpuTime = 0

            frameSampleTime = now

        }

    })

    // ==================================
    // 08 背景分頁時間重置
    // ==================================

    function onVisibilityChange() {

        const now = performance.now()

        lastTime = now

        nextFrameTime = now

        frameSampleTime = now

        frameCounter = 0

        totalCpuTime = 0

        worldAccumulator = 0

        lowFpsCount = 0

        highFpsCount = 0

        lastQualityChange = now

    }

    document.addEventListener(
        'visibilitychange',
        onVisibilityChange
    )

    // ==================================
    // 09 完整資源清理
    // ==================================

    function dispose() {

        if (disposed) return

        disposed = true

        renderer.setAnimationLoop(null)

        resizeObserver.disconnect()

        document.removeEventListener(
            'visibilitychange',
            onVisibilityChange
        )

        const geometries = new Set()

        const materials = new Set()

        const textures = new Set()

        scene.traverse(object => {

            if (object.geometry) {

                geometries.add(object.geometry)

            }

            if (object.material) {

                const list =
                    Array.isArray(object.material)

                        ? object.material

                        : [object.material]

                list.forEach(material => {

                    if (!material) return

                    materials.add(material)

                    Object.values(material)
                        .forEach(value => {

                            if (value?.isTexture) {

                                textures.add(value)

                            }

                        })

                    if (material.uniforms) {

                        Object.values(
                            material.uniforms
                        ).forEach(uniform => {

                            if (
                                uniform?.value?.isTexture
                            ) {

                                textures.add(
                                    uniform.value
                                )

                            }

                        })

                    }

                })

            }

        })

        ambientAudio.dispose()
        oceanAppearance.dispose()
        nightBuildingLights.dispose()
        nightSky.dispose()
        weather.dispose()
        islandTour.dispose()
        cinematicIntro.dispose()
        interaction.dispose()

        controls.dispose()

        islandLabels.dispose()

        geometries.forEach(geometry =>
            geometry.dispose()
        )

        textures.forEach(texture =>
            texture.dispose()
        )

        materials.forEach(material =>
            material.dispose()
        )

        lighting.sunlight.shadow.dispose()

        renderer.dispose()

        renderer.domElement.remove()

        performancePanel?.remove()

        if (positionChanged) {

            container.style.position =
                originalPosition

        }

        if (
            import.meta.env.DEV &&
            window.SkillIslandDiagnostics
        ) {

            delete window.SkillIslandDiagnostics

        }

    }

    // ==================================
    // 10 初始化資訊
    // ==================================

    console.log('======================')

    console.log('SkillIsland V9.0.6.1')

    console.log('島嶼數量：', islands.length)

    console.log('橋梁數量：', bridges.children.length)

    console.log(
        '標籤數量：',
        islandLabels.labels.length
    )

    console.log('最高渲染幀率：', targetFPS)

    console.log('解析度倍率：', pixelRatio)

    console.log('全群島效能監測已初始化')

    console.log('======================')

    updatePerformancePanel()

    // 保留原有API及回傳物件

    return {

        scene,

        camera,

        renderer,

        controls,

        lighting,

        ocean,

        clouds,

        islands,

        bridges,

        islandLabels,

        interaction,

        islandTour,
        cinematicIntro,
        nightSky,
        weather,
        worldAppearance,
        capturePhoto: photography.capturePhoto,
        ambientAudio,
        performanceStats,

        island: islands[0],

        resetView: interaction.resetView,

        dispose

    }

}














