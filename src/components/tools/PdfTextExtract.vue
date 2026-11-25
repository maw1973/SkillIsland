<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
GlobalWorkerOptions.workerSrc = workerUrl
const fileName=ref(''), total=ref(0), start=ref(1), end=ref(1), busy=ref(false), error=ref(''), pages=ref([]), keyword=ref(''), progress=ref(0), notice=ref('')
let task=null, doc=null, generation=0
const text=computed(()=>pages.value.map(p=>`--- 第 ${p.number} 頁 ---\n${p.text}`).join('\n\n'))
const count=computed(()=>Array.from(pages.value.map(p=>p.text).join('').replace(/\s/gu,'')).length)
const matches=computed(()=>{const q=keyword.value.trim().toLocaleLowerCase();if(!q)return [];return pages.value.map(p=>({number:p.number,count:p.text.toLocaleLowerCase().split(q).length-1})).filter(p=>p.count>0)})
async function load(e){
 const file=e.target.files?.[0];e.target.value='';if(!file)return
 const token=++generation;busy.value=true;error.value='';notice.value='';pages.value=[];total.value=0;progress.value=0;fileName.value=file.name
 try{if(task)await task.destroy();task=null;doc=null;const data=await file.arrayBuffer();if(token!==generation)return;task=getDocument({data});const loaded=await task.promise;if(token!==generation)return;doc=loaded;total.value=doc.numPages;start.value=1;end.value=total.value}
 catch(err){if(token===generation)error.value=err?.name==='PasswordException'?'此 PDF 已加密，請先使用合法密碼解除保護。':`無法讀取 PDF：${err.message}`}
 finally{if(token===generation)busy.value=false}
}
async function extract(){
 if(!doc||busy.value)return
 const a=Number(start.value),b=Number(end.value)
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<a||b>total.value){error.value='請輸入有效的起訖頁碼。';return}
 const token=generation;busy.value=true;error.value='';notice.value='';pages.value=[];progress.value=0
 try{const result=[];for(let i=a;i<=b;i++){const page=await doc.getPage(i);const content=await page.getTextContent();if(token!==generation)return;let value='';for(const item of content.items){if(typeof item.str==='string')value+=item.str+(item.hasEOL?'\n':' ')}result.push({number:i,text:value.trim()});progress.value=Math.round((i-a+1)/(b-a+1)*100);page.cleanup()}pages.value=result;if(!result.some(p=>p.text))notice.value='選取頁面沒有可擷取的文字，可能為掃描圖片，需要 OCR。'}
 catch(err){if(token===generation)error.value=`擷取失敗：${err.message}`}
 finally{if(token===generation)busy.value=false}
}
async function copy(){try{await navigator.clipboard.writeText(text.value);notice.value='已複製文字。'}catch{notice.value='無法使用剪貼簿，請在文字框手動選取複製。'}}
function download(){const url=URL.createObjectURL(new Blob(['\uFEFF',text.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=fileName.value.replace(/\.pdf$/i,'')+'_文字擷取.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
onBeforeUnmount(()=>{generation++;task?.destroy().catch(()=>{})})
</script>
<template>
<section class="extract-tool">
 <div class="hero"><div class="eyebrow">DOCUMENT CENTER / 03</div><h3>PDF 文字擷取工作室</h3><p>在本機讀取 PDF 文字、搜尋關鍵字並匯出 TXT。</p></div>
 <label class="upload">選擇 PDF 文件<input type="file" accept=".pdf,application/pdf" :disabled="busy" @change="load"></label>
 <div v-if="fileName" class="meta"><strong>{{fileName}}</strong><span>共 {{total}} 頁</span></div>
 <div v-if="total" class="controls"><label>起始頁<input v-model.number="start" type="number" min="1" :max="total" :disabled="busy"></label><label>結束頁<input v-model.number="end" type="number" min="1" :max="total" :disabled="busy"></label><button :disabled="busy" @click="start=1;end=total">全部頁面</button><button class="primary" :disabled="busy" @click="extract">開始擷取</button></div>
 <div v-if="busy" role="status">處理中… {{progress}}% <progress :value="progress" max="100"/></div>
 <p v-if="error" class="err" role="alert">{{error}}</p><p v-if="notice" role="status">{{notice}}</p>
 <template v-if="pages.length">
 <div class="stats"><div><small>擷取頁數</small><strong>{{pages.length}}</strong></div><div><small>字元數（不含空白）</small><strong>{{count}}</strong></div><div><small>搜尋命中次數</small><strong>{{matches.reduce((sum,p)=>sum+p.count,0)}}</strong></div></div>
 <label>關鍵字搜尋<input v-model="keyword" type="search" placeholder="輸入關鍵字"></label>
 <div v-if="keyword.trim()" class="hits">{{matches.length?matches.map(p=>`第 ${p.number} 頁（${p.count} 次）`).join('、'):'沒有符合的文字'}}</div>
 <textarea :value="text" readonly rows="16" aria-label="擷取結果"/>
 <div class="actions"><button @click="copy">複製全部文字</button><button class="primary" @click="download">下載 TXT</button></div>
 </template>
 <p class="hint">僅支援具有文字層的 PDF；掃描文件需 OCR。多欄排版、表格及部分字型的擷取順序可能與原稿不同。檔案不會上傳至伺服器。</p>
</section>
</template>
<style scoped>
.extract-tool{display:grid;gap:16px;margin-top:16px;color:#18374a}.hero{background:linear-gradient(120deg,#dbeafe,#e0f2fe);padding:24px;border-radius:22px}.hero h3{font-size:26px;font-weight:800;margin:6px 0}.hero p{margin:0}.eyebrow{font-size:12px;letter-spacing:2px;color:#1d4ed8;font-weight:800}.upload{padding:20px;border:2px dashed #93c5fd;background:white;border-radius:16px}.extract-tool label{display:grid;gap:6px;font-weight:700}.extract-tool input,.extract-tool textarea{width:100%;border:1px solid #b9cddd;border-radius:10px;padding:10px;background:white;color:#18374a;font:inherit}.meta,.controls,.actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px}.meta span{color:#64748b}.controls label{width:110px}.controls button{align-self:end}.extract-tool button.primary{background:#2563eb;color:white}.extract-tool button:disabled{opacity:.5;cursor:not-allowed}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stats div{padding:16px;background:#eaf2ff;border-radius:16px;display:grid}.stats strong{font-size:26px;color:#1d4ed8}.hits{padding:12px;background:#fef3c7;border-radius:10px}.err{color:#b91c1c}.hint{font-size:13px;color:#526d7d}.extract-tool progress{width:100%}.extract-tool textarea{line-height:1.65;resize:vertical;white-space:pre-wrap}@media(max-width:600px){.stats{grid-template-columns:1fr}.controls label{flex:1}}
</style>
