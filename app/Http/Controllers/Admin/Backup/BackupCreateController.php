<?php

namespace App\Http\Controllers\Admin\Backup;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use ZipArchive;

class BackupCreateController extends BaseBackupController
{
    public function create(Request $request)
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(600);

        Log::info('BackupCreateController@create - Starting backup creation', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'backup_type' => $request->type,
            'description' => $request->description,
        ]);
        
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:database,files,full',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->route('backup.index')
                ->withErrors($validator)
                ->withInput();
        }

        try {
            $result = $this->performBackup($request->type, $request->description);
            
            activity()
                ->causedBy(auth()->user())
                ->withProperties([
                    'type' => $request->type,
                    'filename' => basename($result['zipPath']),
                    'size' => $result['zipSize'],
                ])
                ->log('Created backup');

            Log::info('BackupCreateController@create - Backup created successfully', [
                'backup_type' => $request->type,
                'filename' => basename($result['zipPath']),
                'size_bytes' => $result['zipSize'],
                'size_human' => $this->formatBytes($result['zipSize']),
            ]);

            return redirect()->route('backup.index')
                ->with('success', 'Backup created successfully!');

        } catch (\Exception $e) {
            Log::error('BackupCreateController@create - Backup failed', [
                'user_id' => auth()->id(),
                'backup_type' => $request->type ?? 'unknown',
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
            ]);
            
            return redirect()->route('backup.index')
                ->with('error', 'Backup failed: ' . $e->getMessage());
        }
    }

    private function performBackup($type, $description)
    {
        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $backupName = "backup_{$type}_{$timestamp}";
        
        $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'laravel_backup_' . uniqid();
        $backupPath = $tempDir . DIRECTORY_SEPARATOR . $backupName;
        
        if (!File::exists($backupPath)) {
            File::makeDirectory($backupPath, 0755, true, true);
        }

        if ($type === 'database' || $type === 'full') {
            $this->backupDatabase($backupPath, $backupName);
        }

        if ($type === 'files' || $type === 'full') {
            $this->backupFiles($backupPath);
        }

        $this->createManifest($backupPath, [
            'name' => $backupName,
            'type' => $type,
            'description' => $description,
            'created_at' => Carbon::now()->toDateTimeString(),
            'database_size' => $this->getDatabaseSize(),
            'files_size' => $this->getFilesSize(),
            'total_size' => 0,
        ]);

        $this->validateBackupDirectory($backupPath, $type);

        $zipPath = $this->createZip($backupPath, $backupName);
        $zipSize = File::size($zipPath);
        
        if (!$this->verifyBackup($zipPath)) {
            Log::warning('Backup verification failed but continuing');
        }
        
        $this->cleanupDirectory($tempDir);

        return ['zipPath' => $zipPath, 'zipSize' => $zipSize];
    }

    private function backupDatabase($path, $name)
    {
        $database = config('database.connections.mysql.database');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port', '3306');
        
        $sqlFile = $path . DIRECTORY_SEPARATOR . 'database.sql';
        
        $mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        
        if (!File::exists($mysqldumpPath)) {
            throw new \Exception('mysqldump.exe not found at: ' . $mysqldumpPath);
        }
        
        $command = sprintf(
            '"%s" --host=%s --user=%s --result-file="%s" %s',
            $mysqldumpPath,
            escapeshellarg($host),
            escapeshellarg($username),
            escapeshellarg($sqlFile),
            escapeshellarg($database)
        );
        
        if (!empty($password)) {
            $command = sprintf(
                '"%s" --host=%s --user=%s --password=%s --result-file="%s" %s',
                $mysqldumpPath,
                escapeshellarg($host),
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($sqlFile),
                escapeshellarg($database)
            );
        }
        
        $output = [];
        $returnVar = 0;
        
        exec($command . ' 2>&1', $output, $returnVar);
        
        if ($returnVar !== 0) {
            throw new \Exception('Database backup failed');
        }
        
        if (!File::exists($sqlFile) || File::size($sqlFile) === 0) {
            $this->exportDatabaseAsJson($path);
        }
        
        $this->exportDatabaseAsJson($path);
    }

    private function exportDatabaseAsJson($path)
    {
        try {
            $tables = DB::select('SHOW TABLES');
            $databaseName = config('database.connections.mysql.database');
            $tablesKey = 'Tables_in_' . $databaseName;
            
            $databaseData = [];
            
            foreach ($tables as $table) {
                $tableName = $table->$tablesKey;
                if ($tableName === 'migrations') continue;
                
                $databaseData[$tableName] = DB::table($tableName)->get();
            }
            
            $jsonContent = json_encode($databaseData, JSON_PRETTY_PRINT);
            File::put($path . DIRECTORY_SEPARATOR . 'database.json', $jsonContent);
            
        } catch (\Exception $e) {
            Log::warning('JSON backup failed: ' . $e->getMessage());
        }
    }

    private function backupFiles($path)
    {
        $totalFiles = 0;
        $totalSize = 0;
        
        $projectPath = dirname(storage_path());
        
        // Storage directory
        $storageSource = storage_path();
        $storageDest = $path . DIRECTORY_SEPARATOR . 'storage';
        
        if (strpos($storageDest, $storageSource) === 0) {
            throw new \Exception('Cannot backup storage into itself - recursion detected');
        }
        
        if (!File::exists($storageDest)) {
            File::makeDirectory($storageDest, 0755, true, true);
        }
        
        $importantDirs = [
            'app/public' => 'app/public',
            'framework' => 'framework',
            'logs' => 'logs',
        ];
        
        foreach ($importantDirs as $sourceDir => $destRelative) {
            $fullSource = $storageSource . DIRECTORY_SEPARATOR . $sourceDir;
            $fullDest = $storageDest . DIRECTORY_SEPARATOR . $destRelative;
            
            if (File::exists($fullSource)) {
                if (!File::exists(dirname($fullDest))) {
                    File::makeDirectory(dirname($fullDest), 0755, true, true);
                }
                File::copyDirectory($fullSource, $fullDest);
            }
        }
        
        // Public directory
        $publicSource = public_path();
        $publicDest = $path . DIRECTORY_SEPARATOR . 'public';
        
        if (File::exists($publicSource) && strpos($publicDest, $publicSource) !== 0) {
            if (!File::exists($publicDest)) {
                File::makeDirectory($publicDest, 0755, true, true);
            }
            File::copyDirectory($publicSource, $publicDest);
        }
        
        // .env file
        $envSource = base_path('.env');
        $envDest = $path . DIRECTORY_SEPARATOR . '.env';
        if (File::exists($envSource)) {
            File::copy($envSource, $envDest);
        }
        
        // Config directory
        $configSource = config_path();
        $configDest = $path . DIRECTORY_SEPARATOR . 'config';
        if (File::exists($configSource) && !File::exists($configDest)) {
            File::makeDirectory($configDest, 0755, true, true);
            File::copyDirectory($configSource, $configDest);
        }
    }

    private function createManifest($path, $data)
    {
        $manifest = [
            'backup' => $data,
            'system' => [
                'laravel_version' => app()->version(),
                'php_version' => phpversion(),
                'mysql_version' => $this->getMysqlVersion(),
                'app_name' => config('app.name'),
                'environment' => app()->environment(),
            ],
            'statistics' => [
                'users_count' => \App\Models\User::count(),
                'residents_count' => \App\Models\Resident::count(),
                'households_count' => \App\Models\Household::count(),
            ],
        ];

        File::put(
            $path . DIRECTORY_SEPARATOR . 'manifest.json',
            json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }

    private function createZip($sourcePath, $zipName)
    {
        $backupDir = $this->getBackupPath();
        $zipFilePath = $backupDir . DIRECTORY_SEPARATOR . $zipName . '.zip';
        
        if (File::exists($zipFilePath)) {
            File::delete($zipFilePath);
        }
        
        $zip = new ZipArchive;
        $zipOpenResult = $zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        
        if ($zipOpenResult !== TRUE) {
            throw new \Exception('Could not create ZIP file. Error code: ' . $zipOpenResult);
        }
        
        $fileCount = 0;
        $totalSize = 0;
        
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($sourcePath, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        foreach ($files as $file) {
            if ($file->isFile()) {
                $filePath = $file->getRealPath();
                $relativePath = str_replace('\\', '/', substr($filePath, strlen($sourcePath) + 1));
                
                if ($zip->addFile($filePath, $relativePath)) {
                    $fileCount++;
                    $totalSize += $file->getSize();
                }
            }
        }
        
        if (!$zip->close()) {
            throw new \Exception('Failed to close ZIP file');
        }
        
        usleep(100000);
        
        if (!File::exists($zipFilePath) || File::size($zipFilePath) === 0) {
            throw new \Exception('ZIP file was not created or is empty');
        }
        
        return $zipFilePath;
    }

    private function validateBackupDirectory($path, $type)
    {
        if (!File::exists($path) || !File::isDirectory($path)) {
            throw new \Exception('Backup directory does not exist');
        }
        
        $manifestPath = $path . DIRECTORY_SEPARATOR . 'manifest.json';
        if (!File::exists($manifestPath)) {
            throw new \Exception('Missing manifest.json');
        }
        
        $manifestContent = File::get($manifestPath);
        json_decode($manifestContent, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Manifest file contains invalid JSON');
        }
        
        match ($type) {
            'database' => $this->validateDatabaseBackup($path),
            'files' => $this->validateFilesBackup($path),
            'full' => $this->validateFullBackup($path),
            default => null,
        };
    }

    private function validateDatabaseBackup($path)
    {
        $sqlPath = $path . DIRECTORY_SEPARATOR . 'database.sql';
        $jsonPath = $path . DIRECTORY_SEPARATOR . 'database.json';
        if (!File::exists($sqlPath) && !File::exists($jsonPath)) {
            throw new \Exception('No database backup found');
        }
    }

    private function validateFilesBackup($path)
    {
        $hasStorage = File::exists($path . DIRECTORY_SEPARATOR . 'storage');
        $hasPublic = File::exists($path . DIRECTORY_SEPARATOR . 'public');
        $hasEnv = File::exists($path . DIRECTORY_SEPARATOR . '.env');
        
        if (!$hasStorage && !$hasPublic && !$hasEnv) {
            throw new \Exception('No files backup found');
        }
    }

    private function validateFullBackup($path)
    {
        $hasDatabase = File::exists($path . DIRECTORY_SEPARATOR . 'database.sql') || 
                       File::exists($path . DIRECTORY_SEPARATOR . 'database.json');
        $hasStorage = File::exists($path . DIRECTORY_SEPARATOR . 'storage');
        $hasPublic = File::exists($path . DIRECTORY_SEPARATOR . 'public');
        
        if (!$hasDatabase && !$hasStorage && !$hasPublic) {
            throw new \Exception('No backup content found');
        }
    }

    private function verifyBackup($zipPath)
    {
        if (!File::exists($zipPath)) {
            return false;
        }
        
        $zip = new ZipArchive;
        $result = $zip->open($zipPath);
        
        if ($result !== TRUE) {
            return false;
        }
        
        $hasManifest = false;
        $hasContent = false;
        $fileCount = $zip->numFiles;
        
        for ($i = 0; $i < $fileCount; $i++) {
            $filename = $zip->getNameIndex($i);
            if ($filename === false) continue;
            
            if (strpos($filename, 'manifest.json') !== false) $hasManifest = true;
            if (strpos($filename, 'database.') !== false || 
                strpos($filename, 'storage/') !== false || 
                strpos($filename, 'public/') !== false ||
                strpos($filename, '.env') !== false) $hasContent = true;
        }
        
        $zip->close();
        
        return $hasManifest && $hasContent && $fileCount > 0;
    }
}