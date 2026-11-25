<script setup>
import { ref, computed } from 'vue'
import { PDFDocument } from 'pdf-lib'
const files = ref([]), busy = ref(false), error = ref(''), message = ref('')
let serial = 0
const total = computed(() => files.value.reduce((sum, f) => sum + f.pages, 0))
const size = n => n >= 1048576 ? `${(n/1048576).toFixed(2)} MB` : `${(n/1024).toFixed(1)} KB`
async function addFiles(e) {
  const selected = Array.from(e.target.files || [])
  e.target.value = ''
  if (busy.value || !selected.length) return
  busy.value = true; error.value = ''; message.value = ''
  const failures = []
  try {
    for (const file of selected) {
      try {
        const bytes = await file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        files.value.push({ id: ++serial, name: file.name, bytes, size: file.size, pages: pdf.getPageCount() })
      } catch { failures.push(`${file.name}：無法讀取（可能已加密或損毀）`) }
    }
    error.value = failures.join('\n')
  } finally { busy.value = false }
}
function move(i, delta) {
  const j = i + delta
  if (busy.value || j < 0 || j >= files.value.length) return
  const next = [...files.value]; [next[i], next[j]] = [next[j], next[i]]; files.value = next; message.value = ''
}
function remove(i) { if (!busy.value) { files.value.splice(i, 1); message.value = '' } }
function clear() { if (!busy.value) { files.value = []; error.value = ''; message.value = '' } }
async function merge() {
  if (busy.value || files.value.length < 2) return
  busy.value = true; error.value = ''; message.value = ''
  try {
    const result = await PDFDocument.create()
    for (const f of files.value) {
      const source = await PDFDocument.load(f.bytes)
      const pages = await result.copyPages(source, source.getPageIndices())
      pages.forEach(p => result.addPage(p))
    }
    const bytes = await result.save()
    const url = URL.createObjectURL(new Blob([bytes], {type:'application/pdf'}))
    const a = document.createElement('a'); a.href = url; a.download = 'SkillIsland_merged.pdf'; document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30000)
    message.value = `已產生 ${result.getPageCount()} 頁 PDF（${size(bytes.length)}），請確認瀏覽器下載。`
  } catch (e) { error.value = `合併失敗：${e.message}` }
  finally { busy.value = false }
}
</script>
<template>
  <section class="pdf-tool">
    <div class="pdf-hero"><h3>📄 PDF 合併工作室</h3><p>上傳多份 PDF，調整順序後合併。所有檔案均在本機瀏覽器處理。</p><label class="pdf-upload">選擇 PDF 檔案<input type="file" accept=".pdf,application/pdf" multiple :disabled="busy" @change="addFiles"></label></div>
    <div class="pdf-stats"><div>文件數量<strong>{{ files.length }}</strong></div><div>總頁數<strong>{{ total }}</strong></div><div>原始總容量<strong>{{ size(files.reduce((n,f)=>n+f.size,0)) }}</strong></div></div>
    <p v-if="!files.length" class="pdf-empty">尚未加入 PDF，請先選擇至少兩份檔案。</p>
    <div v-for="(f,i) in files" :key="f.id" class="pdf-row"><span class="pdf-index">{{ i+1 }}</span><div class="pdf-name"><strong>{{ f.name }}</strong><small>{{ f.pages }} 頁 · {{ size(f.size) }}</small></div><div class="pdf-actions"><button :disabled="busy || i===0" @click="move(i,-1)" aria-label="上移">↑</button><button :disabled="busy || i===files.length-1" @click="move(i,1)" aria-label="下移">↓</button><button :disabled="busy" @click="remove(i)">移除</button></div></div>
    <p v-if="error" class="pdf-error" role="alert">{{ error }}</p><p v-if="message" class="pdf-success" role="status">{{ message }}</p>
    <div class="pdf-bottom"><button :disabled="busy || !files.length" @click="clear">清空清單</button><button class="pdf-primary" :disabled="busy || files.length<2" @click="merge">{{ busy ? '處理中…' : '合併並下載 PDF' }}</button></div>
    <small>不支援受密碼保護的 PDF；書籤、表單及數位簽章不保證保留。大型文件可能消耗較多記憶體。</small>
  </section>
</template>
<style scoped>
.pdf-tool{display:grid;gap:16px;padding:18px 0;color:#18374a}.pdf-hero{background:#dbeafe;padding:24px;border-radius:22px}.pdf-hero h3{font-size:24px;font-weight:800}.pdf-upload{display:inline-flex;flex-wrap:wrap;align-items:center;gap:12px;background:white;padding:12px;border-radius:12px;font-weight:700}.pdf-upload input{max-width:100%}.pdf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.pdf-stats>div{background:white;padding:14px;border:1px solid #dbeafe;border-radius:16px}.pdf-stats strong{display:block;font-size:24px;color:#1d4ed8}.pdf-row{display:flex;align-items:center;gap:12px;padding:14px;background:white;border-radius:14px;border:1px solid #dbeafe}.pdf-index{background:#dbeafe;color:#1d4ed8;border-radius:10px;padding:8px 12px;font-weight:bold}.pdf-name{flex:1;min-width:0;overflow-wrap:anywhere}.pdf-name small{display:block;color:#64748b}.pdf-actions,.pdf-bottom{display:flex;gap:8px;flex-wrap:wrap}.pdf-bottom{justify-content:flex-end}.pdf-tool .pdf-primary{background:#1d4ed8;color:white}.pdf-tool button:disabled{opacity:.45;cursor:not-allowed}.pdf-error{color:#991b1b;white-space:pre-wrap}.pdf-success{color:#166534}.pdf-empty{padding:24px;text-align:center;color:#64748b;background:white;border-radius:14px}.pdf-tool>small{color:#64748b}@media(max-width:600px){.pdf-row{flex-wrap:wrap}.pdf-stats strong{font-size:16px}.pdf-stats>div{padding:8px}}
</style>
