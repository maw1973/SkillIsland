import * as THREE from 'three'

// SkillIsland V8.3.3
// 文件技能島動態展示

export function createDocumentCenterAnimation(island) {

    const group = new THREE.Group()

    group.name = 'DocumentCenterAnimation'
    group.position.y = island.groundY

    group.rotation.y = Math.atan2(
        -island.config.x,
        -island.config.z
    )

    island.group.add(group)

    // ==================================
    // 01 屋頂動態翻頁
    // ==================================

    const pagePivot = new THREE.Group()

    pagePivot.position.set(
        0, 10.15, 0
    )

    group.add(pagePivot)

    const pageGeometry =
        new THREE.PlaneGeometry(
            3.15, 3.85, 24, 8
        )

    pageGeometry.rotateX(-Math.PI / 2)

    pageGeometry.translate(
        1.575, 0, 0
    )

    // 書頁文字貼圖

    const canvas =
        document.createElement('canvas')

    canvas.width = 512
    canvas.height = 640

    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#fff8e8'
    ctx.fillRect(0, 0, 512, 640)

    ctx.fillStyle = '#345b9b'
    ctx.font = 'bold 36px Arial'
    ctx.textAlign = 'center'

    ctx.fillText(
        'SKILL ISLAND',
        256, 65
    )

    ctx.fillStyle = '#6481a2'

    for (let i = 0; i < 15; i++) {

        ctx.fillRect(
            48,
            110 + i * 30,
            i % 5 === 4 ? 280 : 416,
            7
        )
    }

    ctx.fillStyle = '#9aa5b4'
    ctx.font = '22px Arial'

    ctx.fillText(
        'DOCUMENT CENTER',
        256, 605
    )

    const pageTexture =
        new THREE.CanvasTexture(canvas)

    pageTexture.colorSpace =
        THREE.SRGBColorSpace

    const pageMaterial =
        new THREE.MeshStandardMaterial({

            map: pageTexture,
            side: THREE.DoubleSide,
            roughness: 0.85

        })

    const page = new THREE.Mesh(
        pageGeometry,
        pageMaterial
    )

    pagePivot.add(page)

    const original =
        new Float32Array(
            pageGeometry.attributes.position.array
        )

    // ==================================
    // 02 浮動文件展示
    // ==================================

    const files = []

    const fileConfigs = [

        { label: 'PDF', color: '#dc3545' },
        { label: 'DOCX', color: '#2563eb' },
        { label: 'TXT', color: '#16a34a' },
        { label: 'MD', color: '#7952cc' }

    ]

    function createFloatingFile(config, index) {

        const fileGroup =
            new THREE.Group()

        fileGroup.name =
            `Floating_${config.label}`

        const canvas =
            document.createElement('canvas')

        canvas.width = 256
        canvas.height = 320

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 256, 320)

        ctx.fillStyle = config.color
        ctx.fillRect(0, 0, 256, 100)

        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.font = 'bold 60px Arial'

        ctx.fillText(
            config.label, 128, 70
        )

        ctx.fillStyle = '#aeb9c8'

        for (let i = 0; i < 6; i++) {

            ctx.fillRect(
                30,
                135 + i * 26,
                i === 5 ? 115 : 196,
                9
            )
        }

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const body = new THREE.Mesh(

            new THREE.BoxGeometry(
                1.35, 1.7, 0.13
            ),

            new THREE.MeshStandardMaterial({
                color: 0xf5f7fa
            })
        )

        fileGroup.add(body)

        for (const side of [-1, 1]) {

            const face = new THREE.Mesh(

                new THREE.PlaneGeometry(
                    1.27, 1.62
                ),

                new THREE.MeshBasicMaterial({
                    map: texture
                })
            )

            face.position.z =
                side * 0.075

            if (side === -1) {

                face.rotation.y = Math.PI
            }

            fileGroup.add(face)
        }

        // 配置在屋頂前方

        const x = -4.5 + index * 3

        fileGroup.position.set(
            x, 11.8, 3.1
        )

        group.add(fileGroup)

        files.push({
            object: fileGroup,
            x,
            phase: index * 1.3
        })
    }

    fileConfigs.forEach(
        createFloatingFile
    )

    // ==================================
    // 03 文件傳輸光點
    // ==================================

    const particleCount = 32

    const positions =
        new Float32Array(
            particleCount * 3
        )

    const particleGeometry =
        new THREE.BufferGeometry()

    particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            positions, 3
        ).setUsage(THREE.DynamicDrawUsage)
    )

    const particles =
        new THREE.Points(

            particleGeometry,

            new THREE.PointsMaterial({

                color: 0x92eaff,
                size: 0.15,
                transparent: true,
                opacity: 0.85,
                depthWrite: false

            })
        )

    particles.frustumCulled = false

    group.add(particles)

    // ==================================
    // 04 文件掃描光線
    // ==================================

    const scanMaterial =
        new THREE.MeshBasicMaterial({

            color: 0x67e8f9,
            transparent: true,
            opacity: 0.75,
            depthWrite: false

        })

    const scanLine = new THREE.Mesh(

        new THREE.BoxGeometry(
            2.8, 0.055, 0.04
        ),

        scanMaterial
    )

    scanLine.position.set(
        0, 5.2, 4.43
    )

    group.add(scanLine)

    // ==================================
    // 05 動態更新
    // ==================================

    function update(time) {

        // 每八秒翻動一次書頁

        const cycle = time % 8

        const progress =
            Math.min(cycle / 2.4, 1)

        const eased =
            progress * progress
            * (3 - 2 * progress)

        pagePivot.rotation.z =
            eased * Math.PI

        page.visible = cycle < 2.4

        const attribute =
            pageGeometry.attributes.position

        for (
            let i = 0;
            i < attribute.count;
            i++
        ) {

            const index = i * 3

            const x = original[index]
            const y = original[index + 1]
            const z = original[index + 2]

            const bend =
                Math.sin(progress * Math.PI)
                * Math.sin(x / 3.15 * Math.PI)
                * 0.35

            attribute.setXYZ(
                i, x, y + bend, z
            )
        }

        attribute.needsUpdate = true

        pageGeometry.computeVertexNormals()

        // 文件上下浮動

        files.forEach(item => {

            item.object.position.y =
                11.8
                + Math.sin(
                    time * 1.6 + item.phase
                ) * 0.32

            item.object.rotation.y =
                Math.sin(
                    time * 0.8 + item.phase
                ) * 0.35
        })

        // 文件傳輸粒子

        for (let i = 0; i < particleCount; i++) {

            const t = (
                time * 0.25
                + i / particleCount
            ) % 1

            positions[i * 3] =
                Math.sin(
                    t * Math.PI * 2 + i
                ) * 1.25

            positions[i * 3 + 1] =
                8.5 + t * 4

            positions[i * 3 + 2] =
                3.2
                + Math.cos(i * 1.7) * 0.4
        }

        particleGeometry.attributes.position
            .needsUpdate = true

        // 掃描光線上下移動

        scanLine.position.y =
            5.2
            + (
                Math.sin(time * 1.7) + 1
            ) * 0.95

        scanMaterial.opacity =
            0.45
            + Math.sin(time * 2) * 0.2
    }

    // ==================================
    // 06 沿用既有渲染迴圈
    // ==================================

    const startTime = performance.now()

    particles.onBeforeRender = () => {

        update(
            (performance.now() - startTime)
            / 1000
        )
    }

    update(0)

    // 互動識別資料

    group.traverse(object => {

        object.userData.islandId =
            island.config.id

        object.userData.islandConfig =
            island.config
    })

    return group
}
