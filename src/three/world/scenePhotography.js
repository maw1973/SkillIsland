// SkillIsland V9.1.5
// 3D 場景攝影模式

export function createScenePhotography({
    scene,
    camera,
    renderer,
    islandLabels,
    worldAppearance,
    weather
}) {

    let busy = false

    function createFilename() {

        const now = new Date()

        const stamp = now.toISOString()
            .replace(/[:.]/g, '-')

        const light =
            worldAppearance?.mode || 'original'

        const climate =
            weather?.mode || 'clear'

        return `SkillIsland_${light}_${climate}_${stamp}.png`
    }

    function downloadBlob(blob, filename) {

        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')

        link.href = url

        link.download = filename

        document.body.appendChild(link)

        link.click()

        link.remove()

        setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 1000)
    }

    async function capturePhoto({
        labels = true
    } = {}) {

        if (busy) return false

        busy = true

        const changedObjects = new Map()

        // 保存原本的標籤顯示狀態

        function hideObject(object) {

            if (!object?.isObject3D) return

            if (changedObjects.has(object)) return

            changedObjects.set(
                object,
                object.visible
            )

            object.visible = false
        }

        try {

            // 選擇是否保留浮動標籤

            if (!labels) {

                hideObject(
                    scene.getObjectByName('IslandLabels')
                )

                islandLabels.labels.forEach(label => {

                    hideObject(label.sprite)

                    hideObject(label.group)

                    hideObject(label.bubble)

                })
            }

            // 立即重新渲染目前鏡頭

            renderer.render(scene, camera)

            // 同步擷取，避免 WebGL 緩衝區清除

            const dataURL =
                renderer.domElement.toDataURL(
                    'image/png'
                )

            if (
                !dataURL ||
                dataURL === 'data:,'
            ) {
                throw new Error('無法取得場景圖片')
            }

            const filename = createFilename()

            // 恢復原本的標籤狀態

            changedObjects.forEach(
                (visible, object) => {

                    object.visible = visible

                }
            )

            changedObjects.clear()

            // 恢復正常場景

            renderer.render(scene, camera)

            // 轉換為 PNG Blob

            const response = await fetch(dataURL)

            const blob = await response.blob()

            downloadBlob(blob, filename)

            console.log(
                '[V9.1.5] 場景攝影完成',
                {
                    filename,
                    width: renderer.domElement.width,
                    height: renderer.domElement.height,
                    labels,
                    size: blob.size
                }
            )

            return true

        } finally {

            // 發生錯誤時也必須恢復場景

            changedObjects.forEach(
                (visible, object) => {

                    object.visible = visible

                }
            )

            busy = false
        }
    }

    console.log(
        '[V9.1.5] 3D場景攝影模式建立完成'
    )

    return {
        capturePhoto,

        get busy() {
            return busy
        }
    }
}
