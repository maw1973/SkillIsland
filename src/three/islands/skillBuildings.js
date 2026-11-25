import * as THREE from 'three'

// SkillIsland V1.6
// 七種特色建築生成模組

export function createSkillBuilding(island, config) {

    const group = new THREE.Group()

    group.name = `Building_${config.id}`

    group.position.y = island.groundY

    group.userData.islandId = config.id

    island.group.add(group)

    // 共用材質

    const materials = new Map()

    function material(color, glow = false) {

        const key = `${color}_${glow}`

        if (!materials.has(key)) {

            materials.set(key,
                new THREE.MeshStandardMaterial({
                    color,
                    roughness: 0.75,
                    flatShading: true,
                    emissive: glow ? color : 0x000000,
                    emissiveIntensity: glow ? 0.7 : 0
                })
            )
        }

        return materials.get(key)
    }

    function mesh(geometry, color, x, y, z, glow = false) {

        const object = new THREE.Mesh(
            geometry,
            material(color, glow)
        )

        object.position.set(x, y, z)

        object.castShadow = true
        object.receiveShadow = true

        group.add(object)

        return object
    }

    function box(w, h, d, color, x, y, z, glow = false) {

        return mesh(
            new THREE.BoxGeometry(w, h, d),
            color, x, y, z, glow
        )
    }

    function cylinder(rt, rb, h, color, x, y, z, sides = 24) {

        return mesh(
            new THREE.CylinderGeometry(rt, rb, h, sides),
            color, x, y, z
        )
    }

    function sphere(r, color, x, y, z, glow = false) {

        return mesh(
            new THREE.IcosahedronGeometry(r, 1),
            color, x, y, z, glow
        )
    }

    function frontCylinder(r, depth, color, x, y, z) {

        const object = cylinder(
            r, r, depth,
            color, x, y, z
        )

        object.rotation.x = Math.PI / 2

        return object
    }

    function torus(r, tube, color, x, y, z) {

        return mesh(
            new THREE.TorusGeometry(r, tube, 8, 32),
            color, x, y, z
        )
    }

    // 共用建築底座

    box(
        11.5, 0.45, 10.5,
        0xe9ddc5,
        0, 0.225, 0
    )

    // ============================
    // HQ 中央技能管理中心
    // ============================

    function createHeadquarters() {

        // SkillIsland V8.1.1
        // 中央技能管理大樓

        const wall = 0xffefd2
        const trim = 0xffffff
        const glass = 0x69b9e8
        const frame = 0x315b78
        const roofColor = 0xd96848

        // 建築基座

        box(14.5, 0.5, 11.5,
            0xd9cbb3, 0, 0.25, 0)

        box(13.8, 0.25, 10.8,
            0xf1e6d3, 0, 0.625, 0)

        // 主建築

        box(12, 7.2, 8,
            wall, 0, 4.35, 0)

        // 左右側翼

        for (const side of [-1, 1]) {

            box(3.2, 5.8, 6.8,
                wall, side * 6.6, 3.65, -0.2)

            box(3.6, 0.4, 7.2,
                roofColor, side * 6.6, 6.75, -0.2)

            box(3.4, 0.18, 7,
                trim, side * 6.6, 6.45, -0.2)
        }

        // 樓層分隔裝飾

        for (const y of [0.85, 3.9, 7.8]) {

            box(12.3, 0.2, 8.25,
                trim, 0, y, 0)
        }

        // 正面與背面窗戶

        for (const side of [-1, 1]) {

            for (const x of [-4.5, -2.7, 2.7, 4.5]) {

                for (const y of [2.4, 5.7]) {

                    box(1.35, 1.95, 0.15,
                        frame, x, y, side * 4.08)

                    box(1.12, 1.72, 0.08,
                        glass, x, y, side * 4.19)

                    box(0.08, 1.72, 0.06,
                        trim, x, y, side * 4.25)

                    box(1.12, 0.08, 0.06,
                        trim, x, y, side * 4.25)

                    box(1.55, 0.16, 0.4,
                        trim, x, y - 1.02, side * 4.1)
                }
            }
        }

        // 側翼窗戶

        for (const side of [-1, 1]) {

            for (const y of [2.3, 4.8]) {

                box(1.8, 1.7, 0.16,
                    frame, side * 6.8, y, 3.25)

                box(1.55, 1.45, 0.1,
                    glass, side * 6.8, y, 3.37)

                box(0.08, 1.45, 0.05,
                    trim, side * 6.8, y, 3.44)
            }
        }

        // 正面中央玻璃帷幕

        box(3.25, 2.65, 0.22,
            frame, 0, 5.75, 4.13)

        box(2.95, 2.35, 0.12,
            glass, 0, 5.75, 4.29)

        for (const x of [-0.75, 0, 0.75]) {

            box(0.08, 2.35, 0.08,
                trim, x, 5.75, 4.38)
        }

        box(2.95, 0.08, 0.08,
            trim, 0, 5.75, 4.38)

        // 正面入口平台

        box(7.4, 0.35, 2.5,
            0xe4d8c3, 0, 0.925, 4.8)

        // 四根大型柱子

        for (const x of [-3.05, -1.15, 1.15, 3.05]) {

            cylinder(0.28, 0.36, 4.6,
                trim, x, 3.4, 5.5, 12)

            cylinder(0.45, 0.45, 0.25,
                0xe7e1d5, x, 1.2, 5.5, 12)

            cylinder(0.42, 0.42, 0.25,
                trim, x, 5.65, 5.5, 12)
        }

        // 柱廊頂部

        box(7.6, 0.55, 3.1,
            trim, 0, 5.95, 4.95)

        box(7.8, 0.25, 3.3,
            roofColor, 0, 6.35, 4.95)

        // 玻璃雙開門

        box(3.3, 3.5, 0.22,
            frame, 0, 2.5, 4.15)

        box(1.42, 3.15, 0.12,
            0x4088aa, -0.79, 2.5, 4.31)

        box(1.42, 3.15, 0.12,
            0x4088aa, 0.79, 2.5, 4.31)

        // 門把

        for (const x of [-0.22, 0.22]) {

            box(0.09, 0.55, 0.12,
                0xffd166, x, 2.35, 4.43)
        }

        // 入口階梯

        for (let i = 0; i < 4; i++) {

            const h = 0.25 * (4 - i)

            box(7.4, h, 0.7,
                0xe3d9c7,
                0, h / 2, 6 + i * 0.7)
        }

        // 屋頂底座

        box(13.2, 0.5, 9.2,
            0xbb563a, 0, 8.15, 0)

        const roof = mesh(
            new THREE.ConeGeometry(9.2, 3.2, 4),
            roofColor,
            0, 9.9, 0
        )

        roof.rotation.y = Math.PI / 4

        // 屋頂中央裝飾

        box(2.8, 0.35, 2.8,
            trim, 0, 11.55, 0)

        cylinder(0.85, 1.1, 1.1,
            0xf5d6a0, 0, 12.1, 0, 12)

        // SkillIsland 招牌

        const signCanvas = document.createElement('canvas')

        signCanvas.width = 1024
        signCanvas.height = 256

        const ctx = signCanvas.getContext('2d')

        ctx.fillStyle = '#124e66'
        ctx.fillRect(0, 0, 1024, 256)

        ctx.strokeStyle = '#ffdf91'
        ctx.lineWidth = 12
        ctx.strokeRect(12, 12, 1000, 232)

        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 108px Arial'
        ctx.fillText('SKILL ISLAND', 512, 93)

        ctx.font = 'bold 54px Microsoft JhengHei'
        ctx.fillText('中央技能管理中心', 512, 190)

        const signTexture = new THREE.CanvasTexture(signCanvas)

        signTexture.colorSpace = THREE.SRGBColorSpace

        const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(7.2, 1.8),
            new THREE.MeshBasicMaterial({
                map: signTexture
            })
        )

        sign.position.set(0, 7.05, 4.25)

        group.add(sign)

        // 中華民國國旗旗桿

        cylinder(0.075, 0.1, 3.8,
            0xe5e7eb, 0, 14.35, 0, 12)

        sphere(0.16, 0xffd166,
            0, 16.3, 0)

        // 國旗 Canvas 貼圖

        const flagCanvas = document.createElement('canvas')

        flagCanvas.width = 600
        flagCanvas.height = 400

        const flagCtx = flagCanvas.getContext('2d')

        // 紅地

        flagCtx.fillStyle = '#FE0000'
        flagCtx.fillRect(0, 0, 600, 400)

        // 青天

        flagCtx.fillStyle = '#000095'
        flagCtx.fillRect(0, 0, 300, 200)

        // 十二道光芒

        flagCtx.fillStyle = '#ffffff'
        flagCtx.beginPath()

        for (let i = 0; i < 24; i++) {

            const angle =
                -Math.PI / 2 + i * Math.PI / 12

            const r = i % 2 === 0 ? 75 : 42

            const x = 150 + Math.cos(angle) * r
            const y = 100 + Math.sin(angle) * r

            if (i === 0) flagCtx.moveTo(x, y)
            else flagCtx.lineTo(x, y)
        }

        flagCtx.closePath()
        flagCtx.fill()

        // 青色分隔圓環

        flagCtx.fillStyle = '#000095'
        flagCtx.beginPath()
        flagCtx.arc(150, 100, 42, 0, Math.PI * 2)
        flagCtx.fill()

        // 白日

        flagCtx.fillStyle = '#ffffff'
        flagCtx.beginPath()
        flagCtx.arc(150, 100, 37.5, 0, Math.PI * 2)
        flagCtx.fill()

        const flagTexture = new THREE.CanvasTexture(flagCanvas)

        flagTexture.colorSpace = THREE.SRGBColorSpace

        const flag = new THREE.Mesh(
            new THREE.PlaneGeometry(2.7, 1.8, 36, 24),
            new THREE.MeshBasicMaterial({
                map: flagTexture,
                side: THREE.DoubleSide
            })
        )

        flag.position.set(1.4, 15.25, 0)

        group.add(flag)

        // ==================================
        // V8.1.4 國旗飄揚動畫
        // ==================================

        const flagPosition =
            flag.geometry.attributes.position

        const flagOriginal =
            new Float32Array(flagPosition.array)

        const flagWaveStart =
            performance.now()

        flag.frustumCulled = false

        flag.onBeforeRender = () => {

            const time =
                (performance.now() - flagWaveStart)
                / 1000

            for (
                let i = 0;
                i < flagPosition.count;
                i++
            ) {

                const index = i * 3

                const x = flagOriginal[index]

                const y = flagOriginal[index + 1]

                // 靠近旗桿處固定

                const u = THREE.MathUtils.clamp(
                    (x + 1.35) / 2.7,
                    0,
                    1
                )

                const amplitude =
                    Math.pow(u, 1.4)

                // 主要風浪

                const wave1 =
                    Math.sin(
                        u * Math.PI * 2.2
                        - time * 3.2
                    ) * 0.28

                // 細微布料波紋

                const wave2 =
                    Math.sin(
                        u * Math.PI * 4.8
                        - time * 4.5
                        + y * 1.8
                    ) * 0.07

                const z =
                    (wave1 + wave2)
                    * amplitude

                // 旗幟上下擺動

                const vertical =
                    Math.sin(
                        u * Math.PI * 2
                        - time * 2.6
                    ) * 0.08 * amplitude

                flagPosition.setXYZ(
                    i,
                    x,
                    y + vertical,
                    z
                )
            }

            flagPosition.needsUpdate = true
        }

        // 入口景觀花盆

        for (const side of [-1, 1]) {

            cylinder(0.65, 0.48, 0.65,
                0xc97b55, side * 4.5, 0.95, 6.4, 12)

            sphere(0.85, 0x40985b,
                side * 4.5, 1.8, 6.4)

            sphere(0.38, 0xf8c34c,
                side * 4.5, 2.48, 6.4)
        }
    }
    // ============================
    // 01 影像技能島：大型相機
    // ============================

    function createImageStudio() {

        // SkillIsland V8.2.1
        // 專業攝影工作室

        const pink = 0xe976a6
        const lightPink = 0xf8bdd5
        const dark = 0x293247
        const silver = 0xdce4ed

        // 相機底座

        box(12, 0.4, 10.2,
            0xf5dce7, 0, 0.65, 0)

        // 相機主機身

        box(11, 7, 6.4,
            pink, 0, 4.35, 0)

        // 頂部金屬外殼

        box(11.2, 0.75, 6.6,
            lightPink, 0, 8.05, 0)

        // 底部金屬外殼

        box(11.2, 0.55, 6.6,
            dark, 0, 1.1, 0)

        // 相機握把

        box(2.25, 5.8, 1.25,
            dark, 4.65, 4.45, 3.45)

        for (let i = 0; i < 9; i++) {

            box(1.85, 0.12, 0.12,
                0x586174,
                4.65,
                2.15 + i * 0.52,
                4.12)
        }

        // 頂部觀景窗

        box(3.7, 1.45, 3.1,
            lightPink, -0.5, 9.05, -0.4)

        box(2.65, 0.85, 0.2,
            dark, -0.5, 9.05, -2.02)

        box(2.1, 0.58, 0.12,
            0x6fa6cc, -0.5, 9.05, -2.16)

        // 閃光燈

        box(1.8, 1.15, 0.28,
            silver, -3.9, 6.75, 3.35)

        box(1.45, 0.85, 0.16,
            0xfff4cf, -3.9, 6.75, 3.55,
            true)

        // 快門按鈕

        cylinder(0.68, 0.72, 0.32,
            dark, 4.2, 8.55, 0.8, 32)

        cylinder(0.48, 0.48, 0.18,
            silver, 4.2, 8.8, 0.8, 24)

        // 模式轉盤

        cylinder(0.95, 0.95, 0.45,
            dark, -3.85, 8.65, -0.3, 32)

        cylinder(0.78, 0.78, 0.08,
            silver, -3.85, 8.91, -0.3, 32)

        for (let i = 0; i < 20; i++) {

            const a = i * Math.PI * 2 / 20

            const ridge = box(
                0.09, 0.34, 0.12,
                0x657084,
                -3.85 + Math.cos(a) * 0.95,
                8.65,
                -0.3 + Math.sin(a) * 0.95
            )

            ridge.rotation.y = -a
        }

        // 大型鏡頭底座

        frontCylinder(
            3.2, 0.65,
            silver, -0.45, 4.5, 3.45
        )

        frontCylinder(
            3.02, 1.25,
            dark, -0.45, 4.5, 4.25
        )

        // 鏡頭對焦環

        frontCylinder(
            2.8, 1.05,
            0x41485b,
            -0.45, 4.5, 5.25
        )

        for (let i = 0; i < 40; i++) {

            const a = i * Math.PI * 2 / 40

            const grip = box(
                0.14, 0.24, 0.85,
                0x657084,
                -0.45 + Math.cos(a) * 2.8,
                4.5 + Math.sin(a) * 2.8,
                5.25
            )

            grip.rotation.z =
                a - Math.PI / 2
        }

        // 紅色專業鏡頭環

        torus(
            2.65, 0.085,
            0xff5374,
            -0.45, 4.5, 5.85
        )

        // 鏡頭前端

        frontCylinder(
            2.55, 0.65,
            dark,
            -0.45, 4.5, 6.15
        )

        torus(
            2.35, 0.16,
            silver,
            -0.45, 4.5, 6.52
        )

        // 多層鏡頭玻璃

        frontCylinder(
            2.15, 0.18,
            0x244d76,
            -0.45, 4.5, 6.5
        )

        frontCylinder(
            1.78, 0.12,
            0x348dc0,
            -0.45, 4.5, 6.63
        )

        frontCylinder(
            1.15, 0.10,
            0x3653a0,
            -0.45, 4.5, 6.72
        )

        // 鏡頭反光

        const reflection = sphere(
            0.48,
            0xc8f4ff,
            -1.15, 5.35, 6.76,
            true
        )

        reflection.scale.set(
            1.4, 0.75, 0.12
        )

        reflection.rotation.z = -0.5

        const reflection2 = sphere(
            0.21,
            0xffffff,
            0.4, 3.65, 6.76,
            true
        )

        reflection2.scale.z = 0.12

        // 機身品牌招牌

        const canvas =
            document.createElement('canvas')

        canvas.width = 1024
        canvas.height = 256

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#293247'
        ctx.fillRect(0, 0, 1024, 256)

        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.font = 'bold 108px Arial'
        ctx.fillText('IMAGE STUDIO', 512, 90)

        ctx.font = 'bold 55px Microsoft JhengHei'
        ctx.fillText('影像技能工作室', 512, 190)

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const sign = new THREE.Mesh(

            new THREE.PlaneGeometry(5.8, 1.45),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        )

        sign.position.set(
            -0.25, 7.4, 3.42
        )

        group.add(sign)

        // ============================
        // 背面 LCD 螢幕
        // ============================

        box(6.7, 4.6, 0.24,
            dark, -1.25, 4.55, -3.35)

        box(6.15, 4.05, 0.13,
            0x263d59, -1.25, 4.55, -3.55)

        // LCD 畫面貼圖

        const lcdCanvas =
            document.createElement('canvas')

        lcdCanvas.width = 640
        lcdCanvas.height = 420

        const lcd = lcdCanvas.getContext('2d')

        lcd.fillStyle = '#85cee8'
        lcd.fillRect(0, 0, 640, 420)

        // 太陽

        lcd.fillStyle = '#ffe39c'
        lcd.beginPath()
        lcd.arc(510, 85, 38, 0, Math.PI * 2)
        lcd.fill()

        // 遠山

        lcd.fillStyle = '#729ba8'
        lcd.beginPath()
        lcd.moveTo(0, 290)
        lcd.lineTo(150, 115)
        lcd.lineTo(290, 270)
        lcd.lineTo(430, 145)
        lcd.lineTo(640, 290)
        lcd.lineTo(640, 420)
        lcd.lineTo(0, 420)
        lcd.closePath()
        lcd.fill()

        // 近山

        lcd.fillStyle = '#438c72'
        lcd.beginPath()
        lcd.moveTo(0, 330)
        lcd.lineTo(220, 205)
        lcd.lineTo(400, 335)
        lcd.lineTo(640, 230)
        lcd.lineTo(640, 420)
        lcd.lineTo(0, 420)
        lcd.closePath()
        lcd.fill()

        // 對焦框

        lcd.strokeStyle = '#ffffff'
        lcd.lineWidth = 4
        lcd.strokeRect(260, 165, 120, 90)

        // 攝影參數

        lcd.fillStyle = 'rgba(0,0,0,0.65)'
        lcd.fillRect(0, 375, 640, 45)

        lcd.font = 'bold 22px Arial'
        lcd.fillStyle = '#ffffff'

        lcd.fillText(
            '1/125    F2.8    ISO 200',
            20, 405
        )

        const lcdTexture =
            new THREE.CanvasTexture(lcdCanvas)

        lcdTexture.colorSpace =
            THREE.SRGBColorSpace

        const screen = new THREE.Mesh(

            new THREE.PlaneGeometry(5.95, 3.9),

            new THREE.MeshBasicMaterial({
                map: lcdTexture
            })
        )

        screen.position.set(
            -1.25, 4.55, -3.64
        )

        screen.rotation.y = Math.PI

        group.add(screen)

        // 背面操作按鈕

        for (let i = 0; i < 3; i++) {

            frontCylinder(
                0.32, 0.22,
                dark,
                3.8, 6.8 - i * 0.85, -3.45
            )
        }

        // 十字方向控制盤

        frontCylinder(
            0.95, 0.22,
            dark, 3.8, 3.25, -3.45
        )

        frontCylinder(
            0.42, 0.24,
            silver, 3.8, 3.25, -3.62
        )

        // 電源指示燈

        sphere(
            0.12,
            0x65f3ab,
            4.7, 7.45, -3.45,
            true
        )
    }
    // ============================
    // 02 文件技能島：圖書館
    // ============================

    function createDocumentCenter() {

        // SkillIsland V8.3.1
        // 數位文件管理中心

        const wall = 0xf0f5ff
        const blue = 0x386ac4
        const darkBlue = 0x244b85
        const glass = 0x7fc6ed
        const white = 0xffffff

        // 建築底座

        box(13.5, 0.45, 10.5,
            0xcbd5e1, 0, 0.5, 0)

        box(12.8, 0.2, 9.8,
            0xe8eef5, 0, 0.825, 0)

        // 主建築

        box(11.5, 7.4, 8,
            wall, 0, 4.625, 0)

        // 樓層分隔

        box(11.8, 0.28, 8.25,
            blue, 0, 4.1, 0)

        // 建築屋頂

        box(12.6, 0.55, 9,
            blue, 0, 8.55, 0)

        box(11.7, 0.25, 8.2,
            darkBlue, 0, 8.95, 0)

        // 正面及背面玻璃窗

        for (const side of [-1, 1]) {

            for (const x of [-4.3, -2.7, 2.7, 4.3]) {

                for (const y of [2.65, 6.15]) {

                    box(1.35, 2.25, 0.14,
                        darkBlue,
                        x, y, side * 4.08)

                    box(1.12, 2.02, 0.08,
                        glass,
                        x, y, side * 4.19)

                    box(0.08, 2.02, 0.06,
                        white,
                        x, y, side * 4.25)

                    box(1.12, 0.08, 0.06,
                        white,
                        x, y, side * 4.25)
                }
            }
        }

        // 建築兩側大型玻璃窗

        for (const side of [-1, 1]) {

            for (const z of [-2.5, 0, 2.5]) {

                for (const y of [2.6, 6.1]) {

                    box(0.15, 2.3, 1.9,
                        darkBlue,
                        side * 5.82, y, z)

                    box(0.08, 2.05, 1.65,
                        glass,
                        side * 5.94, y, z)
                }
            }
        }

        // 中央玻璃帷幕

        box(3.25, 2.55, 0.18,
            darkBlue, 0, 6.2, 4.12)

        box(2.95, 2.25, 0.12,
            glass, 0, 6.2, 4.24)

        for (const x of [-0.75, 0, 0.75]) {

            box(0.07, 2.25, 0.06,
                white, x, 6.2, 4.32)
        }

        // 入口雙開玻璃門

        box(3.1, 3.2, 0.22,
            darkBlue, 0, 2.53, 4.15)

        for (const side of [-1, 1]) {

            box(1.35, 2.9, 0.12,
                0x4389b9,
                side * 0.73, 2.53, 4.31)

            box(0.10, 0.55, 0.10,
                0xffd166,
                side * 0.18, 2.45, 4.43)
        }

        // 入口遮雨棚

        box(5.1, 0.35, 2.2,
            blue, 0, 4.55, 4.95)

        // 入口支柱

        for (const side of [-1, 1]) {

            cylinder(
                0.20, 0.28, 3.6,
                white,
                side * 2.2,
                2.55, 5.65, 12
            )
        }

        // 入口階梯

        for (let i = 0; i < 3; i++) {

            const h = 0.3 * (3 - i)

            box(4.8, h, 0.65,
                0xdce3ed,
                0, h / 2,
                5.1 + i * 0.65)
        }

        // ==================================
        // 屋頂大型立體書本
        // ==================================

        const book = new THREE.Group()

        book.position.set(0, 9.2, 0)

        group.add(book)

        for (const side of [-1, 1]) {

            const page = new THREE.Group()

            page.rotation.z = -side * 0.22

            book.add(page)

            // 書皮

            const cover = new THREE.Mesh(
                new THREE.BoxGeometry(
                    3.65, 0.26, 4.25
                ),
                material(blue)
            )

            cover.position.set(
                side * 1.75, 0.35, 0
            )

            cover.castShadow = true

            page.add(cover)

            // 書頁

            const paper = new THREE.Mesh(
                new THREE.BoxGeometry(
                    3.4, 0.30, 4
                ),
                material(0xfff8e8)
            )

            paper.position.set(
                side * 1.75, 0.63, 0
            )

            paper.castShadow = true

            page.add(paper)

            // 書頁文字線條

            for (let i = 0; i < 7; i++) {

                const line = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        2.45, 0.022, 0.08
                    ),
                    material(0x9aa9be)
                )

                line.position.set(
                    side * 1.75,
                    0.795,
                    -1.35 + i * 0.43
                )

                page.add(line)
            }
        }

        // 書脊

        cylinder(
            0.22, 0.22, 4.2,
            darkBlue,
            0, 9.62, 0,
            16
        ).rotation.x = Math.PI / 2

        // ==================================
        // 文件中心中英文招牌
        // ==================================

        function createSign(
            title, subtitle,
            width, height,
            x, y, z,
            background
        ) {

            const canvas =
                document.createElement('canvas')

            canvas.width = 1024
            canvas.height = 320

            const ctx = canvas.getContext('2d')

            ctx.fillStyle = background

            ctx.fillRect(0, 0, 1024, 320)

            ctx.strokeStyle = '#b9ddff'
            ctx.lineWidth = 8

            ctx.strokeRect(
                12, 12, 1000, 296
            )

            ctx.fillStyle = '#ffffff'

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            ctx.font = 'bold 90px Arial'
            ctx.fillText(title, 512, 110)

            ctx.font =
                'bold 64px Microsoft JhengHei'

            ctx.fillText(subtitle, 512, 225)

            const texture =
                new THREE.CanvasTexture(canvas)

            texture.colorSpace =
                THREE.SRGBColorSpace

            const sign = new THREE.Mesh(
                new THREE.PlaneGeometry(
                    width, height
                ),
                new THREE.MeshBasicMaterial({
                    map: texture
                })
            )

            sign.position.set(x, y, z)

            group.add(sign)

            return sign
        }

        createSign(
            'DOCUMENT CENTER',
            '數位文件管理中心',
            9.2, 1.8,
            0, 7.65, 4.35,
            '#244b85'
        )

        // ==================================
        // 立體文件格式展示
        // ==================================

        function createFileModel(
            label, color, x, z, rotation
        ) {

            const file = new THREE.Group()

            file.position.set(x, 0, z)

            file.rotation.y = rotation

            group.add(file)

            const body = new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.65, 2.2, 0.28
                ),
                material(0xffffff)
            )

            body.position.y = 1.6
            body.castShadow = true

            file.add(body)

            const canvas =
                document.createElement('canvas')

            canvas.width = 256
            canvas.height = 340

            const ctx =
                canvas.getContext('2d')

            ctx.fillStyle = '#ffffff'

            ctx.fillRect(0, 0, 256, 340)

            ctx.fillStyle =
                '#' + color.toString(16).padStart(6, '0')

            ctx.fillRect(0, 0, 256, 110)

            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 60px Arial'
            ctx.textAlign = 'center'

            ctx.fillText(label, 128, 75)

            // 文件內容

            ctx.fillStyle = '#aab5c5'

            for (let i = 0; i < 6; i++) {

                ctx.fillRect(
                    28, 145 + i * 27,
                    i === 5 ? 115 : 200,
                    10
                )
            }

            const texture =
                new THREE.CanvasTexture(canvas)

            texture.colorSpace =
                THREE.SRGBColorSpace

            const face = new THREE.Mesh(

                new THREE.PlaneGeometry(
                    1.55, 2.1
                ),

                new THREE.MeshBasicMaterial({
                    map: texture
                })
            )

            face.position.set(
                0, 1.6, 0.15
            )

            file.add(face)

            // 文件展示底座

            const base = new THREE.Mesh(
                new THREE.BoxGeometry(
                    2, 0.4, 1.15
                ),
                material(color)
            )

            base.position.y = 0.2
            base.castShadow = true

            file.add(base)
        }

        createFileModel(
            'PDF', 0xdc3545,
            -4.65, 5.15, 0
        )

        createFileModel(
            'DOCX', 0x2563eb,
            4.65, 5.15, 0
        )

        createFileModel(
            'TXT', 0x16a34a,
            -4.65, -5.15, Math.PI
        )

        createFileModel(
            'MD', 0x7952cc,
            4.65, -5.15, Math.PI
        )
    }
    // ============================
    // 03 Excel 技能島：資料大樓
    // ============================

    function createExcelStudio() {

        // SkillIsland V8.4.1
        // 智慧試算表中心

        const green = 0x218b4a
        const darkGreen = 0x116638
        const lightGreen = 0x93d7a8
        const white = 0xf5fff7

        // ==================================
        // 建築底座
        // ==================================

        box(12.8, 0.45, 10,
            0xc9ddd0, 0, 0.5, 0)

        box(12.1, 0.2, 9.4,
            0xe8f2e9, 0, 0.825, 0)

        // 主建築

        box(10.8, 10.5, 7.6,
            green, 0, 6.175, 0)

        // 屋頂

        box(11.6, 0.55, 8.4,
            darkGreen, 0, 11.7, 0)

        box(11, 0.2, 7.9,
            lightGreen, 0, 12.075, 0)

        // 樓層裝飾帶

        for (const y of [3.45, 6.1, 8.75]) {

            box(10.95, 0.16, 7.75,
                darkGreen, 0, y, 0)
        }

        // ==================================
        // 正面試算表展示框
        // ==================================

        box(9.6, 7.6, 0.32,
            darkGreen, 0, 5.65, 3.95)

        box(9.15, 7.2, 0.18,
            white, 0, 5.65, 4.18)

        // 試算表 Canvas 貼圖

        const canvas =
            document.createElement('canvas')

        canvas.width = 1024
        canvas.height = 800

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#f4fff6'
        ctx.fillRect(0, 0, 1024, 800)

        // Excel 功能列

        ctx.fillStyle = '#176b3c'
        ctx.fillRect(0, 0, 1024, 80)

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px Microsoft JhengHei'

        ctx.fillText(
            '檔案    常用    插入    資料    公式',
            35, 52
        )

        // 公式列

        ctx.fillStyle = '#dcefe1'
        ctx.fillRect(0, 80, 1024, 68)

        ctx.fillStyle = '#205d39'
        ctx.font = 'bold 29px Arial'

        ctx.fillText(
            'fx    =SUM(B2:D5)',
            35, 123
        )

        // 欄位及列號

        const startX = 75
        const startY = 203

        const cellW = 189
        const cellH = 91

        const columns = ['A', 'B', 'C', 'D', 'E']

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        columns.forEach((name, i) => {

            ctx.fillStyle = '#c6e5cf'

            ctx.fillRect(
                startX + i * cellW,
                150,
                cellW - 3,
                49
            )

            ctx.fillStyle = '#225d3b'
            ctx.font = 'bold 31px Arial'

            ctx.fillText(
                name,
                startX + i * cellW + cellW / 2,
                175
            )
        })

        // 試算表內容

        const rows = [

            ['月份', '營收', '成本', '毛利', '成長'],
            ['01', '850', '520', '330', '8%'],
            ['02', '920', '560', '360', '9%'],
            ['03', '980', '590', '390', '7%'],
            ['04', '1050', '610', '440', '7%'],
            ['合計', '3800', '2280', '1520', '--']

        ]

        rows.forEach((row, r) => {

            const y =
                startY + r * cellH

            ctx.fillStyle = '#d6eadb'

            ctx.fillRect(
                0, y,
                72, cellH - 3
            )

            ctx.fillStyle = '#38734b'
            ctx.font = 'bold 27px Arial'

            ctx.fillText(
                String(r + 1),
                36, y + cellH / 2
            )

            row.forEach((value, c) => {

                const x =
                    startX + c * cellW

                if (r === 0) {

                    ctx.fillStyle = '#218b4a'

                } else if (r === 5) {

                    ctx.fillStyle = '#a7deb5'

                } else if (c === 3) {

                    ctx.fillStyle = '#e0f1bb'

                } else {

                    ctx.fillStyle =
                        r % 2 === 0
                            ? '#e8f5eb'
                            : '#ffffff'
                }

                ctx.fillRect(
                    x, y,
                    cellW - 3,
                    cellH - 3
                )

                ctx.fillStyle =
                    r === 0
                        ? '#ffffff'
                        : '#245c38'

                ctx.font =
                    'bold 30px Microsoft JhengHei'

                ctx.fillText(
                    value,
                    x + cellW / 2,
                    y + cellH / 2
                )
            })
        })

        // 底部工作表標籤

        ctx.fillStyle = '#d3e9d9'

        ctx.fillRect(
            0, 752, 1024, 48
        )

        ctx.fillStyle = '#176b3c'
        ctx.font = 'bold 23px Microsoft JhengHei'

        ctx.fillText(
            '營收統計', 130, 776
        )

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const screen = new THREE.Mesh(

            new THREE.PlaneGeometry(
                9, 7.05
            ),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        )

        screen.position.set(
            0, 5.65, 4.29
        )

        group.add(screen)

        // ==================================
        // 中英文建築招牌
        // ==================================

        const signCanvas =
            document.createElement('canvas')

        signCanvas.width = 1024
        signCanvas.height = 256

        const signCtx =
            signCanvas.getContext('2d')

        signCtx.fillStyle = '#105b35'

        signCtx.fillRect(
            0, 0, 1024, 256
        )

        signCtx.strokeStyle = '#bceace'
        signCtx.lineWidth = 8

        signCtx.strokeRect(
            10, 10, 1004, 236
        )

        signCtx.textAlign = 'center'
        signCtx.textBaseline = 'middle'

        signCtx.fillStyle = '#ffffff'
        signCtx.font = 'bold 100px Arial'

        signCtx.fillText(
            'EXCEL STUDIO', 512, 83
        )

        signCtx.font =
            'bold 65px Microsoft JhengHei'

        signCtx.fillText(
            '智慧試算表中心', 512, 187
        )

        const signTexture =
            new THREE.CanvasTexture(signCanvas)

        signTexture.colorSpace =
            THREE.SRGBColorSpace

        const sign = new THREE.Mesh(

            new THREE.PlaneGeometry(
                9.2, 1.65
            ),

            new THREE.MeshBasicMaterial({
                map: signTexture
            })
        )

        sign.position.set(
            0, 10.25, 4.0
        )

        group.add(sign)

        // ==================================
        // 側面玻璃窗
        // ==================================

        for (const side of [-1, 1]) {

            for (const y of [2.25, 4.9, 7.55, 10]) {

                box(0.16, 1.8, 5.8,
                    darkGreen,
                    side * 5.48, y, 0)

                box(0.08, 1.55, 5.5,
                    0x93d9c4,
                    side * 5.60, y, 0)

                for (const z of [-1.8, 0, 1.8]) {

                    box(0.08, 1.55, 0.07,
                        white,
                        side * 5.66, y, z)
                }
            }
        }

        // ==================================
        // 入口雙開門
        // ==================================

        box(2.9, 1.55, 0.22,
            darkGreen, 0, 1.3, 3.95)

        for (const side of [-1, 1]) {

            box(1.25, 1.35, 0.12,
                0x6bbca6,
                side * 0.68, 1.3, 4.12)

            box(0.08, 0.38, 0.12,
                0xffdfa1,
                side * 0.16, 1.3, 4.24)
        }

        // 入口階梯

        for (let i = 0; i < 3; i++) {

            const h = 0.25 * (3 - i)

            box(4.8, h, 0.65,
                0xd7e5dc,
                0, h / 2, 4.4 + i * 0.65)
        }

        // ==================================
        // 屋頂大型 Excel X 標誌
        // ==================================

        box(4.5, 0.35, 3.2,
            darkGreen, 0, 12.35, 0)

        box(4.2, 4.2, 0.65,
            darkGreen, 0, 14.6, 0)

        box(3.85, 3.85, 0.16,
            green, 0, 14.6, 0.40)

        const logoCanvas =
            document.createElement('canvas')

        logoCanvas.width = 512
        logoCanvas.height = 512

        const logoCtx =
            logoCanvas.getContext('2d')

        logoCtx.fillStyle = '#218b4a'

        logoCtx.fillRect(
            0, 0, 512, 512
        )

        logoCtx.strokeStyle = '#8cdbab'
        logoCtx.lineWidth = 12

        logoCtx.strokeRect(
            16, 16, 480, 480
        )

        logoCtx.fillStyle = '#ffffff'
        logoCtx.font = 'bold 390px Arial'
        logoCtx.textAlign = 'center'
        logoCtx.textBaseline = 'middle'

        logoCtx.fillText(
            'X', 256, 265
        )

        const logoTexture =
            new THREE.CanvasTexture(logoCanvas)

        logoTexture.colorSpace =
            THREE.SRGBColorSpace

        for (const side of [-1, 1]) {

            const logo = new THREE.Mesh(

                new THREE.PlaneGeometry(
                    3.7, 3.7
                ),

                new THREE.MeshBasicMaterial({
                    map: logoTexture
                })
            )

            logo.position.set(
                0, 14.6, side * 0.5
            )

            if (side === -1) {

                logo.rotation.y = Math.PI
            }

            group.add(logo)
        }

        // ==================================
        // 入口資料統計展示柱
        // ==================================

        const barColors = [

            0x42a5f5,
            0x66bb6a,
            0xffc857,
            0x9c7cdb

        ]

        for (const side of [-1, 1]) {

            box(2.6, 0.3, 1.6,
                darkGreen,
                side * 4.1, 0.6, 5.4)

            for (let i = 0; i < 4; i++) {

                const h = 0.6 + i * 0.35

                box(0.4, h, 0.85,
                    barColors[i],
                    side * 4.1 - 0.75 + i * 0.5,
                    0.75 + h / 2,
                    5.4)
            }
        }
    }
    // ============================
    // 04 程式技能島：大型電腦
    // ============================

    function createCodeLab() {

        // SkillIsland V8.5.1
        // 軟體開發中心

        const purple = 0x7952cc
        const darkPurple = 0x483578
        const lightPurple = 0xc4b5fd
        const dark = 0x20283b

        // ==================================
        // 01 電腦建築底座
        // ==================================

        box(13.2, 0.35, 10.5,
            0xe6dff4, 0, 0.625, 0)

        box(9, 0.55, 5.2,
            darkPurple, 0, 1.075, -0.7)

        // 螢幕支架

        box(3, 3.1, 2.2,
            purple, 0, 2.9, -0.7)

        box(3.15, 0.2, 2.4,
            lightPurple, 0, 1.55, -0.7)

        // ==================================
        // 02 大型電腦螢幕
        // ==================================

        box(12.6, 8.8, 2.5,
            purple, 0, 8.2, -0.7)

        box(12.8, 0.3, 2.7,
            lightPurple, 0, 12.65, -0.7)

        box(11.8, 8.05, 0.25,
            dark, 0, 8.2, 0.65)

        // ==================================
        // 03 程式開發介面 Canvas
        // ==================================

        const canvas =
            document.createElement('canvas')

        canvas.width = 1280
        canvas.height = 880

        const ctx = canvas.getContext('2d')

        // 編輯器背景

        ctx.fillStyle = '#182235'
        ctx.fillRect(0, 0, 1280, 880)

        // 視窗標題列

        ctx.fillStyle = '#344056'
        ctx.fillRect(0, 0, 1280, 65)

        const buttonColors = [
            '#f87171',
            '#facc15',
            '#4ade80'
        ]

        buttonColors.forEach((color, i) => {

            ctx.fillStyle = color

            ctx.beginPath()

            ctx.arc(
                28 + i * 38,
                32,
                11,
                0,
                Math.PI * 2
            )

            ctx.fill()
        })

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 25px Arial'
        ctx.textAlign = 'center'

        ctx.fillText(
            'SkillIsland - Code Editor',
            640, 42
        )

        // ==================================
        // 04 專案檔案總管
        // ==================================

        ctx.fillStyle = '#263247'
        ctx.fillRect(0, 65, 260, 815)

        ctx.fillStyle = '#94a3b8'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'left'

        ctx.fillText(
            'EXPLORER',
            25, 108
        )

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 23px Arial'

        ctx.fillText(
            'SKILL ISLAND',
            25, 155
        )

        const files = [

            ['src', '#facc15'],
            ['  main.js', '#facc15'],
            ['  App.vue', '#4ade80'],
            ['  api.js', '#facc15'],
            ['  skills.js', '#facc15'],
            ['  style.css', '#60a5fa'],
            ['public', '#a78bfa'],
            ['package.json', '#fb923c'],
            ['vite.config.js', '#facc15']

        ]

        files.forEach(([name, color], i) => {

            const y = 202 + i * 43

            if (i === 2) {

                ctx.fillStyle = '#405473'

                ctx.fillRect(
                    0, y - 28, 260, 40
                )
            }

            ctx.fillStyle = color

            ctx.font = '23px Arial'

            ctx.fillText(
                name, 28, y
            )
        })

        // ==================================
        // 05 編輯器分頁
        // ==================================

        ctx.fillStyle = '#303c51'

        ctx.fillRect(
            260, 65, 1020, 54
        )

        ctx.fillStyle = '#182235'

        ctx.fillRect(
            260, 65, 220, 54
        )

        ctx.fillStyle = '#c4b5fd'
        ctx.fillRect(
            260, 65, 220, 4
        )

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '25px Arial'

        ctx.fillText(
            'App.vue', 286, 100
        )

        // ==================================
        // 06 彩色程式碼
        // ==================================

        const lines = [

            ["import { ref } from 'vue'", '#c4b5fd'],

            ["import { loadSkills } from './api.js'", '#c4b5fd'],

            ['', '#ffffff'],

            ['const skills = ref([])', '#7dd3fc'],

            ['const ready = ref(false)', '#7dd3fc'],

            ['', '#ffffff'],

            ['async function initialize() {', '#fde68a'],

            ['    skills.value = await loadSkills()', '#86efac'],

            ['    ready.value = true', '#f9a8d4'],

            ['}', '#fde68a'],

            ['', '#ffffff'],

            ['initialize()', '#93c5fd']

        ]

        ctx.font = '27px Consolas, monospace'

        lines.forEach(([text, color], i) => {

            const y = 158 + i * 34

            ctx.fillStyle = '#62748c'

            ctx.fillText(
                String(i + 1),
                280, y
            )

            ctx.fillStyle = color

            ctx.fillText(
                text,
                337, y
            )
        })

        // ==================================
        // 07 終端機
        // ==================================

        ctx.fillStyle = '#303c51'

        ctx.fillRect(
            260, 585, 1020, 45
        )

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 23px Arial'

        ctx.fillText(
            'TERMINAL', 282, 616
        )

        ctx.fillStyle = '#101827'

        ctx.fillRect(
            260, 630, 1020, 215
        )

        ctx.font = '25px Consolas, monospace'

        ctx.fillStyle = '#e2e8f0'

        ctx.fillText(
            'PS D:\\SkillIsland> npm run build',
            285, 670
        )

        ctx.fillStyle = '#94a3b8'

        ctx.fillText(
            'Building production environment...',
            285, 712
        )

        ctx.fillStyle = '#86efac'

        ctx.fillText(
            'Build completed successfully',
            285, 754
        )

        ctx.fillText(
            'SkillIsland Development Studio',
            285, 795
        )

        // 底部狀態列

        ctx.fillStyle = '#7952cc'

        ctx.fillRect(
            0, 845, 1280, 35
        )

        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Arial'

        ctx.fillText(
            'main    UTF-8    JavaScript    Vue 3',
            25, 870
        )

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const screen = new THREE.Mesh(

            new THREE.PlaneGeometry(
                11.5, 7.85
            ),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        )

        screen.position.set(
            0, 8.2, 0.81
        )

        group.add(screen)

        // ==================================
        // 08 屋頂程式碼標誌
        // ==================================

        box(4.8, 0.35, 2.3,
            darkPurple, 0, 12.975, -0.7)

        box(4.6, 2.75, 0.5,
            darkPurple, 0, 14.525, -0.7)

        const logoCanvas =
            document.createElement('canvas')

        logoCanvas.width = 640
        logoCanvas.height = 384

        const logoCtx =
            logoCanvas.getContext('2d')

        logoCtx.fillStyle = '#594298'

        logoCtx.fillRect(
            0, 0, 640, 384
        )

        logoCtx.strokeStyle = '#b9a6f5'
        logoCtx.lineWidth = 10

        logoCtx.strokeRect(
            12, 12, 616, 360
        )

        logoCtx.fillStyle = '#ffffff'
        logoCtx.textAlign = 'center'
        logoCtx.textBaseline = 'middle'
        logoCtx.font = 'bold 265px Consolas'

        logoCtx.fillText(
            '</>', 320, 192
        )

        const logoTexture =
            new THREE.CanvasTexture(logoCanvas)

        logoTexture.colorSpace =
            THREE.SRGBColorSpace

        for (const side of [-1, 1]) {

            const logo = new THREE.Mesh(

                new THREE.PlaneGeometry(
                    4.4, 2.6
                ),

                new THREE.MeshBasicMaterial({
                    map: logoTexture
                })
            )

            logo.position.set(
                0, 14.525,
                -0.7 + side * 0.26
            )

            if (side === -1) {

                logo.rotation.y = Math.PI
            }

            group.add(logo)
        }

        // ==================================
        // 09 大型鍵盤
        // ==================================

        box(9.6, 0.35, 3.2,
            darkPurple, -0.45, 0.975, 3.4)

        for (let row = 0; row < 4; row++) {

            for (let col = 0; col < 12; col++) {

                if (
                    row === 3
                    && col >= 3
                    && col <= 8
                ) {

                    continue
                }

                box(
                    0.62, 0.15, 0.54,
                    row === 0
                        ? lightPurple
                        : 0xeee8fa,

                    -4.575 + col * 0.75,

                    1.225,

                    2.35 + row * 0.69
                )
            }
        }

        // 空白鍵

        box(4.37, 0.15, 0.54,
            lightPurple,
            -0.45, 1.225, 4.42)

        // ==================================
        // 10 大型滑鼠
        // ==================================

        const mouse = sphere(
            0.85,
            purple,
            5.55, 1.05, 3.55
        )

        mouse.scale.set(
            0.70, 0.38, 1.15
        )

        box(0.07, 0.08, 0.55,
            darkPurple,
            5.55, 1.37, 3.35)

        // 滑鼠滾輪

        const wheel = cylinder(
            0.15, 0.15, 0.12,
            lightPurple,
            5.55, 1.4, 3.45, 12
        )

        wheel.rotation.z =
            Math.PI / 2

        // ==================================
        // 11 建築電源指示燈
        // ==================================

        sphere(
            0.13,
            0x86efac,
            5.75, 4.05, 0.85,
            true
        )

        // ==================================
        // 12 背面科技散熱孔
        // ==================================

        for (let row = 0; row < 5; row++) {

            for (let col = 0; col < 10; col++) {

                box(
                    0.68, 0.15, 0.08,
                    darkPurple,

                    -4 + col * 0.88,

                    6.8 + row * 0.36,

                    -2.0
                )
            }
        }

        // 背面裝飾燈條

        for (const side of [-1, 1]) {

            box(
                0.12, 5.3, 0.09,
                0xc4b5fd,

                side * 5.6,

                8.2,

                -2.0,

                true
            )
        }
    }
    // ============================
    // 05 數據分析島：立體圖表
    // ============================

    function createAnalyticsLab() {

        // SkillIsland V8.6.1
        // 商業智慧數據分析中心

        const orange = 0xef951f
        const darkOrange = 0xa96117
        const gold = 0xffd180
        const cream = 0xfff4df

        // ==================================
        // 01 建築底座
        // ==================================

        box(
            13.2, 0.35, 10.5,
            0xe8d5b9,
            0, 0.625, 0
        )

        box(
            12.5, 0.18, 9.8,
            cream,
            0, 0.89, 0
        )

        // ==================================
        // 02 商業智慧主建築
        // ==================================

        box(
            11.5, 8.1, 7.8,
            orange,
            0, 5.03, 0
        )

        box(
            12.3, 0.5, 8.6,
            darkOrange,
            0, 9.33, 0
        )

        box(
            11.9, 0.18, 8.2,
            gold,
            0, 9.67, 0
        )

        // 樓層裝飾

        for (const y of [3.1, 6.0]) {

            box(
                11.7, 0.16, 8.0,
                darkOrange,
                0, y, 0
            )
        }

        // ==================================
        // 03 大型 BI 儀表板
        // ==================================

        box(
            10.4, 5.8, 0.28,
            darkOrange,
            0, 4.85, 4.05
        )

        box(
            10.05, 5.45, 0.12,
            cream,
            0, 4.85, 4.25
        )

        const canvas =
            document.createElement('canvas')

        canvas.width = 1400
        canvas.height = 800

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#fff7e9'

        ctx.fillRect(
            0, 0, 1400, 800
        )

        // 儀表板標題

        ctx.fillStyle = '#a96117'

        ctx.fillRect(
            0, 0, 1400, 90
        )

        ctx.fillStyle = '#ffffff'

        ctx.font =
            'bold 40px Microsoft JhengHei'

        ctx.textAlign = 'center'

        ctx.fillText(
            'BUSINESS INTELLIGENCE DASHBOARD',
            700, 58
        )

        // ==================================
        // 04 KPI 指標卡片
        // ==================================

        const kpis = [

            ['總營收', '3,800', '#ef951f'],
            ['總成本', '2,280', '#538fd3'],
            ['總毛利', '1,520', '#55af80'],
            ['毛利率', '40.0%', '#9273d1']

        ]

        kpis.forEach(
            ([label, value, color], i) => {

                const x = 25 + i * 344

                ctx.fillStyle = '#ffffff'

                ctx.fillRect(
                    x, 112, 320, 135
                )

                ctx.fillStyle = color

                ctx.fillRect(
                    x, 112, 320, 9
                )

                ctx.font =
                    'bold 29px Microsoft JhengHei'

                ctx.fillStyle = '#687383'

                ctx.fillText(
                    label, x + 160, 164
                )

                ctx.fillStyle = color

                ctx.font = 'bold 52px Arial'

                ctx.fillText(
                    value, x + 160, 224
                )
            }
        )

        // ==================================
        // 05 長條圖
        // ==================================

        ctx.fillStyle = '#ffffff'

        ctx.fillRect(
            25, 275, 435, 450
        )

        ctx.fillStyle = '#85511d'

        ctx.font =
            'bold 32px Microsoft JhengHei'

        ctx.fillText(
            '營收趨勢', 242, 318
        )

        const barValues = [
            850, 920, 980, 1050
        ]

        const barColors = [

            '#538fd3',
            '#55af80',
            '#9273d1',
            '#ef951f'

        ]

        // 圖表格線

        ctx.strokeStyle = '#e3e8ef'
        ctx.lineWidth = 2

        for (let i = 0; i < 6; i++) {

            const y = 365 + i * 60

            ctx.beginPath()

            ctx.moveTo(65, y)
            ctx.lineTo(430, y)

            ctx.stroke()
        }

        barValues.forEach((value, i) => {

            const h = value / 1050 * 260

            const x = 85 + i * 90

            ctx.fillStyle = barColors[i]

            ctx.fillRect(
                x, 665 - h, 55, h
            )

            ctx.fillStyle = '#526174'

            ctx.font = 'bold 24px Arial'

            ctx.fillText(
                String(value),
                x + 27.5,
                650 - h
            )

            ctx.fillText(
                '0' + (i + 1),
                x + 27.5,
                700
            )
        })

        // ==================================
        // 06 折線圖
        // ==================================

        ctx.fillStyle = '#ffffff'

        ctx.fillRect(
            480, 275, 435, 450
        )

        ctx.fillStyle = '#85511d'

        ctx.font =
            'bold 32px Microsoft JhengHei'

        ctx.fillText(
            '毛利變化', 697, 318
        )

        const profits = [
            330, 360, 390, 440
        ]

        const points = profits.map(
            (value, i) => ({

                x: 535 + i * 105,

                y: 665 - value / 500 * 300

            })
        )

        ctx.strokeStyle = '#e3e8ef'
        ctx.lineWidth = 2

        for (let i = 0; i < 6; i++) {

            const y = 365 + i * 60

            ctx.beginPath()

            ctx.moveTo(515, y)
            ctx.lineTo(885, y)

            ctx.stroke()
        }

        // 折線填色

        ctx.beginPath()

        ctx.moveTo(
            points[0].x, 665
        )

        points.forEach(p => {

            ctx.lineTo(p.x, p.y)
        })

        ctx.lineTo(
            points[points.length - 1].x,
            665
        )

        ctx.closePath()

        ctx.fillStyle =
            'rgba(239,149,31,0.15)'

        ctx.fill()

        // 折線

        ctx.beginPath()

        points.forEach((p, i) => {

            if (i === 0) {

                ctx.moveTo(p.x, p.y)

            } else {

                ctx.lineTo(p.x, p.y)
            }
        })

        ctx.strokeStyle = '#ef951f'
        ctx.lineWidth = 8

        ctx.stroke()

        points.forEach((p, i) => {

            ctx.beginPath()

            ctx.arc(
                p.x, p.y,
                10, 0, Math.PI * 2
            )

            ctx.fillStyle = '#ef951f'

            ctx.fill()

            ctx.fillStyle = '#85511d'

            ctx.font = 'bold 25px Arial'

            ctx.fillText(
                String(profits[i]),
                p.x, p.y - 24
            )

            ctx.fillText(
                '0' + (i + 1),
                p.x, 700
            )
        })

        // ==================================
        // 07 圓餅圖
        // ==================================

        ctx.fillStyle = '#ffffff'

        ctx.fillRect(
            935, 275, 440, 450
        )

        ctx.fillStyle = '#85511d'

        ctx.font =
            'bold 32px Microsoft JhengHei'

        ctx.fillText(
            '成本與毛利占比',
            1155, 318
        )

        const slices = [

            {
                value: 0.60,
                color: '#538fd3'
            },

            {
                value: 0.40,
                color: '#ef951f'
            }

        ]

        let angle = -Math.PI / 2

        slices.forEach(slice => {

            const end =
                angle + slice.value * Math.PI * 2

            ctx.beginPath()

            ctx.moveTo(1155, 505)

            ctx.arc(
                1155, 505,
                135, angle, end
            )

            ctx.closePath()

            ctx.fillStyle = slice.color

            ctx.fill()

            const middle =
                (angle + end) / 2

            ctx.fillStyle = '#ffffff'

            ctx.font = 'bold 34px Arial'

            ctx.fillText(

                Math.round(
                    slice.value * 100
                ) + '%',

                1155 + Math.cos(middle) * 83,

                515 + Math.sin(middle) * 83
            )

            angle = end
        })

        // 圖例

        ctx.fillStyle = '#538fd3'

        ctx.fillRect(
            980, 670, 25, 25
        )

        ctx.fillStyle = '#ef951f'

        ctx.fillRect(
            1180, 670, 25, 25
        )

        ctx.font =
            'bold 26px Microsoft JhengHei'

        ctx.fillStyle = '#526174'

        ctx.fillText(
            '成本', 1050, 692
        )

        ctx.fillText(
            '毛利', 1250, 692
        )

        // 底部狀態列

        ctx.fillStyle = '#a96117'

        ctx.fillRect(
            0, 750, 1400, 50
        )

        ctx.fillStyle = '#ffffff'

        ctx.font =
            '24px Microsoft JhengHei'

        ctx.fillText(
            'SkillIsland | BI 商業智慧 | 模擬數據展示',
            700, 783
        )

        const texture =
            new THREE.CanvasTexture(canvas)

        texture.colorSpace =
            THREE.SRGBColorSpace

        const screen = new THREE.Mesh(

            new THREE.PlaneGeometry(
                9.95, 5.35
            ),

            new THREE.MeshBasicMaterial({
                map: texture
            })
        )

        screen.name = 'AnalyticsDashboardScreen'

        screen.position.set(
            0, 4.85, 4.33
        )

        group.add(screen)

        // ==================================
        // 08 中英文建築招牌
        // ==================================

        const signCanvas =
            document.createElement('canvas')

        signCanvas.width = 1200
        signCanvas.height = 256

        const signCtx =
            signCanvas.getContext('2d')

        signCtx.fillStyle = '#a96117'

        signCtx.fillRect(
            0, 0, 1200, 256
        )

        signCtx.strokeStyle = '#ffdb99'
        signCtx.lineWidth = 10

        signCtx.strokeRect(
            10, 10, 1180, 236
        )

        signCtx.textAlign = 'center'
        signCtx.textBaseline = 'middle'

        signCtx.fillStyle = '#ffffff'

        signCtx.font = 'bold 85px Arial'

        signCtx.fillText(
            'BUSINESS INTELLIGENCE',
            600, 80, 1130
        )

        signCtx.font =
            'bold 62px Microsoft JhengHei'

        signCtx.fillText(
            '商業智慧數據分析中心',
            600, 185
        )

        const signTexture =
            new THREE.CanvasTexture(signCanvas)

        signTexture.colorSpace =
            THREE.SRGBColorSpace

        const sign = new THREE.Mesh(

            new THREE.PlaneGeometry(
                10.5, 1.25
            ),

            new THREE.MeshBasicMaterial({
                map: signTexture
            })
        )

        sign.position.set(
            0, 8.4, 4.02
        )

        group.add(sign)

        // ==================================
        // 09 屋頂立體長條圖
        // ==================================

        const roofBars = [

            { h: 2.1, color: 0x538fd3 },
            { h: 3.0, color: 0x55af80 },
            { h: 2.6, color: 0x9273d1 },
            { h: 4.5, color: 0xef951f },
            { h: 3.7, color: 0xed7667 }

        ]

        box(
            5.8, 0.25, 3.6,
            darkOrange,
            -2.6, 9.9, 0
        )

        roofBars.forEach((bar, i) => {

            const x = -4.9 + i * 1.12

            const object = box(

                0.82, bar.h, 1.9,

                bar.color,

                x, 10.025 + bar.h / 2, 0
            )

            if (object) {

                object.name =
                    `AnalyticsRoofBar_${i}`
            }
        })

        // ==================================
        // 10 屋頂立體圓餅圖
        // ==================================

        const pieGroup = new THREE.Group()

        pieGroup.name = 'AnalyticsRoofPie'

        pieGroup.position.set(
            3.1, 11.0, 0
        )

        group.add(pieGroup)

        const pieData = [

            { value: 0.40, color: 0x538fd3 },
            { value: 0.30, color: 0xef951f },
            { value: 0.20, color: 0x55af80 },
            { value: 0.10, color: 0x9273d1 }

        ]

        let startAngle = 0

        pieData.forEach((slice, i) => {

            const length =
                slice.value * Math.PI * 2

            const shape = new THREE.Shape()

            shape.moveTo(0, 0)

            shape.absarc(
                0, 0,
                2.15,
                startAngle,
                startAngle + length,
                false
            )

            shape.lineTo(0, 0)

            const geometry =
                new THREE.ExtrudeGeometry(

                    shape,

                    {
                        depth: 0.65,
                        bevelEnabled: false,
                        curveSegments: 32
                    }
                )

            const part = new THREE.Mesh(

                geometry,

                new THREE.MeshStandardMaterial({

                    color: slice.color,

                    roughness: 0.65,

                    flatShading: true
                })
            )

            part.name =
                `AnalyticsPieSlice_${i}`

            part.rotation.x =
                -Math.PI / 2

            const middle =
                startAngle + length / 2

            part.position.x =
                Math.cos(middle) * 0.14

            part.position.z =
                -Math.sin(middle) * 0.14

            part.castShadow = true

            pieGroup.add(part)

            startAngle += length
        })

        // 圓餅圖支架

        cylinder(
            0.42, 0.65, 1.25,
            darkOrange,
            3.1, 10.385, 0
        )

        // ==================================
        // 11 側面玻璃窗
        // ==================================

        for (const side of [-1, 1]) {

            for (const y of [2.0, 4.8, 7.6]) {

                box(

                    0.15, 1.8, 5.9,

                    darkOrange,

                    side * 5.83, y, 0
                )

                box(

                    0.07, 1.55, 5.6,

                    0x91c6da,

                    side * 5.94, y, 0
                )

                for (const z of [-1.8, 0, 1.8]) {

                    box(

                        0.08, 1.55, 0.07,

                        cream,

                        side * 5.99, y, z
                    )
                }
            }
        }

        // ==================================
        // 12 入口雙開門
        // ==================================

        box(
            3.1, 1.6, 0.25,
            darkOrange,
            0, 1.6, 4.05
        )

        for (const side of [-1, 1]) {

            box(

                1.35, 1.4, 0.12,

                0x8dc3d6,

                side * 0.73, 1.6, 4.24
            )

            box(

                0.08, 0.35, 0.10,

                gold,

                side * 0.18, 1.6, 4.34
            )
        }

        // 入口階梯

        for (let i = 0; i < 3; i++) {

            const h = (3 - i) * 0.28

            box(
                4.5, h, 0.65,
                0xe6d5bb,
                0, h / 2,
                4.4 + i * 0.65
            )
        }

        // ==================================
        // 13 建築科技裝飾燈
        // ==================================

        for (const side of [-1, 1]) {

            box(
                0.12, 5.4, 0.08,
                0xffd980,
                side * 5.45,
                4.85, 4.2,
                true
            )
        }
    }
    // ============================
    // 06 AI 技能島：智慧機器人
    // ============================

    function createAgentLab() {

        // 機器人雙腳

        for (const side of [-1, 1]) {

            box(
                2.6, 1.4, 3.1,
                0x607d8b,
                side * 2,
                1.2, 0.3
            )

            cylinder(
                0.65, 0.85, 1.9,
                0x90a4ae,
                side * 2,
                2.4, 0,
                12
            )
        }

        // 身體

        box(
            6.8, 4.4, 4.2,
            0x80deea,
            0, 5, 0
        )

        // 胸前智慧核心

        frontCylinder(
            1.45, 0.4,
            0x176b87,
            0, 5.2, 2.25
        )

        frontCylinder(
            0.95, 0.45,
            0x22d3ee,
            0, 5.2, 2.52
        )

        torus(
            1.1, 0.13,
            0xe0ffff,
            0, 5.2, 2.8
        )

        // 頭部

        box(
            7.8, 4.2, 4.8,
            0xf1f5f9,
            0, 9.35, 0
        )

        // 黑色面罩

        box(
            6.7, 2.5, 0.25,
            0x153448,
            0, 9.5, 2.52
        )

        // 發光眼睛

        for (const side of [-1, 1]) {

            box(
                1.45, 0.85, 0.2,
                0x67e8f9,
                side * 1.75,
                9.75, 2.75,
                true
            )

            // 耳部

            box(
                0.7, 1.9, 2,
                0x0097a7,
                side * 4.1,
                9.4, 0
            )

            // 手臂

            const arm = box(
                1.45, 3.8, 1.65,
                0x80deea,
                side * 4.5,
                5, 0
            )

            arm.rotation.z = side * 0.2

            sphere(
                0.85,
                0x607d8b,
                side * 4.9,
                3.1, 0
            )
        }

        // 微笑

        box(
            1.8, 0.22, 0.13,
            0x67e8f9,
            0, 8.95, 2.75,
            true
        )

        // 天線

        cylinder(
            0.12, 0.18, 1.4,
            0x607d8b,
            0, 12.1, 0,
            12
        )

        sphere(
            0.48,
            0x22d3ee,
            0, 12.9, 0,
            true
        )
    }

    // 依照島嶼類型生成不同建築

    const builders = {

        central: createHeadquarters,
        image: createImageStudio,
        document: createDocumentCenter,
        excel: createExcelStudio,
        code: createCodeLab,
        analytics: createAnalyticsLab,
        agent: createAgentLab

    }

    const builder = builders[config.id]

    if (builder) {

        builder()
    }


    // 所有建築正面朝向中央島

    if (config.id !== 'central') {

        group.rotation.y = Math.atan2(
            -config.x,
            -config.z
        )
    }

    // 綁定互動資料

    group.traverse(object => {

        object.userData.islandId = config.id
        object.userData.islandConfig = config

    })

    return group
}










