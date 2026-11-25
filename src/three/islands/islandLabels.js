import * as THREE from 'three'

// SkillIsland V1.5
// 中文浮動標籤與編號泡泡

export function createIslandLabels(scene, islands) {

    const labels = []

    const colors = {
        central: '#e96b4c',
        image: '#e75480',
        document: '#407bdb',
        excel: '#218b4a',
        code: '#7952cc',
        analytics: '#ef951f',
        agent: '#0097a7'
    }

    const group = new THREE.Group()

    group.name = 'IslandLabels'

    scene.add(group)

    function roundedRect(ctx, x, y, w, h, r) {

        ctx.beginPath()

        ctx.moveTo(x + r, y)

        ctx.lineTo(x + w - r, y)

        ctx.quadraticCurveTo(
            x + w, y,
            x + w, y + r
        )

        ctx.lineTo(x + w, y + h - r)

        ctx.quadraticCurveTo(
            x + w, y + h,
            x + w - r, y + h
        )

        ctx.lineTo(x + r, y + h)

        ctx.quadraticCurveTo(
            x, y + h,
            x, y + h - r
        )

        ctx.lineTo(x, y + r)

        ctx.quadraticCurveTo(
            x, y,
            x + r, y
        )

        ctx.closePath()
    }

    function createLabel(island, index) {

        const config = island.config

        const canvas = document.createElement('canvas')

        canvas.width = 1024
        canvas.height = 320

        const ctx = canvas.getContext('2d')

        const color =
            colors[config.id] || '#64748b'

        // 白色圓角卡片

        ctx.shadowColor = 'rgba(20,40,60,0.25)'
        ctx.shadowBlur = 22
        ctx.shadowOffsetY = 12

        roundedRect(
            ctx,
            35, 30,
            954, 225,
            52
        )

        ctx.fillStyle = '#ffffff'
        ctx.fill()

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        // 彩色外框

        ctx.lineWidth = 7
        ctx.strokeStyle = color
        ctx.stroke()

        // 下方箭頭

        ctx.beginPath()

        ctx.moveTo(470, 253)
        ctx.lineTo(512, 295)
        ctx.lineTo(554, 253)

        ctx.closePath()

        ctx.fillStyle = '#ffffff'
        ctx.fill()

        ctx.strokeStyle = color
        ctx.lineWidth = 5
        ctx.stroke()

        // 彩色編號泡泡

        ctx.beginPath()

        ctx.arc(
            150, 142,
            78,
            0,
            Math.PI * 2
        )

        ctx.fillStyle = color
        ctx.fill()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.font =
            'bold 70px Arial, Microsoft JhengHei'

        ctx.fillStyle = '#ffffff'

        ctx.fillText(
            config.number || 'HQ',
            150,
            146
        )

        // 中文島嶼名稱

        ctx.textAlign = 'left'

        ctx.font =
            'bold 68px Microsoft JhengHei, sans-serif'

        ctx.fillStyle = '#203547'

        ctx.fillText(
            config.name,
            270,
            105,
            670
        )

        // 英文名稱

        ctx.font = '36px Arial, sans-serif'

        ctx.fillStyle = '#64748b'

        ctx.fillText(
            config.englishName,
            275,
            180,
            660
        )

        // 建立 Three.js 貼圖

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const material =
            new THREE.SpriteMaterial({

                map: texture,

                transparent: true,

                depthTest: true,

                depthWrite: false,

                toneMapped: false
            })

        const sprite = new THREE.Sprite(material)

        const isCentral =
            config.id === 'central'

        const labelWidth =
            isCentral ? 30 : 27

        sprite.scale.set(
            labelWidth,
            labelWidth * 320 / 1024,
            1
        )

        const baseY =
            island.groundY + 26

        sprite.position.set(
            config.x,
            baseY,
            config.z
        )

        sprite.name =
            `Label_${config.id}`

        sprite.userData.islandId =
            config.id

        sprite.userData.islandConfig =
            config

        group.add(sprite)

        labels.push({
            sprite,
            texture,
            baseY,
            phase: index * 0.8
        })
    }

    islands.forEach(createLabel)

    // 浮動動畫

    function update(time) {

        labels.forEach(label => {

            label.sprite.position.y =
                label.baseY +
                Math.sin(
                    time * 1.5 + label.phase
                ) * 0.65
        })
    }

    // 釋放 Canvas 貼圖資源

    function dispose() {

        labels.forEach(label => {

            label.texture.dispose()
        })
    }

    console.log(
        'SkillIsland 中文標籤數量：',
        labels.length
    )

    return {
        group,
        labels,
        update,
        dispose
    }
}

