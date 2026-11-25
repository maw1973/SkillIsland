<script setup>
import { ref, computed } from 'vue'
const mode = ref('base64'), input = ref(''), output = ref(''), error = ref(''), notice = ref('')
const modes = [{id:'base64',name:'Base64'},{id:'url',name:'URL'},{id:'unicode',name:'Unicode'},{id:'html',name:'HTML Entity'},{id:'utf8',name:'UTF-8 Hex'}]
const bytes = computed(()=>new TextEncoder().encode(input.value).length)
const outputBytes = computed(()=>new TextEncoder().encode(output.value).length)
const entities = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}
function convert(decode=false){
  error.value=''; notice.value=''; output.value=''
  try {
    const s=input.value
    if(mode.value==='base64'){
      if(decode){const raw=atob(s.replace(/\s/g,''));output.value=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0)))}
      else {const a=new TextEncoder().encode(s);let raw='';for(let i=0;i<a.length;i+=8192)raw+=String.fromCharCode(...a.subarray(i,i+8192));output.value=btoa(raw)}
    }else if(mode.value==='url')output.value=decode?decodeURIComponent(s):encodeURIComponent(s)
    else if(mode.value==='unicode'){
      output.value=decode?s.replace(/\\u(?:\{([0-9a-fA-F]{1,6})\}|([0-9a-fA-F]{4}))/g,(_,a,b)=>a?String.fromCodePoint(parseInt(a,16)):String.fromCharCode(parseInt(b,16))):s.split('').map(c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')).join('')
    }else if(mode.value==='html'){
      output.value=decode?s.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi,m=>{const k=m.slice(1,-1).toLowerCase();if(k.startsWith('#')){const n=k[1]==='x'?parseInt(k.slice(2),16):Number(k.slice(1));if(n>0x10ffff||(n>=0xd800&&n<=0xdfff))throw Error('無效 Unicode 字元');return String.fromCodePoint(n)}return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"})[k]}):s.replace(/[&<>"']/g,c=>entities[c])
    }else if(mode.value==='utf8'){
      if(decode){const hex=s.replace(/\s/g,'');if(!/^(?:[0-9a-f]{2})*$/i.test(hex))throw Error('請輸入完整的十六進位位元組');output.value=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(hex.match(/../g)||[],h=>parseInt(h,16)))}
      else output.value=Array.from(new TextEncoder().encode(s),b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ')
    }
    notice.value='轉換完成'
  }catch(e){error.value='轉換失敗：'+e.message}
}
function reset(){output.value='';error.value='';notice.value=''}
function example(){input.value='勤益科技大學 SkillIsland 🌏';reset()}
function swap(){input.value=output.value;reset()}
async function copy(){try{await navigator.clipboard.writeText(output.value);notice.value='已複製'}catch{error.value='無法使用剪貼簿，請手動複製'}}
function download(){const url=URL.createObjectURL(new Blob([output.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='encoding-result.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
</script>
<template>
<section class="enc">
  <header><small>CODE LAB / TEXT ENCODING</small><h3>文字編碼轉換工作室</h3><p>繁體中文與 Emoji 支援 · 本機瀏覽器運算</p></header>
  <nav><button v-for="m in modes" :key="m.id" :class="{active:mode===m.id}" @click="mode=m.id;reset()">{{m.name}}</button></nav>
  <div class="panes"><div><label for="enc-in">原始文字 · {{bytes}} Bytes</label><textarea id="enc-in" v-model="input" @input="reset" placeholder="輸入文字或編碼"></textarea></div><div><label for="enc-out">轉換結果 · {{outputBytes}} Bytes</label><textarea id="enc-out" :value="output" readonly placeholder="轉換結果"></textarea></div></div>
  <div class="actions"><button class="primary" @click="convert()">編碼 →</button><button class="primary" @click="convert(true)">解碼 →</button><button @click="swap" :disabled="!output">結果移至輸入</button><button @click="example">載入範例</button><button @click="input='';reset()">清空</button><button @click="copy" :disabled="!output">複製結果</button><button @click="download" :disabled="!output">下載 TXT</button></div>
  <p v-if="error" class="err" role="alert">{{error}}</p><p v-else-if="notice" class="ok" role="status">{{notice}}</p>
  <aside>Base64 與 UTF-8 Hex 不是加密。URL 使用元件編碼；Unicode 使用 JavaScript 跳脫格式；HTML Entity 支援五種常用命名實體與數字實體。</aside>
</section>
</template>
<style scoped>
.enc{margin:16px 0;padding:20px;border:1px solid #ddd6fe;border-radius:24px;background:#fff;color:#312e81}.enc header{padding:24px;background:linear-gradient(120deg,#ede9fe,#dbeafe);border-radius:18px}.enc header small{letter-spacing:2px;font-weight:800}.enc h3{font-size:26px;margin:8px 0}.enc p{margin:8px 0}.enc nav,.actions{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.panes{display:grid;grid-template-columns:1fr 1fr;gap:16px}.panes label{display:block;font-weight:700;margin-bottom:8px}.panes textarea{width:100%;min-height:220px;resize:vertical;padding:14px;border:1px solid #c4b5fd;border-radius:14px;background:#fafaff;color:#172033;font:15px/1.6 monospace}.enc .primary,.enc button.active{background:#6d28d9;color:white}.enc button:disabled{opacity:.5;cursor:not-allowed}.enc aside{padding:12px;background:#f5f3ff;border-radius:12px;font-size:14px}.err{color:#b91c1c}.ok{color:#166534}@media(max-width:700px){.panes{grid-template-columns:1fr}}
</style>
