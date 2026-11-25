import * as THREE from 'three'

// SkillIsland V9.0.5
// 七大技能島自動巡覽

export function createIslandTour({
    container,
    camera,
    controls,
    islands
}) {

    const order = [
        'central',
        'image',
        'document',
        'excel',
        'code',
        'analytics',
        'agent'
    ]

    const descriptions = {
        central: '智慧技能管理中心',
        image: '攝影與影像處理',
        document: '智慧文件與 PDF 工具',
        excel: '試算表與資料管理',
        code: '程式開發工作區',
        analytics: '全球商業智慧分析',
        agent: '智慧代理與機器人'
    }

    const stops = order.map(id =>
        islands.find(i => i.config.id === id)
    ).filter(Boolean)

    const central = stops.find(
        i => i.config.id === 'central'
    )

    const center = new THREE.Vector3()

    central?.group.getWorldPosition(center)

    const originalPosition = new THREE.Vector3()
    const originalTarget = new THREE.Vector3()

    const fromPosition = new THREE.Vector3()
    const fromTarget = new THREE.Vector3()

    const orbitStart = new THREE.Vector3()
    const orbitEnd = new THREE.Vector3()
    const target = new THREE.Vector3()

    const moveDuration = 2200
    const orbitDuration = 4000
    const stopDuration = moveDuration + orbitDuration
    const returnDuration = 2500

    let running = false
    let disposed = false
    let index = 0
    let startedAt = 0
    let returning = false
    let previousControlsEnabled = true

    function emit(label = '') {

        container.dispatchEvent(
            new CustomEvent('skillisland:tourchange', {
                detail: {
                    active: running,
                    label
                }
            })
        )

    }

    function ease(t) {

        t = THREE.MathUtils.clamp(t, 0, 1)

        return t * t * (3 - 2 * t)

    }

    function applyCamera(position, lookTarget) {

        camera.position.copy(position)

        controls.target.copy(lookTarget)

        camera.lookAt(lookTarget)

    }

    function prepareStop(now) {

        const island = stops[index]

        fromPosition.copy(camera.position)
        fromTarget.copy(controls.target)

        island.group.getWorldPosition(target)

        target.y = island.groundY + 5

        const direction = target.clone().sub(center)

        direction.y = 0

        if (direction.lengthSq() < 0.001) {
            direction.set(0.7, 0, 1)
        }

        direction.normalize()

        const radius = Number(
            island.config.radius
        ) || 19

        const distance = Math.max(
            38, radius * 2.5
        )

        const height = Math.max(
            32, radius * 1.8
        )

        const angle = Math.atan2(
            direction.x,
            direction.z
        )

        orbitStart.set(
            target.x + Math.sin(angle - 0.35) * distance,
            target.y + height,
            target.z + Math.cos(angle - 0.35) * distance
        )

        orbitEnd.set(
            target.x + Math.sin(angle + 0.35) * distance,
            target.y + height,
            target.z + Math.cos(angle + 0.35) * distance
        )

        startedAt = now

        emit(
            `${index + 1}/${stops.length} ` +
            `${island.config.name}｜` +
            descriptions[island.config.id]
        )

    }

    function start() {

        if (running || disposed || !stops.length) return

        originalPosition.copy(camera.position)
        originalTarget.copy(controls.target)

        previousControlsEnabled = controls.enabled

        controls.enabled = false

        running = true
        returning = false
        index = 0

        prepareStop(performance.now())

        console.log('[V9.0.5] 七大技能島巡覽開始')

    }

    function finish() {

        if (!running) return

        running = false
        returning = false

        applyCamera(originalPosition, originalTarget)

        controls.enabled = previousControlsEnabled

        controls.update()

        emit()

        console.log('[V9.0.5] 自動巡覽結束')

    }

    const currentPosition = new THREE.Vector3()
    const currentTarget = new THREE.Vector3()

    function update(now = performance.now()) {

        if (!running || disposed) return

        const elapsed = now - startedAt

        // 返回巡覽前的視角

        if (returning) {

            const t = ease(
                elapsed / returnDuration
            )

            currentPosition.lerpVectors(
                fromPosition,
                originalPosition,
                t
            )

            currentTarget.lerpVectors(
                fromTarget,
                originalTarget,
                t
            )

            applyCamera(
                currentPosition,
                currentTarget
            )

            if (elapsed >= returnDuration) {
                finish()
            }

            return

        }

        // 前往下一座島嶼

        if (elapsed >= stopDuration) {

            index++

            if (index >= stops.length) {

                returning = true

                fromPosition.copy(camera.position)
                fromTarget.copy(controls.target)

                startedAt = now

                emit('巡覽完成，返回原始視角')

            } else {

                prepareStop(now)

            }

            return

        }

        // 鏡頭飛行階段

        if (elapsed < moveDuration) {

            const t = ease(
                elapsed / moveDuration
            )

            currentPosition.lerpVectors(
                fromPosition,
                orbitStart,
                t
            )

            currentTarget.lerpVectors(
                fromTarget,
                target,
                t
            )

            applyCamera(
                currentPosition,
                currentTarget
            )

            return

        }

        // 環繞島嶼展示階段

        const t = ease(
            (elapsed - moveDuration) / orbitDuration
        )

        const angleA = Math.atan2(
            orbitStart.x - target.x,
            orbitStart.z - target.z
        )

        const angleB = Math.atan2(
            orbitEnd.x - target.x,
            orbitEnd.z - target.z
        )

        const angleDiff = Math.atan2(
            Math.sin(angleB - angleA),
            Math.cos(angleB - angleA)
        )

        const angle = angleA + angleDiff * t

        const radius = Math.hypot(
            orbitStart.x - target.x,
            orbitStart.z - target.z
        )

        currentPosition.set(
            target.x + Math.sin(angle) * radius,
            orbitStart.y,
            target.z + Math.cos(angle) * radius
        )

        applyCamera(currentPosition, target)

    }

    function onKeyDown(event) {

        if (event.key === 'Escape' && running) {

            event.preventDefault()
            event.stopImmediatePropagation()

            finish()

        }

    }

    window.addEventListener(
        'keydown',
        onKeyDown,
        true
    )

    function dispose() {

        if (disposed) return

        finish()

        disposed = true

        window.removeEventListener(
            'keydown',
            onKeyDown,
            true
        )

    }

    console.log('[V9.0.5] 自動巡覽模組建立完成', {
        islands: stops.length,
        duration: stops.length * stopDuration
            + returnDuration
    })

    return {
        start,
        finish,
        update,
        dispose,
        get active() {
            return running
        }
    }

}
