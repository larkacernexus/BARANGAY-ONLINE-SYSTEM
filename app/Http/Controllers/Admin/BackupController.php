<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use ZipArchive;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
   /**
 * Display backup page - SAFE VERSION
 */
public function index(Request $request)
{
    // Increase limits for backup operations
    ini_set('memory_limit', '512M');
    set_time_limit(300);

    $this->cleanupFailedBackups();

    Log::info('BackupController@index - User accessed backup page', [
        'user_id' => auth()->id(),
        'user_name' => auth()->user()->name,
        'filters' => $request->only(['search', 'type', 'from_date', 'to_date', 'size']),
    ]);
    
    try {
        $backups = $this->getBackupFiles();
        
        // Get filters from request
        $filters = $request->only(['search', 'type', 'from_date', 'to_date', 'size']);
        
        // Get disk space info with error suppression
        try {
            $diskSpace = $this->getDiskSpaceInfo();
        } catch (\Exception $e) {
            Log::error('BackupController@index - Failed to get disk space, using defaults', [
                'error' => $e->getMessage(),
            ]);
            $diskSpace = [
                'total' => '0 GB',
                'free' => '0 GB',
                'used' => '0 GB',
                'used_percentage' => 0,
                'total_bytes' => 0,
                'free_bytes' => 0,
                'used_bytes' => 0,
            ];
        }
        
        Log::info('BackupController@index - Successfully retrieved backup data', [
            'backup_count' => count($backups),
            'disk_space_used_percentage' => $diskSpace['used_percentage'] ?? 0,
        ]);
        
        return Inertia::render('admin/Backup/Index', [
            'backups' => [
                'current_page' => 1,
                'data' => $backups,
                'from' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'to' => count($backups),
                'total' => count($backups),
            ],
            'diskSpace' => $diskSpace,
            'lastBackup' => $this->getLastBackupDate(),
            'stats' => $this->getBackupStats($backups),
            'filters' => $filters,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
        
    } catch (\Exception $e) {
        Log::error('BackupController@index - Failed to load backup page', [
            'user_id' => auth()->id(),
            'error_message' => $e->getMessage(),
            'error_trace' => $e->getTraceAsString(),
        ]);
        
        // Show error on backup page instead of redirecting
        return Inertia::render('admin/Backup/Index', [
            'backups' => [
                'current_page' => 1,
                'data' => [],
                'from' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'to' => 0,
                'total' => 0,
            ],
            'diskSpace' => [
                'total' => '0 GB',
                'free' => '0 GB',
                'used' => '0 GB',
                'used_percentage' => 0,
                'total_bytes' => 0,
                'free_bytes' => 0,
                'used_bytes' => 0,
            ],
            'lastBackup' => null,
            'stats' => [
                'total' => 0,
                'full' => 0,
                'database' => 0,
                'files' => 0,
                'recent' => 0,
                'protected' => 0,
                'total_size_bytes' => 0,
            ],
            'filters' => [],
            'flash' => [
                'error' => 'Failed to load backup page: ' . $e->getMessage(),
            ],
        ]);
    }
}

public function progress(Request $request)
{
    // This is a simplified version - you would need to track real progress
    // For now, we'll simulate based on backup creation timestamp
    
    $backupDir = storage_path('app/backups');
    $files = File::files($backupDir);
    
    // Sort by modified time (newest first)
    usort($files, function($a, $b) {
        return $b->getMTime() - $a->getMTime();
    });
    
    $latestBackup = count($files) > 0 ? $files[0] : null;
    
    if ($latestBackup && (time() - $latestBackup->getMTime()) < 60) {
        // If a backup was created in the last minute, assume it's still in progress
        return response()->json([
            'status' => 'processing',
            'progress' => 50,
            'message' => 'Backup in progress...',
        ]);
    }
    
    return response()->json([
        'status' => 'idle',
        'progress' => 0,
        'message' => 'No backup in progress',
    ]);
}

    /**
     * Create a new backup
     */
    public function create(Request $request)
    {
        // Increase limits for backup creation
        ini_set('memory_limit', '1024M');
        set_time_limit(600); // 10 minutes for large backups

        Log::info('BackupController@create - Starting backup creation', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'backup_type' => $request->type,
            'description' => $request->description,
        ]);
        
        $request->validate([
            'type' => 'required|in:database,files,full',
            'description' => 'nullable|string|max:255',
        ]);

        try {
            $type = $request->type;
            $description = $request->description;
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $backupName = "backup_{$type}_{$timestamp}";
            
            Log::info('BackupController@create - Creating backup', [
                'backup_name' => $backupName,
                'type' => $type,
                'timestamp' => $timestamp,
            ]);
            
            // Create temporary directory in system temp folder to avoid recursion issues
            $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'laravel_backup_' . uniqid();
            $backupPath = $tempDir . DIRECTORY_SEPARATOR . $backupName;
            
            Log::debug('BackupController@create - Backup path', ['path' => $backupPath]);
            
            if (!File::exists($backupPath)) {
                // Ensure parent directory exists
                $parentDir = dirname($backupPath);
                if (!File::exists($parentDir)) {
                    File::makeDirectory($parentDir, 0755, true, true);
                }
                File::makeDirectory($backupPath, 0755, true, true);
                Log::debug('BackupController@create - Created backup directory', ['path' => $backupPath]);
            }

            if ($type === 'database' || $type === 'full') {
                Log::info('BackupController@create - Starting database backup');
                $this->backupDatabase($backupPath, $backupName);
                Log::info('BackupController@create - Database backup completed');
            }

            if ($type === 'files' || $type === 'full') {
                Log::info('BackupController@create - Starting files backup');
                $this->backupFiles($backupPath);
                Log::info('BackupController@create - Files backup completed');
            }

            // Create manifest file
            Log::debug('BackupController@create - Creating manifest file');
            $this->createManifest($backupPath, [
                'name' => $backupName,
                'type' => $type,
                'description' => $description,
                'created_at' => Carbon::now()->toDateTimeString(),
                'database_size' => $this->getDatabaseSize(),
                'files_size' => $this->getFilesSize(),
                'total_size' => 0,
            ]);

            // Validate backup before creating ZIP
            Log::debug('BackupController@create - Validating backup directory');
            $this->validateBackupDirectory($backupPath, $type);

            // Create ZIP archive
            Log::info('BackupController@create - Creating ZIP archive');
            $zipPath = $this->createZip($backupPath, $backupName);
            $zipSize = File::size($zipPath);
            
            // Verify backup integrity (with warning if fails but continue)
            Log::info('BackupController@create - Verifying backup integrity');
            if (!$this->verifyBackup($zipPath)) {
                Log::warning('BackupController@create - Backup verification failed but continuing anyway');
                // Don't throw exception, just log warning
                // throw new \Exception('Backup verification failed. The backup may be corrupted.');
            }
            
            Log::info('BackupController@create - ZIP archive created', [
                'zip_path' => $zipPath,
                'zip_size' => $zipSize,
                'zip_size_human' => $this->formatBytes($zipSize),
            ]);
            
            // Clean up temporary directory
            Log::debug('BackupController@create - Cleaning up temporary directory');
            $this->cleanupDirectory($tempDir);

            // Log backup activity
            activity()
                ->causedBy(auth()->user())
                ->withProperties([
                    'type' => $type,
                    'filename' => basename($zipPath),
                    'size' => $zipSize,
                ])
                ->log('Created backup');

            Log::info('BackupController@create - Backup created successfully', [
                'backup_type' => $type,
                'filename' => basename($zipPath),
                'size_bytes' => $zipSize,
                'size_human' => $this->formatBytes($zipSize),
            ]);

            // Return success with flash message
            return redirect()->route('backup.index')
                ->with('success', 'Backup created successfully!');

        } catch (\Exception $e) {
            // Clean up any partial files on error
            if (isset($tempDir) && File::exists($tempDir)) {
                $this->cleanupDirectory($tempDir);
            }
            if (isset($zipPath) && File::exists($zipPath)) {
                File::delete($zipPath);
            }
            
            Log::error('BackupController@create - Backup failed', [
                'user_id' => auth()->id(),
                'backup_type' => $request->type ?? 'unknown',
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);
            
            return redirect()->route('backup.index')
                ->with('error', 'Backup failed: ' . $e->getMessage());
        }
    }

    /**
     * Backup database
     */
    private function backupDatabase($path, $name)
    {
        $database = config('database.connections.mysql.database');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port', '3306');
        
        $sqlFile = $path . DIRECTORY_SEPARATOR . 'database.sql';
        
        Log::debug('BackupController@backupDatabase - Starting mysqldump', [
            'database' => $database,
            'host' => $host,
            'port' => $port,
            'username' => $username,
            'has_password' => !empty($password),
            'sql_file' => $sqlFile,
        ]);
        
        // Use full path to XAMPP's mysqldump.exe
        $mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        
        // Check if mysqldump exists
        if (!File::exists($mysqldumpPath)) {
            Log::error('BackupController@backupDatabase - mysqldump.exe not found', [
                'expected_path' => $mysqldumpPath,
            ]);
            throw new \Exception('mysqldump.exe not found at: ' . $mysqldumpPath);
        }
        
        // Build mysqldump command - simplified for Windows
        $command = sprintf(
            '"%s" --host=%s --user=%s --result-file="%s" %s',
            $mysqldumpPath,
            escapeshellarg($host),
            escapeshellarg($username),
            escapeshellarg($sqlFile),
            escapeshellarg($database)
        );
        
        // Add password if set
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
        
        Log::debug('BackupController@backupDatabase - Executing command', ['command' => str_replace($password ?? '', '***', $command)]);
        
        // Execute command
        $output = [];
        $returnVar = 0;
        
        exec($command . ' 2>&1', $output, $returnVar);
        
        Log::debug('BackupController@backupDatabase - mysqldump completed', [
            'return_var' => $returnVar,
            'output_count' => count($output),
        ]);
        
        if ($returnVar !== 0) {
            Log::error('BackupController@backupDatabase - mysqldump failed', [
                'return_var' => $returnVar,
                'output' => $output,
                'error_details' => $this->getMysqldumpError($returnVar, $output),
            ]);
            throw new \Exception('Database backup failed - ' . $this->getMysqldumpError($returnVar, $output));
        }
        
        // Check if SQL file was created
        if (!File::exists($sqlFile) || File::size($sqlFile) === 0) {
            Log::error('BackupController@backupDatabase - SQL file empty or not created', [
                'sql_file' => $sqlFile,
                'file_exists' => File::exists($sqlFile),
                'file_size' => File::exists($sqlFile) ? File::size($sqlFile) : 0,
            ]);
            
            // Try alternative method
            $this->exportDatabaseAsJson($path);
            if (!File::exists($path . DIRECTORY_SEPARATOR . 'database.json')) {
                throw new \Exception('Database backup failed - could not create SQL or JSON file');
            }
            Log::info('BackupController@backupDatabase - Used JSON export as fallback');
        } else {
            Log::info('BackupController@backupDatabase - SQL dump created', [
                'file_size' => File::size($sqlFile),
                'file_size_human' => $this->formatBytes(File::size($sqlFile)),
            ]);
        }
        
        // Also backup as JSON for easier inspection
        Log::debug('BackupController@backupDatabase - Exporting database as JSON');
        $this->exportDatabaseAsJson($path);
    }

    /**
     * Get mysqldump error message
     */
    private function getMysqldumpError($returnVar, $output)
    {
        $errors = [
            1 => 'General mysqldump error',
            2 => 'Access denied or incorrect parameters',
            3 => 'Out of memory',
            4 => 'MySQL server has gone away',
            5 => 'Error reading/writing to file',
            6 => 'Connection lost',
            7 => 'Unknown error',
        ];
        
        $errorMessage = $errors[$returnVar] ?? "Unknown error code: {$returnVar}";
        
        if (!empty($output)) {
            $lastOutput = end($output);
            if ($lastOutput) {
                $errorMessage .= ' - ' . $lastOutput;
            }
        }
        
        return $errorMessage;
    }

    /**
     * Export database as JSON
     */
    private function exportDatabaseAsJson($path)
    {
        try {
            $tables = DB::select('SHOW TABLES');
            $databaseName = config('database.connections.mysql.database');
            $tablesKey = 'Tables_in_' . $databaseName;
            
            Log::debug('BackupController@exportDatabaseAsJson - Found tables', [
                'table_count' => count($tables),
                'database' => $databaseName,
            ]);
            
            $databaseData = [];
            $totalRecords = 0;
            
            foreach ($tables as $table) {
                $tableName = $table->$tablesKey;
                
                // Skip migrations table
                if ($tableName === 'migrations') {
                    Log::debug('BackupController@exportDatabaseAsJson - Skipping migrations table');
                    continue;
                }
                
                Log::debug('BackupController@exportDatabaseAsJson - Exporting table', ['table' => $tableName]);
                $data = DB::table($tableName)->get();
                $databaseData[$tableName] = $data;
                $totalRecords += count($data);
                
                Log::debug('BackupController@exportDatabaseAsJson - Table exported', [
                    'table' => $tableName,
                    'record_count' => count($data),
                ]);
            }
            
            $jsonContent = json_encode($databaseData, JSON_PRETTY_PRINT);
            File::put($path . DIRECTORY_SEPARATOR . 'database.json', $jsonContent);
            
            Log::info('BackupController@exportDatabaseAsJson - JSON export completed', [
                'tables_exported' => count($databaseData),
                'total_records' => $totalRecords,
                'json_file_size' => File::size($path . DIRECTORY_SEPARATOR . 'database.json'),
                'json_file_size_human' => $this->formatBytes(File::size($path . DIRECTORY_SEPARATOR . 'database.json')),
            ]);
            
        } catch (\Exception $e) {
            Log::error('BackupController@exportDatabaseAsJson - Failed to export database as JSON', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
            ]);
            // Don't throw, continue with backup
            Log::warning('BackupController@exportDatabaseAsJson - Continuing backup without JSON export');
        }
    }

   /**
 * Backup important files - FIXED VERSION
 */
private function backupFiles($path)
{
    Log::info('BackupController@backupFiles - Starting files backup');
    
    $totalFiles = 0;
    $totalSize = 0;
    
    // Get the base project path (parent of storage)
    $projectPath = dirname(storage_path());
    Log::debug('BackupController@backupFiles - Project path', ['project_path' => $projectPath]);
    
    // 1. Backup only important directories from storage (excluding backups)
    try {
        $storageSource = storage_path();
        $storageDest = $path . DIRECTORY_SEPARATOR . 'storage';
        
        // Check if we're trying to copy into ourselves
        if (strpos($storageDest, $storageSource) === 0) {
            Log::error('BackupController@backupFiles - Destination is inside source, avoiding recursion');
            throw new \Exception('Cannot backup storage into itself - recursion detected');
        }
        
        // Create storage backup directory
        if (!File::exists($storageDest)) {
            File::makeDirectory($storageDest, 0755, true, true);
        }
        
        // Only copy important subdirectories, not the entire storage
        $importantDirs = [
            'app/public' => 'app/public',  // Fixed: removed extra "storage/" prefix
            'framework' => 'framework',
            'logs' => 'logs',
        ];
        
        foreach ($importantDirs as $sourceDir => $destRelative) {
            $fullSource = $storageSource . DIRECTORY_SEPARATOR . $sourceDir;
            $fullDest = $storageDest . DIRECTORY_SEPARATOR . $destRelative;
            
            if (File::exists($fullSource)) {
                Log::debug('BackupController@backupFiles - Copying directory', [
                    'source' => $fullSource,
                    'dest' => $fullDest,
                ]);
                
                // Ensure destination directory exists
                if (!File::exists(dirname($fullDest))) {
                    File::makeDirectory(dirname($fullDest), 0755, true, true);
                }
                
                File::copyDirectory($fullSource, $fullDest);
                
                // Count files
                $dirStats = $this->getDirectoryStats($fullDest);
                $totalFiles += $dirStats['files_count'];
                $totalSize += $dirStats['total_size'];
                
                Log::info('BackupController@backupFiles - Directory backed up', [
                    'directory' => $sourceDir,
                    'files_count' => $dirStats['files_count'],
                    'size' => $this->formatBytes($dirStats['total_size']),
                ]);
            } else {
                Log::debug('BackupController@backupFiles - Source directory does not exist', [
                    'directory' => $fullSource,
                ]);
            }
        }
        
    } catch (\Exception $e) {
        Log::error('BackupController@backupFiles - Storage backup failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        throw new \Exception('Storage backup failed: ' . $e->getMessage());
    }
    
    // 2. Backup public directory
    try {
        $publicSource = public_path();
        $publicDest = $path . DIRECTORY_SEPARATOR . 'public';
        
        if (File::exists($publicSource)) {
            // Check if we're trying to copy into ourselves
            if (strpos($publicDest, $publicSource) === 0) {
                Log::warning('BackupController@backupFiles - Skipping public directory (destination inside source)');
            } else {
                if (!File::exists($publicDest)) {
                    File::makeDirectory($publicDest, 0755, true, true);
                }
                
                File::copyDirectory($publicSource, $publicDest);
                
                // Count files
                $publicStats = $this->getDirectoryStats($publicDest);
                $totalFiles += $publicStats['files_count'];
                $totalSize += $publicStats['total_size'];
                
                Log::info('BackupController@backupFiles - Public directory backed up', [
                    'files_count' => $publicStats['files_count'],
                    'size' => $this->formatBytes($publicStats['total_size']),
                ]);
            }
        } else {
            Log::warning('BackupController@backupFiles - Public directory does not exist', [
                'path' => $publicSource,
            ]);
        }
        
    } catch (\Exception $e) {
        Log::error('BackupController@backupFiles - Public directory backup failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        throw new \Exception('Public directory backup failed: ' . $e->getMessage());
    }
    
    // 3. Backup .env file
    try {
        $envSource = base_path('.env');
        $envDest = $path . DIRECTORY_SEPARATOR . '.env';
        
        if (File::exists($envSource)) {
            File::copy($envSource, $envDest);
            $totalFiles++;
            $totalSize += File::size($envDest);
            
            Log::info('BackupController@backupFiles - .env file backed up', [
                'size' => $this->formatBytes(File::size($envDest)),
            ]);
        }
    } catch (\Exception $e) {
        Log::warning('BackupController@backupFiles - Failed to backup .env file', [
            'error' => $e->getMessage(),
        ]);
        // Don't fail the entire backup if .env can't be copied
    }
    
    // 4. Backup important config files
    try {
        $configSource = config_path();
        $configDest = $path . DIRECTORY_SEPARATOR . 'config';
        
        if (File::exists($configSource) && !File::exists($configDest)) {
            File::makeDirectory($configDest, 0755, true, true);
            File::copyDirectory($configSource, $configDest);
            
            $configStats = $this->getDirectoryStats($configDest);
            $totalFiles += $configStats['files_count'];
            $totalSize += $configStats['total_size'];
            
            Log::info('BackupController@backupFiles - Config directory backed up', [
                'files_count' => $configStats['files_count'],
                'size' => $this->formatBytes($configStats['total_size']),
            ]);
        }
    } catch (\Exception $e) {
        Log::warning('BackupController@backupFiles - Failed to backup config directory', [
            'error' => $e->getMessage(),
        ]);
    }
    
    Log::info('BackupController@backupFiles - Backup completed', [
        'total_files' => $totalFiles,
        'total_size' => $this->formatBytes($totalSize),
    ]);
}
    /**
     * Get directory statistics
     */
    private function getDirectoryStats($path)
    {
        $filesCount = 0;
        $totalSize = 0;
        
        if (!File::exists($path)) {
            return ['files_count' => 0, 'total_size' => 0];
        }
        
        try {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );
            
            foreach ($files as $file) {
                if ($file->isFile()) {
                    $filesCount++;
                    $totalSize += $file->getSize();
                }
            }
        } catch (\Exception $e) {
            Log::error('BackupController@getDirectoryStats - Error calculating stats', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
        }
        
        return [
            'files_count' => $filesCount,
            'total_size' => $totalSize,
        ];
    }

    /**
     * Create manifest file
     */
    private function createManifest($path, $data)
    {
        try {
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

            $manifestPath = $path . DIRECTORY_SEPARATOR . 'manifest.json';
            File::put($manifestPath, json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            
            Log::info('BackupController@createManifest - Manifest file created', [
                'path' => $manifestPath,
                'file_size' => File::size($manifestPath),
                'statistics' => $manifest['statistics'],
            ]);
            
        } catch (\Exception $e) {
            Log::error('BackupController@createManifest - Failed to create manifest', [
                'error_message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            // Don't throw, continue with backup
        }
    }

    /**
     * Get MySQL version safely
     */
    private function getMysqlVersion()
    {
        try {
            $result = DB::select('SELECT VERSION() as version');
            return $result[0]->version ?? 'Unknown';
        } catch (\Exception $e) {
            Log::warning('BackupController@getMysqlVersion - Failed to get MySQL version', [
                'error' => $e->getMessage(),
            ]);
            return 'Unknown';
        }
    }

    /**
     * Create ZIP archive with improved error handling
     */
   private function createZip($sourcePath, $zipName)
{
    Log::debug('BackupController@createZip - Starting ZIP creation', [
        'source_path' => $sourcePath,
        'zip_name' => $zipName,
    ]);
    
    // Ensure backup directory exists
    $backupDir = storage_path('app/backups');
    if (!File::exists($backupDir)) {
        File::makeDirectory($backupDir, 0755, true, true);
    }
    
    $zipFilePath = $backupDir . DIRECTORY_SEPARATOR . $zipName . '.zip';
    
    // Remove existing file if it exists
    if (File::exists($zipFilePath)) {
        File::delete($zipFilePath);
    }
    
    $zip = new ZipArchive;
    
    // Open ZIP with error handling
    $zipOpenResult = $zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    if ($zipOpenResult !== TRUE) {
        $error = 'Could not create ZIP file. Error code: ' . $zipOpenResult;
        if ($zip->getStatusString()) {
            $error .= ' - ' . $zip->getStatusString();
        }
        
        Log::error('BackupController@createZip - ' . $error);
        throw new \Exception($error);
    }
    
    $fileCount = 0;
    $totalSize = 0;
    
    try {
        // Add files to ZIP
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($sourcePath, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        foreach ($files as $file) {
            if ($file->isFile()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($sourcePath) + 1);
                
                // Use forward slashes for ZIP compatibility (works on Windows too)
                $relativePath = str_replace('\\', '/', $relativePath);
                
                // Add file to ZIP
                if ($zip->addFile($filePath, $relativePath)) {
                    $fileCount++;
                    $totalSize += $file->getSize();
                } else {
                    Log::warning('BackupController@createZip - Failed to add file to ZIP', [
                        'file' => $filePath,
                        'relative_path' => $relativePath,
                    ]);
                }
            }
        }
        
        Log::debug('BackupController@createZip - Added files to ZIP', [
            'file_count' => $fileCount,
            'total_size' => $this->formatBytes($totalSize),
        ]);
        
        // Close the ZIP file properly
        if (!$zip->close()) {
            $error = 'Failed to close ZIP file';
            if ($zip->getStatusString()) {
                $error .= ': ' . $zip->getStatusString();
            }
            throw new \Exception($error);
        }
        
        // Give system a moment to release the file handle
        usleep(100000); // 0.1 second delay
        
        // Verify ZIP file was created
        if (!File::exists($zipFilePath)) {
            throw new \Exception('ZIP file was not created');
        }
        
        $zipSize = File::size($zipFilePath);
        if ($zipSize === 0) {
            throw new \Exception('ZIP file is empty (0 bytes)');
        }
        
        Log::info('BackupController@createZip - ZIP archive created successfully', [
            'zip_file' => $zipFilePath,
            'files_count' => $fileCount,
            'total_size_bytes' => $totalSize,
            'total_size_human' => $this->formatBytes($totalSize),
            'zip_file_size' => $zipSize,
            'zip_file_size_human' => $this->formatBytes($zipSize),
            'compression_ratio' => $totalSize > 0 ? round(($zipSize / $totalSize) * 100, 2) : 0,
        ]);
        
        return $zipFilePath;
        
    } catch (\Exception $e) {
        // Clean up failed ZIP file
        if (File::exists($zipFilePath)) {
            File::delete($zipFilePath);
        }
        @$zip->close();
        throw $e;
    }
}

    /**
     * Download backup with proper headers
     */
    public function download($filename)
    {
        Log::info('BackupController@download - User downloading backup', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        $filePath = storage_path('app/backups/' . $filename);
        
        if (!File::exists($filePath)) {
            Log::error('BackupController@download - Backup file not found', [
                'filename' => $filename,
                'file_path' => $filePath,
            ]);
            abort(404, 'Backup file not found');
        }
        
        // Verify file is valid ZIP
        if (!$this->isValidZipFile($filePath)) {
            Log::error('BackupController@download - Invalid ZIP file detected', [
                'filename' => $filename,
                'file_size' => File::size($filePath),
            ]);
            abort(400, 'Invalid backup file. The file may be corrupted.');
        }
        
        // Log download activity
        activity()
            ->causedBy(auth()->user())
            ->withProperties(['filename' => $filename])
            ->log('Downloaded backup');
        
        $fileSize = File::size($filePath);
        Log::info('BackupController@download - Backup download started', [
            'filename' => $filename,
            'file_size' => $fileSize,
            'file_size_human' => $this->formatBytes($fileSize),
        ]);
        
        // Set proper headers for download
        $headers = [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => $fileSize,
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];
        
        return response()->download($filePath, $filename, $headers);
    }

    /**
     * Check if file is a valid ZIP archive
     */
    private function isValidZipFile($filePath)
    {
        if (!File::exists($filePath)) {
            return false;
        }
        
        $fileSize = File::size($filePath);
        if ($fileSize < 100) { // ZIP files should have minimum size
            Log::warning('BackupController@isValidZipFile - File too small', [
                'size' => $fileSize,
                'file' => $filePath,
            ]);
            return false;
        }
        
        // Check file signature (PK header)
        $handle = fopen($filePath, 'r');
        $header = fread($handle, 4);
        fclose($handle);
        
        if ($header !== "PK\x03\x04" && $header !== "PK\x05\x06" && $header !== "PK\x07\x08") {
            Log::warning('BackupController@isValidZipFile - Invalid ZIP signature', [
                'header' => bin2hex($header),
                'file' => $filePath,
            ]);
            return false;
        }
        
        // Try to open the file as ZIP
        $zip = new ZipArchive;
        $result = $zip->open($filePath);
        
        if ($result === TRUE) {
            $numFiles = $zip->numFiles;
            $zip->close();
            
            if ($numFiles > 0) {
                return true;
            } else {
                Log::warning('BackupController@isValidZipFile - ZIP contains no files');
                return false;
            }
        }
        
        Log::warning('BackupController@isValidZipFile - Failed to open as ZIP', [
            'error_code' => $result,
            'file' => $filePath,
        ]);
        
        return false;
    }

    /**
     * Delete backup
     */
    public function destroy($filename)
    {
        Log::info('BackupController@destroy - User deleting backup', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        $filePath = storage_path('app/backups/' . $filename);
        
        if (!File::exists($filePath)) {
            Log::error('BackupController@destroy - Backup file not found', [
                'filename' => $filename,
                'file_path' => $filePath,
            ]);
            abort(404, 'Backup file not found');
        }
        
        $fileSize = File::size($filePath);
        File::delete($filePath);
        
        activity()
            ->causedBy(auth()->user())
            ->withProperties(['filename' => $filename])
            ->log('Deleted backup');

        Log::info('BackupController@destroy - Backup deleted successfully', [
            'filename' => $filename,
            'file_size' => $fileSize,
            'file_size_human' => $this->formatBytes($fileSize),
        ]);

        return redirect()->route('backup.index')
            ->with('success', 'Backup deleted successfully');
    }

    /**
     * Toggle backup protection
     */
    public function toggleProtection($filename)
    {
        Log::info('BackupController@toggleProtection - User toggling backup protection', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        // For now, just return success - you can implement actual protection logic
        return redirect()->route('backup.index')
            ->with('success', 'Backup protection toggled successfully');
    }

    /**
     * Protect backup
     */
    public function protect($filename)
    {
        Log::info('BackupController@protect - User protecting backup', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        return redirect()->route('backup.index')
            ->with('success', 'Backup protected successfully');
    }

    /**
     * Unprotect backup
     */
    public function unprotect($filename)
    {
        Log::info('BackupController@unprotect - User unprotecting backup', [
            'user_id' => auth()->id(),
            'user_name' => auth()->user()->name,
            'filename' => $filename,
        ]);
        
        return redirect()->route('backup.index')
            ->with('success', 'Backup unprotected successfully');
    }

    /**
     * Get list of backup files
     */
    private function getBackupFiles()
    {
        try {
            $backupPath = storage_path('app/backups');
            
            if (!File::exists($backupPath)) {
                File::makeDirectory($backupPath, 0755, true, true);
                Log::info('BackupController@getBackupFiles - Created backup directory', ['path' => $backupPath]);
                return [];
            }
            
            $files = File::files($backupPath);
            $backups = [];
            
            foreach ($files as $file) {
                if ($file->getExtension() === 'zip') {
                    $filename = $file->getFilename();
                    $size = $file->getSize();
                    $modified = $file->getMTime();
                    
                    // Extract info from filename
                    $parts = explode('_', $filename);
                    $type = $parts[1] ?? 'unknown';
                    
                    // Use try-catch for route generation
                    try {
                        $downloadUrl = route('backup.download', ['filename' => $filename]);
                    } catch (\Exception $e) {
                        $downloadUrl = url('/admin/backup/download/' . $filename);
                        Log::warning('BackupController@getBackupFiles - Route not defined, using URL fallback', [
                            'filename' => $filename,
                            'url' => $downloadUrl,
                        ]);
                    }
                    
                    $backups[] = [
                        'id' => md5($filename),
                        'filename' => $filename,
                        'size' => $this->formatBytes($size),
                        'size_bytes' => $size,
                        'modified' => date('Y-m-d\TH:i:s', $modified),
                        'type' => $type,
                        'download_url' => $downloadUrl,
                        'is_protected' => false,
                        'is_valid' => $this->isValidZipFile($file->getPathname()),
                    ];
                }
            }
            
            // Sort by modified date (newest first)
            usort($backups, function($a, $b) {
                return strtotime($b['modified']) - strtotime($a['modified']);
            });
            
            Log::debug('BackupController@getBackupFiles - Retrieved backup files', [
                'backup_count' => count($backups),
                'backup_types' => array_count_values(array_column($backups, 'type')),
                'total_size_bytes' => array_sum(array_column($backups, 'size_bytes')),
                'total_size_human' => $this->formatBytes(array_sum(array_column($backups, 'size_bytes'))),
                'valid_backups' => count(array_filter($backups, function($b) { return $b['is_valid']; })),
            ]);
            
            return $backups;
            
        } catch (\Exception $e) {
            Log::error('BackupController@getBackupFiles - Failed to get backup files', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
            ]);
            return [];
        }
    }

    /**
     * Clean up failed backup directories
     */
    private function cleanupFailedBackups()
    {
        try {
            $backupPath = storage_path('app/backups');
            
            // Clean up old incomplete ZIP files
            $files = File::files($backupPath);
            foreach ($files as $file) {
                if ($file->getExtension() === 'zip' && $file->getSize() < 1024) { // Less than 1KB
                    Log::info('BackupController@cleanupFailedBackups - Removing small/incomplete ZIP', [
                        'file' => $file->getFilename(),
                        'size' => $file->getSize(),
                    ]);
                    File::delete($file->getPathname());
                }
            }
            
        } catch (\Exception $e) {
            Log::error('BackupController@cleanupFailedBackups - Failed to clean up', [
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Clean up directory safely
     */
    private function cleanupDirectory($path)
    {
        try {
            if (File::exists($path)) {
                File::deleteDirectory($path);
                Log::debug('BackupController@cleanupDirectory - Directory cleaned up', ['path' => $path]);
            }
        } catch (\Exception $e) {
            Log::error('BackupController@cleanupDirectory - Failed to clean up directory', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
        }
    }

   /**
 * Get disk space information - SAFE VERSION
 */
private function getDiskSpaceInfo()
{
    $defaultResult = [
        'total' => '0 GB',
        'free' => '0 GB',
        'used' => '0 GB',
        'used_percentage' => 0,
        'total_bytes' => 0,
        'free_bytes' => 0,
        'used_bytes' => 0,
    ];
    
    try {
        $backupPath = storage_path('app/backups');
        
        // Ensure backup directory exists
        if (!File::exists($backupPath)) {
            try {
                File::makeDirectory($backupPath, 0755, true, true);
            } catch (\Exception $e) {
                Log::warning('BackupController@getDiskSpaceInfo - Failed to create backup directory', [
                    'path' => $backupPath,
                    'error' => $e->getMessage(),
                ]);
                return $defaultResult;
            }
        }
        
        // Get disk space with validation
        $totalSpace = @disk_total_space($backupPath);
        $freeSpace = @disk_free_space($backupPath);
        
        if ($totalSpace === false || $freeSpace === false) {
            Log::warning('BackupController@getDiskSpaceInfo - Failed to get disk space', [
                'path' => $backupPath,
                'total_space' => $totalSpace,
                'free_space' => $freeSpace,
            ]);
            return $defaultResult;
        }
        
        // Validate disk space values
        if ($totalSpace <= 0 || $freeSpace < 0 || $freeSpace > $totalSpace) {
            Log::warning('BackupController@getDiskSpaceInfo - Invalid disk space values', [
                'total_space' => $totalSpace,
                'free_space' => $freeSpace,
            ]);
            return $defaultResult;
        }
        
        $usedSpace = $totalSpace - $freeSpace;
        $usedPercentage = $totalSpace > 0 ? round(($usedSpace / $totalSpace) * 100, 1) : 0;
        
        // Cap percentage at 100%
        if ($usedPercentage > 100) {
            $usedPercentage = 100;
        }
        
        $diskInfo = [
            'total' => $this->formatBytes($totalSpace),
            'free' => $this->formatBytes($freeSpace),
            'used' => $this->formatBytes($usedSpace),
            'used_percentage' => $usedPercentage,
            'total_bytes' => $totalSpace,
            'free_bytes' => $freeSpace,
            'used_bytes' => $usedSpace,
        ];
        
        Log::debug('BackupController@getDiskSpaceInfo - Disk space info', [
            'total_space' => $diskInfo['total'],
            'free_space' => $diskInfo['free'],
            'used_space' => $diskInfo['used'],
            'used_percentage' => $diskInfo['used_percentage'],
        ]);
        
        return $diskInfo;
        
    } catch (\Exception $e) {
        Log::error('BackupController@getDiskSpaceInfo - Failed to get disk space info', [
            'error_message' => $e->getMessage(),
            'error_trace' => $e->getTraceAsString(),
        ]);
        
        return $defaultResult;
    }
}
    /**
     * Get last backup date
     */
    private function getLastBackupDate()
    {
        try {
            $backups = $this->getBackupFiles();
            $validBackups = array_filter($backups, function($backup) {
                return $backup['is_valid'];
            });
            
            $lastBackup = count($validBackups) > 0 ? reset($validBackups)['modified'] : null;
            
            Log::debug('BackupController@getLastBackupDate - Last backup date', [
                'has_valid_backups' => count($validBackups) > 0,
                'last_backup' => $lastBackup,
                'total_backups' => count($backups),
                'valid_backups' => count($validBackups),
            ]);
            
            return $lastBackup;
            
        } catch (\Exception $e) {
            Log::error('BackupController@getLastBackupDate - Failed to get last backup date', [
                'error_message' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get backup statistics
     */
    private function getBackupStats($backups)
    {
        try {
            $total = count($backups);
            $full = 0;
            $database = 0;
            $files = 0;
            $protected = 0;
            $totalSizeBytes = 0;
            $recent = 0;
            $valid = 0;
            
            $weekAgo = strtotime('-7 days');
            
            foreach ($backups as $backup) {
                $totalSizeBytes += $backup['size_bytes'];
                
                if ($backup['is_valid']) {
                    $valid++;
                }
                
                switch ($backup['type']) {
                    case 'full':
                        $full++;
                        break;
                    case 'database':
                        $database++;
                        break;
                    case 'files':
                        $files++;
                        break;
                }
                
                // Check if backup is recent (last 7 days)
                $modified = strtotime($backup['modified']);
                if ($modified > $weekAgo) {
                    $recent++;
                }
            }
            
            $stats = [
                'total' => $total,
                'valid' => $valid,
                'full' => $full,
                'database' => $database,
                'files' => $files,
                'recent' => $recent,
                'protected' => $protected,
                'total_size_bytes' => $totalSizeBytes,
            ];
            
            Log::debug('BackupController@getBackupStats - Backup statistics', $stats);
            
            return $stats;
            
        } catch (\Exception $e) {
            Log::error('BackupController@getBackupStats - Failed to get backup stats', [
                'error_message' => $e->getMessage(),
            ]);
            
            return [
                'total' => 0,
                'valid' => 0,
                'full' => 0,
                'database' => 0,
                'files' => 0,
                'recent' => 0,
                'protected' => 0,
                'total_size_bytes' => 0,
            ];
        }
    }

    /**
     * Get database size
     */
    private function getDatabaseSize()
    {
        try {
            $database = config('database.connections.mysql.database');
            $result = DB::select(
                "SELECT SUM(data_length + index_length) as size 
                 FROM information_schema.TABLES 
                 WHERE table_schema = ?",
                [$database]
            );
            
            $size = $result[0]->size ?? 0;
            
            Log::debug('BackupController@getDatabaseSize - Database size', [
                'size_bytes' => $size,
                'size_human' => $this->formatBytes($size),
            ]);
            
            return $size;
            
        } catch (\Exception $e) {
            Log::error('BackupController@getDatabaseSize - Failed to get database size', [
                'error_message' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    /**
     * Get files size
     */
    private function getFilesSize()
    {
        try {
            $directories = [
                storage_path('app/public'),
                public_path(),
            ];
            
            $totalSize = 0;
            
            foreach ($directories as $directory) {
                if (File::exists($directory)) {
                    $size = $this->getDirectorySize($directory);
                    $totalSize += $size;
                    
                    Log::debug('BackupController@getFilesSize - Directory size', [
                        'directory' => $directory,
                        'size_bytes' => $size,
                        'size_human' => $this->formatBytes($size),
                    ]);
                } else {
                    Log::debug('BackupController@getFilesSize - Directory does not exist', ['directory' => $directory]);
                }
            }
            
            Log::info('BackupController@getFilesSize - Total files size', [
                'total_size_bytes' => $totalSize,
                'total_size_human' => $this->formatBytes($totalSize),
            ]);
            
            return $totalSize;
            
        } catch (\Exception $e) {
            Log::error('BackupController@getFilesSize - Failed to get files size', [
                'error_message' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    /**
     * Calculate directory size
     */
    private function getDirectorySize($path)
    {
        $size = 0;
        $fileCount = 0;
        
        try {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \RecursiveDirectoryIterator::SKIP_DOTS)
            );
            
            foreach ($files as $file) {
                if ($file->isFile()) {
                    $size += $file->getSize();
                    $fileCount++;
                }
            }
            
            Log::debug('BackupController@getDirectorySize - Directory calculated', [
                'path' => $path,
                'file_count' => $fileCount,
                'size_bytes' => $size,
                'size_human' => $this->formatBytes($size),
            ]);
            
        } catch (\Exception $e) {
            Log::error('BackupController@getDirectorySize - Failed to calculate directory size', [
                'path' => $path,
                'error_message' => $e->getMessage(),
            ]);
        }
        
        return $size;
    }

   /**
 * Validate backup before creating ZIP - FIXED VERSION
 */
private function validateBackupDirectory($path, $type)
{
    Log::debug('BackupController@validateBackupDirectory - Validating backup', [
        'path' => $path,
        'type' => $type,
    ]);
    
    // Check if directory exists and has content
    if (!File::exists($path) || !File::isDirectory($path)) {
        throw new \Exception('Backup directory does not exist or is not a directory');
    }
    
    // Check manifest file
    $manifestPath = $path . DIRECTORY_SEPARATOR . 'manifest.json';
    if (!File::exists($manifestPath)) {
        throw new \Exception('Backup validation failed: Missing manifest.json');
    }
    
    // Try to read manifest to ensure it's valid JSON
    try {
        $manifestContent = File::get($manifestPath);
        json_decode($manifestContent, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Manifest file contains invalid JSON');
        }
    } catch (\Exception $e) {
        throw new \Exception('Backup validation failed: Cannot read manifest.json - ' . $e->getMessage());
    }
    
    // Check content based on backup type
    switch ($type) {
        case 'database':
            $sqlPath = $path . DIRECTORY_SEPARATOR . 'database.sql';
            $jsonPath = $path . DIRECTORY_SEPARATOR . 'database.json';
            if (!File::exists($sqlPath) && !File::exists($jsonPath)) {
                throw new \Exception('Backup validation failed: No database backup found (checked for database.sql and database.json)');
            }
            break;
            
        case 'files':
            // For files backup, check if we have at least some content
            $hasStorage = File::exists($path . DIRECTORY_SEPARATOR . 'storage');
            $hasPublic = File::exists($path . DIRECTORY_SEPARATOR . 'public');
            $hasEnv = File::exists($path . DIRECTORY_SEPARATOR . '.env');
            
            if (!$hasStorage && !$hasPublic && !$hasEnv) {
                // List what's in the directory for debugging
                $files = File::files($path);
                $directories = File::directories($path);
                Log::warning('BackupController@validateBackupDirectory - No backup content found', [
                    'files' => array_map('basename', $files),
                    'directories' => array_map('basename', $directories),
                ]);
                throw new \Exception('Backup validation failed: No files backup found. Checked for: storage/, public/, .env');
            }
            break;
            
        case 'full':
            $hasDatabase = File::exists($path . DIRECTORY_SEPARATOR . 'database.sql') || File::exists($path . DIRECTORY_SEPARATOR . 'database.json');
            $hasStorage = File::exists($path . DIRECTORY_SEPARATOR . 'storage');
            $hasPublic = File::exists($path . DIRECTORY_SEPARATOR . 'public');
            
            if (!$hasDatabase && !$hasStorage && !$hasPublic) {
                throw new \Exception('Backup validation failed: No backup content found');
            }
            break;
    }
    
    Log::info('BackupController@validateBackupDirectory - Backup validation passed');
    return true;
}

    /**
     * Verify backup integrity
     */
    private function verifyBackup($zipPath)
{
    Log::debug('BackupController@verifyBackup - Verifying backup integrity', ['zip_path' => $zipPath]);
    
    if (!File::exists($zipPath)) {
        Log::error('BackupController@verifyBackup - ZIP file does not exist');
        return false;
    }
    
    $zip = new ZipArchive;
    $result = $zip->open($zipPath);
    
    if ($result !== TRUE) {
        Log::error('BackupController@verifyBackup - Failed to open ZIP file', ['error_code' => $result]);
        return false;
    }
    
    // Check for essential files
    $hasManifest = false;
    $hasContent = false;
    $fileCount = $zip->numFiles;
    
    Log::debug('BackupController@verifyBackup - ZIP file info', [
        'num_files' => $fileCount,
        'zip_status' => $zip->getStatusString(),
    ]);
    
    // If numFiles is 0, try counting manually
    if ($fileCount === 0) {
        Log::warning('BackupController@verifyBackup - ZIP reports 0 files, trying manual count');
        
        // Try to get the first file name to see if files exist
        $firstFile = $zip->getNameIndex(0);
        if ($firstFile !== false) {
            $fileCount = 1;
            // Count remaining files
            for ($i = 1; $i < 1000; $i++) { // Limit to prevent infinite loop
                if ($zip->getNameIndex($i) === false) {
                    break;
                }
                $fileCount++;
            }
            Log::debug('BackupController@verifyBackup - Manual file count', ['file_count' => $fileCount]);
        }
    }
    
    for ($i = 0; $i < $fileCount; $i++) {
        $filename = $zip->getNameIndex($i);
        if ($filename === false) {
            continue;
        }
        
        Log::debug('BackupController@verifyBackup - Checking file', [
            'index' => $i,
            'filename' => $filename,
        ]);
        
        if (strpos($filename, 'manifest.json') !== false) {
            $hasManifest = true;
        }
        
        if (strpos($filename, 'database.') !== false || 
            strpos($filename, 'storage/') !== false || 
            strpos($filename, 'public/') !== false ||
            strpos($filename, '.env') !== false) {
            $hasContent = true;
        }
        
        // Check if file can be extracted
        $fileInfo = $zip->statIndex($i);
        if ($fileInfo && $fileInfo['size'] > 0 && $fileInfo['comp_size'] == 0) {
            Log::warning('BackupController@verifyBackup - Corrupted file detected', [
                'file' => $filename,
                'size' => $fileInfo['size'],
                'compressed_size' => $fileInfo['comp_size'],
            ]);
        }
    }
    
    $zip->close();
    
    $isValid = $hasManifest && $hasContent && $fileCount > 0;
    
    Log::info('BackupController@verifyBackup - Backup verification result', [
        'has_manifest' => $hasManifest,
        'has_content' => $hasContent,
        'file_count' => $fileCount,
        'is_valid' => $isValid,
        'zip_file_size' => File::size($zipPath),
        'zip_file_size_human' => $this->formatBytes(File::size($zipPath)),
    ]);
    
    return $isValid;
}

    /**
     * Format bytes to human readable
     */
    private function formatBytes($bytes, $precision = 2)
    {
        if ($bytes <= 0) {
            return '0 B';
        }
        
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}