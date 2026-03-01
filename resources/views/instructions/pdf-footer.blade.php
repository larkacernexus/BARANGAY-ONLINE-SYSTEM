<!DOCTYPE html>
<html>
<head>
    <style>
        .footer {
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #666;
            padding: 10px 0;
            border-top: 1px solid #e5e7eb;
        }
        .page-number:before {
            content: "Page " counter(page);
        }
    </style>
</head>
<body>
    <div class="footer">
        <span class="page-number"></span>
    </div>
</body>
</html>