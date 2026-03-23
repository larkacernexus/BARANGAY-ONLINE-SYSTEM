import{c as os,X as cs,r as es,j as t,S as ms,x as ds}from"./app-CJA2CJ-O.js";import{A as xs}from"./admin-app-layout-CyGjd-SB.js";import{B as qt}from"./createLucideIcon-DITSAAMQ.js";import{B as De}from"./breadcrumbs-DAyYl91y.js";import{C as ts}from"./clipboard-list-BoxAEQmj.js";import{B as fs,c as ps,e as ss,D as gs}from"./use-mobile-navigation-C4jHJMNa.js";import{A as hs}from"./arrow-left-QBk0su_s.js";import{H as bs}from"./hash-8rhvvgtg.js";import{a as ys,C as rs,P as us,F as js,U as Ns}from"./zap-BusV_gTH.js";import{P as as}from"./printer-ChXCvfBv.js";import{I as is}from"./info-D8csLNKP.js";import{M as vs}from"./map-pin-Dpb6tnXc.js";import{F as _s}from"./file-digit-DTgxOSez.js";import{S as ws}from"./shield-DmwrWQjH.js";import{Q as Ss}from"./qr-code-D2aIbKJy.js";import{F as ks}from"./file-check-BaW7LkKh.js";import{B as Ps}from"./building-B6Lw3Dun.js";import{U as Rs}from"./index-DjMZT7QU.js";import"./app-kPDqszAC.js";import"./house-T3E5Np-v.js";import"./briefcase-CJHD1fip.js";import"./megaphone-B14aN7gt.js";import"./key-Dz-yeoyW.js";import"./link-CQU7Paud.js";import"./history-D-BqYtd2.js";import"./octagon-alert-BlEPGms5.js";import"./monitor-DcdVou_R.js";import"./database-D-JovRjY.js";import"./file-type-BOEdBs47.js";import"./tag-BSMnUdvu.js";import"./palette-DA_9ubYs.js";import"./index-ikzcNs2d.js";import"./mail--cnqGh9c.js";import"./book-open-7cnx_U79.js";import"./keyboard-N6j-d7EL.js";import"./funnel-x9N-9mnR.js";import"./triangle-alert-ChUdhr1z.js";import"./loader-circle-B_idytKc.js";import"./index-D75nDeoL.js";const Mt=e=>new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP",minimumFractionDigits:2,maximumFractionDigits:2}).format(e),Ts=e=>{switch(e.toLowerCase()){case"completed":case"paid":case"approved":return"bg-green-100 text-green-800 border-green-200";case"pending":return"bg-yellow-100 text-yellow-800 border-yellow-200";case"cancelled":case"failed":return"bg-red-100 text-red-800 border-red-200";default:return"bg-gray-100 text-gray-800 border-gray-200"}};function Nr(){const e=os.c(266),{payment:s,barangay:r,officer:n}=cs().props,x=es.useRef(null),[c,m]=es.useState(!1);let d;e[0]!==s.or_number?(d=()=>{m(!0),setTimeout(()=>{if(x.current){const Vt=window.open("","_blank");if(Vt){const Jt=x.current.cloneNode(!0);Jt.querySelectorAll(".no-print").forEach(Ds),Vt.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Official Receipt - ${s.or_number}</title>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');
                            
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: 'Inter', sans-serif;
                                line-height: 1.5;
                                color: #374151;
                                background: #ffffff;
                                font-size: 10pt;
                                padding: 0;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            
                            .receipt-container {
                                width: 100%;
                                max-width: 100%;
                                margin: 0 auto;
                                background: #ffffff;
                                position: relative;
                                padding: 15px;
                                break-inside: avoid;
                                page-break-inside: avoid;
                            }
                            
                            /* Remove watermark for print */
                            .absolute.inset-0.pointer-events-none.opacity-5 {
                                display: none;
                            }
                            
                            /* Header styles - LIGHTER BACKGROUND for receipt title */
                            .text-center.border-b-2.border-gray-900 {
                                text-align: center;
                                border-bottom: 2px solid #1f2937;
                                padding-bottom: 12px;
                                margin-bottom: 15px;
                            }
                            
                            /* LIGHTEN the receipt title background */
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 {
                                background: linear-gradient(to right, #374151, #4b5563) !important;
                                position: relative;
                                border-radius: 8px;
                                padding: 12px !important;
                                margin-bottom: 15px;
                                overflow: hidden;
                            }
                            
                            /* MAKE TEXT WHITE FOR BETTER CONTRAST */
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 .text-white {
                                color: #ffffff !important;
                                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                            }
                            
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 .text-gray-300 {
                                color: #e5e7eb !important;
                            }
                            
                            .flex.justify-center.mb-6 {
                                display: flex;
                                justify-content: center;
                                margin-bottom: 12px;
                            }
                            
                            .h-24.w-24.object-contain {
                                height: 4rem;
                                width: 4rem;
                                object-fit: contain;
                            }
                            
                            .text-3xl.font-black.uppercase {
                                font-size: 1.25rem;
                                font-weight: 900;
                                text-transform: uppercase;
                                color: #111827;
                            }
                            
                            .text-xs.tracking-widest.text-gray-500 {
                                font-size: 0.65rem;
                                letter-spacing: 0.05em;
                                color: #6b7280;
                            }
                            
                            /* Grid layouts */
                            .grid.grid-cols-1.md\\:grid-cols-2 {
                                display: grid;
                                grid-template-columns: 1fr;
                                gap: 12px;
                                margin-bottom: 12px;
                            }
                            
                            @media (min-width: 768px) {
                                .grid.grid-cols-1.md\\:grid-cols-2 {
                                    grid-template-columns: 1fr 1fr;
                                }
                            }
                            
                            /* Badge styles - lighter */
                            .inline-flex.items-center.rounded-full.border.px-2\\.5.py-0\\.5.text-xs {
                                display: inline-flex;
                                align-items: center;
                                border-radius: 9999px;
                                border-width: 1px;
                                padding: 0.15rem 0.4rem !important;
                                font-size: 0.6rem !important;
                                background-color: #f8fafc !important;
                                border-color: #e2e8f0 !important;
                                color: #334155 !important;
                            }
                            
                            /* Font mono for amounts */
                            .font-mono {
                                font-family: 'Roboto Mono', monospace;
                            }
                            
                            /* Table styles - lighter */
                            table.w-full {
                                width: 100%;
                                font-size: 9pt;
                            }
                            
                            .overflow-hidden.rounded-xl.border {
                                overflow: hidden;
                                border-radius: 6px;
                                border: 1px solid #e2e8f0;
                            }
                            
                            thead.bg-gray-50 {
                                background-color: #f8fafc !important;
                            }
                            
                            th, td {
                                padding: 6px 8px !important;
                                font-size: 9pt !important;
                            }
                            
                            th {
                                text-align: left;
                                font-weight: 600;
                                text-transform: uppercase;
                                color: #475569;
                                background-color: #f8fafc !important;
                                border-bottom: 2px solid #e2e8f0;
                            }
                            
                            .divide-y.divide-gray-200 > * + * {
                                border-top: 1px solid #f1f5f9;
                            }
                            
                            /* Lighter gradient backgrounds */
                            .bg-gradient-to-r.from-gray-50.to-gray-100 {
                                background: linear-gradient(to right, #f8fafc, #f1f5f9) !important;
                                border: 1px solid #e2e8f0 !important;
                            }
                            
                            .bg-gradient-to-br.from-blue-50.to-indigo-50 {
                                background: linear-gradient(135deg, #f0f9ff, #e0f7ff) !important;
                                border: 1px solid #bae6fd !important;
                            }
                            
                            .bg-gradient-to-r.from-green-50.to-emerald-50 {
                                background: linear-gradient(to right, #f0fdf4, #dcfce7) !important;
                                border: 1px solid #bbf7d0 !important;
                            }
                            
                            /* Remove QR code for print */
                            .mt-8.flex.justify-center {
                                display: none;
                            }
                            
                            /* Signature section */
                            .mt-12.pt-8.border-t {
                                margin-top: 20px !important;
                                padding-top: 15px !important;
                                border-top: 1px solid #cbd5e1;
                            }
                            
                            /* Force single column for print */
                            @media print {
                                .grid.grid-cols-1.md\\:grid-cols-2 {
                                    grid-template-columns: 1fr !important;
                                }
                                
                                .grid.grid-cols-2 {
                                    grid-template-columns: 1fr !important;
                                }
                            }
                            
                            /* Footer */
                            .mt-12.pt-8.border-t-2 {
                                margin-top: 20px !important;
                                padding-top: 15px !important;
                                border-top: 1px solid #cbd5e1;
                                font-size: 8pt;
                            }
                            
                            /* Force single page */
                            @page {
                                margin: 0.7cm;
                                size: A4;
                            }
                            
                            /* Ensure content stays on one page */
                            .receipt-container > * {
                                page-break-inside: avoid;
                                break-inside: avoid;
                            }
                            
                            /* Hide print-specific elements */
                            .no-print {
                                display: none !important;
                            }
                            
                            /* Adjust spacing for print */
                            .mb-8 {
                                margin-bottom: 12px !important;
                            }
                            
                            .mb-6 {
                                margin-bottom: 10px !important;
                            }
                            
                            .p-6, .p-8 {
                                padding: 10px !important;
                            }
                            
                            /* Reduce font sizes but ensure readability */
                            .text-2xl {
                                font-size: 1.1rem !important;
                            }
                            
                            .text-3xl {
                                font-size: 1.2rem !important;
                            }
                            
                            .text-4xl {
                                font-size: 1.3rem !important;
                            }
                            
                            /* Receipt title text - WHITE for contrast */
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 .text-4xl {
                                color: #ffffff !important;
                                font-size: 1.4rem !important;
                                font-weight: 900;
                            }
                            
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 .text-sm {
                                color: #e5e7eb !important;
                                font-size: 0.7rem !important;
                            }
                            
                            /* Compact header */
                            .text-center.border-b-2.border-gray-900 {
                                padding-bottom: 10px !important;
                                margin-bottom: 12px !important;
                            }
                            
                            /* Reduce grid gaps */
                            .gap-6 {
                                gap: 8px !important;
                            }
                            
                            .gap-8 {
                                gap: 10px !important;
                            }
                            
                            /* Adjust signature section */
                            .mt-12.pt-8 {
                                margin-top: 15px !important;
                                padding-top: 10px !important;
                            }
                            
                            .mt-16.pt-12 {
                                margin-top: 12px !important;
                                padding-top: 10px !important;
                            }
                            
                            /* Print-specific adjustments */
                            @media print {
                                body {
                                    font-size: 9pt !important;
                                    color: #374151 !important;
                                }
                                
                                /* Lighten all text for better print contrast */
                                * {
                                    color: #374151 !important;
                                }
                                
                                /* Make sure white text stays white on dark backgrounds */
                                .text-white {
                                    color: #ffffff !important;
                                }
                                
                                /* Lighter text colors */
                                .text-gray-600, .text-gray-500, .text-gray-400 {
                                    color: #64748b !important;
                                }
                                
                                .text-gray-700, .text-gray-800, .text-gray-900 {
                                    color: #334155 !important;
                                }
                                
                                /* Reduce all margins and padding */
                                .receipt-container {
                                    padding: 10px !important;
                                }
                                
                                .receipt-container > div {
                                    margin-bottom: 8px !important;
                                }
                                
                                /* Make table more compact */
                                table {
                                    font-size: 8pt !important;
                                }
                                
                                th, td {
                                    padding: 4px 6px !important;
                                }
                                
                                /* Ensure everything fits */
                                .receipt-container {
                                    max-height: 27cm; /* A4 height minus margins */
                                    overflow: hidden;
                                }
                                
                                /* Stack everything in single column */
                                .grid {
                                    grid-template-columns: 1fr !important;
                                    gap: 6px !important;
                                }
                                
                                /* Lighten background colors for better ink usage */
                                .bg-gray-50, .bg-gray-100 {
                                    background-color: #f8fafc !important;
                                }
                                
                                /* Remove excessive shadows and effects */
                                .shadow, .shadow-xl, .shadow-lg {
                                    box-shadow: none !important;
                                }
                                
                                /* Ensure text is readable */
                                .font-black {
                                    font-weight: 800 !important;
                                }
                                
                                .font-bold {
                                    font-weight: 700 !important;
                                }
                                
                                .font-semibold {
                                    font-weight: 600 !important;
                                }
                                
                                /* Adjust the receipt title to be lighter but still visible */
                                .relative.bg-gradient-to-r.from-gray-900.to-gray-800 {
                                    background: linear-gradient(to right, #475569, #64748b) !important;
                                }
                            }
                            
                            /* Additional utility classes for print */
                            .print\\:text-black {
                                color: #000000 !important;
                            }
                            
                            .print\\:bg-white {
                                background-color: #ffffff !important;
                            }
                            
                            .print\\:border-gray-300 {
                                border-color: #d1d5db !important;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="receipt-container">
                            ${Jt.innerHTML}
                        </div>
                        <script>
                            setTimeout(() => {
                                window.print();
                                setTimeout(() => {
                                    window.close();
                                }, 500);
                            }, 250);
                        <\/script>
                    </body>
                    </html>
                `),Vt.document.close()}}m(!1)},100)},e[0]=s.or_number,e[1]=d):d=e[1];const l=d;let o;e[2]!==s.id?(o=()=>{window.location.href=`/admin/payments/${s.id}/receipt/pdf`},e[2]=s.id,e[3]=o):o=e[3];const a=o,i=Fs,Zt=Cs,ls=Es,ns=As,Lt=`Official Receipt - ${s.or_number}`;let f;e[4]!==Lt?(f=t.jsx(ms,{title:Lt}),e[4]=Lt,e[5]=f):f=e[5];const Ot=`Official Receipt - ${s.or_number}`;let Be,Me;e[6]===Symbol.for("react.memo_cache_sentinel")?(Be={title:"Dashboard",href:"/admin/dashboard"},Me={title:"Payments",href:"/admin/payments"},e[6]=Be,e[7]=Me):(Be=e[6],Me=e[7]);const zt=`Payment #${s.or_number}`,Ht=`/admin/payments/${s.id}`;let p;e[8]!==zt||e[9]!==Ht?(p={title:zt,href:Ht},e[8]=zt,e[9]=Ht,e[10]=p):p=e[10];let Le;e[11]===Symbol.for("react.memo_cache_sentinel")?(Le={title:"Receipt",href:"#"},e[11]=Le):Le=e[11];let g;e[12]!==p?(g=[Be,Me,p,Le],e[12]=p,e[13]=g):g=e[13];const Xt=`/admin/payments/${s.id}`;let Oe;e[14]===Symbol.for("react.memo_cache_sentinel")?(Oe=t.jsxs(qt,{variant:"outline",className:"border-gray-300 hover:bg-gray-50",children:[t.jsx(hs,{className:"h-4 w-4 mr-2"}),"Back to Payment"]}),e[14]=Oe):Oe=e[14];let h;e[15]!==Xt?(h=t.jsx(ds,{href:Xt,children:Oe}),e[15]=Xt,e[16]=h):h=e[16];let ze;e[17]===Symbol.for("react.memo_cache_sentinel")?(ze=t.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Official Receipt"}),e[17]=ze):ze=e[17];let He;e[18]!==s.status?(He=Ts(s.status),e[18]=s.status,e[19]=He):He=e[19];const $t=`${He} font-semibold`;let b;e[20]!==s.status||e[21]!==$t?(b=t.jsxs("div",{className:"flex items-center gap-3",children:[ze,t.jsx(De,{className:$t,children:s.status})]}),e[20]=s.status,e[21]=$t,e[22]=b):b=e[22];let Xe;e[23]===Symbol.for("react.memo_cache_sentinel")?(Xe=t.jsx(bs,{className:"h-3.5 w-3.5 mr-1.5"}),e[23]=Xe):Xe=e[23];let y;e[24]!==s.or_number?(y=t.jsxs("div",{className:"flex items-center text-sm text-gray-600",children:[Xe,t.jsx("span",{className:"font-semibold",children:s.or_number})]}),e[24]=s.or_number,e[25]=y):y=e[25];let $e;e[26]===Symbol.for("react.memo_cache_sentinel")?($e=t.jsx(ys,{className:"h-3.5 w-3.5 mr-1.5"}),e[26]=$e):$e=e[26];let u;e[27]!==s.formatted_date?(u=t.jsxs("div",{className:"flex items-center text-sm text-gray-600",children:[$e,s.formatted_date]}),e[27]=s.formatted_date,e[28]=u):u=e[28];const Gt=Zt(s.payment_method);let j;e[29]!==s.payment_method?(j=i(s.payment_method),e[29]=s.payment_method,e[30]=j):j=e[30];let N;e[31]!==s.payment_method_display?(N=t.jsx("span",{className:"ml-1.5",children:s.payment_method_display}),e[31]=s.payment_method_display,e[32]=N):N=e[32];let v;e[33]!==Gt||e[34]!==j||e[35]!==N?(v=t.jsxs(De,{className:Gt,children:[j,N]}),e[33]=Gt,e[34]=j,e[35]=N,e[36]=v):v=e[36];let _;e[37]!==y||e[38]!==u||e[39]!==v?(_=t.jsxs("div",{className:"flex items-center gap-4 mt-2",children:[y,u,v]}),e[37]=y,e[38]=u,e[39]=v,e[40]=_):_=e[40];let w;e[41]!==b||e[42]!==_?(w=t.jsxs("div",{children:[b,_]}),e[41]=b,e[42]=_,e[43]=w):w=e[43];let S;e[44]!==h||e[45]!==w?(S=t.jsxs("div",{className:"flex items-center gap-4",children:[h,w]}),e[44]=h,e[45]=w,e[46]=S):S=e[46];let Ge;e[47]===Symbol.for("react.memo_cache_sentinel")?(Ge=t.jsx(ps,{className:"h-4 w-4 mr-2"}),e[47]=Ge):Ge=e[47];let k;e[48]!==a?(k=t.jsxs(qt,{variant:"outline",onClick:a,className:"border-gray-300 hover:bg-gray-50",children:[Ge,"Download PDF"]}),e[48]=a,e[49]=k):k=e[49];let Ue;e[50]===Symbol.for("react.memo_cache_sentinel")?(Ue=t.jsx(as,{className:"h-4 w-4 mr-2"}),e[50]=Ue):Ue=e[50];const Ut=c?"Printing...":"Print Receipt";let P;e[51]!==l||e[52]!==c||e[53]!==Ut?(P=t.jsxs(qt,{onClick:l,disabled:c,className:"bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm",children:[Ue,Ut]}),e[51]=l,e[52]=c,e[53]=Ut,e[54]=P):P=e[54];let R;e[55]!==k||e[56]!==P?(R=t.jsxs("div",{className:"flex flex-wrap gap-3",children:[k,P]}),e[55]=k,e[56]=P,e[57]=R):R=e[57];let T;e[58]!==S||e[59]!==R?(T=t.jsxs("div",{className:"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 no-print",children:[S,R]}),e[58]=S,e[59]=R,e[60]=T):T=e[60];let We;e[61]===Symbol.for("react.memo_cache_sentinel")?(We=t.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[t.jsx(is,{className:"h-5 w-5 text-blue-600"}),t.jsxs("div",{children:[t.jsx("h3",{className:"font-semibold text-gray-900",children:"Receipt Preview"}),t.jsx("p",{className:"text-sm text-gray-600",children:"This is how your receipt will appear when printed"})]})]}),e[61]=We):We=e[61];let Ye;e[62]===Symbol.for("react.memo_cache_sentinel")?(Ye=t.jsx("div",{className:"no-print mb-6",children:t.jsxs("div",{className:"bg-white rounded-xl shadow-lg border border-gray-200 p-6",children:[We,t.jsxs("div",{className:"flex items-center gap-2 text-sm text-gray-500",children:[t.jsx(rs,{className:"h-4 w-4"}),"Paper size: A4 • Print in landscape for best results"]})]})}),e[62]=Ye):Ye=e[62];let I;e[63]!==r.name?(I=t.jsx("div",{className:"absolute inset-0 pointer-events-none opacity-5 font-black text-8xl text-center rotate-45 flex items-center justify-center select-none",children:r.name}),e[63]=r.name,e[64]=I):I=e[64];let A;e[65]!==r.logo?(A=r.logo&&t.jsx("div",{className:"flex justify-center mb-6",children:t.jsx("img",{src:r.logo,alt:"Barangay Seal",className:"h-24 w-24 object-contain"})}),e[65]=r.logo,e[66]=A):A=e[66];let E;e[67]!==r.name?(E=t.jsx("h1",{className:"text-3xl font-black uppercase tracking-wider text-gray-900 mb-2",children:r.name}),e[67]=r.name,e[68]=E):E=e[68];let Ke;e[69]===Symbol.for("react.memo_cache_sentinel")?(Ke=t.jsx("div",{className:"text-xs tracking-widest text-gray-500 mb-4",children:"BARANGAY GOVERNMENT UNIT"}),e[69]=Ke):Ke=e[69];let Qe;e[70]===Symbol.for("react.memo_cache_sentinel")?(Qe=t.jsx(vs,{className:"h-4 w-4"}),e[70]=Qe):Qe=e[70];let C;e[71]!==r.address?(C=t.jsxs("div",{className:"flex items-center justify-center gap-2",children:[Qe,r.address]}),e[71]=r.address,e[72]=C):C=e[72];let Ve;e[73]===Symbol.for("react.memo_cache_sentinel")?(Ve=t.jsx(us,{className:"h-4 w-4"}),e[73]=Ve):Ve=e[73];let F;e[74]!==r.contact?(F=t.jsxs("div",{className:"flex items-center justify-center gap-2",children:[Ve,r.contact]}),e[74]=r.contact,e[75]=F):F=e[75];let D;e[76]!==C||e[77]!==F?(D=t.jsxs("div",{className:"flex flex-col sm:flex-row justify-center gap-4 text-sm text-gray-600",children:[C,F]}),e[76]=C,e[77]=F,e[78]=D):D=e[78];let B;e[79]!==A||e[80]!==E||e[81]!==D?(B=t.jsxs("div",{className:"text-center border-b-2 border-gray-900 pb-8 mb-8 relative",children:[A,E,Ke,D]}),e[79]=A,e[80]=E,e[81]=D,e[82]=B):B=e[82];let qe;e[83]===Symbol.for("react.memo_cache_sentinel")?(qe=t.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"}),e[83]=qe):qe=e[83];let Ze;e[84]===Symbol.for("react.memo_cache_sentinel")?(Ze=t.jsxs("div",{className:"relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 mb-8 text-center overflow-hidden",children:[qe,t.jsxs("div",{className:"relative",children:[t.jsx("div",{className:"text-4xl font-black uppercase tracking-widest text-white mb-2",children:"OFFICIAL RECEIPT"}),t.jsx("div",{className:"text-sm text-gray-300 tracking-widest",children:"ORIGINAL COPY • VALID ONLY WITH OFFICIAL SEAL"}),t.jsx("div",{className:"absolute -top-2 -right-2 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold",children:"BIR Reg. No. XXXX-XXXX-XXXX"})]})]}),e[84]=Ze):Ze=e[84];let Je;e[85]===Symbol.for("react.memo_cache_sentinel")?(Je=t.jsx("div",{className:"text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1",children:"Receipt Details"}),e[85]=Je):Je=e[85];let et;e[86]===Symbol.for("react.memo_cache_sentinel")?(et=t.jsx("span",{className:"text-sm text-gray-600",children:"OR Number:"}),e[86]=et):et=e[86];let M;e[87]!==s.or_number?(M=t.jsxs("div",{className:"flex items-center justify-between",children:[et,t.jsx("span",{className:"font-mono font-bold text-gray-900",children:s.or_number})]}),e[87]=s.or_number,e[88]=M):M=e[88];let tt;e[89]===Symbol.for("react.memo_cache_sentinel")?(tt=t.jsx("span",{className:"text-sm text-gray-600",children:"Date Issued:"}),e[89]=tt):tt=e[89];let L;e[90]!==s.formatted_date?(L=t.jsxs("div",{className:"flex items-center justify-between",children:[tt,t.jsx("span",{className:"font-medium text-gray-900",children:s.formatted_date})]}),e[90]=s.formatted_date,e[91]=L):L=e[91];let st;e[92]===Symbol.for("react.memo_cache_sentinel")?(st=t.jsx("span",{className:"text-sm text-gray-600",children:"Payment Method:"}),e[92]=st):st=e[92];const Wt=`${Zt(s.payment_method)} font-semibold`;let O;e[93]!==s.payment_method?(O=i(s.payment_method),e[93]=s.payment_method,e[94]=O):O=e[94];let z;e[95]!==s.payment_method_display?(z=t.jsx("span",{className:"ml-1.5",children:s.payment_method_display}),e[95]=s.payment_method_display,e[96]=z):z=e[96];let H;e[97]!==Wt||e[98]!==O||e[99]!==z?(H=t.jsxs("div",{className:"flex items-center justify-between",children:[st,t.jsxs(De,{className:Wt,children:[O,z]})]}),e[97]=Wt,e[98]=O,e[99]=z,e[100]=H):H=e[100];let X;e[101]!==s.reference_number?(X=s.reference_number&&t.jsxs("div",{className:"flex items-center justify-between",children:[t.jsx("span",{className:"text-sm text-gray-600",children:"Reference No:"}),t.jsx("span",{className:"font-mono font-medium text-gray-900",children:s.reference_number})]}),e[101]=s.reference_number,e[102]=X):X=e[102];let $;e[103]!==M||e[104]!==L||e[105]!==H||e[106]!==X?($=t.jsx("div",{className:"space-y-4",children:t.jsxs("div",{children:[Je,t.jsxs("div",{className:"space-y-2",children:[M,L,H,X]})]})}),e[103]=M,e[104]=L,e[105]=H,e[106]=X,e[107]=$):$=e[107];let rt;e[108]===Symbol.for("react.memo_cache_sentinel")?(rt=t.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[t.jsx(ts,{className:"h-5 w-5 text-blue-600"}),t.jsx("div",{className:"font-semibold text-gray-900",children:"Transaction Summary"})]}),e[108]=rt):rt=e[108];let at;e[109]===Symbol.for("react.memo_cache_sentinel")?(at=t.jsx("span",{className:"text-sm text-gray-600",children:"Subtotal"}),e[109]=at):at=e[109];let G;e[110]!==s.formatted_subtotal?(G=t.jsxs("div",{className:"flex justify-between items-center",children:[at,t.jsx("span",{className:"font-mono font-medium",children:s.formatted_subtotal})]}),e[110]=s.formatted_subtotal,e[111]=G):G=e[111];let U;e[112]!==s.formatted_surcharge||e[113]!==s.surcharge?(U=s.surcharge>0&&t.jsxs("div",{className:"flex justify-between items-center",children:[t.jsx("span",{className:"text-sm text-amber-700",children:"Surcharge"}),t.jsxs("span",{className:"font-mono font-medium text-amber-700",children:["+",s.formatted_surcharge]})]}),e[112]=s.formatted_surcharge,e[113]=s.surcharge,e[114]=U):U=e[114];let W;e[115]!==s.formatted_penalty||e[116]!==s.penalty?(W=s.penalty>0&&t.jsxs("div",{className:"flex justify-between items-center",children:[t.jsx("span",{className:"text-sm text-red-700",children:"Penalty"}),t.jsxs("span",{className:"font-mono font-medium text-red-700",children:["+",s.formatted_penalty]})]}),e[115]=s.formatted_penalty,e[116]=s.penalty,e[117]=W):W=e[117];let Y;e[118]!==s.discount||e[119]!==s.formatted_discount?(Y=s.discount>0&&t.jsxs("div",{className:"flex justify-between items-center",children:[t.jsx("span",{className:"text-sm text-green-700",children:"Discount"}),t.jsxs("span",{className:"font-mono font-medium text-green-700",children:["-",s.formatted_discount]})]}),e[118]=s.discount,e[119]=s.formatted_discount,e[120]=Y):Y=e[120];let it;e[121]===Symbol.for("react.memo_cache_sentinel")?(it=t.jsx("span",{className:"font-semibold text-gray-900",children:"Total Amount"}),e[121]=it):it=e[121];let K;e[122]!==s.formatted_total?(K=t.jsx("div",{className:"border-t border-blue-200 pt-3 mt-3",children:t.jsxs("div",{className:"flex justify-between items-center",children:[it,t.jsx("span",{className:"text-2xl font-bold text-gray-900",children:s.formatted_total})]})}),e[122]=s.formatted_total,e[123]=K):K=e[123];let Q;e[124]!==G||e[125]!==U||e[126]!==W||e[127]!==Y||e[128]!==K?(Q=t.jsxs("div",{className:"bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100",children:[rt,t.jsxs("div",{className:"space-y-3",children:[G,U,W,Y,K]})]}),e[124]=G,e[125]=U,e[126]=W,e[127]=Y,e[128]=K,e[129]=Q):Q=e[129];let V;e[130]!==$||e[131]!==Q?(V=t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8",children:[$,Q]}),e[130]=$,e[131]=Q,e[132]=V):V=e[132];let q;e[133]!==s.payer_type?(q=ls(s.payer_type),e[133]=s.payer_type,e[134]=q):q=e[134];let lt;e[135]===Symbol.for("react.memo_cache_sentinel")?(lt=t.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"PAYER INFORMATION"}),e[135]=lt):lt=e[135];let Z;e[136]!==q?(Z=t.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[q,lt]}),e[136]=q,e[137]=Z):Z=e[137];let nt;e[138]===Symbol.for("react.memo_cache_sentinel")?(nt=t.jsx("div",{className:"text-xs uppercase tracking-wider text-gray-500 mb-1",children:"Payer Details"}),e[138]=nt):nt=e[138];let ot;e[139]===Symbol.for("react.memo_cache_sentinel")?(ot=t.jsx("div",{className:"text-sm text-gray-600",children:"Name"}),e[139]=ot):ot=e[139];let J;e[140]!==s.payer_name?(J=t.jsxs("div",{children:[ot,t.jsx("div",{className:"font-semibold text-gray-900",children:s.payer_name})]}),e[140]=s.payer_name,e[141]=J):J=e[141];let ct;e[142]===Symbol.for("react.memo_cache_sentinel")?(ct=t.jsx("div",{className:"text-sm text-gray-600",children:"Type"}),e[142]=ct):ct=e[142];const Yt=s.payer_type==="resident"?"Individual Resident":"Household Account";let ee;e[143]!==Yt?(ee=t.jsxs("div",{children:[ct,t.jsx(De,{className:"bg-gray-100 text-gray-700",children:Yt})]}),e[143]=Yt,e[144]=ee):ee=e[144];let te;e[145]!==J||e[146]!==ee?(te=t.jsx("div",{className:"space-y-4",children:t.jsxs("div",{children:[nt,t.jsxs("div",{className:"space-y-2",children:[J,ee]})]})}),e[145]=J,e[146]=ee,e[147]=te):te=e[147];let mt;e[148]===Symbol.for("react.memo_cache_sentinel")?(mt=t.jsx("div",{className:"text-xs uppercase tracking-wider text-gray-500 mb-1",children:"Contact Information"}),e[148]=mt):mt=e[148];let se;e[149]!==s.contact_number?(se=s.contact_number&&t.jsxs("div",{children:[t.jsx("div",{className:"text-sm text-gray-600",children:"Contact Number"}),t.jsx("div",{className:"font-medium text-gray-900",children:s.contact_number})]}),e[149]=s.contact_number,e[150]=se):se=e[150];let re;e[151]!==s.address?(re=s.address&&t.jsxs("div",{children:[t.jsx("div",{className:"text-sm text-gray-600",children:"Address"}),t.jsx("div",{className:"font-medium text-gray-900",children:s.address})]}),e[151]=s.address,e[152]=re):re=e[152];let ae;e[153]!==se||e[154]!==re?(ae=t.jsx("div",{className:"space-y-4",children:t.jsxs("div",{children:[mt,t.jsxs("div",{className:"space-y-2",children:[se,re]})]})}),e[153]=se,e[154]=re,e[155]=ae):ae=e[155];let ie;e[156]!==te||e[157]!==ae?(ie=t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[te,ae]}),e[156]=te,e[157]=ae,e[158]=ie):ie=e[158];let le;e[159]!==Z||e[160]!==ie?(le=t.jsxs("div",{className:"bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200",children:[Z,ie]}),e[159]=Z,e[160]=ie,e[161]=le):le=e[161];let dt;e[162]===Symbol.for("react.memo_cache_sentinel")?(dt=t.jsxs("div",{className:"flex items-center gap-3 mb-6",children:[t.jsx(_s,{className:"h-5 w-5 text-gray-700"}),t.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"PAYMENT BREAKDOWN"})]}),e[162]=dt):dt=e[162];let xt;e[163]===Symbol.for("react.memo_cache_sentinel")?(xt=t.jsx("thead",{className:"bg-gray-50",children:t.jsxs("tr",{children:[t.jsx("th",{className:"py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider",children:"Description"}),t.jsx("th",{className:"py-4 px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider",children:"Base Amount"}),t.jsx("th",{className:"py-4 px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider",children:"Surcharge"}),t.jsx("th",{className:"py-4 px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider",children:"Penalty"}),t.jsx("th",{className:"py-4 px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider",children:"Total"})]})}),e[163]=xt):xt=e[163];let ne;e[164]!==s.items?(ne=s.items.map(Is),e[164]=s.items,e[165]=ne):ne=e[165];let oe;e[166]!==ne?(oe=t.jsxs("div",{className:"mb-8",children:[dt,t.jsx("div",{className:"overflow-hidden rounded-xl border border-gray-200",children:t.jsxs("table",{className:"w-full",children:[xt,t.jsx("tbody",{className:"divide-y divide-gray-200",children:ne})]})})]}),e[166]=ne,e[167]=oe):oe=e[167];let ft;e[168]===Symbol.for("react.memo_cache_sentinel")?(ft=t.jsx("div",{className:"text-sm font-semibold text-gray-700 mb-2",children:"Amount in Words:"}),e[168]=ft):ft=e[168];const Kt=ns(s.total_amount);let ce;e[169]!==Kt?(ce=t.jsxs("div",{className:"mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200",children:[ft,t.jsxs("div",{className:"font-medium text-gray-900 italic",children:['"',Kt,'"']})]}),e[169]=Kt,e[170]=ce):ce=e[170];let pt;e[171]===Symbol.for("react.memo_cache_sentinel")?(pt=t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(js,{className:"h-5 w-5 text-gray-700"}),t.jsx("h4",{className:"font-semibold text-gray-900",children:"Payment Details"})]}),e[171]=pt):pt=e[171];let me;e[172]!==s.purpose?(me=s.purpose&&t.jsxs("div",{children:[t.jsx("div",{className:"text-sm text-gray-600",children:"Purpose"}),t.jsx("div",{className:"font-medium",children:s.purpose})]}),e[172]=s.purpose,e[173]=me):me=e[173];let de;e[174]!==s.collection_type?(de=s.collection_type&&t.jsxs("div",{children:[t.jsx("div",{className:"text-sm text-gray-600",children:"Collection Type"}),t.jsx("div",{className:"font-medium",children:s.collection_type})]}),e[174]=s.collection_type,e[175]=de):de=e[175];let xe;e[176]!==me||e[177]!==de?(xe=t.jsxs("div",{className:"space-y-4",children:[pt,t.jsxs("div",{className:"space-y-3",children:[me,de]})]}),e[176]=me,e[177]=de,e[178]=xe):xe=e[178];let fe;e[179]!==s.remarks?(fe=s.remarks&&t.jsxs("div",{className:"space-y-4",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(ts,{className:"h-5 w-5 text-gray-700"}),t.jsx("h4",{className:"font-semibold text-gray-900",children:"Remarks"})]}),t.jsx("div",{className:"text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200",children:s.remarks})]}),e[179]=s.remarks,e[180]=fe):fe=e[180];let pe;e[181]!==fe||e[182]!==xe?(pe=t.jsx("div",{className:"mb-8",children:t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[xe,fe]})}),e[181]=fe,e[182]=xe,e[183]=pe):pe=e[183];let ge;e[184]!==s.certificate_type||e[185]!==s.certificate_type_display?(ge=s.certificate_type&&t.jsxs("div",{className:"mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200",children:[t.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[t.jsx(fs,{className:"h-5 w-5 text-green-600"}),t.jsx("h4",{className:"font-semibold text-green-900",children:"CERTIFICATE ISSUED"})]}),t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[t.jsxs("div",{children:[t.jsx("div",{className:"text-sm text-green-700 font-medium mb-1",children:"Certificate Type"}),t.jsx("div",{className:"font-semibold text-green-900",children:s.certificate_type_display})]}),t.jsxs("div",{children:[t.jsx("div",{className:"text-sm text-green-700 font-medium mb-1",children:"Status"}),t.jsx(De,{className:"bg-green-100 text-green-800 border-green-300 font-semibold",children:"Issued & Processed"})]})]})]}),e[184]=s.certificate_type,e[185]=s.certificate_type_display,e[186]=ge):ge=e[186];let gt;e[187]===Symbol.for("react.memo_cache_sentinel")?(gt=t.jsx("div",{className:"text-sm font-semibold text-gray-700 mb-1",children:"Prepared By:"}),e[187]=gt):gt=e[187];let he;e[188]!==s.recorder?(he=s.recorder&&t.jsx("div",{className:"font-bold text-gray-900",children:s.recorder.name}),e[188]=s.recorder,e[189]=he):he=e[189];let be;e[190]!==he?(be=t.jsxs("div",{className:"mb-6",children:[gt,he]}),e[190]=he,e[191]=be):be=e[191];let ht;e[192]===Symbol.for("react.memo_cache_sentinel")?(ht=t.jsx("div",{className:"mt-16 pt-12 border-t border-gray-400 w-48 mx-auto",children:t.jsx("div",{className:"text-xs text-gray-600",children:"Signature over Printed Name"})}),e[192]=ht):ht=e[192];let ye;e[193]!==be?(ye=t.jsxs("div",{className:"text-center",children:[be,ht]}),e[193]=be,e[194]=ye):ye=e[194];let bt;e[195]===Symbol.for("react.memo_cache_sentinel")?(bt=t.jsx("div",{className:"text-sm font-semibold text-gray-700 mb-1",children:"Received By:"}),e[195]=bt):bt=e[195];let ue;e[196]!==n.name?(ue=t.jsx("div",{className:"font-bold text-gray-900",children:n.name}),e[196]=n.name,e[197]=ue):ue=e[197];let je;e[198]!==n.position?(je=t.jsx("div",{className:"text-sm text-gray-600",children:n.position}),e[198]=n.position,e[199]=je):je=e[199];let Ne;e[200]!==ue||e[201]!==je?(Ne=t.jsxs("div",{className:"mb-6",children:[bt,ue,je]}),e[200]=ue,e[201]=je,e[202]=Ne):Ne=e[202];let ve;e[203]!==n.signature?(ve=n.signature?t.jsxs("div",{className:"mt-8",children:[t.jsx("img",{src:n.signature,alt:"Signature",className:"h-20 mx-auto mb-4"}),t.jsx("div",{className:"border-t border-gray-400 w-48 mx-auto pt-2",children:t.jsx("div",{className:"text-xs text-gray-600",children:"Authorized Signature"})})]}):t.jsx("div",{className:"mt-16 pt-12 border-t border-gray-400 w-48 mx-auto",children:t.jsx("div",{className:"text-xs text-gray-600",children:"Signature over Printed Name"})}),e[203]=n.signature,e[204]=ve):ve=e[204];let _e;e[205]!==Ne||e[206]!==ve?(_e=t.jsxs("div",{className:"text-center",children:[Ne,ve]}),e[205]=Ne,e[206]=ve,e[207]=_e):_e=e[207];let we;e[208]!==ye||e[209]!==_e?(we=t.jsx("div",{className:"mt-12 pt-8 border-t border-gray-300",children:t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-12",children:[ye,_e]})}),e[208]=ye,e[209]=_e,e[210]=we):we=e[210];let yt;e[211]===Symbol.for("react.memo_cache_sentinel")?(yt=t.jsxs("div",{className:"mb-4",children:[t.jsxs("div",{className:"font-semibold text-gray-900 mb-2",children:[t.jsx(ws,{className:"h-4 w-4 inline mr-2"}),"THIS IS AN OFFICIAL RECEIPT"]}),t.jsx("div",{className:"text-sm text-gray-600 mb-4",children:"Valid for accounting and legal purposes • Not valid for input tax credits"})]}),e[211]=yt):yt=e[211];let Se;e[212]!==s.or_number?(Se=t.jsxs("div",{children:["Transaction ID: ",s.or_number]}),e[212]=s.or_number,e[213]=Se):Se=e[213];let ut;e[214]===Symbol.for("react.memo_cache_sentinel")?(ut=t.jsx("div",{className:"hidden sm:block",children:"•"}),e[214]=ut):ut=e[214];let jt;e[215]===Symbol.for("react.memo_cache_sentinel")?(jt=new Date().toLocaleDateString("en-PH"),e[215]=jt):jt=e[215];let Nt,vt,_t;e[216]===Symbol.for("react.memo_cache_sentinel")?(Nt=t.jsxs("div",{children:["Generated: ",jt," ",new Date().toLocaleTimeString()]}),vt=t.jsx("div",{className:"hidden sm:block",children:"•"}),_t=t.jsx("div",{children:"Barangay Government Unit"}),e[216]=Nt,e[217]=vt,e[218]=_t):(Nt=e[216],vt=e[217],_t=e[218]);let ke;e[219]!==Se?(ke=t.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-500",children:[Se,ut,Nt,vt,_t]}),e[219]=Se,e[220]=ke):ke=e[220];let wt;e[221]===Symbol.for("react.memo_cache_sentinel")?(wt=t.jsx("div",{className:"mt-4 text-xs text-gray-400 italic",children:"Please keep this receipt for your records. Report discrepancies within 30 days."}),e[221]=wt):wt=e[221];let Pe;e[222]!==ke?(Pe=t.jsxs("div",{className:"mt-12 pt-8 border-t-2 border-gray-300 text-center",children:[yt,ke,wt]}),e[222]=ke,e[223]=Pe):Pe=e[223];let St;e[224]===Symbol.for("react.memo_cache_sentinel")?(St=t.jsx("div",{className:"mt-8 flex justify-center",children:t.jsxs("div",{className:"bg-gray-100 p-4 rounded-lg inline-flex flex-col items-center",children:[t.jsx(Ss,{className:"h-24 w-24 text-gray-400"}),t.jsx("div",{className:"mt-2 text-xs text-gray-500",children:"Scan to verify authenticity"})]})}),e[224]=St):St=e[224];let Re;e[225]!==pe||e[226]!==ge||e[227]!==we||e[228]!==Pe||e[229]!==I||e[230]!==B||e[231]!==V||e[232]!==le||e[233]!==oe||e[234]!==ce?(Re=t.jsx("div",{className:"bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden",children:t.jsxs("div",{ref:x,className:"p-8",children:[I,B,Ze,V,le,oe,ce,pe,ge,we,Pe,St]})}),e[225]=pe,e[226]=ge,e[227]=we,e[228]=Pe,e[229]=I,e[230]=B,e[231]=V,e[232]=le,e[233]=oe,e[234]=ce,e[235]=Re):Re=e[235];let kt;e[236]===Symbol.for("react.memo_cache_sentinel")?(kt=t.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[t.jsx(is,{className:"h-5 w-5 text-blue-600"}),t.jsx("h4",{className:"font-semibold text-gray-900",children:"Transaction Details"})]}),e[236]=kt):kt=e[236];let Pt;e[237]===Symbol.for("react.memo_cache_sentinel")?(Pt=t.jsx("div",{className:"text-sm text-gray-600",children:"Payment ID"}),e[237]=Pt):Pt=e[237];let Te;e[238]!==s.id?(Te=t.jsxs("div",{children:[Pt,t.jsx("div",{className:"font-mono font-medium",children:s.id})]}),e[238]=s.id,e[239]=Te):Te=e[239];let Rt;e[240]===Symbol.for("react.memo_cache_sentinel")?(Rt=t.jsx("div",{className:"text-sm text-gray-600",children:"Recorded By"}),e[240]=Rt):Rt=e[240];const Qt=s.recorder?.name||"System Generated";let Ie;e[241]!==Qt?(Ie=t.jsxs("div",{children:[Rt,t.jsx("div",{className:"font-medium",children:Qt})]}),e[241]=Qt,e[242]=Ie):Ie=e[242];let Ae;e[243]!==Te||e[244]!==Ie?(Ae=t.jsxs("div",{className:"bg-white p-6 rounded-xl shadow border border-gray-200",children:[kt,t.jsxs("div",{className:"space-y-3",children:[Te,Ie]})]}),e[243]=Te,e[244]=Ie,e[245]=Ae):Ae=e[245];let Tt;e[246]===Symbol.for("react.memo_cache_sentinel")?(Tt=t.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[t.jsx(as,{className:"h-5 w-5 text-blue-600"}),t.jsx("h4",{className:"font-semibold text-gray-900",children:"Print Instructions"})]}),e[246]=Tt):Tt=e[246];let It;e[247]===Symbol.for("react.memo_cache_sentinel")?(It=t.jsxs("li",{className:"flex items-start gap-2",children:[t.jsx("div",{className:"mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"}),"Use A4 or Letter size paper"]}),e[247]=It):It=e[247];let At;e[248]===Symbol.for("react.memo_cache_sentinel")?(At=t.jsxs("li",{className:"flex items-start gap-2",children:[t.jsx("div",{className:"mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"}),'Enable "Background graphics" in print settings']}),e[248]=At):At=e[248];let Et;e[249]===Symbol.for("react.memo_cache_sentinel")?(Et=t.jsxs("li",{className:"flex items-start gap-2",children:[t.jsx("div",{className:"mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"}),'Set margins to "Default" or "Minimum"']}),e[249]=Et):Et=e[249];let Ct;e[250]===Symbol.for("react.memo_cache_sentinel")?(Ct=t.jsxs("div",{className:"bg-white p-6 rounded-xl shadow border border-gray-200",children:[Tt,t.jsxs("ul",{className:"space-y-2 text-sm text-gray-600",children:[It,At,Et,t.jsxs("li",{className:"flex items-start gap-2",children:[t.jsx("div",{className:"mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"}),"Print in color for best results"]})]})]}),e[250]=Ct):Ct=e[250];let Ft;e[251]===Symbol.for("react.memo_cache_sentinel")?(Ft=t.jsxs("div",{className:"flex items-center gap-3 mb-4",children:[t.jsx(rs,{className:"h-5 w-5 text-blue-600"}),t.jsx("h4",{className:"font-semibold text-gray-900",children:"Important Notes"})]}),e[251]=Ft):Ft=e[251];let Dt;e[252]===Symbol.for("react.memo_cache_sentinel")?(Dt=t.jsxs("div",{className:"bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow border border-blue-100",children:[Ft,t.jsxs("div",{className:"space-y-2 text-sm text-gray-700",children:[t.jsx("p",{children:"• This receipt serves as official proof of payment"}),t.jsx("p",{children:"• Present this receipt when claiming certificates"}),t.jsx("p",{children:"• Report any discrepancies immediately"}),t.jsx("p",{children:"• Keep for tax and accounting purposes"})]})]}),e[252]=Dt):Dt=e[252];let Ee;e[253]!==Ae?(Ee=t.jsx("div",{className:"mt-8 no-print",children:t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[Ae,Ct,Dt]})}),e[253]=Ae,e[254]=Ee):Ee=e[254];let Ce;e[255]!==Re||e[256]!==Ee||e[257]!==T?(Ce=t.jsx("div",{className:"min-h-screen bg-gradient-to-br from-gray-50 to-gray-100",children:t.jsxs("div",{className:"container mx-auto px-4 py-8",children:[T,Ye,Re,Ee]})}),e[255]=Re,e[256]=Ee,e[257]=T,e[258]=Ce):Ce=e[258];let Fe;e[259]!==g||e[260]!==Ce||e[261]!==Ot?(Fe=t.jsx(xs,{title:Ot,breadcrumbs:g,children:Ce}),e[259]=g,e[260]=Ce,e[261]=Ot,e[262]=Fe):Fe=e[262];let Bt;return e[263]!==Fe||e[264]!==f?(Bt=t.jsxs(t.Fragment,{children:[f,Fe]}),e[263]=Fe,e[264]=f,e[265]=Bt):Bt=e[265],Bt}function Is(e){return t.jsxs("tr",{className:"hover:bg-gray-50",children:[t.jsxs("td",{className:"py-4 px-6",children:[t.jsx("div",{className:"font-medium text-gray-900",children:e.fee_name}),e.fee_code&&t.jsx("div",{className:"mt-1",children:t.jsx(De,{variant:"outline",className:"text-xs bg-gray-100",children:e.fee_code})}),e.description&&t.jsx("div",{className:"mt-2 text-sm text-gray-600",children:e.description})]}),t.jsx("td",{className:"py-4 px-6 text-right font-mono font-medium",children:Mt(e.base_amount)}),t.jsx("td",{className:"py-4 px-6 text-right font-mono",children:e.surcharge>0?t.jsx("span",{className:"text-amber-700 font-medium",children:Mt(e.surcharge)}):t.jsx("span",{className:"text-gray-400",children:"-"})}),t.jsx("td",{className:"py-4 px-6 text-right font-mono",children:e.penalty>0?t.jsx("span",{className:"text-red-700 font-medium",children:Mt(e.penalty)}):t.jsx("span",{className:"text-gray-400",children:"-"})}),t.jsx("td",{className:"py-4 px-6 text-right font-mono font-bold text-gray-900",children:Mt(e.total_amount)})]},e.id)}function As(e){const s=["","Thousand","Million","Billion"],r=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],n=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],x=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];if(e===0)return"Zero Pesos";let c="",m=Math.floor(e),d=0;for(;m>0;){let a=m%1e3;if(a!==0){let i="";a>=100&&(i=r[Math.floor(a/100)]+" Hundred ",a=a%100),a>=20?(i=i+(x[Math.floor(a/10)]+" "),a=a%10,a>0&&(i=i+(r[a]+" "))):a>=10?i=i+(n[a-10]+" "):a>0&&(i=i+(r[a]+" ")),i=i+(s[d]+" "),c=i+c}m=Math.floor(m/1e3),d++}c=c.trim();const l=Math.round(e%1*100);let o="";return l>0&&(l>=20?(o=""+x[Math.floor(l/10)],l%10>0&&(o=o+(" "+r[l%10]))):l>=10?o=""+n[l-10]:l>0&&(o=""+r[l])),`${c} Pesos${l>0?` and ${o} Centavos`:""} Only`}function Es(e){return e==="resident"?t.jsx(Rs,{className:"h-4 w-4"}):t.jsx(Ns,{className:"h-4 w-4"})}function Cs(e){switch(e){case"cash":return"bg-green-50 text-green-700 border-green-200";case"gcash":return"bg-blue-50 text-blue-700 border-blue-200";case"maya":return"bg-purple-50 text-purple-700 border-purple-200";case"online":return"bg-cyan-50 text-cyan-700 border-cyan-200";case"bank":return"bg-indigo-50 text-indigo-700 border-indigo-200";case"check":return"bg-amber-50 text-amber-700 border-amber-200";default:return"bg-gray-50 text-gray-700 border-gray-200"}}function Fs(e){switch(e){case"cash":return t.jsx(gs,{className:"h-4 w-4"});case"gcash":case"maya":case"online":return t.jsx(ss,{className:"h-4 w-4"});case"bank":return t.jsx(Ps,{className:"h-4 w-4"});case"check":return t.jsx(ks,{className:"h-4 w-4"});default:return t.jsx(ss,{className:"h-4 w-4"})}}function Ds(e){return e.remove()}export{Nr as default};
