<script setup>
import { ref, computed } from 'vue'
import * as prettier from 'prettier/standalone'
import * as babel from 'prettier/plugins/babel'
import * as estree from 'prettier/plugins/estree'
import * as typescript from 'prettier/plugins/typescript'
import * as html from 'prettier/plugins/html'
import * as postcss from 'prettier/plugins/postcss'
const languages = [
  {id:'javascript',label:'JavaScript',parser:'babel',ext:'js',sample:'const user={name:"王小明",skills:["Vue","SQL"]};function greet(name){return `Hello ${name}`;}console.log(greet(user.name));'},
  {id:'typescript',label:'TypeScript',parser:'typescript',ext:'ts',sample:'interface Student{name:string;score:number}const student:Student={name:"王小明",score:95};'},
  {id:'html',label:'HTML',parser:'html',ext:'html',sample:'<!DOCTYPE html><html><body><main><h1>SkillIsland</h1><p>智慧技能島</p></main></body></html>'},
  {id:'css',label:'CSS',parser:'css',ext:'css',sample:'.card{display:flex;gap:12px;background:#ede9fe;border-radius:16px;} .card:hover{transform:translateY(-3px);}'},
  {id:'vue',label:'Vue 3',parser:'vue',ext:'vue',sample:'<template><div><h1>{{title}}</h1></div></template>\n<scr'+'ipt setup>\nconst title="SkillIsland";\n</scr'+'ipt>\n<style scoped>h1{color:purple;}</style>'},
  {id:'json',label:'JSON',parser:'json',ext:'json',sample:'{"project":"SkillIsland","version":"5.2","skills":["Vue","JavaScript"],"enabled":true}'}
]
const language=ref('javascript'), source=ref(''), result=ref(''), message=ref(''), failed=ref(false), busy=ref(false)
const indent=ref(2), width=ref(80), singleQuote=ref(true), semi=ref(true)
const selected=computed(()=>languages.find(x=>x.id===language.value))
const lines=s=>s?s.split(/\r?\n/).length:0
let revision=0
function clearResult(){revision++;result.value='';message.value='';failed.value=false;busy.value=false}
function example(){source.value=selected.value.sample;clearResult()}
function reset(){source.value='';clearResult()}
function languageChanged(){clearResult()}
async function run(){
  clearResult()
  if(!source.value.trim()){message.value='請先輸入程式碼';failed.value=true;return}
  const token=revision;busy.value=true
  try{
    const formatted=await prettier.format(source.value,{parser:selected.value.parser,plugins:[babel,estree,typescript,html,postcss],tabWidth:Number(indent.value),printWidth:Number(width.value),singleQuote:singleQuote.value,semi:semi.value,endOfLine:'lf'})
    if(token!==revision)return
    result.value=formatted;message.value='格式化完成'
  }catch(e){if(token===revision){failed.value=true;message.value='格式化失敗：'+e.message}}
  finally{if(token===revision)busy.value=false}
}
async function load(e){const file=e.target.files?.[0];e.target.value='';if(!file)return;clearResult();const token=revision;try{const value=(await file.text()).replace(/^\uFEFF/,'');if(token!==revision)return;const ext=file.name.split('.').pop().toLowerCase();const match=languages.find(x=>x.ext===ext);if(match)language.value=match.id;source.value=value;clearResult()}catch(err){if(token===revision){failed.value=true;message.value='讀取失敗：'+err.message}}}
async function copy(){try{await navigator.clipboard.writeText(result.value);message.value='已複製';failed.value=false}catch{message.value='無法自動複製，請手動選取結果';failed.value=true}}
function save(){const url=URL.createObjectURL(new Blob([result.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='formatted.'+selected.value.ext;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
</script>
<template>
<section class="cf">
<header><span>CODE LAB / V5.2</span><h3>程式碼格式化工作室</h3><p>使用 Prettier 在瀏覽器整理程式碼，不執行原始碼，也不需上傳伺服器。</p></header>
<div class="cf-options">
<label>語言<select v-model="language" @change="languageChanged"><option v-for="l in languages" :key="l.id" :value="l.id">{{l.label}}</option></select></label>
<label>縮排<select v-model.number="indent" @change="clearResult"><option :value="2">2 格</option><option :value="4">4 格</option></select></label>
<label>建議行寬<select v-model.number="width" @change="clearResult"><option :value="80">80</option><option :value="100">100</option><option :value="120">120</option></select></label>
<label class="cf-check"><input type="checkbox" v-model="singleQuote" @change="clearResult"> 偏好單引號</label><label class="cf-check"><input type="checkbox" v-model="semi" @change="clearResult"> 保留分號</label>
</div>
<div class="cf-actions"><button @click="example">載入範例</button><label class="cf-upload">上傳程式檔<input type="file" accept=".js,.ts,.html,.css,.vue,.json,.txt" @change="load"></label><button @click="reset">清空</button><button class="cf-primary" :disabled="busy || !source.trim()" @click="run">{{busy?'格式化中…':'開始格式化'}}</button></div>
<div class="cf-grid"><label>原始程式碼 <small>{{lines(source)}} 行</small><textarea v-model="source" @input="clearResult" spellcheck="false" placeholder="請貼上原始程式碼"></textarea></label><label>格式化結果 <small>{{lines(result)}} 行</small><textarea :value="result" readonly spellcheck="false" placeholder="格式化結果"></textarea></label></div>
<div class="cf-actions"><button :disabled="!result" @click="copy">複製結果</button><button :disabled="!result" @click="save">下載程式檔</button></div>
<pre v-if="message" role="status" class="cf-status" :class="{bad:failed}">{{message}}</pre>
<small>格式化不是完整的語法、型別或執行測試。JSON 引號及部分語言格式仍依語法規範；Vue 內嵌的其他語言不保證全部支援。</small>
</section>
</template>
<style scoped>
.cf{background:#fff;border:1px solid #ddd6fe;border-radius:24px;padding:20px;margin-top:16px;color:#312e81}.cf header{background:linear-gradient(120deg,#ede9fe,#dbeafe);border-radius:18px;padding:20px}.cf header span{font-size:12px;font-weight:800;letter-spacing:2px;color:#6d28d9}.cf h3{margin:8px 0;font-weight:800}.cf header p{margin:0}.cf-options,.cf-actions{display:flex;flex-wrap:wrap;align-items:end;gap:12px;margin:16px 0}.cf-options label{display:grid;gap:5px;font-weight:700}.cf-options .cf-check{display:flex;align-items:center;padding:8px 0}.cf select{border:1px solid #c4b5fd;border-radius:10px;padding:8px;background:white;color:#312e81}.cf-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.cf-grid label{display:grid;gap:8px;font-weight:700}.cf-grid small{color:#64748b}.cf textarea{box-sizing:border-box;width:100%;min-height:340px;resize:vertical;background:#f8fafc;color:#1e293b;border:1px solid #c4b5fd;border-radius:12px;padding:12px;font:14px/1.6 Consolas,monospace}.cf button,.cf-upload{border:1px solid #c4b5fd;border-radius:12px;padding:10px 14px;background:#f5f3ff;color:#5b21b6;font-weight:700;cursor:pointer}.cf .cf-primary{background:#6d28d9;color:white}.cf button:disabled{opacity:.45;cursor:not-allowed}.cf-upload input{display:block;max-width:220px;font-size:12px}.cf-status{white-space:pre-wrap;overflow-wrap:anywhere;background:#dcfce7;color:#166534;padding:12px;border-radius:10px}.cf-status.bad{background:#fee2e2;color:#991b1b}@media(max-width:750px){.cf-grid{grid-template-columns:1fr}.cf textarea{min-height:220px}}
</style>
