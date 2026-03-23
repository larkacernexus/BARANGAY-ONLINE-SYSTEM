import{t as l}from"./index-BG5lK7-p.js";import{S as b}from"./resident-ui-DdYfQzfM.js";import{f}from"./format-COnKHPFw.js";const x=(e,t)=>{if(!e)return"N/A";try{const r=new Date(e);return t?f(r,"MMM dd"):f(r,"MMM dd, yyyy")}catch{return"N/A"}},v=e=>{const t=typeof e=="string"?parseFloat(e):e;return isNaN(t)?"₱0.00":`₱${t.toFixed(2)}`},C=e=>e?e.name:"Clearance",$=(e,t)=>{switch(t){case"all":return e.total_clearances||0;case"pending":return e.pending_clearances||0;case"pending_payment":return e.pending_payment_clearances||0;case"processing":return e.processing_clearances||0;case"approved":return e.approved_clearances||0;case"issued":return e.issued_clearances||0;case"rejected":return e.rejected_clearances||0;case"cancelled":return e.cancelled_clearances||0;default:return 0}},w=e=>b[e]||b.pending,N=e=>{let t=0;return e.forEach(r=>{const s=typeof r.total_amount=="string"?parseFloat(r.total_amount):r.total_amount;isNaN(s)||(t+=s)}),t},k=async(e,t)=>{try{await navigator.clipboard.writeText(e),l.success(t)}catch{l.error("Failed to copy")}},S=(e,t,r,s,i,c,p)=>{if(e.length===0){l.error("No clearance requests to print");return}const n=window.open("","_blank");if(!n){l.error("Please allow popups to print");return}const u=`
    <!DOCTYPE html>
    <html>
    <head>
        <title>My Clearance Requests Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .print-header { margin-bottom: 30px; }
            .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
            .clearance-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .clearance-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
            .clearance-table td { padding: 10px; border: 1px solid #ddd; }
            .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
            .badge-pending { background-color: #fef3c7; color: #92400e; }
            .badge-pending_payment { background-color: #fed7aa; color: #9a3412; }
            .badge-processing { background-color: #dbeafe; color: #1e40af; }
            .badge-approved { background-color: #d1fae5; color: #065f46; }
            .badge-issued { background-color: #e9d5ff; color: #6b21a8; }
            .badge-rejected { background-color: #fee2e2; color: #991b1b; }
            .badge-cancelled { background-color: #f3f4f6; color: #374151; }
            .badge-normal { background-color: #dbeafe; color: #1e40af; }
            .badge-rush { background-color: #fed7aa; color: #9a3412; }
            .badge-express { background-color: #fee2e2; color: #991b1b; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="print-header">
            <h1>My Clearance Requests Report</h1>
            <div class="print-info">
                <div>
                    <p><strong>Generated:</strong> ${new Date().toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                    <p><strong>Total Requests:</strong> ${e.length}</p>
                    <p><strong>Status:</strong> ${t==="all"?"All":t.charAt(0).toUpperCase()+t.slice(1)}</p>
                </div>
                <div>
                    <p><strong>Household:</strong> ${r?.household_number||"N/A"}</p>
                    <p><strong>Head of Family:</strong> ${r?.head_of_family||"N/A"}</p>
                    <p><strong>Total Fees:</strong> ${c(s.total_fees)}</p>
                </div>
            </div>
        </div>
        
        <table class="clearance-table">
            <thead>
                <tr>
                    <th>Reference No.</th>
                    <th>Type</th>
                    <th>Purpose</th>
                    <th>Date Requested</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Fee</th>
                </tr>
            </thead>
            <tbody>
                ${e.map(a=>`
                    <tr>
                        <td>${a.reference_number}</td>
                        <td>${p(a.clearance_type)}</td>
                        <td>${a.purpose}</td>
                        <td>${i(a.created_at,!1)}</td>
                        <td><span class="badge badge-${a.urgency}">${a.urgency.toUpperCase()}</span></td>
                        <td><span class="badge badge-${a.status}">${a.status.replace("_"," ").toUpperCase()}</span></td>
                        <td>${c(a.fee_amount)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
        
        <div class="footer">
            <p>Generated from Barangay Management System</p>
            <p>Page 1 of 1</p>
        </div>
    </body>
    </html>
  `;n.document.write(u),n.document.close(),n.focus(),n.print(),n.close()},R=(e,t,r,s,i,c,p)=>{if(e.length===0){p.error("No clearance requests to export");return}c(!0),setTimeout(()=>{const n=["Reference No.","Clearance Number","Type","Purpose","Specific Purpose","Status","Urgency","Fee","Date Requested","Needed Date","Issue Date","Valid Until"],u=e.map(o=>[o.reference_number,o.clearance_number||"N/A",i(o.clearance_type),`"${(o.purpose||"").replace(/"/g,'""')}"`,`"${(o.specific_purpose||"").replace(/"/g,'""')}"`,o.status.replace("_"," ").toUpperCase(),o.urgency.toUpperCase(),s(o.fee_amount),r(o.created_at,!1),r(o.needed_date,!1),o.issue_date?r(o.issue_date,!1):"Not issued",o.valid_until?r(o.valid_until,!1):"N/A"]),a=[n.join(","),...u.map(o=>o.join(","))].join(`
`),m=new Blob([a],{type:"text/csv;charset=utf-8;"}),d=document.createElement("a"),g=URL.createObjectURL(m);d.setAttribute("href",g),d.setAttribute("download",`clearance_requests_${t}_${new Date().toISOString().split("T")[0]}.csv`),d.style.visibility="hidden",document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(g),c(!1),p.success("CSV file downloaded successfully")},500)};export{x as a,C as b,k as c,w as d,R as e,v as f,$ as g,N as h,S as p};
