<script setup>
import { ref, shallowRef, computed, watch } from 'vue'
import ExcelJS from 'exceljs'
const book=shallowRef(null), sheetId=ref(''), keys=ref([]), keep=ref('first'), trim=ref(true), ignoreCase=ref(false), skipBlank=ref(true), busy=ref(false), error=ref(''), filename=ref(''), result=shallowRef(null)
const sheet=computed(()=>book.value?.getWorksheet(Number(sheetId.value)))
const headers=computed(()=>Array.from({length:sheet.value?.columnCount||0},(_,i)=>({id:i+1,name:sheet.value.getRow(1).getCell(i+1).text||`欄 ${i+1}`})))
watch(sheetId,()=>{keys.value=[];result.value=null})
watch([keys,keep,trim,ignoreCase,skipBlank],()=>{result.value=null},{deep:true})
function value(cell){const v=cell.value;if(v==null)return null;if(v instanceof Date)return v;if(typeof v==='object'){if('formula' in v||'sharedFormula' in v)return v.result??null;return cell.text}return v}
function normalized(v){if(v==null)return ['blank',''];if(v instanceof Date)return ['date',v.toISOString()];if(typeof v==='string'){let s=trim.value?v.trim():v;if(ignoreCase.value)s=s.toLowerCase();return s===''?['blank','']:['string',s]}return [typeof v,v]}
async function upload(e){const f=e.target.files?.[0];e.target.value='';if(!f)return;busy.value=true;error.value='';book.value=null;keys.value=[];result.value=null;try{if(!/\.xlsx$/i.test(f.name)||f.size>20*1024*1024)throw Error('請選擇 20 MB 以內的 XLSX 檔案');const b=new ExcelJS.Workbook();await b.xlsx.load(await f.arrayBuffer());if(!b.worksheets.length)throw Error('沒有工作表');book.value=b;filename.value=f.name;sheetId.value=String(b.worksheets[0].id)}catch(err){error.value=err.message+(String(err.message).includes('sheets')?'；請先用 Excel 另存為標準 XLSX 再試。':'')}finally{busy.value=false}}
function preview(){error.value='';result.value=null;try{const s=sheet.value;if(!s||!keys.value.length)throw Error('請至少選擇一個比對欄位');if(s.rowCount>100001||s.columnCount>256)throw Error('最多支援十萬筆資料、256 欄');const groups=new Map(), rows=[];const cols=[...keys.value].sort((a,b)=>a-b);s.eachRow((row,r)=>{if(r===1)return;const parts=cols.map(c=>normalized(value(row.getCell(c))));const key=skipBlank.value&&parts.every(p=>p[0]==='blank')?`blank-row:${r}`:JSON.stringify(parts);rows.push({r,key});if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)});const remove=new Set();let duplicateGroups=0;for(const list of groups.values()){if(list.length<2)continue;duplicateGroups++;const retained=keep.value==='first'?list[0]:list[list.length-1];for(const r of list)if(r!==retained)remove.add(r)}result.value={sheetId:Number(sheetId.value),total:rows.length,duplicateGroups,remove,retained:rows.filter(x=>!remove.has(x.r)).map(x=>x.r),rows:rows.slice(0,100).map(x=>({r:x.r,values:cols.map(c=>s.getRow(x.r).getCell(c).text),duplicate:groups.get(x.key).length>1,removed:remove.has(x.r)})),columns:cols.map(c=>headers.value.find(h=>h.id===c)?.name||`欄 ${c}`)}}catch(err){error.value=err.message}}
async function download(){const data=result.value;if(!data)return;busy.value=true;error.value='';try{const s=book.value.getWorksheet(data.sheetId), out=new ExcelJS.Workbook(), dest=out.addWorksheet(s.name);for(const r of [1,...data.retained]){const original=s.getRow(r), row=dest.addRow(Array.from({length:s.columnCount},(_,i)=>value(original.getCell(i+1))));for(let c=1;c<=s.columnCount;c++){const fmt=original.getCell(c).numFmt;if(fmt)row.getCell(c).numFmt=fmt}}const buf=await out.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download=filename.value.replace(/\.xlsx$/i,'')+'_unique.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}catch(err){error.value=err.message}finally{busy.value=false}}
</script>
<template>
<section class="duplicate-tool">
<h2>重複資料移除工作室</h2><p>選擇比對欄位，先預覽，再下載清理後的新檔。</p>
<label>上傳 Excel <input type="file" accept=".xlsx" :disabled="busy" @change="upload"></label>
<fieldset :disabled="busy||!book">
<label>工作表 <select v-model="sheetId"><option v-for="s in book?.worksheets||[]" :key="s.id" :value="String(s.id)">{{s.name}}</option></select></label>
<h3>比對欄位（可複選）</h3><div class="columns"><label v-for="h in headers" :key="h.id"><input type="checkbox" v-model="keys" :value="h.id"> {{h.name}}（第 {{h.id}} 欄）</label></div>
<label>保留方式 <select v-model="keep"><option value="first">保留第一筆</option><option value="last">保留最後一筆</option></select></label>
<div class="columns"><label><input type="checkbox" v-model="trim"> 忽略文字前後空格</label><label><input type="checkbox" v-model="ignoreCase"> 忽略英文字母大小寫</label><label><input type="checkbox" v-model="skipBlank"> 比對欄位全部空白時保留該列</label></div>
<button :disabled="!keys.length" @click="preview">比對並預覽</button>
</fieldset>
<p v-if="error" class="error" role="alert">{{error}}</p><p v-if="busy">處理中…</p>
<template v-if="result"><div class="stats"><div>原始資料<strong>{{result.total}}</strong></div><div>重複群組<strong>{{result.duplicateGroups}}</strong></div><div>預計刪除<strong>{{result.remove.size}}</strong></div><div>保留資料<strong>{{result.retained.length}}</strong></div></div>
<div class="scroll"><table><thead><tr><th>原始列號</th><th v-for="(h,i) in result.columns" :key="i">{{h}}</th><th>處理結果</th></tr></thead><tbody><tr v-for="r in result.rows" :key="r.r" :class="{removed:r.removed}"><td>{{r.r}}</td><td v-for="(v,i) in r.values" :key="i">{{v}}</td><td>{{r.removed?'刪除':r.duplicate?'重複群組／保留':'保留'}}</td></tr></tbody></table></div><p>最多預覽前 100 筆，下載包含所有保留資料。</p><button :disabled="busy" @click="download">下載清理後 Excel</button></template>
<p class="note">第一列為標題；數字與文字型別分開比對。輸出僅包含選定工作表的資料與基本數字格式，公式使用既有快取值（沒有快取則為空白），不保留其他工作表、圖表或完整排版。原檔不會被修改。</p>
</section>
</template>
<style scoped>
.duplicate-tool{background:white;border-radius:20px;padding:22px;color:#18374a}.duplicate-tool h3{font-size:18px;margin:16px 0}.duplicate-tool label{display:flex;align-items:center;gap:8px;margin:10px 0;flex-wrap:wrap}.duplicate-tool input,.duplicate-tool select{max-width:100%}.duplicate-tool select{padding:8px;border:1px solid #a7c6b0;border-radius:8px;background:white}.duplicate-tool fieldset{border:0;padding:0;min-width:0}.columns{display:flex;flex-wrap:wrap;gap:8px 22px}.duplicate-tool button{background:#166534;color:white;border-radius:10px;padding:10px 18px}.duplicate-tool button:disabled{opacity:.5}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin:18px 0}.stats div,.note{background:#dcfce7;border-radius:12px;padding:12px}.stats strong{display:block;font-size:25px}.scroll{overflow:auto;max-height:420px}table{width:100%;border-collapse:collapse}th,td{padding:9px;border:1px solid #cbd5e1;white-space:nowrap}th{background:#166534;color:white}.removed{background:#fee2e2;color:#991b1b}.error{color:#b91c1c}
</style>
