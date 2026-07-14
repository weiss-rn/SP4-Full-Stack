"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Boxes, Calendar, ChevronLeft, ChevronRight, Download, FileText, Percent, Search, ShoppingCart, Tags, TrendingUp, Users, X } from "lucide-react";
import type { DemoOrderReportItem } from "@/types/demo-orders";
import { cn } from "@/utils/cn";

type SF = "date"|"qty"|"unitPrice"|"lineTotal"|"remainingStock"|"deduction"|"net";
type SD = "asc"|"desc";

function fmt$(v:number){return"$"+v.toFixed(2);}
function fmtTS(v:string){return new Date(v).toLocaleString();}
function fmtSC(v:number){return v.toLocaleString();}

function calcDeduction(item: DemoOrderReportItem): number {
  if (!item.subtotal || item.subtotal <= 0) return 0;
  const prop = item.lineTotal / item.subtotal;
  return Math.round(((item.discountAmount + item.shippingFee) * prop + Number.EPSILON) * 100) / 100;
}
function calcNet(item: DemoOrderReportItem): number {
  return Math.round((item.lineTotal - calcDeduction(item) + Number.EPSILON) * 100) / 100;
}

const fc="w-full rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900";
const cc="rounded-[1.75rem] border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm";

interface P{initialReportItems:DemoOrderReportItem[];onNavigateCatalog:()=>void;}

