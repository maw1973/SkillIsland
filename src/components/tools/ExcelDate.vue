<script setup>
import { ref, shallowRef, computed, watch } from 'vue'
import ExcelJS from 'exceljs'
const book=shallowRef(null), sheetId=ref(''), col=ref(1), format=ref('roc'), source=ref('auto'), filename=ref(''), error=ref(''), busy=ref(false), result=shallowRef(null)
const sheet=computed(()=>book.value?.getWorksheet(Number(sheetId.value)))
const headers=computed(()=>Array.from({length:sheet.value?.columnCount||0},(_,i)=>({id:i+1,name:sheet.value.getRow(1).getCell(i+1).text||`欄 ${i+1}`})))
watch([sheetId,col,format,source],()=>result.value=null)
watch(sheetId,()=>col.value=1)
const pad=n=>String(n).padStart(2,'0')
function valid(y,m,d){const date=new Date(Date.UTC(y,m-1,d));return y>=1912&&y<=9999&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d?date:null}
function parse(v){
 if(v instanceof Date)return valid(v.getUTCFullYear(),v.getUTCMonth()+1,v.getUTCDate())
 if(typeof v==='number'&&source.value==='serial'){
  const is1904=!!book.value.properties.date1904
  if(!Number.isFinite(v)||v<0||(!is1904&&Math.floor(v)===60))return null
  const date=new Date(Date.UTC(is1904?1904:1899,is1904?0:11,is1904?1:31)+(Math.floor(v)-(!is1904&&v>=61?1:0))*86400000)
  return valid(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate())
 }
 if(typeof v!=='string'||source.value==='serial')return null
 const text=v.trim().replace(/^民國\s*/,'')
 const match=text.match(/^(\d{1,4})\s*(?:年|[\/.-])\s*(\d{1,2})\s*(?:月|[\/.-])\s*(\d{1,2})\s*日?$/)
 if(!match)return null
 let y=Number(match[1]);const m=Number(match[2]),d=Number(match[3]);
 if(source.value==='roc'||(source.value==='auto'&&match[1].length<=3)) {if(y<1||y>8088)return null;y+=1911}
 return valid(y,m,d)
}
function output(date){const y=date.getUTCFullYear(),m=pad(date.getUTCMonth()+1),d=pad(date.getUTCDate());if(format.value==='date')return date;if(format.value==='iso')return `${y}-${m}-${d}`;return `${format.value==='roc3'?String(y-1911).padStart(3,'0'):String(y-1911).padStart(2,'0')}年${m}月${d}日`}
function display(v){return v instanceof Date?v.toISOString().slice(0,10):String(v??'')}
async function upload(e){const f=e.target.files?.[0];e.target.value='';if(!f)return;busy.value=true;error.value='';book.value=null;result.value=null;try{if(!/\.xlsx$/i.test(f.name)||f.size>20*1024*1024)throw Error('請選擇 20 MB 以內的 XLSX 檔案');const b=new ExcelJS.Workbook();await b.xlsx.load(await f.arrayBuffer());if(!b.worksheets.length)throw Error('沒有工作表');book.value=b;filename.value=f.name;sheetId.value=String(b.worksheets[0].id)}catch(e){error.value=e.message}finally{busy.value=false}}
function preview(){error.value='';result.value=null;try{const s=sheet.value;if(!s||!headers.value.length)throw Error('請選擇有資料的工作表');if(s.rowCount>100001)throw Error('最多處理十萬筆資料');const changes=[],rows=[];let invalid=0,blank=0;for(let r=2;r<=s.rowCount;r++){const c=s.getRow(r).getCell(Number(col.value)),v=c.value;if(v==null||v===''){blank++;continue}const date=parse(v);if(!date){invalid++;if(rows.length<50)rows.push({r,before:display(c.text),after:c.text,status:'保留原值'});continue}const next=output(date);changes.push({r,next});if(rows.length<50)rows.push({r,before:display(v),after:display(next),status:'可轉換'})}result.value={changes,rows,invalid,blank,sheetId:Number(sheetId.value),col:Number(col.value),format:format.value}}catch(e){error.value=e.message}}
async function download(){const data=result.value;if(!data)return;busy.value=true;error.value='';try{const copy=new ExcelJS.Workbook();await copy.xlsx.load(await book.value.xlsx.writeBuffer());const s=copy.getWorksheet(data.sheetId);for(const item of data.changes){const c=s.getRow(item.r).getCell(data.col);c.value=item.next;c.numFmt=data.format==='date'?'yyyy-mm-dd':'@'}const buf=await copy.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download=filename.value.replace(/\.xlsx$/i,'')+'_date.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}catch(e){error.value=e.message}finally{busy.value=false}}
</script>
<template>
<section class="date-tool"><h2>民國與西元日期格式統一</h2><p>上傳 XLSX，選擇工作表與日期欄位，預覽後另存新檔。</p><label>上傳 Excel<input type="file" accept=".xlsx" :disabled="busy" @change="upload"></label><fieldset :disabled="busy||!book"><div class="options"><label>工作表<select v-model="sheetId"><option v-for="s in book?.worksheets||[]" :key="s.id" :value="String(s.id)">{{s.name}}</option></select></label><label>日期欄位<select v-model="col"><option v-for="h in headers" :key="h.id" :value="h.id">{{h.name}}</option></select></label><label>來源日期格式<select v-model="source"><option value="auto">自動：1～3 位民國、4 位西元</option><option value="roc">民國文字</option><option value="ad">西元文字</option><option value="serial">Excel 數字日期序號</option></select></label><label>輸出格式<select v-model="format"><option value="roc">民國：75年08月29日</option><option value="roc3">民國：075年08月29日</option><option value="iso">西元：1986-08-29（文字）</option><option value="date">西元：Excel 日期型別</option></select></label></div><button @click="preview">轉換並預覽</button></fieldset><p v-if="error" role="alert" class="error">{{error}}</p><p v-if="busy">處理中…</p><template v-if="result"><p class="stats">可轉換 {{result.changes.length}} 筆｜未辨識 {{result.invalid}} 筆｜空白 {{result.blank}} 筆</p><div class="scroll"><table><thead><tr><th>列號</th><th>原始日期</th><th>轉換結果</th><th>狀態</th></tr></thead><tbody><tr v-for="r in result.rows" :key="r.r"><td>{{r.r}}</td><td>{{r.before}}</td><td>{{r.after}}</td><td>{{r.status}}</td></tr></tbody></table></div><p>最多預覽 50 筆，輸出包含整本工作簿。</p><button :disabled="busy||!result.changes.length" @click="download">下載轉換後 Excel</button></template><p class="note">僅修改選定欄位的有效日期，無效日期與公式保留原值。第一列為標題。數字序號必須手動選擇來源模式，以免將一般數值誤判為日期。ExcelJS 不保證保留圖表及所有進階格式。</p></section>
</template>
<style scoped>
.date-tool{padding:22px;background:white;color:#18374a;border-radius:20px}.date-tool label{display:grid;gap:6px;margin:10px 0}.date-tool input,.date-tool select{padding:10px;border:1px solid #a7c6b0;border-radius:10px;background:white;color:#18374a;max-width:100%}.date-tool fieldset{border:0;padding:0;min-width:0}.options{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.date-tool button{background:#166534;color:white;padding:10px 18px;border:0;border-radius:10px}.date-tool button:disabled{opacity:.5}.stats,.note{background:#dcfce7;padding:12px;border-radius:10px;margin-top:14px}.error{color:#b91c1c}.scroll{overflow:auto;max-height:420px}table{border-collapse:collapse;width:100%}th,td{padding:10px;border:1px solid #cbd5e1;white-space:nowrap}th{background:#166534;color:white}
</style>
