<script setup>
import { ref, computed } from 'vue'
import mammoth from 'mammoth'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
const file = ref(null), output = ref(''), error = ref(''), busy = ref(false), format = ref('html'), completed = ref(false)
const extension = computed(() => file.value?.name.split('.').pop().toLowerCase() || '')
const escapeHtml = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
function selectFile(e) { file.value = e.target.files?.[0] || null; output.value = ''; error.value = ''; completed.value = false; format.value = 'html' }
async function convert() {
  if (!file.value || busy.value) return
  busy.value = true; error.value = ''; output.value = ''; completed.value = false
  try {
    const f = file.value, ext = extension.value
    if (f.size > 30 * 1024 * 1024) throw new Error('請選擇 30 MB 以內的文件')
    if (ext === 'docx') {
      const arrayBuffer = await f.arrayBuffer()
      const result = format.value === 'txt' ? await mammoth.extractRawText({ arrayBuffer }) : await mammoth.convertToHtml({ arrayBuffer })
      output.value = format.value === 'txt' ? result.value : DOMPurify.sanitize(result.value, { FORBID_TAGS: ['img','iframe','style','form'], FORBID_ATTR: ['style'] })
    } else if (ext === 'txt') {
      output.value = '<pre>' + escapeHtml(await f.text()) + '</pre>'
    } else if (ext === 'md' || ext === 'markdown') {
      output.value = DOMPurify.sanitize(await marked.parse(await f.text()), { FORBID_TAGS: ['img','iframe','style','form'], FORBID_ATTR: ['style'] })
    } else throw new Error('僅支援 DOCX、TXT、MD 文件')
    completed.value = true
  } catch (e) { error.value = e.message || '轉換失敗' } finally { busy.value = false }
}
function download() {
  if (!completed.value) return
  const html = format.value === 'html'
  const content = html ? '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>轉換文件</title></head><body>' + output.value + '</body></html>' : '\uFEFF' + output.value
  const url = URL.createObjectURL(new Blob([content], { type: html ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = file.value.name.replace(/\.[^.]+$/, '') + '_converted.' + format.value; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>
<template>
  <section class="convert-workspace">
    <div class="intro"><h3>文件格式轉換工作室</h3><p>在瀏覽器內轉換文件，不需上傳至伺服器。</p></div>
    <label class="upload">選擇 DOCX、TXT 或 Markdown 文件<input type="file" accept=".docx,.txt,.md,.markdown" :disabled="busy" @change="selectFile"></label>
    <p v-if="file">{{ file.name }} · {{ (file.size / 1024).toFixed(1) }} KB</p>
    <label>輸出格式 <select v-model="format" :disabled="busy || !file" @change="completed=false; output=''">
      <option value="html">HTML 網頁</option><option v-if="extension==='docx'" value="txt">TXT 純文字</option>
    </select></label>
    <div class="actions"><button :disabled="!file || busy" @click="convert">{{busy?'轉換中…':'開始轉換'}}</button><button :disabled="!completed || busy" @click="download">下載 {{format.toUpperCase()}}</button></div>
    <p v-if="error" role="alert" class="error">{{error}}</p>
    <div v-if="completed" class="result"><h4>轉換結果</h4><iframe v-if="format==='html'" title="HTML 預覽" sandbox="" :srcdoc="output"></iframe><pre v-else>{{output}}</pre><p v-if="!output">文件沒有可擷取的文字。</p></div>
    <p class="note">DOCX 轉換以文字及基本結構為主，不保證原始排版；為避免外部資源載入，HTML 輸出不保留圖片。TXT、Markdown 請使用 UTF-8 編碼。不支援舊式 .doc。</p>
  </section>
</template>
<style scoped>
.convert-workspace{display:grid;gap:16px;background:white;border-radius:24px;padding:24px;color:#18374a}.intro{background:#dbeafe;border-radius:18px;padding:20px}.intro h3{margin:0 0 8px;font-weight:800}.intro p,.note{margin:0}.upload{display:grid;gap:8px;padding:20px;border:2px dashed #93c5fd;border-radius:16px}select,input{max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:10px}.actions{display:flex;gap:10px;flex-wrap:wrap}.actions button:first-child{background:#2563eb;color:white}.actions button:disabled{opacity:.45;cursor:not-allowed}.result{border:1px solid #cbd5e1;padding:16px;border-radius:14px}.result iframe{width:100%;height:360px;border:0;background:white}.result pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:400px;overflow:auto}.note{font-size:13px;color:#526d7d}.error{color:#b91c1c}
</style>

