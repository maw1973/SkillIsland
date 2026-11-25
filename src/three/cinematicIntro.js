import * as THREE from 'three'

// SkillIsland V9.0.4
// 電影式開場鏡頭導覽

export function createCinematicIntro({
    container,
    camera,
    controls,
    islands
}) {

    const originalPosition =
        camera.position.clone()

    const originalTarget =
        controls.target.clone()

    const center = new THREE.Vector3()

    const central = islands.find(
        island => island.config?.id === 'central'
    )

    if (central?.group) {

        central.group.getWorldPosition(center)

    }

    // ==================================
    // 01 計算實際群島範圍
    // ==================================

    let radius = 30

    islands.forEach(island => {

        if (!island?.group) return

        const point = island.group.getWorldPosition(
            new THREE.Vector3()
        )

        const islandRadius =
            Number(island.config?.radius) || 19

        const distance = Math.hypot(
            point.x - center.x,
            point.z - center.z
        )

        radius = Math.max(
            radius,
            distance + islandRadius
        )

    })

    const duration = 12000

    let running = false

    let disposed = false

    let startedAt = 0

    let previousControlsEnabled = true

    const currentPosition = new THREE.Vector3()

    const currentTarget = new THREE.Vector3()

    // ==================================
    // 02 鏡頭路徑
    // ==================================

    function cameraPoint(angle, distance, height) {

        return new THREE.Vector3(

            center.x + Math.sin(angle) * distance,

            center.y + height,

            center.z + Math.cos(angle) * distance

        )

    }

    const originalAngle = Math.atan2(

        originalPosition.x - center.x,

        originalPosition.z - center.z

    )

    const highPoint = cameraPoint(

        originalAngle - 0.9,

        radius * 1.3,

        radius * 1.8

    )

    const orbitPoint = cameraPoint(

        originalAngle - 0.4,

        radius * 1.45,

        radius * 0.95

    )

    const plazaPoint = cameraPoint(

        originalAngle + 0.25,

        radius * 0.52,

        radius * 0.52

    )

    const returnPoint = originalPosition.clone()

    // ==================================
    // 03 電影式開場介面
    // ==================================

    const overlay = document.createElement('div')
    overlay.dataset.siIntroOverlay = 'true'

    overlay.style.cssText = `
        position:absolute;
        inset:0;
        pointer-events:none;
        z-index:110;
        overflow:hidden;
        font-family:"Microsoft JhengHei",Arial,sans-serif;
        opacity:0;
        transition:opacity .4s ease;
    `

    const topBar = document.createElement('div')

    topBar.style.cssText = `
        position:absolute;
        top:0;
        left:0;
        right:0;
        height:8%;
        background:linear-gradient(
            #071827,
            rgba(7,24,39,0)
        );
    `

    overlay.appendChild(topBar)

    const bottomBar = document.createElement('div')

    bottomBar.style.cssText = `
        position:absolute;
        bottom:0;
        left:0;
        right:0;
        height:25%;
        background:linear-gradient(
            transparent,
            rgba(7,24,39,.85)
        );
    `

    overlay.appendChild(bottomBar)

    const title = document.createElement('div')

    title.style.cssText = `
        position:absolute;
        left:0;
        right:0;
        bottom:11%;
        text-align:center;
        color:white;
        font-size:clamp(24px,4vw,52px);
        font-weight:800;
        letter-spacing:4px;
        text-shadow:0 3px 12px #102030;
    `

    title.textContent = 'SkillIsland 技能群島'

    overlay.appendChild(title)

    const subtitle = document.createElement('div')

    subtitle.style.cssText = `
        position:absolute;
        left:0;
        right:0;
        bottom:7%;
        text-align:center;
        color:#e0f2fe;
        font-size:clamp(12px,1.5vw,18px);
        letter-spacing:2px;
    `

    subtitle.textContent =
        '探索七大技能領域'

    overlay.appendChild(subtitle)

    const progress = document.createElement('div')

    progress.style.cssText = `
        position:absolute;
        bottom:20px;
        left:25%;
        width:50%;
        height:4px;
        background:rgba(255,255,255,.25);
        border-radius:8px;
        overflow:hidden;
    `

    const progressFill = document.createElement('div')

    progressFill.style.cssText = `
        width:0%;
        height:100%;
        background:#67e8f9;
        border-radius:8px;
    `

    progress.appendChild(progressFill)

    overlay.appendChild(progress)

    const skipButton = document.createElement('button')
    skipButton.dataset.siIntroControl = 'true'

    skipButton.type = 'button'

    skipButton.textContent = '略過導覽 »'

    skipButton.style.cssText = `
        position:absolute;
        right:24px;
        top:90px;
        padding:11px 19px;
        color:white;
        background:rgba(15,23,42,.8);
        border:1px solid #67e8f9;
        border-radius:24px;
        cursor:pointer;
        pointer-events:auto;
        font-size:14px;
    `

    overlay.appendChild(skipButton)

    container.appendChild(overlay)

    const replayButton = document.createElement('button')
    replayButton.dataset.siIntroControl = 'true'

    replayButton.type = 'button'

    replayButton.textContent = '▶ 電影式導覽'

    replayButton.style.cssText = `
        position:absolute;
        left:20px;
        bottom:22px;
        z-index:111;
        padding:11px 17px;
        color:white;
        background:rgba(15,23,42,.85);
        border:1px solid rgba(103,232,249,.65);
        border-radius:22px;
        cursor:pointer;
        font-family:"Microsoft JhengHei",sans-serif;
        font-size:13px;
        box-shadow:0 4px 12px rgba(0,0,0,.15);
    `

    container.appendChild(replayButton)

    // ==================================
    // 04 平滑鏡頭移動
    // ==================================

    function ease(t) {

        const u = THREE.MathUtils.clamp(t, 0, 1)

        return u * u * (3 - 2 * u)

    }

    function moveCamera(
        from,
        to,
        targetFrom,
        targetTo,
        t
    ) {

        const u = ease(t)

        currentPosition.lerpVectors(
            from,
            to,
            u
        )

        currentTarget.lerpVectors(
            targetFrom,
            targetTo,
            u
        )

        camera.position.copy(currentPosition)

        controls.target.copy(currentTarget)

        camera.lookAt(currentTarget)

    }

    // ==================================
    // 05 啟動電影式導覽
    // ==================================

    function start() {

        if (running || disposed) return

        previousControlsEnabled = controls.enabled

        controls.enabled = false

        running = true
        container.dispatchEvent(
            new Event('skillisland:introchange')
        )

        startedAt = performance.now()

        overlay.style.opacity = '1'

        overlay.style.visibility = 'visible'

        replayButton.style.display = 'none'

        skipButton.style.display = 'block'

        progressFill.style.width = '0%'

        title.textContent = 'SkillIsland 技能群島'

        subtitle.textContent =
            '探索七大技能領域'

        camera.position.copy(highPoint)

        controls.target.copy(center)

        camera.lookAt(center)

        console.log(
            '[V9.0.4] 電影式導覽開始'
        )

    }

    // ==================================
    // 06 結束及略過導覽
    // ==================================

    function finish() {

        if (!running) return

        running = false

        camera.position.copy(originalPosition)

        controls.target.copy(originalTarget)

        camera.lookAt(originalTarget)

        controls.enabled = previousControlsEnabled

        controls.update()

        overlay.style.opacity = '0'

        overlay.style.visibility = 'hidden'

        skipButton.style.display = 'none'

        replayButton.style.display = 'block'
        container.dispatchEvent(
            new Event('skillisland:introchange')
        )

        console.log(
            '[V9.0.4] 電影式導覽結束'
        )

    }

    // ==================================
    // 07 四階段鏡頭動畫
    // ==================================

    function update(now = performance.now()) {

        if (!running || disposed) return false

        const elapsed = now - startedAt

        const seconds = elapsed / 1000

        const percent = Math.min(
            elapsed / duration * 100,
            100
        )

        progressFill.style.width =
            `${percent}%`

        // 第一階段：高空俯瞰

        if (seconds < 3) {

            title.textContent =
                'SkillIsland 技能群島'

            subtitle.textContent =
                '七座島嶼・六座橋梁・無限創意'

            moveCamera(

                highPoint,

                orbitPoint,

                center,

                center,

                seconds / 3 * 0.4

            )

        }

        // 第二階段：環繞群島

        else if (seconds < 7) {

            title.textContent =
                '探索智慧技能世界'

            subtitle.textContent =
                '影像・文件・Excel・程式・分析・代理'

            const t = (seconds - 3) / 4

            moveCamera(

                highPoint,

                orbitPoint,

                center,

                center,

                0.4 + t * 0.6

            )

        }

        // 第三階段：聚焦中央廣場

        else if (seconds < 10) {

            title.textContent =
                '智慧技能中央廣場'

            subtitle.textContent =
                '串聯知識、創意與科技'

            moveCamera(

                orbitPoint,

                plazaPoint,

                center,

                center,

                (seconds - 7) / 3

            )

        }

        // 第四階段：返回操作視角

        else if (seconds < 12) {

            title.textContent =
                '開始你的技能探索'

            subtitle.textContent =
                '點擊島嶼，進入專屬技能領域'

            moveCamera(

                plazaPoint,

                returnPoint,

                center,

                originalTarget,

                (seconds - 10) / 2

            )

        }

        else {

            finish()

        }

        return running

    }

    // ==================================
    // 08 操作及資源清理
    // ==================================

    function onKeyDown(event) {

        if (event.key === 'Escape' && running) {

            event.preventDefault()
            event.stopPropagation()

            finish()

        }

    }

    skipButton.addEventListener(
        'click',
        finish
    )

    replayButton.addEventListener(
        'click',
        start
    )

    document.addEventListener(
        'keydown',
        onKeyDown
    )

    function dispose() {

        if (disposed) return

        if (running) finish()

        disposed = true

        skipButton.removeEventListener(
            'click',
            finish
        )

        replayButton.removeEventListener(
            'click',
            start
        )

        document.removeEventListener(
            'keydown',
            onKeyDown
        )

        overlay.remove()

        replayButton.remove()

    }

    // ==================================
    // 09 每次瀏覽工作階段只自動播放一次
    // ==================================

    let firstVisit = true

    try {

        firstVisit =
            sessionStorage.getItem(
                'SkillIslandIntroPlayed'
            ) !== 'true'

        sessionStorage.setItem(
            'SkillIslandIntroPlayed',
            'true'
        )

    } catch (error) {

        // 無法使用儲存空間時仍可正常播放

    }

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches

    if (firstVisit && !reducedMotion) {

        start()

    }

    console.log(
        '[V9.0.4] 電影式鏡頭導覽建立完成',
        {
            duration,
            islandRadius: radius,
            firstVisit
        }
    )

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

