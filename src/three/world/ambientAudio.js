 // SkillIsland V9.1.4
 // 沉浸式環境音效

export function createAmbientAudio({
    worldAppearance,
    weather
}) {

    let context = null
    let master = null
    let compressor = null

    let active = false
    let disposed = false
    let volume = 0.35
    let time = 0

    const sources = []
    const channels = {}

    const profiles = {
        clear:  { ocean: 0.6, wind: 0.08, rain: 0 },
        cloudy: { ocean: 0.5, wind: 0.28, rain: 0 },
        rain:   { ocean: 0.3, wind: 0.2, rain: 0.8 },
        fog:    { ocean: 0.2, wind: 0.18, rain: 0 }
    }

    // 01 建立環境雜訊

    function createNoiseBuffer() {

        const length = context.sampleRate * 5

        const buffer = context.createBuffer(
            1,
            length,
            context.sampleRate
        )

        const data = buffer.getChannelData(0)

        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1
        }

        return buffer
    }

    // 02 建立獨立聲音通道

    function createChannel(
        name,
        buffer,
        type,
        frequency,
        gain
    ) {

        const source = context.createBufferSource()
        const filter = context.createBiquadFilter()
        const output = context.createGain()

        source.buffer = buffer
        source.loop = true

        filter.type = type
        filter.frequency.value = frequency
        filter.Q.value = 0.65

        output.gain.value = 0

        source.connect(filter)
        filter.connect(output)
        output.connect(master)

        source.start()

        sources.push(source)

        channels[name] = {
            source,
            filter,
            output,
            gain
        }
    }

    // 03 初始化音效引擎

    function initialize() {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext

        if (!AudioContextClass) {
            throw new Error('瀏覽器不支援 Web Audio')
        }

        context = new AudioContextClass()

        master = context.createGain()
        compressor = context.createDynamicsCompressor()

        master.gain.value = 0

        compressor.threshold.value = -18
        compressor.ratio.value = 4

        master.connect(compressor)
        compressor.connect(context.destination)

        const noise = createNoiseBuffer()

        createChannel(
            'ocean', noise,
            'lowpass', 450, 0.7
        )

        createChannel(
            'wind', noise,
            'bandpass', 320, 0.32
        )

        createChannel(
            'rain', noise,
            'highpass', 2200, 0.45
        )

        // 夜間模擬蟲鳴

        const cricket = context.createOscillator()
        const cricketGain = context.createGain()

        cricket.type = 'sine'
        cricket.frequency.value = 3200

        cricketGain.gain.value = 0

        cricket.connect(cricketGain)
        cricketGain.connect(master)

        cricket.start()

        sources.push(cricket)

        channels.cricket = {
            source: cricket,
            output: cricketGain
        }

        console.log(
            '[V9.1.4] 環境音效引擎初始化完成'
        )
    }

    // 04 開啟環境音效

    async function start(initialVolume = volume) {

        if (disposed) return false

        setVolume(initialVolume)

        if (!context) {
            initialize()
        }

        await context.resume()

        if (disposed) return false

        active = true

        master.gain.setTargetAtTime(
            volume * 0.45,
            context.currentTime,
            0.3
        )

        return true
    }

    // 05 關閉環境音效

    function stop() {

        active = false

        if (!context || !master) return

        master.gain.setTargetAtTime(
            0,
            context.currentTime,
            0.15
        )
    }

    // 06 音量控制

    function setVolume(value) {

        if (!Number.isFinite(value)) return

        volume = Math.max(
            0,
            Math.min(1, value)
        )

        if (active && context && master) {

            master.gain.setTargetAtTime(
                volume * 0.45,
                context.currentTime,
                0.15
            )
        }
    }

    function setChannel(name, value) {

        const channel = channels[name]

        if (!channel) return

        channel.output.gain.setTargetAtTime(
            Math.max(0, value),
            context.currentTime,
            0.12
        )
    }

    // 07 同步天氣及光影

    let accumulator = 0

    function update(delta) {

        if (!active || !context || disposed) return

        time += delta
        accumulator += delta

        // 音效參數每秒更新約20次

        if (accumulator < 0.05) return

        accumulator = 0

        const profile =
            profiles[weather.mode] ||
            profiles.clear

        const oceanWave =
            0.65 +
            Math.sin(time * 0.7) * 0.25 +
            Math.sin(time * 1.3) * 0.1

        const windWave =
            0.7 +
            Math.sin(time * 0.35) * 0.3

        setChannel(
            'ocean',
            profile.ocean *
            oceanWave *
            channels.ocean.gain
        )

        setChannel(
            'wind',
            profile.wind *
            windWave *
            channels.wind.gain
        )

        setChannel(
            'rain',
            profile.rain *
            channels.rain.gain
        )

        channels.ocean.filter.frequency.value =
            350 + oceanWave * 350

        const isNight =
            worldAppearance.mode === 'night'

        const cricketEnabled =
            isNight &&
            weather.mode !== 'rain'

        const pulse = Math.pow(
            Math.max(
                0,
                Math.sin(time * 5)
            ),
            5
        )

        const chirp = Math.pow(
            Math.max(
                0,
                Math.sin(time * 25)
            ),
            2
        )

        setChannel(
            'cricket',
            cricketEnabled
                ? pulse * chirp * 0.009
                : 0
        )
    }

    // 08 切換瀏覽器分頁時暫時靜音

    function onVisibilityChange() {

        if (!context || !master) return

        master.gain.setTargetAtTime(
            document.hidden || !active
                ? 0
                : volume * 0.45,
            context.currentTime,
            0.15
        )
    }

    document.addEventListener(
        'visibilitychange',
        onVisibilityChange
    )

    // 09 資源清理

    function dispose() {

        if (disposed) return

        disposed = true
        active = false

        document.removeEventListener(
            'visibilitychange',
            onVisibilityChange
        )

        sources.forEach(source => {
            try {
                source.stop()
                source.disconnect()
            } catch {}
        })

        if (context) {
            context.close().catch(() => {})
        }

        sources.length = 0
    }

    return {
        start,
        stop,
        setVolume,
        update,
        dispose,

        get active() {
            return active
        },

        get volume() {
            return volume
        }
    }
}
