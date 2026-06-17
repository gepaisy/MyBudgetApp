import { useState, useMemo } from "react";

// ════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════
const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو",
                 "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

const CATEGORIES = {
  income: [
    { id: "salary",     label: "راتب",       icon: "💼" },
    { id: "housing_sup",label: "دعم سكني",   icon: "🏡" },
    { id: "bonus",      label: "علاوة",       icon: "🎯" },
    { id: "freelance",  label: "عمل حر",      icon: "💻" },
    { id: "other_in",   label: "أخرى",        icon: "➕" },
  ],
  expense: [
    { id: "food",       label: "طعام",        icon: "🍽️" },
    { id: "transport",  label: "مواصلات",     icon: "🚗" },
    { id: "housing",    label: "سكن",         icon: "🏠" },
    { id: "health",     label: "صحة",         icon: "🏥" },
    { id: "education",  label: "تعليم",       icon: "📚" },
    { id: "clothes",    label: "ملابس",       icon: "👗" },
    { id: "loans",      label: "أقساط",       icon: "🏦" },
    { id: "fixed",      label: "ثابتة",       icon: "📌" },
    { id: "other_out",  label: "أخرى",        icon: "➖" },
  ],
};

// ════════════════════════════════════════════════
//  LOANS (أقساط البنوك)
// ════════════════════════════════════════════════
const LOANS_DATA = [
  // الراجحي — حتى يوليو 2026
  { id:"r1", lender:"الراجحي", name:"قرض الراجحي #1", amount:6148,   startYM:[2026,5], endYM:[2026,6] },
  { id:"r2", lender:"الراجحي", name:"قرض الراجحي #2", amount:4562,   startYM:[2026,5], endYM:[2026,6] },
  { id:"r3", lender:"الراجحي", name:"قرض الراجحي #3", amount:54,     startYM:[2026,5], endYM:[2026,6] },
  { id:"r4", lender:"الراجحي", name:"قرض الراجحي #4", amount:39,     startYM:[2026,5], endYM:[2026,6] },
  // الراجحي — من أغسطس 2026
  { id:"r5", lender:"الراجحي", name:"قرض الراجحي #5", amount:8768,   startYM:[2026,7], endYM:[2041,11] },
  { id:"r6", lender:"الراجحي", name:"قرض الراجحي #6", amount:405,    startYM:[2026,7], endYM:[2028,1]  },
  { id:"r7", lender:"الراجحي", name:"قرض الراجحي #7", amount:1487,   startYM:[2026,7], endYM:[2028,1]  },
  // الراجحي — يناير→يونيو 2028
  { id:"r8", lender:"الراجحي", name:"قرض الراجحي #8", amount:953,    startYM:[2028,0], endYM:[2028,5]  },
  // إمكان
  { id:"i1", lender:"إمكان",   name:"قرض إمكان #1",   amount:149.84, startYM:[2026,5], endYM:[2029,4]  },
  { id:"i2", lender:"إمكان",   name:"قرض إمكان #2",   amount:378.55, startYM:[2026,5], endYM:[2030,10] },
  // سيارة
  { id:"c1", lender:"أخرى",    name:"قسط السيارة",    amount:945,    startYM:[2026,5], endYM:[2027,3]  },
  // PC الأولاد
  { id:"p1", lender:"أخرى",    name:"قسط PC الأولاد", amount:345,    startYM:[2026,5], endYM:[2026,10] },
];

// ════════════════════════════════════════════════
//  FIXED MONTHLY OBLIGATIONS (ثابتة غير قروض)
// ════════════════════════════════════════════════
const FIXED_BILLS = [
  { id:"fb1",  category:"اتصالات", name:"فاتورة الإنترنت",    icon:"🌐", amount:402   },
  { id:"fb2",  category:"اتصالات", name:"فاتورة جوالي",        icon:"📱", amount:517   },
  { id:"fb3",  category:"اتصالات", name:"جوال أم محمد",        icon:"📱", amount:46    },
  { id:"fb4",  category:"بث رقمي", name:"Amazon Prime",        icon:"📦", amount:16    },
  { id:"fb5",  category:"بث رقمي", name:"Disney+",             icon:"🎬", amount:35    },
  { id:"fb6",  category:"بث رقمي", name:"Bein Sport",          icon:"⚽", amount:90    },
  { id:"fb7",  category:"بث رقمي", name:"YouTube Premium",     icon:"▶️", amount:24    },
  { id:"fb8",  category:"بث رقمي", name:"شاهد",                icon:"📺", amount:69    },
  { id:"fb9",  category:"منزل",    name:"فاتورة الكهرباء",     icon:"⚡", amount:652   },
  { id:"fb10", category:"منزل",    name:"فاتورة المياه",       icon:"💧", amount:132   },
  { id:"fb11", category:"منزل",    name:"راتب العامل",         icon:"🧹", amount:200   },
  { id:"fb12", category:"أسرة",    name:"جمعية أم محمد",       icon:"👩‍👧", amount:1400  },
];

