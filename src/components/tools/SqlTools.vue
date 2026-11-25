<script setup>
import { ref, computed } from 'vue'
import { format } from 'sql-formatter'
const source=ref(''), result=ref(''), message=ref(''), bad=ref(false)
const mode=ref('SELECT'), table=ref('dbo.Employees'), fields=ref('EmployeeID, Name, Salary'), condition=ref('EmployeeID = 1')
const columns=ref('EmployeeID int NOT NULL PRIMARY KEY\nName nvarchar(100) NOT NULL\nSalary decimal(12,2) NULL')
const assignments=ref("Name = N'王小明', Salary = 45000"), values=ref("1, N'王小明', 45000")
const modes=['SELECT','INSERT','UPDATE','DELETE','CREATE TABLE']
const size=computed(()=>new TextEncoder().encode(result.value).length)
function clearStatus(){message.value='';bad.value=false}
function fail(e){bad.value=true;message.value=e.message;result.value=''}
function identifier(s){const parts=s.trim().split('.');if(parts.some(p=>!p.trim()||/[\[\]\r\n]/.test(p)))throw new Error('請輸入未加括號的資料表或欄位名稱');return parts.map(p=>'['+p.trim()+']').join('.')}
function generate(){clearStatus();try{const t=identifier(table.value);const cols=()=>fields.value.split(',').map(identifier).join(', ');const where=condition.value.trim();let sql='';switch(mode.value){case 'SELECT':sql=`SELECT ${fields.value.trim()==='*'?'*':cols()} FROM ${t}${where?' WHERE '+where:''};`;break;case 'INSERT':if(!values.value.trim())throw new Error('請輸入新增值');sql=`INSERT INTO ${t} (${cols()}) VALUES (${values.value.trim()});`;break;case 'UPDATE':if(!where||!assignments.value.trim())throw new Error('UPDATE 必須填寫 SET 與 WHERE 條件');sql=`UPDATE ${t} SET ${assignments.value.trim()} WHERE ${where};`;break;case 'DELETE':if(!where)throw new Error('DELETE 必須填寫 WHERE 條件');sql=`DELETE FROM ${t} WHERE ${where};`;break;case 'CREATE TABLE':{const defs=columns.value.split(/\r?\n/).map(x=>x.trim().replace(/,$/,'')).filter(Boolean);if(!defs.length)throw new Error('請輸入欄位定義');sql=`CREATE TABLE ${t} (\n${defs.map(x=>'    '+x).join(',\n')}\n);`;break;}}source.value=sql;result.value=sql;message.value='範本已產生，請確認欄位及條件後再使用。'}catch(e){fail(e)}}
function beautify(){clearStatus();try{if(!source.value.trim())throw new Error('請輸入 SQL');result.value=format(source.value,{language:'transactsql',keywordCase:'upper',tabWidth:4});message.value='格式化完成（不代表 SQL 語法或資料庫驗證通過）'}catch(e){fail(e)}}
function example(){source.value='select EmployeeID, Name, Salary from dbo.Employees where Salary >= 40000 order by Salary desc;';result.value='';clearStatus()}
async function copy(){try{await navigator.clipboard.writeText(result.value);bad.value=false;message.value='已複製'}catch(e){bad.value=true;message.value='請手動複製結果'}}
function save(){const url=URL.createObjectURL(new Blob([result.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='query.sql';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
</script>
<template>
<section class="sql-tool">
<header><h3>SQL Server 智慧工具工作室</h3><p>T-SQL 格式化與查詢範本產生，完全在瀏覽器執行。</p></header>
<div class="builder"><h4>SQL 範本產生器</h4><div class="actions"><button v-for="m in modes" :key="m" :class="{chosen:mode===m}" @click="mode=m">{{m}}</button></div>
<label>資料表名稱<input v-model="table" placeholder="dbo.Employees"></label>
<label v-if="mode==='SELECT'||mode==='INSERT'">欄位名稱（逗號分隔）<input v-model="fields"></label>
<label v-if="mode==='INSERT'">VALUES 值（SQL 表達式）<input v-model="values"></label>
<label v-if="mode==='UPDATE'">SET 更新內容<input v-model="assignments"></label>
<label v-if="['SELECT','UPDATE','DELETE'].includes(mode)">WHERE 條件<input v-model="condition"></label>
<label v-if="mode==='CREATE TABLE'">欄位定義（每行一欄）<textarea v-model="columns" rows="5"></textarea></label>
<button @click="generate">產生 SQL 範本</button><small>UPDATE / DELETE 必須填寫 WHERE，但仍須自行確認條件是否正確。</small></div>
<div class="actions"><button @click="example">載入範例</button><button @click="beautify">格式化 SQL</button><button @click="source='';result='';clearStatus()">清空</button><button :disabled="!result" @click="copy">複製結果</button><button :disabled="!result" @click="save">下載 SQL</button></div>
<div class="editors"><label>原始 SQL<textarea v-model="source" spellcheck="false" rows="12"></textarea></label><label>處理結果<textarea :value="result" readonly spellcheck="false" rows="12"></textarea></label></div>
<p v-if="message" role="status" :class="{bad}" class="status">{{message}}</p><p>輸出容量：{{size}} Bytes</p><small>本工具不連線 SQL Server、不執行 SQL，也不驗證欄位型別或資料表是否存在。範本中的值與條件為使用者提供的 SQL 片段，不宜直接用於未受信任的輸入。</small>
</section>
</template>
<style scoped>
.sql-tool{background:white;color:#312e81;border:1px solid #ddd6fe;border-radius:24px;padding:22px;margin-top:16px}.sql-tool header,.builder{background:#ede9fe;border-radius:16px;padding:18px;margin-bottom:16px}.sql-tool h3,.sql-tool h4{font-weight:800;margin:0 0 10px}.builder{display:grid;gap:10px}.sql-tool label{display:grid;gap:6px;font-weight:700}.sql-tool input,.sql-tool textarea{width:100%;border:1px solid #c4b5fd;background:#fafaff;color:#1e293b;border-radius:10px;padding:10px;font:14px/1.6 Consolas,monospace}.actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.sql-tool button{padding:9px 13px;border:1px solid #c4b5fd;border-radius:10px;background:white;color:#5b21b6;font-weight:700}.sql-tool button.chosen,.sql-tool button:hover:not(:disabled){background:#6d28d9;color:white}.sql-tool button:disabled{opacity:.4}.editors{display:grid;grid-template-columns:1fr 1fr;gap:14px}.status{background:#dcfce7;color:#166534;padding:12px;border-radius:10px}.status.bad{background:#fee2e2;color:#991b1b}@media(max-width:750px){.editors{grid-template-columns:1fr}}
</style>
