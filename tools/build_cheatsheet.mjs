import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Workbook, SpreadsheetFile} from '@oai/artifact-tool';
import {checkedOn, title, sources, guide, fundamentals, history, glossary, groups, queries} from './content.mjs';
import './queries.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'outputs', 'cloudwatch_insights_20261016');
const qa = path.join(out, 'qa');
await fs.mkdir(qa, {recursive:true});
const filename = 'CloudWatch_Logs_Insights_Cheatsheet';
const workbook = Workbook.create();
const font = 'Meiryo UI';
const ink = '#202020';
const sheetInfo = [];
const sourceMap = new Map(sources.map(s => [s[0], s]));

function textWidth(value, size = 11) {
  return [...value].reduce((n, c) => n + (/[\u0000-\u007F]/.test(c) ? (/[MW@]/.test(c) ? 0.85 : 0.58) : 1.05), 0) * size * 96 / 72;
}
function height(value, width, size = 11) {
  const lineCount = String(value).split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(textWidth(l, size) / (width - 24))), 0);
  return Math.max(29, Math.ceil(lineCount * size * 96 / 72 * 1.52 + 15));
}
function style(sheet, range, opts) {
  const target = sheet.getRange(range);
  Object.assign(target.format, opts);
}
function init(name, heading, widths, subtitle) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  sheet.tabColor = name.startsWith('01') ? '#252525' : '#999999';
  widths.forEach((w, i) => {sheet.getRangeByIndexes(0,i,1,1).format.columnWidthPx = w;});
  const startCol = name.startsWith('01') ? 'A' : 'B';
  sheet.getRange(`${startCol}2`).values = [[heading]];
  sheet.getRange(`${startCol}2`).format.font = {name:font,size:17,bold:true,color:ink};
  sheet.getRange(`${startCol}2`).format.rowHeightPx = 40;
  sheet.getRange(`${startCol}3`).values = [[subtitle]];
  sheet.getRange(`${startCol}3`).format.font = {name:font,size:11,color:'#555555'};
  sheet.getRange(`${startCol}3`).format.rowHeightPx = 30;
  sheet.getRange(`${startCol}3:${name.startsWith('01')?'E':'C'}3`).format.borders = {bottom:{style:'thin',color:'#888888'}};
  const info = {name,widths,lastRow:3,links:[],queryStarts:[],rowHeights:{}};
  sheetInfo.push(info);
  return {sheet,info};
}
function narrativeRow(sheet, info, row, label, value, kind = 'body') {
  const literal = text => text.startsWith('=') ? "'" + text : text;
  sheet.getRange(`B${row}:C${row}`).values = [[literal(label),literal(value)]];
  const size = kind === 'section' ? 12 : 11;
  const fill = kind === 'section' ? '#3B3B3B' : kind === 'query' || kind === 'sample' ? '#F0F0F0' : '#FFFFFF';
  sheet.getRange(`B${row}:C${row}`).format = {
    font:{name:font,size,color:kind === 'section'?'#FFFFFF':ink,bold:kind === 'section'},
    fill,wrapText:true,verticalAlignment:'top',horizontalAlignment:'left'
  };
  if(kind !== 'section') {
    sheet.getRange(`B${row}`).format.font = {name:font,size:11,bold:true,color:'#4A4A4A'};
    sheet.getRange(`B${row}`).format.fill = '#F7F7F7';
  }
  const h = Math.max(height(label,info.widths[1],size),height(value,info.widths[2],size));
  if (h > 540) throw new Error(`Row exceeds safe Excel height: ${info.name} row ${row}`);
  sheet.getRange(`B${row}:C${row}`).format.rowHeightPx = h;
  info.rowHeights[row] = h;
  info.lastRow = Math.max(info.lastRow,row);
}
function blank(sheet, info, row) {
  sheet.getRange(`B${row}:C${row}`).format.rowHeightPx = 15;
  info.lastRow = Math.max(info.lastRow,row);
}
const widths = [24,170,830];
const start = init('00_使い方', title, widths, `仕様確認日 ${checkedOn}　48クエリ　Logs Insights QL`);
let row = 5;
for (const [label,value] of guide) narrativeRow(start.sheet,start.info,row++,label,value);
blank(start.sheet,start.info,row++);
narrativeRow(start.sheet,start.info,row++,'選び方','最初にQ01。エラーはQ02。除外はQ09。日時はQ13・Q15。グループはQ18。EAPはQ23～Q29。JavaはQ30～Q39。集計はQ40～Q43。');