export default function AdminSalesReport({initialReportItems,onNavigateCatalog}:P){
  const[df,setDf]=useState("");const[dt,setDt]=useState("");
  const[pmin,setPmin]=useState("");const[pmax,setPmax]=useState("");
  const[qmin,setQmin]=useState("");const[qmax,setQmax]=useState("");
  const[qq,setQq]=useState("");const[sb,setSb]=useState("date-desc");
  const[pg,setPg]=useState(1);const[det,setDet]=useState<null|{orderId:string;orderNumber:string;createdAt:string;customerName:string;customerEmail:string;items:DemoOrderReportItem[];totalUnits:number;totalRevenue:number;}>(null);
  const[sf,setSf]=useState(false);const PS=25;

  const items=useMemo(()=>{
    let a=[...initialReportItems];
    if(df)a=a.filter(i=>i.createdAt>=df);
    if(dt)a=a.filter(i=>i.createdAt<=dt+"T23:59:59.999Z");
    if(pmin)a=a.filter(i=>i.unitPrice>=Number(pmin));
    if(pmax)a=a.filter(i=>i.unitPrice<=Number(pmax));
    if(qmin)a=a.filter(i=>i.quantity>=Number(qmin));
    if(qmax)a=a.filter(i=>i.quantity<=Number(qmax));
    const q=qq.trim().toLowerCase();
    if(q)a=a.filter(i=>(i.orderNumber+" "+i.customerName+" "+i.customerEmail+" "+i.productName+" "+i.productId+" "+i.category).toLowerCase().includes(q));
    const[f,d]=sb.split("-")as[SF,SD];
    a.sort((a,b)=>{let c=0;if(f==="date")c=a.createdAt.localeCompare(b.createdAt);else if(f==="qty")c=a.quantity-b.quantity;else if(f==="unitPrice")c=a.unitPrice-b.unitPrice;else if(f==="lineTotal")c=a.lineTotal-b.lineTotal;else if(f==="remainingStock")c=a.remainingStock-b.remainingStock;else if(f==="deduction")c=calcDeduction(a)-calcDeduction(b);else c=calcNet(a)-calcNet(b);return d==="desc"?-c:c;});
    return a;
  },[initialReportItems,df,dt,pmin,pmax,qmin,qmax,qq,sb]);

  const os=new Set(items.map(i=>i.orderId));
  const tO=os.size;const tU=items.reduce((s,i)=>s+i.quantity,0);const tR=items.reduce((s,i)=>s+i.lineTotal,0);
  const tD=items.reduce((s,i)=>s+calcDeduction(i),0);
  const netTotal=items.reduce((s,i)=>s+calcNet(i),0);
  const aO=tO>0?tR/tO:0;

  // aggregate summaries
  const weeks=useMemo(()=>{
    const w=new Map<string,{o:Set<string>;u:number;r:number}>();
    for(const i of items){const d=new Date(i.createdAt);const y=d.getUTCFullYear();const s=new Date(Date.UTC(y,0,1));const wk=Math.ceil(((d.getTime()-s.getTime())/86400000+s.getUTCDay()+1)/7);const k=y+"-W"+String(wk).padStart(2,"0");if(!w.has(k))w.set(k,{o:new Set(),u:0,r:0});const m=w.get(k)!;m.o.add(i.orderId);m.u+=i.quantity;m.r+=i.lineTotal;}
    return Array.from(w).map(([k,d])=>({k,orders:d.o.size,units:d.u,rev:d.r})).sort((a,b)=>b.k.localeCompare(a.k)).slice(0,10);
  },[items]);

  const months=useMemo(()=>{
    const m=new Map<string,{o:Set<string>;u:number;r:number}>();const N=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    for(const i of items){const d=new Date(i.createdAt);const k=N[d.getUTCMonth()]+" "+d.getUTCFullYear();if(!m.has(k))m.set(k,{o:new Set(),u:0,r:0});const x=m.get(k)!;x.o.add(i.orderId);x.u+=i.quantity;x.r+=i.lineTotal;}
    return Array.from(m).map(([k,d])=>({k,orders:d.o.size,units:d.u,rev:d.r})).sort((a,b)=>{const p=(s:string)=>new Date(s.replace(" "," 1,")).getTime();return p(b.k)-p(a.k);}).slice(0,12);
  },[items]);

  const topP=useMemo(()=>{
    const p=new Map<string,{n:string;c:string;u:number;r:number}>();
    for(const i of items){if(!p.has(i.productId))p.set(i.productId,{n:i.productName,c:i.category,u:0,r:0});const x=p.get(i.productId)!;x.u+=i.quantity;x.r+=i.lineTotal;}
    return Array.from(p).map(([id,d])=>({id,name:d.n,cat:d.c,units:d.u,rev:d.r})).sort((a,b)=>b.rev-a.rev).slice(0,10);
  },[items]);

  const topC=useMemo(()=>{
    const c=new Map<string,{n:string;e:string;o:Set<string>;r:number}>();
    for(const i of items){const k=i.customerEmail;if(!c.has(k))c.set(k,{n:i.customerName,e:i.customerEmail,o:new Set(),r:0});const x=c.get(k)!;x.o.add(i.orderId);x.r+=i.lineTotal;}
    return Array.from(c).map(([e,d])=>({email:e,name:d.n,orders:d.o.size,rev:d.r})).sort((a,b)=>b.rev-a.rev).slice(0,8);
  },[items]);

  const catBr=useMemo(()=>{
    const c=new Map<string,{u:number;r:number;d:number;n:number}>();
    for(const i of items){if(!c.has(i.category))c.set(i.category,{u:0,r:0,d:0,n:0});const x=c.get(i.category)!;x.u+=i.quantity;x.r+=i.lineTotal;x.d+=calcDeduction(i);x.n+=calcNet(i);}
    return Array.from(c).map(([k,v])=>({cat:k,...v})).sort((a,b)=>b.n-a.n);
  },[items]);

  const tp=Math.max(1,Math.ceil(items.length/PS));const sp=Math.min(pg,tp);
  const pi=items.slice((sp-1)*PS,sp*PS);const fN=(sp-1)*PS+1;const tN=Math.min(sp*PS,items.length);

  const showD=(item:DemoOrderReportItem)=>{
    const oi=initialReportItems.filter(i=>i.orderId===item.orderId);
    setDet({orderId:item.orderId,orderNumber:item.orderNumber,createdAt:item.createdAt,customerName:item.customerName,customerEmail:item.customerEmail,items:oi,totalUnits:oi.reduce((s,i)=>s+i.quantity,0),totalRevenue:oi.reduce((s,i)=>s+i.lineTotal,0)});
  };

  const expCSV=()=>{
    const h=["Date","Order#","OrderID","Name","Email","ProdID","Product","Category","Qty","Price","Total","Deduction","Net","Stock"];
    const r=items.map(i=>[i.createdAt,i.orderNumber,i.orderId,i.customerName,i.customerEmail,i.productId,i.productName,i.category,i.quantity,i.unitPrice,i.lineTotal,calcDeduction(i),calcNet(i),i.remainingStock]);
    const csv=[h.join(","),...r.map(row=>row.join(","))].join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="report.csv";a.click();URL.revokeObjectURL(url);
  };

  const hf=!!(df||dt||pmin||pmax||qmin||qmax||qq);
  const clr=()=>{setDf("");setDt("");setPmin("");setPmax("");setQmin("");setQmax("");setQq("");setPg(1);};
  const activeFilterCount=[(df||dt),(pmin||pmax),(qmin||qmax),qq].filter(Boolean).length;

  return(<><section className={cc}>
    {/* Header */}
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-mono-400" /><h2 className="text-lg font-bold text-mono-900">Sales Report</h2></div><p className="mt-1 text-sm text-mono-500">Filter, sort, and export. Click any row for order details.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={expCSV} disabled={items.length===0} className="inline-flex items-center gap-2 rounded-full border border-mono-200 bg-surface px-4 py-2.5 text-sm font-semibold text-mono-700 transition hover:border-mono-900 hover:text-mono-900 disabled:opacity-50"><Download className="h-4 w-4" />Export CSV</button>
        <button type="button" onClick={onNavigateCatalog} className="inline-flex items-center gap-2 rounded-full bg-mono-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mono-800"><Boxes className="h-4 w-4" />Catalog</button>
      </div>
    </div>
    {/* Stat cards */}      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4"><div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Orders</span></div><p className="mt-2 text-2xl font-bold text-mono-900">{tO}</p></div>
        <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4"><div className="flex items-center gap-2"><Boxes className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Units sold</span></div><p className="mt-2 text-2xl font-bold text-mono-900">{tU.toLocaleString()}</p></div>
        <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Revenue</span></div><p className="mt-2 text-2xl font-bold text-mono-900">{fmt$(tR)}</p></div>
        <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Avg order</span></div><p className="mt-2 text-2xl font-bold text-mono-900">{fmt$(aO)}</p></div>
        <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4"><div className="flex items-center gap-2"><Percent className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Deductions</span></div><p className="mt-2 text-2xl font-bold text-mono-900">{fmt$(tD)}</p></div>
        <div className="rounded-[1.4rem] border border-mono-200 bg-mono-50 px-4 py-4"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Net income</span></div><p className="mt-2 text-2xl font-bold text-emerald-600">{fmt$(netTotal)}</p></div>
      </div>
    {/* Filter toggle */}
    <button type="button" onClick={()=>setSf(s=>!s)} className="mt-5 inline-flex items-center gap-2 rounded-full border border-mono-200 px-4 py-2 text-sm font-medium text-mono-600 transition hover:border-mono-900 hover:text-mono-900 focus-visible:outline-2 focus-visible:outline-mono-900" aria-expanded={sf}>
      <Search className="h-4 w-4" />{sf?"Hide filters":"Show filters"}
      {hf&&<span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-mono-900 text-[10px] font-bold text-white">{activeFilterCount}</span>}
    </button>
    {/* Filter panel */}
    {sf&&<div className="mt-4 space-y-4 rounded-[1.75rem] border border-mono-200 bg-mono-50 p-5" role="search" aria-label="Filters">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Date from</span>
          <input type="date" value={df} onChange={(e:ChangeEvent<HTMLInputElement>)=>{setDf(e.target.value);setPg(1);}} className={cn(fc)} aria-label="From" /></label>
        <label className="space-y-1"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Date to</span>
          <input type="date" value={dt} onChange={(e:ChangeEvent<HTMLInputElement>)=>{setDt(e.target.value);setPg(1);}} className={cn(fc)} aria-label="To" /></label>
        <label className="space-y-1"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Price min</span>
          <input type="number" min="0" step="0.01" value={pmin} onChange={(e:ChangeEvent<HTMLInputElement>)=>{setPmin(e.target.value);setPg(1);}} placeholder="0" className={cn(fc)} /></label>
        <label className="space-y-1"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Price max</span>
          <input type="number" min="0" step="0.01" value={pmax} onChange={(e:ChangeEvent<HTMLInputElement>)=>{setPmax(e.target.value);setPg(1);}} placeholder="999" className={cn(fc)} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Qty min</span>
          <input type="number" min="0" value={qmin} onChange={(e:ChangeEvent<HTMLInputElement>)=>{setQmin(e.target.value);setPg(1);}} placeholder="1" className={cn(fc)} /></label>
        <label className="space-y-1"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Qty max</span>
          <input type="number" min="0" value={qmax} onChange={(e:ChangeEvent<HTMLInputElement>)=>{setQmax(e.target.value);setPg(1);}} placeholder="100" className={cn(fc)} /></label>
        <label className="space-y-1"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Search</span>
          <div className="relative mt-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400" />
          <input value={qq} onChange={(e:ChangeEvent<HTMLInputElement>)=>{setQq(e.target.value);setPg(1);}} placeholder="Order, customer, item..." className="w-full rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface py-2.5 pl-10 pr-3 text-sm text-mono-900 outline-none transition focus:border-mono-900" /></div></label>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-mono-500">{items.length} of {initialReportItems.length} match</p>
        {hf&&<button type="button" onClick={clr} className="inline-flex items-center gap-1 rounded-full border border-mono-200 bg-surface px-3 py-1.5 text-xs font-semibold text-mono-600 hover:border-mono-900 hover:text-mono-900"><X className="h-3 w-3" />Clear</button>}
      </div>
    </div>}
    {/* Weekly/Monthly/Top */}
    {(weeks.length>0||months.length>0||topP.length>0||topC.length>0||catBr.length>0)&&<div className="mt-5 grid gap-5 lg:grid-cols-2">
      {weeks.length>0&&<div className="rounded-[1.4rem] border border-mono-200 p-4">
        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Weekly</span></div>
        <div className="mt-3 max-h-52 space-y-1.5 overflow-y-auto">{weeks.map(w=><div key={w.k} className="flex items-center justify-between rounded-lg bg-mono-50 px-3 py-2 text-xs">
          <span className="font-medium text-mono-900">{w.k.replace("-W"," W")}</span>
          <span className="flex gap-2 text-mono-600"><span>{w.orders} orders</span><span>{w.units} units</span><span className="font-semibold text-mono-900">{fmt$(w.rev)}</span></span>
        </div>)}</div>
      </div>}
      {months.length>0&&<div className="rounded-[1.4rem] border border-mono-200 p-4">
        <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Monthly</span></div>
        <div className="mt-3 max-h-52 space-y-1.5 overflow-y-auto">{months.map(m=><div key={m.k} className="flex items-center justify-between rounded-lg bg-mono-50 px-3 py-2 text-xs">
          <span className="font-medium text-mono-900">{m.k}</span>
          <span className="flex gap-2 text-mono-600"><span>{m.orders} orders</span><span>{m.units} units</span><span className="font-semibold text-mono-900">{fmt$(m.rev)}</span></span>
        </div>)}</div>
      </div>}
      {topP.length>0&&<div className="rounded-[1.4rem] border border-mono-200 p-4">
        <div className="flex items-center gap-2"><Boxes className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Top products</span></div>
        <div className="mt-3 max-h-52 space-y-1.5 overflow-y-auto">{topP.map(p=><div key={p.id} className="flex items-center justify-between rounded-lg bg-mono-50 px-3 py-2 text-xs">
          <div className="min-w-0 flex-1"><span className="font-medium text-mono-900">{p.name}</span><span className="ml-2 text-mono-500">{p.cat}</span></div>
          <span className="flex shrink-0 gap-2 text-mono-600"><span>{p.units}sold</span><span className="font-semibold text-mono-900">{fmt$(p.rev)}</span></span>
        </div>)}</div>
      </div>}
      {topC.length>0&&<div className="rounded-[1.4rem] border border-mono-200 p-4">
        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Top customers</span></div>
        <div className="mt-3 max-h-52 space-y-1.5 overflow-y-auto">{topC.map(c=><div key={c.email} className="flex items-center justify-between rounded-lg bg-mono-50 px-3 py-2 text-xs">
          <div className="min-w-0 flex-1"><span className="font-medium text-mono-900">{c.name}</span><span className="ml-2 text-mono-500">{c.email}</span></div>
          <span className="flex shrink-0 gap-2 text-mono-600"><span>{c.orders}ord</span><span className="font-semibold text-mono-900">{fmt$(c.rev)}</span></span>
        </div>)}</div>
      </div>}
      {catBr.length>0&&<div className="rounded-[1.4rem] border border-mono-200 p-4 lg:col-span-2">
        <div className="flex items-center gap-2"><Tags className="h-4 w-4 text-mono-400" /><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Income by category</span></div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead><tr className="text-left text-mono-500">
              <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Category</th>
              <th scope="col" className="border-b border-mono-200 px-3 py-2 text-right font-medium">Units</th>
              <th scope="col" className="border-b border-mono-200 px-3 py-2 text-right font-medium">Revenue</th>
              <th scope="col" className="border-b border-mono-200 px-3 py-2 text-right font-medium">Deductions</th>
              <th scope="col" className="border-b border-mono-200 px-3 py-2 text-right font-medium">Net</th>
              <th scope="col" className="border-b border-mono-200 px-3 py-2 text-right font-medium">Margin</th>
            </tr></thead>
            <tbody>{catBr.map(c=>{const margin=c.r>0?((c.n/c.r)*100):0;return(<tr key={c.cat} className="text-mono-700">
              <td className="border-b border-mono-100 px-3 py-2.5 font-semibold text-mono-900">{c.cat}</td>
              <td className="border-b border-mono-100 px-3 py-2.5 text-right">{c.u.toLocaleString()}</td>
              <td className="border-b border-mono-100 px-3 py-2.5 text-right">{fmt$(c.r)}</td>
              <td className="border-b border-mono-100 px-3 py-2.5 text-right text-mono-600">{fmt$(c.d)}</td>
              <td className="border-b border-mono-100 px-3 py-2.5 text-right font-semibold text-emerald-600">{fmt$(c.n)}</td>
              <td className="border-b border-mono-100 px-3 py-2.5 text-right font-medium">{margin.toFixed(1)}%</td>
            </tr>);})}</tbody>
            <tfoot><tr className="text-mono-900">
              <td className="border-t border-mono-300 px-3 py-2.5 text-xs font-bold uppercase tracking-wide">Total</td>
              <td className="border-t border-mono-300 px-3 py-2.5 text-right text-xs font-bold">{catBr.reduce((s,c)=>s+c.u,0).toLocaleString()}</td>
              <td className="border-t border-mono-300 px-3 py-2.5 text-right font-bold">{fmt$(catBr.reduce((s,c)=>s+c.r,0))}</td>
              <td className="border-t border-mono-300 px-3 py-2.5 text-right font-bold text-mono-600">{fmt$(catBr.reduce((s,c)=>s+c.d,0))}</td>
              <td className="border-t border-mono-300 px-3 py-2.5 text-right font-bold text-emerald-600">{fmt$(catBr.reduce((s,c)=>s+c.n,0))}</td>
              <td className="border-t border-mono-300 px-3 py-2.5 text-right font-bold">{(()=>{const tr=catBr.reduce((s,c)=>s+c.r,0);return tr>0?((catBr.reduce((s,c)=>s+c.n,0)/tr)*100).toFixed(1)+"%":"0%";})()}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>}
    </div>}
    {/* Sort */}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-mono-500">Showing <span className="font-semibold text-mono-900">{fN}-{tN}</span> of <span className="font-semibold text-mono-900">{items.length}</span></p>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Sort</span>
        <select value={sb} onChange={(e)=>{setSb(e.target.value);setPg(1);}} className={cn(fc,"w-auto py-1.5 text-xs")} aria-label="Sort">
          <option value="date-desc">Newest</option><option value="date-asc">Oldest</option>
          <option value="qty-desc">Most qty</option><option value="qty-asc">Least qty</option>
          <option value="unitPrice-desc">Price high</option><option value="unitPrice-asc">Price low</option>
          <option value="lineTotal-desc">Total high</option><option value="lineTotal-asc">Total low</option>
          <option value="deduction-desc">Deduction high</option><option value="deduction-asc">Deduction low</option>
          <option value="net-desc">Net income high</option><option value="net-asc">Net income low</option>
          <option value="remainingStock-desc">Stock high</option><option value="remainingStock-asc">Stock low</option>
        </select>
      </div>
    </div>
    {/* Table */}
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left text-mono-500">
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Date</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Order</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Customer</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Item</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Qty</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Price</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Total</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Deduct</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Net</th>
            <th scope="col" className="border-b border-mono-200 px-3 py-3 font-medium">Stock</th>
          </tr>
        </thead>
        <tbody>
          {pi.length===0?<tr><td colSpan={10} className="px-3 py-10 text-center text-sm text-mono-500">{initialReportItems.length===0?"No purchases yet.":"No matches."}</td></tr>:
            pi.map(item=>{const ded=calcDeduction(item);const net=calcNet(item);return(<tr key={item.orderId+"-"+item.productId} className="cursor-pointer text-mono-700 transition hover:bg-mono-50 focus-visible:outline-2 focus-visible:outline-mono-900"
              onClick={()=>showD(item)} tabIndex={0} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();showD(item);}}} role="button" aria-label={"View order "+item.orderNumber}>
              <td className="border-b border-mono-100 px-3 py-4 text-xs text-mono-500">{fmtTS(item.createdAt)}</td>
              <td className="border-b border-mono-100 px-3 py-4"><div className="font-semibold text-mono-900">{item.orderNumber}</div><div className="font-mono text-[11px] text-mono-500">{item.orderId.slice(0,8)}</div></td>
              <td className="border-b border-mono-100 px-3 py-4"><div className="font-semibold text-mono-900">{item.customerName}</div><div className="text-xs text-mono-500">{item.customerEmail}</div></td>
              <td className="border-b border-mono-100 px-3 py-4"><div className="font-semibold text-mono-900">{item.productName}</div><div className="text-xs text-mono-500">{item.category}</div></td>
              <td className="border-b border-mono-100 px-3 py-4 font-semibold text-mono-900">{item.quantity}</td>
              <td className="border-b border-mono-100 px-3 py-4">{fmt$(item.unitPrice)}</td>
              <td className="border-b border-mono-100 px-3 py-4 font-semibold text-mono-900">{fmt$(item.lineTotal)}</td>
              <td className="border-b border-mono-100 px-3 py-4 text-mono-600">{fmt$(ded)}</td>
              <td className="border-b border-mono-100 px-3 py-4 font-semibold text-emerald-600">{fmt$(net)}</td>
              <td className="border-b border-mono-100 px-3 py-4">{fmtSC(item.remainingStock)}</td>
            </tr>);})
          }
        </tbody>
      </table>
    </div>
    {/* Pagination */}
    {tp>1&&<div className="mt-5 flex items-center justify-between" role="navigation" aria-label="Pagination">
      <p className="text-xs text-mono-500">Page {sp} of {tp}</p>
      <div className="flex gap-2">
        <button type="button" onClick={()=>setPg(Math.max(1,sp-1))} disabled={sp<=1} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-mono-200 bg-surface text-mono-600 hover:border-mono-900 hover:text-mono-900 disabled:opacity-40" aria-label="Prev"><ChevronLeft className="h-4 w-4" /></button>
        {Array.from({length:Math.min(5,tp)},(_,i)=>{const s=Math.max(1,Math.min(sp-2,tp-4));const n=s+i;if(n>tp)return null;return<button key={n} type="button" onClick={()=>setPg(n)} className={"inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition "+(n===sp?"bg-mono-900 text-white":"border border-mono-200 bg-surface text-mono-600 hover:border-mono-900 hover:text-mono-900")} aria-label={"Page "+n} aria-current={n===sp?"page":undefined}>{n}</button>;})}
        <button type="button" onClick={()=>setPg(Math.min(tp,sp+1))} disabled={sp>=tp} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-mono-200 bg-surface text-mono-600 hover:border-mono-900 hover:text-mono-900 disabled:opacity-40" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>}
    <p className="mt-4 text-xs text-mono-500">Click row for order details.</p>
  </section>
  {/* Detail overlay */}
  {det&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={()=>setDet(null)} role="dialog" aria-modal="true" aria-label={"Order "+det.orderNumber}>
    <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-mono-200 bg-surface p-6 shadow-xl" onClick={(e)=>e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="text-lg font-bold text-mono-900">Order {det.orderNumber}</h3><p className="mt-1 text-sm text-mono-500">{fmtTS(det.createdAt)}</p></div>
        <button type="button" onClick={()=>setDet(null)} className="flex h-8 w-8 items-center justify-center rounded-full border border-mono-200 bg-surface text-mono-500 hover:border-mono-900 hover:text-mono-900" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 rounded-[1.4rem] border border-mono-200 bg-mono-50 p-4">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-mono-500">Customer</span>
        <p className="mt-1 text-sm font-semibold text-mono-900">{det.customerName}</p>
        <p className="text-sm text-mono-600">{det.customerEmail}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[1rem] border border-mono-200 bg-mono-50 p-3 text-center"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Items</span><p className="mt-1 text-lg font-bold text-mono-900">{det.items.length}</p></div>
        <div className="rounded-[1rem] border border-mono-200 bg-mono-50 p-3 text-center"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Units</span><p className="mt-1 text-lg font-bold text-mono-900">{det.totalUnits}</p></div>
        <div className="rounded-[1rem] border border-mono-200 bg-mono-50 p-3 text-center"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mono-500">Revenue</span><p className="mt-1 text-lg font-bold text-mono-900">{fmt$(det.totalRevenue)}</p></div>
      </div>
      <table className="mt-4 min-w-full border-separate border-spacing-0 text-sm">
        <thead><tr className="text-left text-mono-500">
          <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Product</th>
          <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Category</th>
          <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Qty</th>
          <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Price</th>
          <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Total</th>
          <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Deduct</th>
          <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Net</th>
          <th scope="col" className="border-b border-mono-200 px-3 py-2 font-medium">Stock</th>
        </tr></thead>
        <tbody>{det.items.map(item=>{const ded=calcDeduction(item);const net=calcNet(item);return(<tr key={item.productId} className="text-mono-700">
          <td className="border-b border-mono-100 px-3 py-2.5 font-semibold text-mono-900">{item.productName}</td>
          <td className="border-b border-mono-100 px-3 py-2.5 text-mono-600">{item.category}</td>
          <td className="border-b border-mono-100 px-3 py-2.5">{item.quantity}</td>
          <td className="border-b border-mono-100 px-3 py-2.5">{fmt$(item.unitPrice)}</td>
          <td className="border-b border-mono-100 px-3 py-2.5 font-semibold text-mono-900">{fmt$(item.lineTotal)}</td>
          <td className="border-b border-mono-100 px-3 py-2.5 text-mono-600">{fmt$(ded)}</td>
          <td className="border-b border-mono-100 px-3 py-2.5 font-semibold text-emerald-600">{fmt$(net)}</td>
          <td className="border-b border-mono-100 px-3 py-2.5">{fmtSC(item.remainingStock)}</td>
        </tr>);})}</tbody>
      </table>
      <button type="button" onClick={()=>setDet(null)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-mono-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-mono-800">Close</button>
    </div>
  </div>}
</>)}
