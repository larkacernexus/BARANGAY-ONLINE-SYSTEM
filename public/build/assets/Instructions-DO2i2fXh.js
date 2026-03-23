import{c as q,j as e,a as se,r as y,S as ie,x as P}from"./app-CJA2CJ-O.js";import{A as de}from"./admin-app-layout-CyGjd-SB.js";import{P as ne}from"./printer-ChXCvfBv.js";import{E as le}from"./earth-CtH0bdno.js";import{U as W,F as Y,c as X,C as V,E as oe,a as ce,Z}from"./zap-BusV_gTH.js";import{e as J,d as _,S as xe,c as $,V as ee,a as me,b as u,f as ge}from"./use-mobile-navigation-C4jHJMNa.js";import{S as te}from"./breadcrumbs-DAyYl91y.js";import{K}from"./keyboard-N6j-d7EL.js";import{B as pe}from"./book-open-7cnx_U79.js";import{C as I}from"./index-DjMZT7QU.js";import{S as he}from"./share-2-BdcDJkQ2.js";import{C as be}from"./chevron-left-Cp61l76p.js";import{S as M}from"./shield-DmwrWQjH.js";import{T as ye}from"./triangle-alert-ChUdhr1z.js";import"./app-kPDqszAC.js";import"./createLucideIcon-DITSAAMQ.js";import"./house-T3E5Np-v.js";import"./briefcase-CJHD1fip.js";import"./megaphone-B14aN7gt.js";import"./key-Dz-yeoyW.js";import"./link-CQU7Paud.js";import"./history-D-BqYtd2.js";import"./octagon-alert-BlEPGms5.js";import"./monitor-DcdVou_R.js";import"./database-D-JovRjY.js";import"./file-type-BOEdBs47.js";import"./tag-BSMnUdvu.js";import"./palette-DA_9ubYs.js";import"./index-ikzcNs2d.js";import"./mail--cnqGh9c.js";import"./funnel-x9N-9mnR.js";import"./info-D8csLNKP.js";import"./loader-circle-B_idytKc.js";import"./index-D75nDeoL.js";const ue=f=>{const a=q.c(12),{sections:i,selectedSection:n,faqItems:o,shortcuts:h}=f;let b;a[0]!==i||a[1]!==n?(b=i.find(w=>w.id===n)||i[0],a[0]=i,a[1]=n,a[2]=b):b=a[2];const k=b;let R;a[3]!==o||a[4]!==i||a[5]!==k||a[6]!==n||a[7]!==h?(R=()=>{const w=window.open("","_blank");if(!w)return;const E=()=>{let r="";return r=r+`
        <div class="print-header">
          <h1>Barangay Kibawe Management System</h1>
          <div class="subtitle">Complete User Guide</div>
          <div class="header-badge">Version 2.0</div>
        </div>

        <div class="metadata-section">
          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="metadata-label">Generated:</span>
              <span class="metadata-value">${new Date().toLocaleDateString()}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Time:</span>
              <span class="metadata-value">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Document Type:</span>
              <span class="metadata-value">${n!=="overview"?"Section Guide":"Full Guide"}</span>
            </div>
          </div>
        </div>

        <div class="stats-container">
          <h2>System Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">5,234</div>
              <div class="stat-label">Active Residents</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">1,245</div>
              <div class="stat-label">Households</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">156</div>
              <div class="stat-label">Clearances Today</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">₱45.2K</div>
              <div class="stat-label">Today's Collection</div>
            </div>
          </div>
        </div>
      `,r=r+`
        <div class="toc-section">
          <h2>Table of Contents</h2>
          <div class="toc-grid">
      `,i.forEach((m,S)=>{r=r+`
          <div class="toc-item">
            <span class="toc-number">${(S+1).toString().padStart(2,"0")}</span>
            <div class="toc-details">
              <div class="toc-title">${m.title}</div>
              <div class="toc-description">${m.description}</div>
            </div>
          </div>
        `}),r=r+`
          </div>
        </div>
      `,n!=="overview"&&k?r=r+`
          <div class="section">
            <h2>${k.title}</h2>
            <div class="section-description">${k.description}</div>
            <div class="section-content">
              ${j(k.content)}
            </div>
          </div>
        `:i.forEach((m,S)=>{r=r+`
            <div class="section">
              <h2>${S+1}. ${m.title}</h2>
              <div class="section-description">${m.description}</div>
              <div class="section-content">
                ${j(m.content)}
              </div>
            </div>
          `,m.id==="faq"&&(r=r+`
              <div class="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div class="faq-grid">
            `,o.forEach((C,B)=>{r=r+`
                <div class="faq-item">
                  <div class="faq-question">Q${B+1}: ${C.question}</div>
                  <div class="faq-answer">${C.answer}</div>
                </div>
              `}),r=r+`
                </div>
              </div>
            `),m.id==="shortcuts"&&(r=r+`
              <div class="shortcuts-section">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-grid">
            `,h.forEach(C=>{r=r+`
                <div class="shortcut-item">
                  <span class="shortcut-key">${C.key}</span>
                  <span class="shortcut-description">${C.description}</span>
                </div>
              `}),r=r+`
                </div>
              </div>
            `)}),r=r+`
        <div class="tips-section">
          <h2>Quick Tips & Best Practices</h2>
          <div class="tips-grid">
            <div class="tip-item">✓ Use keyboard shortcuts to speed up common tasks</div>
            <div class="tip-item">✓ Regular data backup ensures information safety</div>
            <div class="tip-item">✓ Verify resident information before issuing clearances</div>
            <div class="tip-item">✓ Daily reconciliation of collections is recommended</div>
            <div class="tip-item">✓ Review audit logs periodically for security</div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-content">
            <div class="footer-copyright">
              © ${new Date().getFullYear()} Barangay Kibawe. All rights reserved.
            </div>
            <div class="footer-doc-id">
              Document ID: ${Math.random().toString(36).substring(2,15).toUpperCase()}
            </div>
          </div>
        </div>
      `,r},j=r=>{if(typeof r=="string")return r;if(typeof r=="number")return r.toString();if(Array.isArray(r))return r.map(j).join("");if(se.isValidElement(r)){const m=r.props;return m.children?j(m.children):""}return""};w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barangay Management System - User Guide</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333;
              background: #fff;
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px 20px;
            }

            /* Header Styles */
            .print-header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }

            .print-header h1 {
              font-size: 42px;
              color: #1e3a8a;
              margin-bottom: 10px;
              font-weight: 700;
            }

            .print-header .subtitle {
              font-size: 18px;
              color: #4b5563;
              margin-bottom: 10px;
            }

            .print-header .header-badge {
              display: inline-block;
              padding: 6px 12px;
              background: #2563eb;
              color: white;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
            }

            /* Metadata Styles */
            .metadata-section {
              background: #f3f4f6;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 30px;
            }

            .metadata-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }

            .metadata-item {
              display: flex;
              flex-direction: column;
            }

            .metadata-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .metadata-value {
              font-size: 16px;
              font-weight: 600;
              color: #1e3a8a;
              margin-top: 4px;
            }

            /* Stats Styles */
            .stats-container {
              margin-bottom: 40px;
            }

            .stats-container h2 {
              font-size: 24px;
              color: #1e3a8a;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }

            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
            }

            .stat-card {
              background: linear-gradient(135deg, #f9fafb, #f3f4f6);
              border-radius: 16px;
              padding: 25px 20px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .stat-value {
              font-size: 36px;
              font-weight: 700;
              color: #1e3a8a;
              margin-bottom: 8px;
            }

            .stat-label {
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            }

            /* TOC Styles */
            .toc-section {
              margin-bottom: 40px;
              page-break-after: avoid;
            }

            .toc-section h2 {
              font-size: 24px;
              color: #1e3a8a;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }

            .toc-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }

            .toc-item {
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 12px;
              background: #f9fafb;
              border-radius: 10px;
            }

            .toc-number {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              background: #2563eb;
              color: white;
              border-radius: 8px;
              font-weight: 600;
            }

            .toc-details {
              flex: 1;
            }

            .toc-title {
              font-weight: 600;
              color: #1e3a8a;
              margin-bottom: 4px;
            }

            .toc-description {
              font-size: 12px;
              color: #6b7280;
            }

            /* Section Styles */
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }

            .section h2 {
              font-size: 28px;
              color: #1e3a8a;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #2563eb;
            }

            .section h3 {
              font-size: 20px;
              color: #374151;
              margin: 20px 0 10px;
            }

            .section-description {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 20px;
              font-style: italic;
            }

            .section-content {
              color: #374151;
            }

            .section-content ul, 
            .section-content ol {
              margin: 15px 0;
              padding-left: 25px;
            }

            .section-content li {
              margin-bottom: 8px;
            }

            .section-content .badge {
              display: inline-block;
              padding: 4px 10px;
              background: #f3f4f6;
              border-radius: 15px;
              font-size: 12px;
              color: #4b5563;
            }

            .section-content .alert {
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
            }

            .section-content .tip {
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              background: #dbeafe;
              border-left: 4px solid #3b82f6;
            }

            /* FAQ Styles */
            .faq-section {
              margin: 30px 0;
            }

            .faq-section h3 {
              font-size: 20px;
              color: #1e3a8a;
              margin-bottom: 20px;
            }

            .faq-grid {
              display: grid;
              gap: 20px;
            }

            .faq-item {
              background: #f9fafb;
              padding: 20px;
              border-radius: 10px;
              border: 1px solid #e5e7eb;
            }

            .faq-question {
              font-weight: 600;
              color: #1e3a8a;
              margin-bottom: 10px;
              font-size: 16px;
            }

            .faq-answer {
              color: #4b5563;
              font-size: 14px;
            }

            /* Shortcuts Styles */
            .shortcuts-section {
              margin: 30px 0;
            }

            .shortcuts-section h3 {
              font-size: 20px;
              color: #1e3a8a;
              margin-bottom: 20px;
            }

            .shortcuts-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }

            .shortcut-item {
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 12px;
              background: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }

            .shortcut-key {
              font-family: 'Courier New', monospace;
              font-weight: 600;
              color: #2563eb;
              background: #dbeafe;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 14px;
              min-width: 100px;
              text-align: center;
            }

            .shortcut-description {
              color: #4b5563;
              font-size: 14px;
            }

            /* Tips Section */
            .tips-section {
              margin: 50px 0;
              page-break-inside: avoid;
            }

            .tips-section h2 {
              font-size: 24px;
              color: #1e3a8a;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }

            .tips-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }

            .tip-item {
              padding: 15px;
              background: #f0fdf4;
              border: 1px solid #86efac;
              border-radius: 8px;
              color: #166534;
              font-size: 14px;
            }

            /* Footer Styles */
            .footer {
              margin-top: 60px;
              padding: 30px 0;
              border-top: 2px solid #e5e7eb;
              text-align: center;
            }

            .footer-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #6b7280;
              font-size: 12px;
            }

            .footer-doc-id {
              font-family: monospace;
              background: #f3f4f6;
              padding: 4px 8px;
              border-radius: 4px;
            }

            /* Table Styles */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }

            th, td {
              border: 1px solid #e5e7eb;
              padding: 12px;
              text-align: left;
            }

            th {
              background: #f3f4f6;
              font-weight: 600;
              color: #374151;
            }

            tr:nth-child(even) {
              background: #f9fafb;
            }

            /* Print-specific styles */
            @media print {
              body {
                padding: 0.5in;
              }

              .no-print {
                display: none !important;
              }

              a {
                text-decoration: none;
                color: #000;
              }

              h1, h2, h3 {
                page-break-after: avoid;
              }

              .section {
                page-break-inside: avoid;
              }

              table, figure {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px; position: sticky; top: 20px; z-index: 100;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              🖨️ Print This Document
            </button>
            <button onclick="window.close()" style="padding: 12px 24px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ✕ Close
            </button>
          </div>

          ${E()}
        </body>
      </html>
    `),w.document.close()},a[3]=o,a[4]=i,a[5]=k,a[6]=n,a[7]=h,a[8]=R):R=a[8];const F=R;let v;a[9]===Symbol.for("react.memo_cache_sentinel")?(v=e.jsx(ne,{className:"h-4 w-4"}),a[9]=v):v=a[9];let N;return a[10]!==F?(N=e.jsxs("button",{onClick:F,className:"flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700",children:[v,"Print Guide"]}),a[10]=F,a[11]=N):N=a[11],N},st=()=>{const[f,a]=y.useState(""),[i,n]=y.useState("overview"),[o,h]=y.useState(["getting-started"]),[b,k]=y.useState("guide"),[R,F]=y.useState(null),[v,N]=y.useState(!1),[w,E]=y.useState(!1),[j,r]=y.useState("pdf"),[m,S]=y.useState(null),C=y.useRef(null),B=s=>{h(d=>d.includes(s)?d.filter(c=>c!==s):[...d,s])},G=(...s)=>s.filter(Boolean).join(" "),ae=()=>{const s=new Date,d=x,c=x.find(l=>l.id===i),T=l=>{if(typeof l=="string")return l;if(typeof l=="number")return l.toString();if(Array.isArray(l))return l.map(T).join("");if(se.isValidElement(l)){const p=l.props;return p.children?T(p.children):""}return""};let t="";return t+="=".repeat(80)+`
`,t+=`                    BARANGAY KIBAWE MANAGEMENT SYSTEM
`,t+=`                         COMPLETE USER GUIDE
`,t+="=".repeat(80)+`

`,t+=`Generated: ${s.toLocaleDateString()} at ${s.toLocaleTimeString()}
`,t+=`Document Type: ${i!=="overview"?"Section Guide":"Full Guide"}
`,t+=`Version: 2.0
`,t+="-".repeat(80)+`

`,t+=`SYSTEM OVERVIEW STATISTICS
`,t+="─".repeat(40)+`
`,t+=`Active Residents: 5,234
`,t+=`Households: 1,245
`,t+=`Clearances Today: 156
`,t+=`Today's Collection: ₱45,200

`,t+=`TABLE OF CONTENTS
`,t+="─".repeat(40)+`
`,d.forEach((l,p)=>{t+=`${(p+1).toString().padStart(2,"0")}. ${l.title}
`,t+=`   ${l.description}
`}),t+=`
`+"=".repeat(80)+`

`,i!=="overview"&&c?(t+=`${c.title}
`,t+="═".repeat(c.title.length)+`

`,t+=`Description: ${c.description}

`,t+=T(c.content)):(d.forEach((l,p)=>{t+=`${p+1}. ${l.title}
`,t+="─".repeat(l.title.length+3)+`
`,t+=`${l.description}

`,t+=T(l.content),l.id==="shortcuts"&&(t+=`
KEYBOARD SHORTCUTS
`,t+="─".repeat(18)+`
`,O.forEach(g=>{t+=`${g.key.padEnd(12)} - ${g.description}
`})),l.id==="faq"&&(t+=`
FREQUENTLY ASKED QUESTIONS
`,t+="─".repeat(26)+`
`,L.forEach((g,z)=>{t+=`
Q${z+1}: ${g.question}
`,t+=`A: ${g.answer}
`})),t+=`
`+"-".repeat(40)+`

`}),t+=`
QUICK TIPS & BEST PRACTICES
`,t+="═".repeat(27)+`
`,t+=`• Use keyboard shortcuts to speed up common tasks
`,t+=`• Regular data backup ensures information safety
`,t+=`• Verify resident information before issuing clearances
`,t+=`• Daily reconciliation of collections is recommended
`,t+=`• Review audit logs periodically for security

`,t+=`VERSION HISTORY
`,t+="═".repeat(14)+`
`,t+=`Version 2.0 (March 2024)
`,t+=`  • Complete system overhaul with modern UI
`,t+=`  • Enhanced security features
`,t+=`  • New reporting capabilities
`,t+=`  • Mobile-responsive design
`,t+=`  • Improved performance and speed

`,t+=`Version 1.5 (January 2024)
`,t+=`  • Added payment tracking system
`,t+=`  • Resident management enhancements
`,t+=`  • Bug fixes and optimizations

`),t+=`
`+"=".repeat(80)+`
`,t+=`                     END OF DOCUMENT
`,t+="=".repeat(80)+`

`,t+=`This document was generated from the Barangay Kibawe Management System.
`,t+=`For support, contact: support@bms-kibawe.gov.ph
`,t+=`Document ID: ${Math.random().toString(36).substring(2,15).toUpperCase()}
`,t},U=async()=>{N(!0),S(null);try{if(j==="text"){const g=ae(),z=new Blob([g],{type:"text/plain;charset=utf-8"}),Q=window.URL.createObjectURL(z),D=document.createElement("a");D.href=Q,D.download=`Barangay_System_Guide_${new Date().toISOString().split("T")[0]}.txt`,document.body.appendChild(D),D.click(),document.body.removeChild(D),window.URL.revokeObjectURL(Q),N(!1),E(!1);return}const s=new URL("/instructions/download",window.location.origin);s.searchParams.append("format",j),i!=="overview"&&i?(s.searchParams.append("section",i),s.searchParams.append("type","section")):s.searchParams.append("type","full");const d=await fetch(s.toString(),{method:"GET",headers:{"X-Requested-With":"XMLHttpRequest",Accept:"application/pdf","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")||""}});if(!d.ok){const g=await d.json().catch(()=>null);throw new Error(g?.error||`Download failed with status: ${d.status}`)}const c=d.headers.get("Content-Disposition");let T=`Barangay_System_Guide_${new Date().toISOString().split("T")[0]}.pdf`;if(c){const g=c.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);g&&g[1]&&(T=g[1].replace(/['"]/g,""))}const t=await d.blob(),l=window.URL.createObjectURL(t),p=document.createElement("a");p.href=l,p.download=T,document.body.appendChild(p),p.click(),document.body.removeChild(p),window.URL.revokeObjectURL(l)}catch(s){console.error("Download error:",s),S(s instanceof Error?s.message:"Failed to download. Please try again."),alert(s instanceof Error?s.message:"Failed to download. Please try again.")}finally{N(!1),E(!1),setTimeout(()=>S(null),5e3)}},x=[{id:"overview",title:"System Overview",icon:le,description:"Complete guide to the Barangay Management System",content:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white",children:[e.jsx("div",{className:"absolute right-0 top-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10"}),e.jsx("div",{className:"absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10"}),e.jsx("h2",{className:"relative text-2xl font-bold",children:"Welcome to Barangay Kibawe Management System"}),e.jsx("p",{className:"relative mt-2 text-blue-100",children:"Your complete digital solution for efficient barangay governance and community service"}),e.jsxs("div",{className:"relative mt-4 flex gap-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-5 w-5"}),e.jsx("span",{children:"Version 2.0"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ce,{className:"h-5 w-5"}),e.jsx("span",{children:"Last Updated: March 2024"})]})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-3",children:[e.jsx("div",{className:"rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30",children:e.jsx(Z,{className:"h-5 w-5 text-blue-600 dark:text-blue-400"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 dark:text-white",children:"Fast Processing"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Reduce clearance processing time by 70%"})]})]})}),e.jsx("div",{className:"rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"rounded-lg bg-green-100 p-2 dark:bg-green-900/30",children:e.jsx(M,{className:"h-5 w-5 text-green-600 dark:text-green-400"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 dark:text-white",children:"Secure & Reliable"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Enterprise-grade security with daily backups"})]})]})}),e.jsx("div",{className:"rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30",children:e.jsx(W,{className:"h-5 w-5 text-purple-600 dark:text-purple-400"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 dark:text-white",children:"User-Friendly"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Intuitive interface for all user levels"})]})]})})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-4",children:[e.jsxs("div",{className:"rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50",children:[e.jsx("div",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"5,234"}),e.jsx("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Active Residents"})]}),e.jsxs("div",{className:"rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50",children:[e.jsx("div",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"1,245"}),e.jsx("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Households"})]}),e.jsxs("div",{className:"rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50",children:[e.jsx("div",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"156"}),e.jsx("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Clearances Today"})]}),e.jsxs("div",{className:"rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50",children:[e.jsx("div",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"₱45.2K"}),e.jsx("div",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Today's Collection"})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-6 dark:border-gray-700",children:[e.jsxs("h3",{className:"mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white",children:[e.jsx(te,{className:"h-5 w-5"}),"System Requirements"]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"mb-2 font-medium text-gray-800 dark:text-gray-300",children:"Minimum Requirements"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{children:"Modern web browser (Chrome 90+, Firefox 88+, Edge 90+)"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{children:"Internet connection (minimum 1 Mbps)"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{children:"4GB RAM for optimal performance"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{children:"Screen resolution: 1280x720 or higher"})]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mb-2 font-medium text-gray-800 dark:text-gray-300",children:"Recommended Setup"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{children:"Chrome/Firefox latest version"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{children:"5+ Mbps internet connection"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{children:"8GB RAM for heavy usage"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(u,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{children:"Dual monitor setup for multitasking"})]})]})]})]})]}),e.jsxs("div",{className:"rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20",children:[e.jsxs("h3",{className:"mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-300",children:[e.jsx(Z,{className:"h-5 w-5"}),"Quick Actions"]}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-4",children:[e.jsxs(P,{href:"/admin/residents/create",className:"flex items-center gap-2 rounded-lg bg-white p-3 text-blue-700 hover:bg-blue-100 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-gray-700",children:[e.jsx(ge,{className:"h-4 w-4"}),e.jsx("span",{children:"Add Resident"})]}),e.jsxs(P,{href:"/admin/clearances/create",className:"flex items-center gap-2 rounded-lg bg-white p-3 text-purple-700 hover:bg-purple-100 dark:bg-gray-900 dark:text-purple-400 dark:hover:bg-gray-700",children:[e.jsx(Y,{className:"h-4 w-4"}),e.jsx("span",{children:"New Clearance"})]}),e.jsxs(P,{href:"/admin/payments/create",className:"flex items-center gap-2 rounded-lg bg-white p-3 text-green-700 hover:bg-green-100 dark:bg-gray-900 dark:text-green-400 dark:hover:bg-gray-700",children:[e.jsx(J,{className:"h-4 w-4"}),e.jsx("span",{children:"Record Payment"})]}),e.jsxs(P,{href:"/admin/reports",className:"flex items-center gap-2 rounded-lg bg-white p-3 text-amber-700 hover:bg-amber-100 dark:bg-gray-900 dark:text-amber-400 dark:hover:bg-gray-700",children:[e.jsx(_,{className:"h-4 w-4"}),e.jsx("span",{children:"Generate Report"})]})]})]})]})},{id:"getting-started",title:"Getting Started",icon:fe,description:"Initial setup and login instructions",content:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"rounded-lg bg-green-50 p-4 dark:bg-green-900/20",children:[e.jsxs("h3",{className:"flex items-center gap-2 text-lg font-semibold text-green-800 dark:text-green-400",children:[e.jsx(u,{className:"h-5 w-5"}),"Prerequisites"]}),e.jsxs("ul",{className:"mt-2 space-y-2 text-green-700 dark:text-green-300",children:[e.jsx("li",{children:"• Valid user account provided by system administrator"}),e.jsx("li",{children:"• Internet connection and modern web browser"}),e.jsx("li",{children:"• User role and permissions assigned"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"mb-3 text-lg font-semibold text-gray-900 dark:text-white",children:"Step 1: Access the System"}),e.jsxs("p",{className:"text-gray-600 dark:text-gray-400",children:["Open your web browser and navigate to: ",e.jsx("code",{className:"rounded bg-gray-100 px-2 py-1 dark:bg-gray-900",children:"https://bms-kibawe.gov.ph"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"mb-3 text-lg font-semibold text-gray-900 dark:text-white",children:"Step 2: Login"}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("p",{className:"mb-2 text-gray-600 dark:text-gray-400",children:"Enter your credentials:"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsxs("li",{children:[e.jsx("span",{className:"font-medium",children:"Username:"})," Your employee ID or email"]}),e.jsxs("li",{children:[e.jsx("span",{className:"font-medium",children:"Password:"})," Initial password provided by admin"]})]}),e.jsxs("div",{className:"mt-3 rounded bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",children:[e.jsx(V,{className:"mr-2 inline h-4 w-4"}),"First-time users will be prompted to change their password."]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"mb-3 text-lg font-semibold text-gray-900 dark:text-white",children:"Step 3: Dashboard Overview"}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"After login, you'll see the main dashboard with key metrics and quick access to common functions."})]})]})},{id:"dashboard",title:"Dashboard",icon:je,description:"Understanding the main dashboard",content:e.jsxs("div",{className:"space-y-6",children:[e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"The dashboard provides a real-time overview of your barangay's key metrics and activities."}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"Dashboard Components"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"Statistics Cards"})," - Quick overview of residents, clearances, payments"]}),e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"Recent Activities"})," - Latest system actions and updates"]}),e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"Charts & Graphs"})," - Visual representation of data trends"]}),e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"Quick Actions"})," - Frequently used functions"]}),e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"Notifications"})," - System alerts and reminders"]})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"Customization Options"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"• Rearrange widgets by dragging"}),e.jsx("li",{children:"• Choose which statistics to display"}),e.jsx("li",{children:"• Set date ranges for charts"}),e.jsx("li",{children:"• Save custom dashboard layouts"})]})]})]}),e.jsxs("div",{className:"rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20",children:[e.jsx("h4",{className:"mb-2 font-medium text-blue-800 dark:text-blue-400",children:"Pro Tip"}),e.jsx("p",{className:"text-sm text-blue-700 dark:text-blue-300",children:"Click on any statistic card to view detailed reports and analytics for that specific metric."})]})]})},{id:"residents",title:"Residents Management",icon:W,description:"Managing resident records",content:e.jsxs("div",{className:"space-y-6",children:[e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Complete resident information management system with advanced search and filtering capabilities."}),e.jsxs("div",{className:"grid gap-6 md:grid-cols-2",children:[e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Adding New Residents"}),e.jsxs("ol",{className:"list-inside list-decimal space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:'Click "Add Resident" button'}),e.jsx("li",{children:"Fill in personal information"}),e.jsx("li",{children:"Upload required documents"}),e.jsx("li",{children:"Assign household"}),e.jsx("li",{children:'Click "Save" to complete'})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Resident Features"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"Advanced Search"})," - Search by name, age, address, etc."]}),e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"Filters"})," - Filter by status, age group, gender"]}),e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"Export"})," - Export resident lists to Excel/PDF"]}),e.jsxs("li",{children:["• ",e.jsx("span",{className:"font-medium",children:"History"})," - Track resident record changes"]})]})]})]}),e.jsxs("div",{className:"rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20",children:[e.jsxs("h4",{className:"mb-2 flex items-center gap-2 font-medium text-yellow-800 dark:text-yellow-400",children:[e.jsx(V,{className:"h-4 w-4"}),"Important Note"]}),e.jsx("p",{className:"text-sm text-yellow-700 dark:text-yellow-300",children:"Resident records are protected by data privacy laws. Only authorized personnel can access sensitive information."})]})]})},{id:"clearances",title:"Barangay Clearances",icon:Y,description:"Processing and managing clearances",content:e.jsxs("div",{className:"space-y-6",children:[e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Streamlined clearance processing system for various types of barangay certifications."}),e.jsxs("div",{className:"grid gap-6",children:[e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Clearance Types"}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-3",children:[e.jsxs("div",{className:"rounded bg-gray-50 p-3 text-center dark:bg-gray-900",children:[e.jsx("div",{className:"font-medium text-gray-900 dark:text-white",children:"Barangay Clearance"}),e.jsx("div",{className:"text-xs text-gray-500 dark:text-gray-400",children:"General purpose"})]}),e.jsxs("div",{className:"rounded bg-gray-50 p-3 text-center dark:bg-gray-900",children:[e.jsx("div",{className:"font-medium text-gray-900 dark:text-white",children:"Business Clearance"}),e.jsx("div",{className:"text-xs text-gray-500 dark:text-gray-400",children:"For business permits"})]}),e.jsxs("div",{className:"rounded bg-gray-50 p-3 text-center dark:bg-gray-900",children:[e.jsx("div",{className:"font-medium text-gray-900 dark:text-white",children:"Indigency"}),e.jsx("div",{className:"text-xs text-gray-500 dark:text-gray-400",children:"For financial assistance"})]})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Processing Steps"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400",children:"1"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-900 dark:text-white",children:"Application"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Resident submits clearance request"})]})]}),e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400",children:"2"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-900 dark:text-white",children:"Verification"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Verify resident information and eligibility"})]})]}),e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400",children:"3"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-900 dark:text-white",children:"Payment"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Process clearance fee payment"})]})]}),e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400",children:"4"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-900 dark:text-white",children:"Printing"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Generate and print clearance"})]})]})]})]})]})]})},{id:"payments",title:"Payments & Collections",icon:J,description:"Managing payments and financial records",content:e.jsxs("div",{className:"space-y-6",children:[e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Comprehensive payment tracking and collection management system."}),e.jsxs("div",{className:"grid gap-6 md:grid-cols-2",children:[e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Payment Types"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"• Clearance Fees"}),e.jsx("li",{children:"• Business Permit Fees"}),e.jsx("li",{children:"• Community Tax"}),e.jsx("li",{children:"• Donations"}),e.jsx("li",{children:"• Other Collections"})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Features"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"• Multiple payment methods (cash, GCash, bank transfer)"}),e.jsx("li",{children:"• Automatic receipt generation"}),e.jsx("li",{children:"• Daily collection reports"}),e.jsx("li",{children:"• Payment history tracking"})]})]})]}),e.jsxs("div",{className:"rounded-lg bg-green-50 p-4 dark:bg-green-900/20",children:[e.jsx("h4",{className:"mb-2 font-medium text-green-800 dark:text-green-400",children:"Daily Closing"}),e.jsx("p",{className:"text-sm text-green-700 dark:text-green-300",children:"End-of-day reconciliation should be completed by all cashiers. The system automatically generates a closing report."})]})]})},{id:"reports",title:"Reports & Analytics",icon:_,description:"Generating and viewing reports",content:e.jsxs("div",{className:"space-y-6",children:[e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Generate comprehensive reports and analyze barangay data."}),e.jsxs("div",{className:"grid gap-6 md:grid-cols-3",children:[e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"Demographic Reports"}),e.jsxs("ul",{className:"space-y-1 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"Population by age group"}),e.jsx("li",{children:"Gender distribution"}),e.jsx("li",{children:"Household statistics"})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"Financial Reports"}),e.jsxs("ul",{className:"space-y-1 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"Daily collections"}),e.jsx("li",{children:"Monthly summaries"}),e.jsx("li",{children:"Annual financial statements"})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"Operational Reports"}),e.jsxs("ul",{className:"space-y-1 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"Clearance issuance"}),e.jsx("li",{children:"Certificate requests"}),e.jsx("li",{children:"Staff performance"})]})]})]}),e.jsxs("div",{className:"rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20",children:[e.jsx("h4",{className:"mb-2 font-medium text-purple-800 dark:text-purple-400",children:"Export Options"}),e.jsx("p",{className:"text-sm text-purple-700 dark:text-purple-300",children:"Reports can be exported in multiple formats: PDF, Excel, CSV, and HTML for further analysis."})]})]})},{id:"users",title:"User Management",icon:ke,description:"Managing system users and roles",content:e.jsxs("div",{className:"space-y-6",children:[e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Control access and permissions for all system users."}),e.jsxs("div",{className:"grid gap-6 md:grid-cols-2",children:[e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"User Roles"}),e.jsxs("ul",{className:"space-y-3 text-sm",children:[e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(M,{className:"h-4 w-4 text-red-500"}),e.jsx("span",{className:"font-medium text-gray-900 dark:text-white",children:"Super Admin"}),e.jsx("span",{className:"text-gray-500 dark:text-gray-400",children:"- Full system access"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(M,{className:"h-4 w-4 text-blue-500"}),e.jsx("span",{className:"font-medium text-gray-900 dark:text-white",children:"Admin"}),e.jsx("span",{className:"text-gray-500 dark:text-gray-400",children:"- Most features except system settings"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(M,{className:"h-4 w-4 text-green-500"}),e.jsx("span",{className:"font-medium text-gray-900 dark:text-white",children:"Encoder"}),e.jsx("span",{className:"text-gray-500 dark:text-gray-400",children:"- Data entry only"})]}),e.jsxs("li",{className:"flex items-center gap-2",children:[e.jsx(M,{className:"h-4 w-4 text-yellow-500"}),e.jsx("span",{className:"font-medium text-gray-900 dark:text-white",children:"Viewer"}),e.jsx("span",{className:"text-gray-500 dark:text-gray-400",children:"- Read-only access"})]})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"User Management Features"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"• Create and edit user accounts"}),e.jsx("li",{children:"• Assign and modify roles"}),e.jsx("li",{children:"• Reset passwords"}),e.jsx("li",{children:"• Enable/disable accounts"}),e.jsx("li",{children:"• View audit logs"})]})]})]}),e.jsxs("div",{className:"rounded-lg bg-red-50 p-4 dark:bg-red-900/20",children:[e.jsxs("h4",{className:"mb-2 flex items-center gap-2 font-medium text-red-800 dark:text-red-400",children:[e.jsx(ye,{className:"h-4 w-4"}),"Security Warning"]}),e.jsx("p",{className:"text-sm text-red-700 dark:text-red-300",children:"Only assign Super Admin role to trusted personnel. Regular review of user permissions is recommended."})]})]})},{id:"settings",title:"System Settings",icon:te,description:"Configuring system preferences",content:e.jsxs("div",{className:"space-y-6",children:[e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Configure and customize the system according to your barangay's needs."}),e.jsxs("div",{className:"grid gap-6 md:grid-cols-2",children:[e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"General Settings"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"• Barangay information"}),e.jsx("li",{children:"• System name and logo"}),e.jsx("li",{children:"• Date and time format"}),e.jsx("li",{children:"• Language preferences"})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Fee Configuration"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"• Clearance fees"}),e.jsx("li",{children:"• Business permit fees"}),e.jsx("li",{children:"• Community tax rates"}),e.jsx("li",{children:"• Other service fees"})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Notification Settings"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"• Email notifications"}),e.jsx("li",{children:"• SMS alerts"}),e.jsx("li",{children:"• System alerts"})]})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-3 font-semibold text-gray-900 dark:text-white",children:"Backup Settings"}),e.jsxs("ul",{className:"space-y-2 text-sm text-gray-600 dark:text-gray-400",children:[e.jsx("li",{children:"• Automatic backup schedule"}),e.jsx("li",{children:"• Backup location"}),e.jsx("li",{children:"• Retention period"})]})]})]}),e.jsxs("div",{className:"rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20",children:[e.jsx("h4",{className:"mb-2 font-medium text-blue-800 dark:text-blue-400",children:"Important"}),e.jsx("p",{className:"text-sm text-blue-700 dark:text-blue-300",children:"Changes to system settings affect all users. Some changes may require system restart."})]})]})},{id:"shortcuts",title:"Keyboard Shortcuts",icon:K,description:"List of all keyboard shortcuts",content:e.jsxs("div",{className:"space-y-6",children:[e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Increase your productivity with these keyboard shortcuts."}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-2",children:[e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Open command palette"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"Ctrl + K"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Create new record"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"Ctrl + N"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Save current form"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"Ctrl + S"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Search"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"Ctrl + F"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Print"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"Ctrl + P"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Export data"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"Ctrl + E"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Open help guide"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"F1"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Close modal/panel"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"Esc"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Show keyboard shortcuts"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"?"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Duplicate record"}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:"Ctrl + D"})]})]}),e.jsxs("div",{className:"rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20",children:[e.jsx("h4",{className:"mb-2 font-medium text-purple-800 dark:text-purple-400",children:"Pro Tip"}),e.jsxs("p",{className:"text-sm text-purple-700 dark:text-purple-300",children:["Press ",e.jsx("kbd",{className:"rounded bg-purple-200 px-2 py-1 font-mono text-xs dark:bg-purple-800",children:"?"})," anywhere in the system to view this shortcuts guide."]})]})]})},{id:"faq",title:"Frequently Asked Questions",icon:X,description:"Common questions and answers",content:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"How do I reset a user password?"}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:'Go to Settings → User Management, select the user, and click "Reset Password". The system will send a password reset link to their email.'})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"What happens if I delete a resident record?"}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"Resident records are soft-deleted by default, meaning they can be restored within 30 days. After 30 days, they are permanently deleted from the system."})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"Can I undo a payment transaction?"}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:'Yes, but only within 24 hours and requires supervisor approval. Go to Payments → Transaction History, find the transaction, and click "Void".'})]}),e.jsxs("div",{className:"rounded-lg border border-gray-200 p-4 dark:border-gray-700",children:[e.jsx("h3",{className:"mb-2 font-semibold text-gray-900 dark:text-white",children:"How often is data backed up?"}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:"The system performs automatic backups daily at 2:00 AM. Manual backups can be initiated anytime from Settings → Backup."})]})]})}],re=[{title:"Getting Started with BMS",duration:"5:30",thumbnail:"/thumbnails/getting-started.jpg",views:"1.2K"},{title:"Resident Management Guide",duration:"8:15",thumbnail:"/thumbnails/residents.jpg",views:"856"},{title:"Processing Clearances",duration:"6:45",thumbnail:"/thumbnails/clearances.jpg",views:"2.1K"},{title:"Payment Collection Tutorial",duration:"4:20",thumbnail:"/thumbnails/payments.jpg",views:"1.5K"}],L=[{question:"How do I reset a user password?",answer:'Go to Settings → User Management, select the user, and click "Reset Password". The system will send a password reset link to their email.'},{question:"What happens if I delete a resident record?",answer:"Resident records are soft-deleted by default, meaning they can be restored within 30 days. After 30 days, they are permanently deleted from the system."},{question:"Can I undo a payment transaction?",answer:'Yes, but only within 24 hours and requires supervisor approval. Go to Payments → Transaction History, find the transaction, and click "Void".'},{question:"How often is data backed up?",answer:"The system performs automatic backups daily at 2:00 AM. Manual backups can be initiated anytime from Settings → Backup."}],O=[{key:"Ctrl + K",description:"Open command palette"},{key:"Ctrl + N",description:"Create new record"},{key:"Ctrl + S",description:"Save current form"},{key:"Ctrl + F",description:"Search"},{key:"Ctrl + P",description:"Print"},{key:"Ctrl + E",description:"Export data"},{key:"F1",description:"Open help guide"},{key:"Esc",description:"Close modal/panel"},{key:"?",description:"Show keyboard shortcuts"},{key:"Ctrl + D",description:"Duplicate record"}],A=x.find(s=>s.id===i)||x[0],H=s=>e.jsx(s,{className:"h-5 w-5"});return e.jsxs(e.Fragment,{children:[e.jsx(ie,{title:"System Instructions - Barangay Kibawe"}),e.jsx(de,{children:e.jsxs("div",{className:"flex-1 space-y-4 p-4 pt-6 md:p-8",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight text-gray-900 dark:text-white",children:"System Instructions"}),e.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"Learn how to use the Barangay Management System effectively"})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("div",{className:"relative w-96",children:[e.jsx(xe,{className:"absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search help articles...",value:f,onChange:s=>a(s.target.value),className:"w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"})]}),e.jsx(ue,{sections:x,selectedSection:i,faqItems:L,shortcuts:O}),e.jsxs("div",{className:"relative",children:[e.jsxs("button",{onClick:()=>E(!w),className:"flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",children:[e.jsx($,{className:"h-4 w-4"}),v?"Generating...":"Download Guide"]}),w&&e.jsx("div",{className:"absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 z-10",children:e.jsxs("div",{className:"p-2",children:[e.jsx("div",{className:"mb-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400",children:"SELECT FORMAT"}),e.jsxs("label",{className:"mb-1 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700",children:[e.jsx("input",{type:"radio",name:"format",value:"pdf",checked:j==="pdf",onChange:s=>r(s.target.value),className:"h-4 w-4 text-blue-600"}),e.jsxs("div",{children:[e.jsx("span",{className:"text-sm font-medium text-gray-900 dark:text-white",children:"PDF Document"}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Best for printing"})]})]}),e.jsxs("label",{className:"mb-1 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700",children:[e.jsx("input",{type:"radio",name:"format",value:"text",checked:j==="text",onChange:s=>r(s.target.value),className:"h-4 w-4 text-blue-600"}),e.jsxs("div",{children:[e.jsx("span",{className:"text-sm font-medium text-gray-900 dark:text-white",children:"Plain Text"}),e.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400",children:"Simple text format"})]})]}),e.jsx("div",{className:"mt-2 border-t border-gray-200 pt-2 dark:border-gray-700",children:e.jsx("button",{onClick:U,disabled:v,className:"w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",children:v?"Generating...":"Download"})})]})}),m&&e.jsxs("div",{className:"absolute right-0 mt-2 w-64 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800",children:[e.jsx(V,{className:"inline h-4 w-4 mr-1"}),m]})]})]})]}),e.jsx("div",{className:"border-b border-gray-200 dark:border-gray-700",children:e.jsx("nav",{className:"-mb-px flex space-x-8",children:[{id:"guide",label:"Guide",icon:pe},{id:"videos",label:"Videos",icon:ee},{id:"faq",label:"FAQ",icon:X},{id:"shortcuts",label:"Shortcuts",icon:K}].map(s=>{const d=s.icon,c=b===s.id;return e.jsxs("button",{onClick:()=>k(s.id),className:G("flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",c?"border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400":"border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"),children:[e.jsx(d,{className:"h-4 w-4"}),s.label]},s.id)})})}),e.jsxs("div",{ref:C,children:[b==="guide"&&e.jsxs("div",{className:"grid grid-cols-12 gap-6",children:[e.jsx("div",{className:"col-span-3",children:e.jsxs("div",{className:"sticky top-20 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900",children:[e.jsx("h3",{className:"mb-3 text-sm font-semibold text-gray-900 dark:text-white",children:"All Sections"}),e.jsx("nav",{className:"space-y-1",children:x.map(s=>{const d=i===s.id;return e.jsxs("button",{onClick:()=>n(s.id),className:G("flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",d?"bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400":"hover:bg-gray-50 dark:hover:bg-gray-700/50"),children:[e.jsx("div",{className:G("mt-0.5 rounded p-1",d?"bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400":"bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400"),children:H(s.icon)}),e.jsxs("div",{className:"flex-1",children:[e.jsx("div",{className:"font-medium",children:s.title}),e.jsx("div",{className:"mt-0.5 text-xs text-gray-500 dark:text-gray-400",children:s.description})]})]},s.id)})}),e.jsxs("div",{className:"mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50",children:[e.jsx("h4",{className:"mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400",children:"Resources"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("button",{onClick:()=>{r("pdf"),U()},className:"flex w-full items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400",children:[e.jsx($,{className:"h-4 w-4"}),"User Manual (PDF)"]}),e.jsxs("button",{onClick:()=>{r("text"),U()},className:"flex w-full items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400",children:[e.jsx($,{className:"h-4 w-4"}),"Quick Reference Card"]})]})]})]})}),e.jsx("div",{className:"col-span-9",children:e.jsxs("div",{className:"rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900",children:[e.jsxs("nav",{className:"mb-4 flex items-center gap-2 text-sm",children:[e.jsx(P,{href:"/admin/dashboard",className:"text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",children:"Home"}),e.jsx(I,{className:"h-4 w-4 text-gray-400"}),e.jsx("span",{className:"font-medium text-gray-900 dark:text-white",children:"Instructions"}),e.jsx(I,{className:"h-4 w-4 text-gray-400"}),e.jsx("span",{className:"text-blue-600 dark:text-blue-400",children:A.title})]}),e.jsxs("div",{className:"mb-6 flex items-start justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30",children:H(A.icon)}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:A.title}),e.jsx("p",{className:"text-gray-600 dark:text-gray-400",children:A.description})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:()=>E(!0),className:"rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700",children:e.jsx($,{className:"h-5 w-5"})}),e.jsx("button",{className:"rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700",children:e.jsx(he,{className:"h-5 w-5"})})]})]}),e.jsx("div",{className:"prose prose-sm max-w-none dark:prose-invert",children:A.content}),e.jsxs("div",{className:"mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700",children:[e.jsxs("button",{onClick:()=>{const s=x.findIndex(d=>d.id===i);s>0&&n(x[s-1].id)},className:"flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",children:[e.jsx(be,{className:"h-4 w-4"}),"Previous: ",x.find((s,d)=>d===x.findIndex(c=>c.id===i)-1)?.title||"None"]}),e.jsxs("button",{onClick:()=>{const s=x.findIndex(d=>d.id===i);s<x.length-1&&n(x[s+1].id)},className:"flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",children:["Next: ",x.find((s,d)=>d===x.findIndex(c=>c.id===i)+1)?.title||"None",e.jsx(I,{className:"h-4 w-4"})]})]})]})})]}),b==="videos"&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Video Tutorials"}),e.jsx("div",{className:"grid gap-6 md:grid-cols-2",children:re.map((s,d)=>e.jsxs("div",{className:"group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900",children:[e.jsxs("div",{className:"relative mb-3 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700",children:[e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsx("div",{className:"rounded-full bg-black/50 p-3 text-white group-hover:bg-black/70",children:e.jsx(ee,{className:"h-6 w-6"})})}),e.jsx("div",{className:"absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white",children:s.duration})]}),e.jsx("h3",{className:"font-semibold text-gray-900 dark:text-white",children:s.title}),e.jsxs("div",{className:"mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400",children:[e.jsx(oe,{className:"h-3 w-3"}),e.jsxs("span",{children:[s.views," views"]})]})]},d))})]}),b==="faq"&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Frequently Asked Questions"}),e.jsx("div",{className:"space-y-4",children:L.map((s,d)=>e.jsxs("div",{className:"rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900",children:[e.jsxs("button",{onClick:()=>B(`faq-${d}`),className:"flex w-full items-center justify-between text-left",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 dark:text-white",children:s.question}),o.includes(`faq-${d}`)?e.jsx(me,{className:"h-5 w-5 text-gray-500"}):e.jsx(I,{className:"h-5 w-5 text-gray-500"})]}),o.includes(`faq-${d}`)&&e.jsx("p",{className:"mt-4 text-gray-600 dark:text-gray-400",children:s.answer})]},d))})]}),b==="shortcuts"&&e.jsxs("div",{className:"space-y-6",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Keyboard Shortcuts"}),e.jsx("div",{className:"grid gap-4 md:grid-cols-2",children:O.map((s,d)=>e.jsxs("div",{className:"flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900",children:[e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:s.description}),e.jsx("kbd",{className:"rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white",children:s.key})]},d))}),e.jsxs("div",{className:"rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20",children:[e.jsxs("h3",{className:"mb-2 flex items-center gap-2 font-medium text-blue-800 dark:text-blue-400",children:[e.jsx(K,{className:"h-4 w-4"}),"Pro Tip"]}),e.jsxs("p",{className:"text-sm text-blue-700 dark:text-blue-400",children:["Press ",e.jsx("kbd",{className:"rounded bg-blue-200 px-2 py-1 font-mono text-xs dark:bg-blue-800",children:"?"})," anywhere in the system to view this shortcuts guide."]})]})]})]})]})})]})},fe=f=>{const a=q.c(3),{className:i}=f;let n;a[0]===Symbol.for("react.memo_cache_sentinel")?(n=e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 10V3L4 14h7v7l9-11h-7z"}),a[0]=n):n=a[0];let o;return a[1]!==i?(o=e.jsx("svg",{className:i,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:n}),a[1]=i,a[2]=o):o=a[2],o},je=f=>{const a=q.c(3),{className:i}=f;let n;a[0]===Symbol.for("react.memo_cache_sentinel")?(n=e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"}),a[0]=n):n=a[0];let o;return a[1]!==i?(o=e.jsx("svg",{className:i,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:n}),a[1]=i,a[2]=o):o=a[2],o},ke=f=>{const a=q.c(4),{className:i}=f;let n,o;a[0]===Symbol.for("react.memo_cache_sentinel")?(n=e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"}),o=e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M18 10l2 2m0 0l2-2m-2 2v6"}),a[0]=n,a[1]=o):(n=a[0],o=a[1]);let h;return a[2]!==i?(h=e.jsxs("svg",{className:i,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[n,o]}),a[2]=i,a[3]=h):h=a[3],h};export{st as default};