const copy = init('01_コピー用','コピーして実行するクエリ',[65,110,290,810,390],'D列のセルを1つコピー。IDをクリックすると解説へ移動します。');
copy.sheet.getRange('A5:E5').values = [['ID','分類','目的','クエリ（コピーするセル）','実行条件・変更する値']];
copy.sheet.getRange('A5:E5').format = {fill:'#303030',font:{name:font,size:11,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true,rowHeightPx:34};
copy.sheet.freezePanes.freezeRows(5);
copy.sheet.freezePanes.freezeColumns(3);
const locations = {};
for(const [key,name,heading] of groups) {
  const obj = init(name, heading, widths, 'クエリは01_コピー用のD列からコピーできます。入力例と結果はすべて架空です。');
  let r=5;
  for(const q of queries.filter(q=>q.group===key)) {
    locations[q.id]={sheet:name,row:r};
    obj.info.queryStarts.push(r);
    const rows = [
      [q.id,q.name,'section'],
      ['実行条件',q.ready],
      ['変更する値',q.change],
      ['実行クエリ',q.lines.join('\n| '),'query'],
      ['何が分かるか',q.purpose],
      ['身近なたとえ',q.analogy],
      ...q.steps.map((v,i)=>[`処理の段階 ${i+1}`,v]),
      ['入力例（架空）',q.sample,'sample'],
      ['期待する結果',q.expected],
      ['歴史・背景',q.background],
      ['注意点',q.caution],
      ['次に調べること',q.next],
      ['根拠となる資料',q.refs.map(id=>`${id} ${sourceMap.get(id)[2]}`).join(' / ')]
    ];
    for(const [label,value,kind] of rows) narrativeRow(obj.sheet,obj.info,r++,label,value,kind);
    obj.info.links.push({cell:`B${r-1}`,location:"'07_仕組みと資料'!B5",display:'根拠となる資料'});
    blank(obj.sheet,obj.info,r++);
  }
  obj.sheet.freezePanes.freezeRows(3);
}
for(const [i,q] of queries.entries()) {
  const r=i+6;
  const category = groups.find(g=>g[0]===q.group)[2];
  const query = q.lines.join(' | ');
  if (/[\r\n\t"]/.test(query)) throw new Error(`Clipboard-unfriendly query: ${q.id}`);
  const values = [q.id,category,q.name,query,`${q.ready}\n変更：${q.change}`];
  copy.sheet.getRange(`A${r}:E${r}`).values = [values];
  copy.sheet.getRange(`A${r}:E${r}`).format = {font:{name:font,size:11,color:ink},fill:i%2?'#F4F4F4':'#FFFFFF',wrapText:true,verticalAlignment:'top',horizontalAlignment:'left'};
  copy.sheet.getRange(`A${r}`).format.font = {name:font,size:11,bold:true,color:ink,underline:'single'};
  copy.sheet.getRange(`D${r}`).setNumberFormat('@');
  const h=Math.max(...values.map((v,j)=>height(v,copy.info.widths[j])));
  copy.sheet.getRange(`A${r}:E${r}`).format.rowHeightPx=h;
  copy.info.rowHeights[r]=h;
  copy.info.links.push({cell:`A${r}`,location:`'${locations[q.id].sheet}'!B${locations[q.id].row}`,display:q.id});
  copy.info.lastRow=r;
  q.copyCell=`D${r}`;
}

const ref=init('07_仕組みと資料','仕組み・歴史・用語・公式資料',widths,`確認日 ${checkedOn}　出典は一次資料。個々のクエリの組み合わせと入力例は本資料で作成。`);
row=5;
const sections = [['仕組みを理解する',fundamentals],['歴史と必要になった背景',history],['用語辞典',glossary]];
for(const [heading,items] of sections) {
  narrativeRow(ref.sheet,ref.info,row++,'解説',heading,'section');
  for(const [label,value] of items) narrativeRow(ref.sheet,ref.info,row++,label,value);
  blank(ref.sheet,ref.info,row++);
}
const sourceRow=row;
narrativeRow(ref.sheet,ref.info,row++,'出典','公式資料一覧','section');
narrativeRow(ref.sheet,ref.info,row++,'確認日',`${checkedOn}。Red Hatのサポート記事は公開されているIssue等の部分を参照。製品版ごとの差を一般化せず、利用版のログ本文を優先してください。Java SE 25のAPIは基本的な例外の意味を確認する参照版で、利用JDKの推奨版を意味しません。`);
for(const [id,owner,label,url,scope] of sources) {
  narrativeRow(ref.sheet,ref.info,row++,id,`${owner} / ${label}\n確認内容：${scope}`);
  narrativeRow(ref.sheet,ref.info,row,'URL',url);
  ref.info.links.push({cell:`C${row}`,target:url,display:url});
  row++;
}
for(const s of sheetInfo) for(const link of s.links) if(link.location === "'07_仕組みと資料'!B5") link.location=`'07_仕組みと資料'!B${sourceRow}`;
ref.sheet.freezePanes.freezeRows(3);

// Markdown shares the exact source of every query and explanation with Excel.
const lines = [`# ${title}`,'',`仕様確認日：${checkedOn}。48クエリ。対象言語：**Logs Insights QL**。`,'',
  'Excel版の「01_コピー用」D列は、改行・タブ・二重引用符を含まないコピー用1行クエリです。こちらのMarkdownでは同じクエリを段階ごとに改行して掲載します。','',
  '## 使い方',''];
const md = s => s.replace(/\|/g,'\\|').replace(/\n/g,'<br>');
for(const [label,value] of guide) lines.push(`### ${label}`,'',value,'');
lines.push('## クエリ索引','','| ID | 分類 | 目的 | 実行条件 |','| --- | --- | --- | --- |');
for(const q of queries) lines.push(`| [${q.id}](#${q.id.toLowerCase()}) | ${groups.find(g=>g[0]===q.group)[2]} | ${q.name} | ${md(q.ready)} |`);
lines.push('');
for(const [key,,heading] of groups) {
  lines.push(`## ${heading}`,'');
  for(const q of queries.filter(q=>q.group===key)) {
    lines.push(`<a id="${q.id.toLowerCase()}"></a>`,`### ${q.id}　${q.name}`,'',`**実行条件：** ${q.ready}`,'',`**変更する値：** ${q.change}`,'','```text',q.lines.join('\n| '),'```','',
      '**何が分かるか**','',q.purpose,'','**身近なたとえ**','',q.analogy,'','**処理の段階**','');
    q.steps.forEach((v,i)=>lines.push(`${i+1}. ${v}`));
    lines.push('','**入力例（架空）**','','```text',q.sample,'```','',`**期待する結果：** ${q.expected}`,'','**歴史・背景**','',q.background,'','**注意点**','',q.caution,'',`**次に調べること：** ${q.next}`,'',
      '根拠となる資料：'+q.refs.map(id=>{const s=sourceMap.get(id);return `[${id} ${s[2]}](${s[3]})`;}).join('、')+'。','');
  }
}
for(const [heading,items] of sections) {
  lines.push(`## ${heading}`,'');
  for(const [label,value] of items) lines.push(`### ${label}`,'',value.replace(/〔([^〕]+)〕/g,(_,ids)=>ids.split('、').map(id=>sourceMap.has(id)?`[${id}](${sourceMap.get(id)[3]})`:id).join('、')),'');
}
lines.push('## 公式資料一覧','',`すべての資料の確認日：${checkedOn}。サポート記事は公開部分を参照。Java SE 25の記載は基本仕様の確認に用いた参照版です。`,'','| ID | 提供元・資料 | 確認した内容 |','| --- | --- | --- |');
for(const [id,owner,label,url,scope] of sources) lines.push(`| ${id} | [${owner}：${label}](${url}) | ${scope} |`);
await fs.writeFile(path.join(out,`${filename}.md`),lines.join('\n')+'\n','utf8');

workbook.recalculate();
const errors=await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#SPILL!|#CALC!',options:{useRegex:true,maxResults:20},maxChars:1500,summary:'final error check'});
await fs.writeFile(path.join(qa,'artifact_inspect.json'),JSON.stringify(errors,null,2));
const result=await SpreadsheetFile.exportXlsx(workbook);
await result.save(path.join(out,`${filename}.xlsx`));
await fs.writeFile(path.join(qa,'manifest.json'),JSON.stringify({checkedOn,title,queries,sources,sheetInfo,locations,sourceRow},null,2));
console.log(`Exported ${queries.length} queries, ${sheetInfo.length} sheets, ${sources.length} sources.`);

const renderLog=[];
const selectedArg = process.argv.find(arg => arg.startsWith('--render-only='));
const selectedPreviews = selectedArg ? new Set(selectedArg.slice('--render-only='.length).split(',')) : null;
for(const info of sheetInfo) {
  const range=info.name.startsWith('01')?'A1:E9':`A1:C${info.name==='00_使い方'?16:Math.min(13,info.lastRow)}`;
  if (selectedPreviews && !selectedPreviews.has(info.name)) {
    await fs.access(path.join(qa,`${info.name}.png`));
    renderLog.push({sheet:info.name,range,result:'rendered',reusedUnchangedPreview:true});
    continue;
  }
  try {
    const blob=await workbook.render({sheetName:info.name,range,scale:1,format:'png'});
    await fs.writeFile(path.join(qa,`${info.name}.png`),new Uint8Array(await blob.arrayBuffer()));
    renderLog.push({sheet:info.name,range,result:'rendered'});
    console.log(`Rendered ${info.name}`);
  } catch(err) {
    renderLog.push({sheet:info.name,range,result:'failed',error:String(err)});
    console.log(`Render failed: ${info.name}: ${String(err).slice(0,180)}`);
  }
}
for(const id of ['Q16','Q36','Q44']) {
  const loc=locations[id];
  const range=`B${loc.row}:C${loc.row+14}`;
  if (selectedPreviews && !selectedPreviews.has(id)) {
    await fs.access(path.join(qa,`${id}.png`));
    renderLog.push({sheet:loc.sheet,range,result:'rendered',reusedUnchangedPreview:true});
    continue;
  }
  try {
    const blob=await workbook.render({sheetName:loc.sheet,range,scale:1,format:'png'});
    await fs.writeFile(path.join(qa,`${id}.png`),new Uint8Array(await blob.arrayBuffer()));
    renderLog.push({sheet:loc.sheet,range,result:'rendered'});
  } catch(err) {renderLog.push({sheet:loc.sheet,range,result:'failed',error:String(err)});}
}
await fs.writeFile(path.join(qa,'render_log.json'),JSON.stringify(renderLog,null,2));
console.log(`Finished. Markdown length: ${lines.join('\n').length} characters.`);