// ════════════════════════════════════════════════
//  INCOME (دخل ثابت)
// ════════════════════════════════════════════════
const MONTHLY_SALARY    = 20737.5;
const MONTHLY_HOUSING   = 1187;
const ANNUAL_BONUS      = 640; // يضاف في يناير كل سنة

// ════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════
const ymToDate  = (y,m) => new Date(y,m,1);
const fmtNum    = n => Number(n).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2});
const today     = new Date();

function activeLoans(y,m) {
  return LOANS_DATA.filter(l => {
    const cur = ymToDate(y,m);
    return cur >= ymToDate(l.startYM[0],l.startYM[1]) && cur <= ymToDate(l.endYM[0],l.endYM[1]);
  });
}
function totalLoans(y,m)  { return activeLoans(y,m).reduce((s,l)=>s+l.amount,0); }
function totalFixed()      { return FIXED_BILLS.reduce((s,b)=>s+b.amount,0); }
function monthsLeft(endYM){
  const end = ymToDate(endYM[0],endYM[1]);
  if(end<today) return 0;
  return (end.getFullYear()-today.getFullYear())*12+(end.getMonth()-today.getMonth());
}
function remainingTotal(loan){ return monthsLeft(loan.endYM)*loan.amount; }

// الدخل الثابت لأي شهر
function fixedIncome(y,m){
  let total = MONTHLY_SALARY + MONTHLY_HOUSING;
  if(m===0) total += ANNUAL_BONUS; // يناير
  return total;
}

