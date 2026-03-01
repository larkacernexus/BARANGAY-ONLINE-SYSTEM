<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #000;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #000;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        h2 {
            color: #000;
            margin-top: 30px;
            border-left: 5px solid #000;
            padding-left: 15px;
        }
        h3 {
            color: #000;
            margin-top: 20px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f0f0f0;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border: 1px solid #000;
            font-size: 12px;
        }
        .alert {
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #000;
            background: #f9f9f9;
        }
        .tip {
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #000;
            background: #f0f0f0;
        }
        .card {
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #000;
        }
        .page-break {
            page-break-before: always;
        }
        .no-print {
            display: none;
        }
        a {
            text-decoration: none;
            color: #000;
        }
        kbd {
            border: 1px solid #000;
            border-radius: 3px;
            padding: 2px 5px;
            font-family: monospace;
            background: #f0f0f0;
        }
        @media print {
            .page-break {
                page-break-before: always;
            }
            h1, h2, h3 {
                page-break-after: avoid;
            }
            table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="no-print" style="text-align: right; margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #000; color: white; border: none; cursor: pointer;">
            Print
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; cursor: pointer; margin-left: 10px;">
            Close
        </button>
    </div>

    <h1>{{ $title }}</h1>
    <p>Generated on: {{ $date }}</p>

    @if($section === 'all')
        @foreach($sections as $key => $sectionData)
            <div class="card">
                <h2>{{ $sectionData['title'] }}</h2>
                <p>{{ $sectionData['description'] }}</p>
                
                @include('pdf.partials.' . $key, ['content' => $sectionData['content']])
            </div>
            
            @if(!$loop->last)
                <div class="page-break"></div>
            @endif
        @endforeach
    @elseif(isset($sections[$section]))
        <div class="card">
            <h2>{{ $sections[$section]['title'] }}</h2>
            <p>{{ $sections[$section]['description'] }}</p>
            
            @include('pdf.partials.' . $section, ['content' => $sections[$section]['content']])
        </div>
    @endif

    <div style="text-align: center; margin-top: 50px; border-top: 1px solid #000; padding-top: 20px;">
        <p>© {{ date('Y') }} Barangay Kibawe</p>
    </div>
</body>
</html>