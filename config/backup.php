<?php

return [
    'admin_email' => env('BACKUP_ADMIN_EMAIL'),
    'max_backup_size' => env('BACKUP_MAX_SIZE', '1GB'),
    'retention_days' => env('BACKUP_RETENTION_DAYS', 30),
    'compress_backups' => env('BACKUP_COMPRESS', true),
    'auto_backup' => env('BACKUP_AUTO', false),
    'auto_backup_time' => env('BACKUP_AUTO_TIME', '02:00'),
    'auto_backup_frequency' => env('BACKUP_AUTO_FREQUENCY', 'daily'),
    
    'directories' => [
        'public' => [
            'residents',
            'officials',
            'documents',
            'attachments',
            'signatures',
            'certificates',
            'permits',
            'clearances',
        ],
        'private' => [
            'private-documents',
            'secure-uploads',
            'temp-uploads',
            'financial-records',
        ],
    ],
    
    'exclude' => [
        'node_modules',
        '.git',
        'vendor',
        'storage/framework/cache',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/logs',
    ],
];