// ════════════════════════════════════════════════
//  LOAN TIMELINE COMPONENT
// ════════════════════════════════════════════════
function LoanTimeline({loan}){
  const start  = ymToDate(loan.startYM[0],loan.startYM[1]);
  const end    = ymToDate(loan.endYM[0],loan.endYM[1]);
  const totalMs= end-start;
  const pct    = totalMs>0 ? Math.max(0,Math.min(100,((today-start)/totalMs)*100)) : 100;
  const ml     = monthsLeft(loan.endYM);
  const isOver = end<today;
  const color  = isOver?"#5a5a7a":pct>80?"#4ade80":pct>50?"#60a5fa":"#fbbf24";
  return (
    <div style={{marginTop:8}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#7c7ca8",marginBottom:4}}>
        <span>{MONTHS[loan.startYM[1]]} {loan.startYM[0]}</span>
        <span style={{color:isOver?"#5a5a7a":"#c8c8e8"}}>{isOver?"منتهي ✓":`${ml} شهر متبقي`}</span>
        <span>{MONTHS[loan.endYM[1]]} {loan.endYM[0]}</span>
      </div>
      <div style={{background:"rgba(255,255,255,0.08)",borderRadius:6,height:6}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:6,transition:"width 0.5s"}}/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════
export default function BudgetApp(){
  const [transactions, setTransactions] = useState([]);
  const [form, setForm]   = useState({type:"expense",category:"food",amount:"",note:"",date:today.toISOString().split("T")[0]});
  const [view, setView]   = useState("dashboard");
  const [filterMonth, setFilterMonth] = useState(today.getMonth());
  const [filterYear,  setFilterYear]  = useState(today.getFullYear());
  const [loanFilter,  setLoanFilter]  = useState("all");
  const [billFilter,  setBillFilter]  = useState("all");
  const [toast, setToast] = useState(null);
  const [expandFixed, setExpandFixed] = useState(false);
  const [activeTab, setActiveTab] = useState("loans"); // loans | fixed  (in obligations view)

  const showToast = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),2600); };

  // ── Filtered manual transactions ──
  const filtered = useMemo(()=>transactions.filter(t=>{
    const d=new Date(t.date);
    return d.getMonth()===filterMonth && d.getFullYear()===filterYear;
  }),[transactions,filterMonth,filterYear]);

  // ── Fixed income for selected month ──
  const autoIncome   = fixedIncome(filterYear,filterMonth);
  const manualIncome = useMemo(()=>filtered.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),[filtered]);
  const totalIncome  = autoIncome + manualIncome;

  // ── Expenses ──
  const monthLoans   = useMemo(()=>totalLoans(filterYear,filterMonth),[filterYear,filterMonth]);
  const monthFixed   = totalFixed();
  const manualExp    = useMemo(()=>filtered.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),[filtered]);
  const totalExpense = monthLoans + monthFixed + manualExp;
  const net          = totalIncome - totalExpense;
  const savingsRate  = totalIncome>0?((net/totalIncome)*100).toFixed(1):0;

  // ── Active loans this month ──
  const currentLoans = useMemo(()=>activeLoans(filterYear,filterMonth),[filterYear,filterMonth]);
  const grandRemaining = useMemo(()=>LOANS_DATA.reduce((s,l)=>s+remainingTotal(l),0),[]);

  // ── Add / delete transactions ──
  const addTransaction = ()=>{
    if(!form.amount||isNaN(form.amount)||Number(form.amount)<=0){showToast("أدخل مبلغاً صحيحاً","error");return;}
    setTransactions(p=>[{...form,id:Date.now(),amount:parseFloat(form.amount)},...p]);
    setForm({type:"expense",category:"food",amount:"",note:"",date:today.toISOString().split("T")[0]});
    showToast("تمت الإضافة ✓");
    setView("dashboard");
  };
  const delTx = id=>{ setTransactions(p=>p.filter(x=>x.id!==id)); showToast("تم الحذف"); };

  const getCat = (type,id)=>CATEGORIES[type]?.find(c=>c.id===id)||{label:id,icon:"•"};

  // ── Displayed loans (filtered) ──
  const displayedLoans = useMemo(()=>{
    const nowY=today.getFullYear(),nowM=today.getMonth();
    return LOANS_DATA.filter(l=>{
      if(loanFilter==="rajhi") return l.lender==="الراجحي";
      if(loanFilter==="imkan") return l.lender==="إمكان";
      if(loanFilter==="other") return l.lender==="أخرى";
      if(loanFilter==="active") return activeLoans(nowY,nowM).some(a=>a.id===l.id);
      return true;
    });
  },[loanFilter]);

  // ── Displayed fixed bills ──
  const displayedBills = useMemo(()=>{
    if(billFilter==="all") return FIXED_BILLS;
    return FIXED_BILLS.filter(b=>b.category===billFilter);
  },[billFilter]);

  const billCategories = [...new Set(FIXED_BILLS.map(b=>b.category))];

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════
  return (
    <div dir="rtl" style={{fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif",background:"#0d0d1a",minHeight:"100vh",color:"#e8e8f0",position:"relative",paddingBottom:110}}>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:toast.type==="error"?"#991b1b":"#14532d",color:"#fff",padding:"10px 26px",borderRadius:30,zIndex:999,fontWeight:700,fontSize:13,boxShadow:"0 4px 24px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>{toast.msg}</div>}

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(135deg,#12122a 0%,#1a1f3a 55%,#0e2a52 100%)",padding:"18px 18px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:10,color:"#6060a0",letterSpacing:2,marginBottom:2}}>الميزانية الشخصية</div>
            <div style={{fontSize:21,fontWeight:800,letterSpacing:-0.5}}>ميزانيتي <span style={{fontSize:16}}>💰</span></div>
          </div>
          {/* Income Badge */}
          <div style={{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:14,padding:"9px 14px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#6060a0",marginBottom:2}}>الدخل الشهري</div>
            <div style={{fontSize:15,fontWeight:800,color:"#4ade80"}}>{fmtNum(MONTHLY_SALARY)}</div>
            <div style={{fontSize:9,color:"#6060a0"}}>+ {fmtNum(MONTHLY_HOUSING)} دعم سكني</div>
          </div>
        </div>

        {/* Month Nav */}
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14}}>
          <button onClick={()=>{let m=filterMonth-1,y=filterYear;if(m<0){m=11;y--;}setFilterMonth(m);setFilterYear(y);}} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#aaa",borderRadius:8,padding:"5px 11px",cursor:"pointer",fontSize:16}}>‹</button>
          <div style={{flex:1,textAlign:"center",fontWeight:700,fontSize:14,color:"#c8c8e8"}}>{MONTHS[filterMonth]} {filterYear}</div>
          <button onClick={()=>{let m=filterMonth+1,y=filterYear;if(m>11){m=0;y++;}setFilterMonth(m);setFilterYear(y);}} style={{background:"rgba(255,255,255,0.07)",border:"none",color:"#aaa",borderRadius:8,padding:"5px 11px",cursor:"pointer",fontSize:16}}>›</button>
        </div>

        {/* Nav Tabs */}
        <div style={{display:"flex",gap:1}}>
          {[["dashboard","الرئيسية","📊"],["obligations","الالتزامات","📌"],["transactions","المعاملات","📋"],["forecast","التوقعات","🔮"]].map(([v,l,ic])=>(
            <button key={v} onClick={()=>setView(v)} style={{flex:1,background:view===v?"rgba(74,144,226,0.18)":"transparent",border:"none",borderBottom:view===v?"2px solid #4a90e2":"2px solid transparent",color:view===v?"#4a90e2":"#6060a0",padding:"8px 2px",cursor:"pointer",fontSize:10,fontWeight:view===v?700:400,borderRadius:"5px 5px 0 0",transition:"all 0.2s"}}>
              {ic}<br/>{l}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:16,maxWidth:640,margin:"0 auto"}}>

        {/* ══ DASHBOARD ══ */}
        {view==="dashboard"&&(
          <div>
            {/* Top 3 cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {label:"الدخل الكلي",  value:totalIncome,          color:"#4ade80",icon:"⬆️"},
                {label:"المصروفات",    value:totalExpense,         color:"#f87171",icon:"⬇️"},
                {label:"الصافي",       value:net,                  color:net>=0?"#60a5fa":"#f87171",icon:net>=0?"✅":"⚠️"},
              ].map(c=>(
                <div key={c.label} style={{background:"rgba(255,255,255,0.05)",borderRadius:14,padding:"13px 8px",border:`1px solid ${c.color}22`,textAlign:"center"}}>
                  <div style={{fontSize:15,marginBottom:3}}>{c.icon}</div>
                  <div style={{fontSize:9,color:"#6060a0",marginBottom:2}}>{c.label}</div>
                  <div style={{fontSize:11,fontWeight:800,color:c.color}}>{fmtNum(c.value)}</div>
                  <div style={{fontSize:8,color:"#5a5a7a"}}>ر.س</div>
                </div>
              ))}
            </div>

            {/* Expense Breakdown */}
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:15,padding:15,marginBottom:14,border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#c8c8e8",marginBottom:12}}>📊 تفصيل المصروفات الشهرية</div>
              {[
                {label:"أقساط البنوك",    value:monthLoans,  color:"#f87171",  icon:"🏦"},
                {label:"الالتزامات الثابتة",value:monthFixed, color:"#fbbf24",  icon:"📌"},
                {label:"مصروفات متغيرة",  value:manualExp,   color:"#60a5fa",  icon:"🧾"},
              ].map(row=>{
                const pct=totalExpense>0?(row.value/totalExpense*100).toFixed(0):0;
                return(
                  <div key={row.label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,color:"#c8c8e8"}}>{row.icon} {row.label}</span>
                      <span style={{fontSize:12,fontWeight:700,color:row.color}}>{fmtNum(row.value)} <span style={{color:"#5a5a7a",fontWeight:400}}>({pct}%)</span></span>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.07)",borderRadius:5,height:5}}>
                      <div style={{height:"100%",width:`${pct}%`,background:row.color,borderRadius:5,transition:"width 0.5s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Savings Meter */}
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:15,padding:15,marginBottom:14,border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:700,color:"#c8c8e8"}}>💰 معدل الادخار</span>
                <span style={{fontSize:17,fontWeight:800,color:savingsRate>=20?"#4ade80":savingsRate>=10?"#fbbf24":"#f87171"}}>{savingsRate}%</span>
              </div>
              <div style={{background:"rgba(255,255,255,0.08)",borderRadius:8,height:8,overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",width:`${Math.min(Math.max(savingsRate,0),100)}%`,background:savingsRate>=20?"linear-gradient(90deg,#4ade80,#22d3ee)":savingsRate>=10?"linear-gradient(90deg,#fbbf24,#fb923c)":"linear-gradient(90deg,#f87171,#e11d48)",borderRadius:8,transition:"width 0.6s"}}/>
              </div>
              <div style={{fontSize:10,color:"#5a5a7a"}}>
                {net>=0?`متاح للادخار: ${fmtNum(net)} ر.س`:`عجز: ${fmtNum(Math.abs(net))} ر.س`}
                {Number(savingsRate)>=20?" 🌟 ممتاز!":Number(savingsRate)>=10?" 💪 جيد":Number(savingsRate)>=0?" ⚠️ منخفض":" ❌ عجز"}
              </div>
            </div>

            {/* Income breakdown */}
            <div style={{background:"rgba(74,222,128,0.05)",borderRadius:15,padding:15,marginBottom:14,border:"1px solid rgba(74,222,128,0.15)"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#c8c8e8",marginBottom:10}}>💼 مصادر الدخل — {MONTHS[filterMonth]}</div>
              {[
                {label:"الراتب الشهري",   value:MONTHLY_SALARY,  icon:"💼"},
                {label:"الدعم السكني",    value:MONTHLY_HOUSING, icon:"🏡"},
                ...(filterMonth===0?[{label:"العلاوة السنوية",value:ANNUAL_BONUS,icon:"🎯"}]:[]),
                ...(manualIncome>0?[{label:"إيرادات أخرى",value:manualIncome,icon:"➕"}]:[]),
              ].map(r=>(
                <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:12,color:"#c8c8e8"}}>{r.icon} {r.label}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#4ade80"}}>{fmtNum(r.value)} ر.س</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",marginTop:4}}>
                <span style={{fontSize:13,fontWeight:700,color:"#e8e8f0"}}>الإجمالي</span>
                <span style={{fontSize:14,fontWeight:800,color:"#4ade80"}}>{fmtNum(totalIncome)} ر.س</span>
              </div>
            </div>

            {/* Quick Loans Alert */}
            {currentLoans.length>0&&(
              <div style={{background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:14,padding:13,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>{setView("obligations");setActiveTab("loans");}}>
                <div>
                  <div style={{fontSize:12,color:"#f87171",fontWeight:700,marginBottom:2}}>🏦 أقساط هذا الشهر</div>
                  <div style={{fontSize:10,color:"#7c7ca8"}}>{currentLoans.length} قرض نشط · اضغط للتفاصيل</div>
                </div>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:18,fontWeight:800,color:"#f87171"}}>{fmtNum(monthLoans)}</div>
                  <div style={{fontSize:9,color:"#5a5a7a",textAlign:"center"}}>ر.س</div>
                </div>
              </div>
            )}

            {/* Fixed Bills Quick View */}
            <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:14,padding:13,cursor:"pointer"}} onClick={()=>{setView("obligations");setActiveTab("fixed");}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:12,color:"#fbbf24",fontWeight:700,marginBottom:2}}>📌 الالتزامات الثابتة</div>
                  <div style={{fontSize:10,color:"#7c7ca8"}}>{FIXED_BILLS.length} بند · اضغط للتفاصيل</div>
                </div>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:18,fontWeight:800,color:"#fbbf24"}}>{fmtNum(monthFixed)}</div>
                  <div style={{fontSize:9,color:"#5a5a7a",textAlign:"center"}}>ر.س</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ OBLIGATIONS ══ */}
        {view==="obligations"&&(
          <div>
            {/* Sub-tabs */}
            <div style={{display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:12,padding:3,marginBottom:16,gap:3}}>
              {[["loans","🏦 الأقساط"],["fixed","📌 الثابتة"]].map(([t,l])=>(
                <button key={t} onClick={()=>setActiveTab(t)} style={{flex:1,background:activeTab===t?"rgba(74,144,226,0.25)":"transparent",border:activeTab===t?"1px solid #4a90e2":"1px solid transparent",borderRadius:9,padding:"9px 4px",color:activeTab===t?"#4a90e2":"#7c7ca8",cursor:"pointer",fontSize:13,fontWeight:activeTab===t?700:400,transition:"all 0.2s"}}>
                  {l}
                </button>
              ))}
            </div>

            {/* ─ LOANS TAB ─ */}
            {activeTab==="loans"&&(
              <div>
                {/* Summary */}
                <div style={{background:"linear-gradient(135deg,rgba(248,113,113,0.12),rgba(124,58,237,0.12))",border:"1px solid rgba(248,113,113,0.2)",borderRadius:16,padding:15,marginBottom:16}}>
                  <div style={{fontSize:11,color:"#f87171",fontWeight:700,letterSpacing:1,marginBottom:10}}>📊 ملخص الأقساط</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[
                      {label:"أقساط الشهر المختار",value:fmtNum(monthLoans),  sub:`${currentLoans.length} قرض نشط`,color:"#f87171"},
                      {label:"إجمالي المتبقي كله",  value:fmtNum(grandRemaining),sub:"كامل العمر",color:"#fbbf24"},
                    ].map(c=>(
                      <div key={c.label} style={{background:"rgba(0,0,0,0.25)",borderRadius:12,padding:12,textAlign:"center"}}>
                        <div style={{fontSize:9,color:"#7c7ca8",marginBottom:4}}>{c.label}</div>
                        <div style={{fontSize:16,fontWeight:800,color:c.color}}>{c.value}</div>
                        <div style={{fontSize:9,color:"#5a5a7a"}}>{c.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filter */}
                <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                  {[["all","الكل","🔍"],["active","النشطة","✅"],["rajhi","الراجحي","🏛️"],["imkan","إمكان","🏢"],["other","أخرى","🚗"]].map(([f,l,ic])=>(
                    <button key={f} onClick={()=>setLoanFilter(f)} style={{background:loanFilter===f?"rgba(74,144,226,0.25)":"rgba(255,255,255,0.06)",border:loanFilter===f?"1px solid #4a90e2":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 13px",color:loanFilter===f?"#4a90e2":"#7c7ca8",cursor:"pointer",fontSize:11,fontWeight:loanFilter===f?700:400}}>
                      {ic} {l}
                    </button>
                  ))}
                </div>

                {displayedLoans.map(loan=>{
                  const nowY=today.getFullYear(),nowM=today.getMonth();
                  const isActive=activeLoans(nowY,nowM).some(a=>a.id===loan.id);
                  const isEnded=ymToDate(loan.endYM[0],loan.endYM[1])<today;
                  const ml=monthsLeft(loan.endYM);
                  const rem=remainingTotal(loan);
                  const lColor=loan.lender==="الراجحي"?"#60a5fa":loan.lender==="إمكان"?"#a78bfa":"#34d399";
                  return(
                    <div key={loan.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:14,marginBottom:11,border:`1px solid ${isActive?"rgba(74,144,226,0.28)":isEnded?"rgba(80,80,100,0.3)":"rgba(255,255,255,0.07)"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                          <span style={{fontSize:10,background:`${lColor}20`,color:lColor,borderRadius:20,padding:"2px 10px",fontWeight:700}}>{loan.lender}</span>
                          {isActive&&<span style={{fontSize:9,background:"rgba(74,222,128,0.12)",color:"#4ade80",borderRadius:20,padding:"2px 8px",fontWeight:600}}>✓ نشط</span>}
                          {isEnded &&<span style={{fontSize:9,background:"rgba(80,80,100,0.2)",color:"#5a5a7a",borderRadius:20,padding:"2px 8px"}}>منتهي</span>}
                        </div>
                        <div style={{textAlign:"left"}}>
                          <div style={{fontSize:18,fontWeight:800,color:isEnded?"#5a5a7a":"#f87171"}}>{fmtNum(loan.amount)}</div>
                          <div style={{fontSize:9,color:"#5a5a7a",textAlign:"center"}}>ر.س/شهر</div>
                        </div>
                      </div>
                      <div style={{fontSize:13,color:"#c8c8e8",fontWeight:600,marginBottom:8}}>{loan.name}</div>
                      <LoanTimeline loan={loan}/>
                      {!isEnded&&(
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
                          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"7px 10px",textAlign:"center"}}>
                            <div style={{fontSize:9,color:"#7c7ca8",marginBottom:2}}>أشهر متبقية</div>
                            <div style={{fontSize:15,fontWeight:700,color:"#60a5fa"}}>{ml}</div>
                          </div>
                          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"7px 10px",textAlign:"center"}}>
                            <div style={{fontSize:9,color:"#7c7ca8",marginBottom:2}}>متبقي إجمالي</div>
                            <div style={{fontSize:12,fontWeight:700,color:"#fbbf24"}}>{fmtNum(rem)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 6-month schedule */}
                <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:14,marginTop:4,border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#c8c8e8",marginBottom:12}}>📅 جدول الأقساط (6 أشهر)</div>
                  {Array.from({length:6}).map((_,i)=>{
                    const d=new Date(today.getFullYear(),today.getMonth()+i,1);
                    const y=d.getFullYear(),m=d.getMonth();
                    const lns=activeLoans(y,m);
                    const tot=lns.reduce((s,l)=>s+l.amount,0);
                    return(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                        <div>
                          <div style={{fontSize:12,color:"#c8c8e8",fontWeight:i===0?700:400}}>{MONTHS[m]} {y}{i===0?" ← الآن":""}</div>
                          <div style={{fontSize:10,color:"#5a5a7a"}}>{lns.length} قرض نشط</div>
                        </div>
                        <div style={{textAlign:"left"}}>
                          <div style={{fontSize:14,fontWeight:700,color:tot>10000?"#f87171":tot>5000?"#fbbf24":"#4ade80"}}>{fmtNum(tot)}</div>
                          <div style={{fontSize:9,color:"#5a5a7a"}}>ر.س</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─ FIXED BILLS TAB ─ */}
            {activeTab==="fixed"&&(
              <div>
                {/* Total banner */}
                <div style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:16,padding:14,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:11,color:"#fbbf24",fontWeight:700}}>📌 إجمالي الالتزامات الثابتة</div>
                    <div style={{fontSize:10,color:"#7c7ca8",marginTop:2}}>{FIXED_BILLS.length} بند شهري ثابت</div>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:22,fontWeight:800,color:"#fbbf24"}}>{fmtNum(monthFixed)}</div>
                    <div style={{fontSize:9,color:"#5a5a7a"}}>ر.س / شهر</div>
                  </div>
                </div>

                {/* Category filter */}
                <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                  {[["all","الكل"],...billCategories.map(c=>[c,c])].map(([f,l])=>(
                    <button key={f} onClick={()=>setBillFilter(f)} style={{background:billFilter===f?"rgba(251,191,36,0.2)":"rgba(255,255,255,0.06)",border:billFilter===f?"1px solid #fbbf24":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 13px",color:billFilter===f?"#fbbf24":"#7c7ca8",cursor:"pointer",fontSize:11,fontWeight:billFilter===f?700:400}}>
                      {l}
                    </button>
                  ))}
                </div>

                {/* Bills list */}
                {displayedBills.map(b=>(
                  <div key={b.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:13,padding:"12px 14px",marginBottom:9,border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:38,height:38,borderRadius:12,background:"rgba(251,191,36,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{b.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:"#e8e8f0",fontWeight:600}}>{b.name}</div>
                      <div style={{fontSize:10,color:"#6060a0"}}>{b.category}</div>
                    </div>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:15,fontWeight:800,color:"#fbbf24"}}>{fmtNum(b.amount)}</div>
                      <div style={{fontSize:9,color:"#5a5a7a"}}>ر.س</div>
                    </div>
                  </div>
                ))}

                {/* Category totals */}
                <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:14,marginTop:8,border:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#c8c8e8",marginBottom:10}}>📊 الإجمالي حسب الفئة</div>
                  {billCategories.map(cat=>{
                    const total=FIXED_BILLS.filter(b=>b.category===cat).reduce((s,b)=>s+b.amount,0);
                    const pct=monthFixed>0?(total/monthFixed*100).toFixed(0):0;
                    const colors={"اتصالات":"#60a5fa","بث رقمي":"#a78bfa","منزل":"#34d399","أسرة":"#f87171"};
                    const col=colors[cat]||"#fbbf24";
                    return(
                      <div key={cat} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:12,color:"#c8c8e8"}}>{cat}</span>
                          <span style={{fontSize:12,fontWeight:700,color:col}}>{fmtNum(total)} <span style={{color:"#5a5a7a",fontWeight:400}}>({pct}%)</span></span>
                        </div>
                        <div style={{background:"rgba(255,255,255,0.07)",borderRadius:5,height:5}}>
                          <div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:5}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TRANSACTIONS ══ */}
        {view==="transactions"&&(
          <div>
            <div style={{fontSize:13,color:"#6060a0",marginBottom:14}}>{filtered.length} معاملة يدوية — {MONTHS[filterMonth]} {filterYear}</div>
            {filtered.length===0&&(
              <div style={{textAlign:"center",padding:40,color:"#5a5a7a"}}>
                <div style={{fontSize:30,marginBottom:10}}>📭</div>
                <div>لا توجد معاملات يدوية هذا الشهر</div>
                <div style={{fontSize:11,marginTop:6,color:"#4a4a6a"}}>الالتزامات الثابتة والأقساط تُحسب تلقائياً</div>
              </div>
            )}
            {filtered.map(t=>{
              const ci=getCat(t.type,t.category);
              return(
                <div key={t.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:13,padding:13,marginBottom:9,border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:40,height:40,borderRadius:13,background:t.type==="income"?"rgba(74,222,128,0.12)":"rgba(248,113,113,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{ci.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:"#e8e8f0",fontWeight:600}}>{t.note||ci.label}</div>
                    <div style={{fontSize:10,color:"#6060a0"}}>{ci.label} · {t.date}</div>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:14,fontWeight:700,color:t.type==="income"?"#4ade80":"#f87171"}}>{t.type==="income"?"+":"-"}{fmtNum(t.amount)}</div>
                    <div style={{fontSize:9,color:"#5a5a7a",textAlign:"center"}}>ر.س</div>
                  </div>
                  <button onClick={()=>delTx(t.id)} style={{background:"rgba(248,113,113,0.12)",border:"none",color:"#f87171",borderRadius:9,width:30,height:30,cursor:"pointer",fontSize:13,flexShrink:0}}>🗑</button>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ FORECAST ══ */}
        {view==="forecast"&&(
          <div>
            <div style={{fontSize:13,color:"#6060a0",marginBottom:16}}>توقع مالي للأشهر القادمة بناءً على الالتزامات الثابتة</div>

            {/* Annual summary */}
            <div style={{background:"linear-gradient(135deg,rgba(96,165,250,0.1),rgba(167,139,250,0.1))",border:"1px solid rgba(96,165,250,0.2)",borderRadius:16,padding:15,marginBottom:16}}>
              <div style={{fontSize:12,color:"#60a5fa",fontWeight:700,marginBottom:10}}>📅 ملخص سنوي 2026</div>
              {(()=>{
                const startM=today.getMonth(), y=today.getFullYear();
                const months=12-startM;
                const totalInc = months*( MONTHLY_SALARY+MONTHLY_HOUSING ) + ANNUAL_BONUS*(startM===0?0:1); // bonus was in jan
                const totalFixed12 = months*monthFixed;
                const totalLns = Array.from({length:months}).reduce((s,_,i)=>{
                  const d=new Date(y,startM+i,1); return s+totalLoans(d.getFullYear(),d.getMonth());
                },0);
                const netYear=totalInc-totalFixed12-totalLns;
                return(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[
                      {l:"الدخل المتوقع",v:totalInc,c:"#4ade80"},
                      {l:"الأقساط المتوقعة",v:totalLns,c:"#f87171"},
                      {l:"الثابتة المتوقعة",v:totalFixed12,c:"#fbbf24"},
                      {l:"الصافي المتوقع",v:netYear,c:netYear>=0?"#60a5fa":"#f87171"},
                    ].map(r=>(
                      <div key={r.l} style={{background:"rgba(0,0,0,0.2)",borderRadius:11,padding:"10px 12px",textAlign:"center"}}>
                        <div style={{fontSize:9,color:"#7c7ca8",marginBottom:3}}>{r.l}</div>
                        <div style={{fontSize:13,fontWeight:800,color:r.c}}>{fmtNum(r.v)}</div>
                        <div style={{fontSize:8,color:"#5a5a7a"}}>ر.س</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Month-by-month next 12 */}
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:15,padding:14,border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#c8c8e8",marginBottom:12}}>🗓️ التوقع الشهري (12 شهراً)</div>
              {Array.from({length:12}).map((_,i)=>{
                const d=new Date(today.getFullYear(),today.getMonth()+i,1);
                const y=d.getFullYear(),m=d.getMonth();
                const inc=fixedIncome(y,m);
                const lns=totalLoans(y,m);
                const fix=monthFixed;
                const net2=inc-lns-fix;
                const isCur=i===0;
                return(
                  <div key={i} style={{background:isCur?"rgba(74,144,226,0.08)":"transparent",borderRadius:10,padding:"9px 10px",marginBottom:4,border:isCur?"1px solid rgba(74,144,226,0.2)":"1px solid transparent"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,color:isCur?"#60a5fa":"#c8c8e8",fontWeight:isCur?700:400}}>{MONTHS[m]} {y}{isCur?" ← الآن":""}</div>
                        <div style={{fontSize:9,color:"#5a5a7a"}}>أقساط: {fmtNum(lns)} · ثابت: {fmtNum(fix)}</div>
                      </div>
                      <div style={{textAlign:"left"}}>
                        <div style={{fontSize:13,fontWeight:800,color:net2>=0?"#4ade80":"#f87171"}}>{net2>=0?"+":""}{fmtNum(net2)}</div>
                        <div style={{fontSize:8,color:"#5a5a7a"}}>ر.س صافي</div>
                      </div>
                    </div>
                    {/* Mini bar */}
                    <div style={{display:"flex",gap:2,marginTop:5,height:3}}>
                      <div style={{flex:lns/inc||0,background:"#f87171",borderRadius:2}}/>
                      <div style={{flex:fix/inc||0,background:"#fbbf24",borderRadius:2}}/>
                      <div style={{flex:Math.max(net2/inc,0)||0,background:"#4ade80",borderRadius:2}}/>
                    </div>
                  </div>
                );
              })}
              <div style={{display:"flex",gap:12,marginTop:10,fontSize:10,color:"#7c7ca8",justifyContent:"center"}}>
                <span><span style={{color:"#f87171"}}>■</span> أقساط</span>
                <span><span style={{color:"#fbbf24"}}>■</span> ثابتة</span>
                <span><span style={{color:"#4ade80"}}>■</span> صافي</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      {view!=="add"&&(
        <button onClick={()=>setView("add")} style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#4a90e2,#7c3aed)",border:"none",color:"#fff",borderRadius:28,padding:"13px 30px",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 28px rgba(74,144,226,0.5)",display:"flex",alignItems:"center",gap:7,zIndex:50,whiteSpace:"nowrap"}}>
          ＋ إضافة معاملة
        </button>
      )}

      {/* ── ADD MODAL ── */}
      {view==="add"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={e=>e.target===e.currentTarget&&setView("dashboard")}>
          <div style={{background:"#14142a",borderRadius:"22px 22px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:640,margin:"0 auto",border:"1px solid rgba(255,255,255,0.1)"}} dir="rtl">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontSize:16,fontWeight:700}}>إضافة معاملة</div>
              <button onClick={()=>setView("dashboard")} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#aaa",borderRadius:9,width:30,height:30,cursor:"pointer",fontSize:15}}>✕</button>
            </div>

            <div style={{display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:12,padding:3,marginBottom:16,gap:3}}>
              {[["expense","مصروف","🔴"],["income","وارد","🟢"]].map(([t,l,ic])=>(
                <button key={t} onClick={()=>setForm(f=>({...f,type:t,category:t==="income"?"salary":"food"}))} style={{flex:1,background:form.type===t?(t==="income"?"rgba(74,222,128,0.18)":"rgba(248,113,113,0.18)"):"transparent",border:"none",color:form.type===t?(t==="income"?"#4ade80":"#f87171"):"#7c7ca8",borderRadius:9,padding:"9px",cursor:"pointer",fontWeight:600,fontSize:13}}>
                  {ic} {l}
                </button>
              ))}
            </div>

            <div style={{marginBottom:13}}>
              <label style={{fontSize:11,color:"#6060a0",display:"block",marginBottom:5}}>المبلغ (ر.س)</label>
              <input value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" type="number" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",borderRadius:11,padding:"12px 14px",color:"#fff",fontSize:20,fontWeight:700,boxSizing:"border-box",textAlign:"right"}}/>
            </div>

            <div style={{marginBottom:13}}>
              <label style={{fontSize:11,color:"#6060a0",display:"block",marginBottom:7}}>الفئة</label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                {CATEGORIES[form.type].map(cat=>(
                  <button key={cat.id} onClick={()=>setForm(f=>({...f,category:cat.id}))} style={{background:form.category===cat.id?"rgba(74,144,226,0.28)":"rgba(255,255,255,0.05)",border:form.category===cat.id?"1px solid #4a90e2":"1px solid rgba(255,255,255,0.07)",borderRadius:11,padding:"7px 3px",cursor:"pointer",textAlign:"center"}}>
                    <div style={{fontSize:17}}>{cat.icon}</div>
                    <div style={{fontSize:9,color:form.category===cat.id?"#4a90e2":"#7c7ca8",marginTop:2}}>{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
              <div>
                <label style={{fontSize:11,color:"#6060a0",display:"block",marginBottom:5}}>ملاحظة</label>
                <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="اختياري" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"9px 11px",color:"#fff",fontSize:12,boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontSize:11,color:"#6060a0",display:"block",marginBottom:5}}>التاريخ</label>
                <input value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} type="date" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"9px 11px",color:"#fff",fontSize:12,boxSizing:"border-box"}}/>
              </div>
            </div>

            <button onClick={addTransaction} style={{width:"100%",background:"linear-gradient(135deg,#4a90e2,#7c3aed)",border:"none",color:"#fff",borderRadius:14,padding:15,fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 18px rgba(74,144,226,0.4)"}}>
              حفظ المعاملة ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
