const students = [
  {name:"Liam van der Merwe",lurits:"981104-5820",className:"G11-A",a:38,b:33,c:22},
  {name:"Kagiso Molefe",lurits:"981208-4102",className:"G11-A",a:31,b:28,c:18},
  {name:"Thandiwe Zungu",lurits:"980422-9901",className:"G11-A",a:27,b:23,c:19,extra:"15m Extra"},
  {name:"Sipho Ndlovu",lurits:"980112-7314",className:"G11-A",a:16,b:14,c:8,risk:true},
  {name:"Lindiwe Nkosi",lurits:"980719-2184",className:"G11-A",a:"MED",b:"MED",c:"MED"},
  {name:"Chloe van der Merwe",lurits:"980514-6330",className:"G11-A",a:34,b:30,c:19},
  {name:"Farai Moyo",lurits:"981120-1944",className:"G11-A",a:29,b:26,c:17},
];
const storageKey="edusync.assessment.phy11a.t2task3";
try {
  const saved=JSON.parse(localStorage.getItem(storageKey)||"{}");
  students.forEach(s=>{if(saved[s.lurits])Object.assign(s,saved[s.lurits]);});
} catch { /* Keep the sample marks if saved data is unavailable. */ }
let mode="raw",timer;
const body=document.querySelector("#marks-body");
const toast=document.querySelector("#toast");
function notify(message){toast.textContent=message;toast.classList.add("show");clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove("show"),3000);}
function total(s){return [s.a,s.b,s.c].every(v=>v==="MED")?"MED":[s.a,s.b,s.c].reduce((sum,v)=>sum+(Number(v)||0),0);}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(students.map(s=>[s.lurits,{a:s.a,b:s.b,c:s.c}]))));document.querySelector("#autosave").textContent="● Auto-save active (All mark keystrokes synced just now)";}catch{document.querySelector("#autosave").textContent="● Autosave unavailable in this browser";}}
function shownScore(value,max){if(value==="MED")return `<span class="med-mark">MED</span>`;let n=Number(value);if(mode==="weighted")n=(n/max*25).toFixed(1);return `<input class="mark-cell ${n<max*.4?"invalid":""}" type="number" min="0" max="${max}" value="${value}" data-id="${students.findIndex(s=>s.lurits===currentStudent.lurits)}" data-section="${max===40?"a":max===35?"b":"c"}" aria-label="${currentStudent.name} score out of ${max}"/>`;}
let currentStudent;
function render(){const q=document.querySelector("#filter").value.trim().toLowerCase(),cohort=document.querySelector("#cohort").value;
 const rows=students.filter(s=>`${s.name} ${s.lurits}`.toLowerCase().includes(q)).filter(s=>cohort==="risk"?!s.risk?false:true:cohort==="complete"?total(s)==="MED"?false:true:cohort==="incomplete"?total(s)==="MED":true);
 body.innerHTML=rows.map((s)=>{currentStudent=s;let t=total(s),weighted=t==="MED"?"MED":(t*.25).toFixed(1);return `<tr class="${s.risk?"risk-row":""}"><td>${String(students.indexOf(s)+1).padStart(2,"0")}</td><td><div class="learner"><span class="initials">${s.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</span><span><b>${s.name} ${s.extra?`<em class="accommodation">${s.extra}</em>`:""}</b><small class="${s.risk?"risk-id":""}">LURITS: ${s.lurits} • ${s.risk?"At-Risk Flag":s.className}</small></span></div></td><td>${shownScore(s.a,40)}</td><td>${shownScore(s.b,35)}</td><td>${shownScore(s.c,25)}</td><td class="total-cell">${mode==="weighted"&&t!=="MED"?weighted:t}</td></tr>`;}).join("");
 body.querySelectorAll(".mark-cell").forEach(input=>input.addEventListener("input",()=>{let s=students[Number(input.dataset.id)],key=input.dataset.section,max=key==="a"?40:key==="b"?35:25;let val=input.value===""?"":Number(input.value);if(val!==""&&(val<0||val>max)){input.classList.add("invalid");return;}input.classList.remove("invalid");s[key]=val;save();render();let focus=body.querySelector(`[data-id="${input.dataset.id}"][data-section="${key}"]`);if(focus){focus.focus();focus.setSelectionRange?.(String(focus.value).length,String(focus.value).length);}}));
}
render();
document.querySelector("#filter").addEventListener("input",render);
document.querySelector("#cohort").addEventListener("change",render);
document.querySelectorAll(".mode").forEach(button=>button.addEventListener("click",()=>{mode=button.dataset.mode;document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b===button));render();}));
document.querySelector("#batch").addEventListener("click",()=>{const value=prompt("Enter a mark for Section A (0–40) to apply to all learners. Leave blank to cancel:");if(value===null||value.trim()==="")return;const n=Number(value);if(!Number.isInteger(n)||n<0||n>40)return notify("Enter a whole number between 0 and 40.");students.forEach(s=>{if(s.a!=="MED")s.a=n;});save();render();notify("Section A marks updated for learners with an active assessment.");});
document.querySelector("#publish").addEventListener("click",()=>{if(!confirm("Publish the current marks to the SBA ledger? You can still make amendments through the gradebook."))return;save();notify("Marks published to the local SBA ledger preview.");});
document.querySelector("#moderate").addEventListener("click",()=>{save();notify("Moderation request prepared for Mrs. D. Pillay (HOD).");});
document.querySelector("#export").addEventListener("click",()=>{const lines=[["Learner","LURITS ID","Section A / 40","Section B / 35","Section C / 25","Total / 100"],...students.map(s=>[s.name,s.lurits,s.a,s.b,s.c,total(s)])];const csv=lines.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\r\n");const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));link.download="PHY-11A-T2-SBA-marks.csv";link.click();URL.revokeObjectURL(link.href);});
document.querySelector("#import-file").addEventListener("change",async event=>{const file=event.target.files[0];if(!file)return;const lines=(await file.text()).trim().split(/\r?\n/).slice(1);let changed=0;for(const line of lines){const cols=line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));const s=students.find(item=>item.lurits===cols[1]||item.name.toLowerCase()===cols[0]?.toLowerCase());if(!s)continue;["a","b","c"].forEach((key,i)=>{const v=cols[i+2];if(v==="MED"||v===""||v==null)return;const n=Number(v),max={a:40,b:35,c:25}[key];if(Number.isInteger(n)&&n>=0&&n<=max)s[key]=n;});changed++;}save();render();notify(`${changed} matching learner record(s) imported.`);event.target.value="";});
document.querySelector("#recorded-count").textContent="28/34";
document.querySelector("#add-question").addEventListener("click",()=>{const title=prompt("Enter the sub-question title:");if(!title?.trim())return;const points=prompt("Enter its point value:");if(!points||!Number.isFinite(Number(points))||Number(points)<=0)return notify("Enter a valid point value.");const row=document.createElement("div");row.className="question";row.innerHTML=`<b>${title.replace(/[<>]/g,"")}</b><strong>${Number(points)} pts</strong><small>CAPS Core: New assessment item</small>`;document.querySelector(".editor .add-question").before(row);notify("Blueprint item added to this page.");});
document.querySelector("#generate").addEventListener("click",()=>{const sorted=[...students].filter(s=>total(s)!=="MED").sort((a,b)=>total(b)-total(a));const sample=[sorted[0],sorted[Math.floor(sorted.length/2)],sorted.at(-1),sorted.find(s=>s.risk),sorted[Math.min(1,sorted.length-1)]].filter(Boolean);notify(`5-script moderation sample prepared: ${sample.map(s=>s.name).join(", ")}`);});
document.querySelector("#copy-blueprint").addEventListener("click",async()=>{const text=[...document.querySelectorAll(".question b")].map(el=>el.textContent).join("\n");try{await navigator.clipboard.writeText(text);notify("Blueprint item titles copied.");}catch{notify("Blueprint ready to copy from the editor.");}});
document.querySelectorAll("[data-toast]").forEach(button=>button.addEventListener("click",()=>notify(button.dataset.toast)));
document.querySelector("#menu").addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("open"));
