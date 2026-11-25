import * as THREE from 'three'
import { gsap } from 'gsap'

// SkillIsland V1.7
// 島嶼互動與鏡頭飛行

export function createIslandInteraction({
    container,
    camera,
    renderer,
    controls,
    islands,
    islandLabels
}) {

    const canvas = renderer.domElement

    const raycaster = new THREE.Raycaster()

    const pointer = new THREE.Vector2()

    const islandMap = new Map(
        islands.map(island => [
            island.config.id,
            island
        ])
    )

    const targets = [
        ...islands.map(island => island.building),
        ...islandLabels.labels.map(label => label.sprite)
    ].filter(Boolean)

    const initialPosition = camera.position.clone()
    const initialTarget = controls.target.clone()

    let hoveredIsland = null
    let selectedIsland = null
    let pointerDown = null
    let flight = null

    const originalMaterials = new Map()

    // ============================
    // 各島技能清單
    // ============================

    const skillLists = {

        central: [
            '六大技能分類',
            '技能管理中心',
            '智慧工具總覽'
        ],

        image: [
            '圖片放大鏡',
            '自由塗鴉筆',
            '筆跡消除筆',
            '圖片裁切',
            '圖片壓縮',
            '亮度與色彩調整'
        ],

        document: [
            'PDF 合併',
            'PDF 分割',
            '文字擷取',
            '文件格式轉換'
        ],

        excel: [
            '資料清理',
            '日期格式統一',
            '重複資料移除',
            '資料統計'
        ],

        code: [
            'JSON 格式化',
            'SQL 工具',
            '程式碼格式化',
            '文字編碼轉換'
        ],

        analytics: [
            '長條圖生成',
            '折線圖生成',
            '圓餅圖生成',
            'CSV 資料分析'
        ],

        agent: [
            'Agent Skills',
            'SKILL.md 管理',
            '智慧文章摘要',
            '自動化任務'
        ]
    }

    // ============================
    // 建築物發光
    // ============================

    function restoreHighlight() {

        originalMaterials.forEach(
            (original, material) => {

                material.emissive.copy(
                    original.emissive
                )

                material.emissiveIntensity =
                    original.intensity
            }
        )

        originalMaterials.clear()
    }

    function highlightIsland(island) {

        restoreHighlight()

        if (!island?.building) return

        island.building.traverse(object => {

            if (!object.isMesh) return

            const materials =
                Array.isArray(object.material)
                    ? object.material
                    : [object.material]

            materials.forEach(material => {

                if (!material.emissive) return

                if (originalMaterials.has(material)) return

                originalMaterials.set(material, {

                    emissive: material.emissive.clone(),

                    intensity:
                        material.emissiveIntensity
                })

                material.emissive.setHex(
                    island.config.roofColor || 0x66ccff
                )

                material.emissiveIntensity = 0.45
            })
        })
    }

    // ============================
    // 滑鼠射線偵測
    // ============================

    function detectIsland(event) {

        const rect = canvas.getBoundingClientRect()

        if (!rect.width || !rect.height) return null

        pointer.x =
            ((event.clientX - rect.left) /
                rect.width) * 2 - 1

        pointer.y =
            -((event.clientY - rect.top) /
                rect.height) * 2 + 1

        raycaster.setFromCamera(
            pointer,
            camera
        )

        const hits = raycaster.intersectObjects(
            targets,
            true
        )

        for (const hit of hits) {

            let object = hit.object

            while (object) {

                const id = object.userData.islandId

                if (id && islandMap.has(id)) {

                    return islandMap.get(id)
                }

                object = object.parent
            }
        }

        return null
    }

    // ============================
    // 技能介紹面板
    // ============================

    const previousPosition = container.style.position

    if (getComputedStyle(container).position === 'static') {

        container.style.position = 'relative'
    }

    const panel = document.createElement('section')

    panel.setAttribute('aria-label', '技能島介紹')

    panel.style.cssText = `
        position:absolute;
        right:24px;
        top:50%;
        transform:translateY(-50%);
        width:min(320px, calc(100% - 48px));
        max-height:70%;
        overflow:auto;
        background:rgba(255,255,255,0.97);
        border-radius:24px;
        padding:22px;
        color:#203547;
        box-shadow:0 18px 55px rgba(15,50,80,.25);
        font-family:Microsoft JhengHei,sans-serif;
        z-index:100;
        display:none;
    `

    container.appendChild(panel)

    function showPanel(island) {

        const config = island.config

        panel.replaceChildren()

        const icon = document.createElement('div')

        icon.textContent = config.icon || '🏝️'

        icon.style.cssText = `
            font-size:48px;
            margin-bottom:8px;
        `

        const title = document.createElement('h2')

        title.textContent = config.name

        title.style.cssText = `
            font-size:24px;
            font-weight:800;
            margin:0 0 5px;
        `

        const english = document.createElement('div')

        english.textContent = config.englishName

        english.style.cssText = `
            color:#64748b;
            font-size:13px;
            margin-bottom:14px;
        `

        const description = document.createElement('p')

        description.textContent =
            config.description || '探索六大智慧技能島'

        description.style.cssText = `
            font-size:14px;
            line-height:1.7;
            color:#475569;
        `

        panel.append(
            icon,
            title,
            english,
            description
        )

        const heading = document.createElement('h3')

        heading.textContent = '規劃中的技能'

        heading.style.cssText = `
            font-size:16px;
            font-weight:700;
            margin:16px 0 10px;
        `

        panel.appendChild(heading)

        const skills = skillLists[config.id] || []

        skills.forEach((skill, index) => {

            const item = document.createElement('div')

            item.textContent =
                `${String(index + 1).padStart(2, '0')}  ${skill}`

            item.style.cssText = `
                padding:12px 14px;
                margin-bottom:7px;
                background:#f1f5f9;
                border-radius:12px;
                font-size:14px;
                font-weight:600;
            `

            panel.appendChild(item)
        })

        const note = document.createElement('p')

        note.textContent =
            '目前為技能介紹，實際操作工具將於後續版本開放。'

        note.style.cssText = `
            font-size:12px;
            color:#64748b;
            margin-top:12px;
        `

        panel.appendChild(note)

        const backButton = document.createElement('button')

        backButton.type = 'button'

        backButton.textContent = '返回群島全景'

        backButton.style.cssText = `
            width:100%;
            border:0;
            background:#087e91;
            color:white;
            padding:13px;
            border-radius:12px;
            font-size:15px;
            font-weight:700;
            cursor:pointer;
        `

        backButton.addEventListener(
            'click',
            resetView
        )

        // 返回全景統一由頂部工具列控制

        panel.style.display = 'block'

        gsap.fromTo(
            panel,
            {
                opacity:0,
                x:30
            },
            {
                opacity:1,
                x:0,
                duration:0.45
            }
        )
    }

    // ============================
    // 鏡頭平滑飛行
    // ============================

    function stopFlight() {

        if (flight) {

            flight.kill()

            flight = null
        }

        controls.enabled = true
    }

    function prepareIntro() {

        stopFlight()

        selectedIsland = null
        hoveredIsland = null
        pointerDown = null

        restoreHighlight()

        gsap.killTweensOf(panel)

        panel.style.display = 'none'

        canvas.style.cursor = 'grab'

    }

    function moveCamera(position, target) {

        stopFlight()

        controls.enabled = false

        flight = gsap.timeline({

            onUpdate: () => {
                controls.update()
            },

            onComplete: () => {

                controls.enabled = true

                flight = null
            }
        })

        flight.to(
            camera.position,
            {
                x:position.x,
                y:position.y,
                z:position.z,
                duration:1.65,
                ease:'power2.inOut'
            },
            0
        )

        flight.to(
            controls.target,
            {
                x:target.x,
                y:target.y,
                z:target.z,
                duration:1.65,
                ease:'power2.inOut'
            },
            0
        )
    }

    function focusIsland(island) {

        selectedIsland = island

        const config = island.config

        const target = new THREE.Vector3(
            config.x,
            island.groundY + 5,
            config.z
        )

        const direction = new THREE.Vector3(
            -config.x,
            0,
            -config.z
        )

        if (direction.lengthSq() === 0) {

            direction.set(0.7, 0, 1)
        }

        direction.normalize()

        const side = new THREE.Vector3(
            direction.z,
            0,
            -direction.x
        )

        const position = target.clone()

        position.addScaledVector(direction, 39)

        position.addScaledVector(side, 18)

        position.y += 29

        moveCamera(
            position,
            target
        )

        highlightIsland(island)

        showPanel(island)

        console.log(
            '已選取技能島：',
            config.name
        )
    }

    // ============================
    // 返回群島全景
    // ============================

    function resetView() {

        selectedIsland = null

        hoveredIsland = null

        restoreHighlight()

        gsap.killTweensOf(panel)

        panel.style.display = 'none'

        canvas.style.cursor = 'grab'

        moveCamera(
            initialPosition,
            initialTarget
        )
    }

    // ============================
    // 滑鼠事件
    // ============================

    function onPointerMove(event) {

        if (!controls.enabled) return

        if (pointerDown || flight) return

        const island = detectIsland(event)

        if (island === hoveredIsland) return

        hoveredIsland = island

        canvas.style.cursor =
            island ? 'pointer' : 'grab'

        highlightIsland(
            island || selectedIsland
        )
    }

    function onPointerDown(event) {

        if (!controls.enabled) return

        if (event.button !== 0) return

        pointerDown = {

            x:event.clientX,

            y:event.clientY
        }
    }

    function onPointerUp(event) {

        if (!controls.enabled) {
            pointerDown = null
            return
        }

        if (!pointerDown) return

        const dx =
            event.clientX - pointerDown.x

        const dy =
            event.clientY - pointerDown.y

        pointerDown = null

        // 拖曳超過 6 像素不視為點擊

        if (Math.hypot(dx, dy) > 6) return

        const island = detectIsland(event)

        if (island) {

            focusIsland(island)
        }
    }

    function onPointerLeave() {

        pointerDown = null

        hoveredIsland = null

        canvas.style.cursor = 'grab'

        highlightIsland(selectedIsland)
    }

    function onKeyDown(event) {

        if (event.key === 'Escape') {

            resetView()
        }
    }

    canvas.addEventListener(
        'pointermove',
        onPointerMove
    )

    canvas.addEventListener(
        'pointerdown',
        onPointerDown
    )

    canvas.addEventListener(
        'pointerup',
        onPointerUp
    )

    canvas.addEventListener(
        'pointerleave',
        onPointerLeave
    )

    canvas.addEventListener(
        'pointercancel',
        onPointerLeave
    )

    window.addEventListener(
        'keydown',
        onKeyDown
    )

    canvas.style.cursor = 'grab'

    // ============================
    // 資源清理
    // ============================

    function dispose() {

        stopFlight()

        restoreHighlight()

        gsap.killTweensOf(panel)

        canvas.removeEventListener(
            'pointermove',
            onPointerMove
        )

        canvas.removeEventListener(
            'pointerdown',
            onPointerDown
        )

        canvas.removeEventListener(
            'pointerup',
            onPointerUp
        )

        canvas.removeEventListener(
            'pointerleave',
            onPointerLeave
        )

        canvas.removeEventListener(
            'pointercancel',
            onPointerLeave
        )

        window.removeEventListener(
            'keydown',
            onKeyDown
        )

        panel.remove()

        container.style.position = previousPosition
    }

    return {
        prepareIntro,
        focusIsland,
        resetView,
        dispose
    }
}

