<script setup>
import { ref, computed } from 'vue'
const source = ref(''), result = ref(''), message = ref(''), failed = ref(false), indent = ref(2)
const size = computed(() => new TextEncoder().encode(result.value).length)
function resetOutput(){result.value='';message.value='';failed.value=false}
function format(mode){
  resetOutput()
  try {
    const data=JSON.parse(source.value)
    if(mode==='validate'){message.value='JSON 語法正確';return}
    result.value=JSON.stringify(data,null,mode==='compact'?0:Number(indent.value))
    message.value='處理完成'
  } catch(e){failed.value=true;message.value='JSON 語法錯誤：'+e.message}
}
function example(){source.value=JSON.stringify({project:'SkillIsland',version:'5.0',skills:['JSON 格式化','SQL 工具'],enabled:true});resetOutput()}
async function load(e){const file=e.target.files?.[0];if(!file)return;try{source.value=(await file.text()).replace(/^\uFEFF/,'');resetOutput()}catch(err){resetOutput();failed.value=true;message.value=err.message}finally{e.target.value=''}}
async function copy(){try{await navigator.clipboard.writeText(result.value);message.value='已複製結果';failed.value=false}catch(e){message.value='無法自動複製，請手動選取結果';failed.value=true}}
function save(){const url=URL.createObjectURL(new Blob([result.value],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='formatted.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
</script>
<template>
<section class="jf">
  <header><h3>JSON 格式化工作室</h3><p>在瀏覽器內美化、壓縮及檢查 JSON，不需上傳伺服器。</p></header>
  <div class="jf-actions"><button @click="example">載入範例</button><label class="jf-upload">上傳 JSON / TXT<input type="file" accept=".json,.txt,application/json,text/plain" @change="load"></label><button @click="source='';resetOutput()">清空</button><label>縮排 <select v-model.number="indent"><option :value="2">2 空格</option><option :value="4">4 空格</option></select></label></div>
  <div class="jf-grid"><label>原始 JSON<textarea v-model="source" @input="resetOutput" spellcheck="false" placeholder="請貼上 JSON 原始碼"></textarea></label><label>處理結果<textarea :value="result" readonly spellcheck="false" placeholder="處理後的 JSON 將顯示於此"></textarea></label></div>
  <div class="jf-actions"><button @click="format('pretty')">美化格式</button><button @click="format('compact')">壓縮 JSON</button><button @click="format('validate')">語法檢查</button><button :disabled="!result" @click="copy">複製結果</button><button :disabled="!result" @click="save">下載 JSON</button></div>
  <p v-if="message" role="status" :class="{bad:failed}" class="jf-status">{{message}}</p><p>輸出容量：{{size}} Bytes</p>
  <small>注意：採用 JavaScript JSON.parse / stringify，重複鍵會保留最後一個值，超出安全整數範圍的數字可能失去精度。請勿用於需要無損處理的大整數資料。</small>
</section>
</template>
<style scoped>
.jf{background:#fff;border:1px solid #ddd6fe;border-radius:24px;padding:22px;margin-top:16px;color:#312e81}.jf header{background:#ede9fe;border-radius:16px;padding:18px;margin-bottom:16px}.jf h3{margin:0 0 8px;font-weight:800}.jf p{margin:8px 0}.jf-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:14px 0}.jf-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.jf-grid label{display:grid;gap:8px;font-weight:700}.jf textarea{width:100%;min-height:340px;resize:vertical;border:1px solid #c4b5fd;border-radius:12px;padding:14px;background:#fafaff;color:#1e293b;font:15px/1.6 Consolas,monospace}.jf-upload{background:#ede9fe;padding:10px;border-radius:12px;cursor:pointer;font-weight:700}.jf-upload input{display:block;max-width:230px;font-size:12px}.jf select{padding:8px;border:1px solid #c4b5fd;border-radius:8px}.jf button:disabled{opacity:.45;cursor:not-allowed}.jf-status{background:#dcfce7;color:#166534;padding:12px;border-radius:10px;overflow-wrap:anywhere}.jf-status.bad{background:#fee2e2;color:#991b1b}@media(max-width:750px){.jf-grid{grid-template-columns:1fr}.jf textarea{min-height:220px}}
</style>
