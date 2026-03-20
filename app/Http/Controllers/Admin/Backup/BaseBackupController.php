<?php

namespace App\Http\Controllers\Admin\Backup;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use ZipArchive;

abstract class BaseBackupController extends Controller
{
    /**
     * Format bytes to human readable
     */
    protected function formatBytes($bytes, $precision = 2)
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

    /**
     * Get backup directory path
     */
    protected function getBackupPath()
    {
        $path = storage_path('app/backups');
        
        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true, true);
        }
        
        return $path;
    }

    /**
     * Get list of backup files
     */
    protected function getBackupFiles()
    {
        try {
            $backupPath = $this->getBackupPath();
            $files = File::files($backupPath);
            $backups = [];
            
            foreach ($files as $file) {
                if ($file->getExtension() === 'zip') {
                    $filename = $file->getFilename();
                    $size = $file->getSize();
                    $modified = $file->getMTime();
                    
                    $parts = explode('_', $filename);
                    $type = $parts[1] ?? 'unknown';
                    
                    try {
                        $downloadUrl = route('backup.download', ['filename' => $filename]);
                    } catch (\Exception $e) {
                        $downloadUrl = url('/admin/backup/download/' . $filename);
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
            
            usort($backups, fn($a, $b) => strtotime($b['modified']) - strtotime($a['modified']));
            
            return $backups;
            
        } catch (\Exception $e) {
            Log::error('Failed to get backup files: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Check if file is a valid ZIP archive
     */
    protected function isValidZipFile($filePath)
    {
        if (!File::exists($filePath) || File::size($filePath) < 100) {
            return false;
        }
        
        $handle = fopen($filePath, 'r');
        $header = fread($handle, 4);
        fclose($handle);
        
        if ($header !== "PK\x03\x04" && $header !== "PK\x05\x06" && $header !== "PK\x07\x08") {
            return false;
        }
        
        $zip = new ZipArchive;
        $result = $zip->open($filePath);
        
        if ($result === TRUE) {
            $numFiles = $zip->numFiles;
            $zip->close();
            return $numFiles > 0;
        }
        
        return false;
    }

    /**
     * Get disk space information
     */
    protected function getDiskSpaceInfo()
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
            $backupPath = $this->getBackupPath();
            
            $totalSpace = @disk_total_space($backupPath);
            $freeSpace = @disk_free_space($backupPath);
            
            if ($totalSpace === false || $freeSpace === false || $totalSpace <= 0) {
                return $defaultResult;
            }
            
            $usedSpace = $totalSpace - $freeSpace;
            $usedPercentage = $totalSpace > 0 ? min(round(($usedSpace / $totalSpace) * 100, 1), 100) : 0;
            
            return [
                'total' => $this->formatBytes($totalSpace),
                'free' => $this->formatBytes($freeSpace),
                'used' => $this->formatBytes($usedSpace),
                'used_percentage' => $usedPercentage,
                'total_bytes' => $totalSpace,
                'free_bytes' => $freeSpace,
                'used_bytes' => $usedSpace,
            ];
            
        } catch (\Exception $e) {
            Log::error('Failed to get disk space: ' . $e->getMessage());
            return $defaultResult;
        }
    }

    /**
     * Get last backup date
     */
    protected function getLastBackupDate()
    {
        try {
            $backups = $this->getBackupFiles();
            $validBackups = array_filter($backups, fn($b) => $b['is_valid']);
            return count($validBackups) > 0 ? reset($validBackups)['modified'] : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get backup statistics
     */
    protected function getBackupStats($backups)
    {
        try {
            $total = count($backups);
            $full = $database = $files = $protected = $valid = $recent = 0;
            $totalSizeBytes = 0;
            $weekAgo = strtotime('-7 days');
            
            foreach ($backups as $backup) {
                $totalSizeBytes += $backup['size_bytes'];
                if ($backup['is_valid']) $valid++;
                
                match ($backup['type']) {
                    'full' => $full++,
                    'database' => $database++,
                    'files' => $files++,
                    default => null,
                };
                
                if (strtotime($backup['modified']) > $weekAgo) $recent++;
            }
            
            return [
                'total' => $total,
                'valid' => $valid,
                'full' => $full,
                'database' => $database,
                'files' => $files,
                'recent' => $recent,
                'protected' => $protected,
                'total_size_bytes' => $totalSizeBytes,
            ];
            
        } catch (\Exception $e) {
            return [
                'total' => 0, 'valid' => 0, 'full' => 0, 'database' => 0,
                'files' => 0, 'recent' => 0, 'protected' => 0, 'total_size_bytes' => 0,
            ];
        }
    }

    /**
     * Clean up failed backups
     */
    protected function cleanupFailedBackups()
    {
        try {
            $backupPath = $this->getBackupPath();
            $files = File::files($backupPath);
            
            foreach ($files as $file) {
                if ($file->getExtension() === 'zip' && $file->getSize() < 1024) {
                    File::delete($file->getPathname());
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to clean up: ' . $e->getMessage());
        }
    }

    /**
     * Clean up directory safely
     */
    protected function cleanupDirectory($path)
    {
        try {
            if (File::exists($path)) {
                File::deleteDirectory($path);
            }
        } catch (\Exception $e) {
            Log::error('Failed to clean up directory: ' . $e->getMessage());
        }
    }

    /**
     * Get MySQL version
     */
    protected function getMysqlVersion()
    {
        try {
            $result = DB::select('SELECT VERSION() as version');
            return $result[0]->version ?? 'Unknown';
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Get database size
     */
    protected function getDatabaseSize()
    {
        try {
            $database = config('database.connections.mysql.database');
            $result = DB::select(
                "SELECT SUM(data_length + index_length) as size 
                 FROM information_schema.TABLES 
                 WHERE table_schema = ?",
                [$database]
            );
            return $result[0]->size ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get files size
     */
    protected function getFilesSize()
    {
        try {
            $directories = [storage_path('app/public'), public_path()];
            $totalSize = 0;
            
            foreach ($directories as $directory) {
                if (File::exists($directory)) {
                    $totalSize += $this->getDirectorySize($directory);
                }
            }
            
            return $totalSize;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Calculate directory size
     */
    protected function getDirectorySize($path)
    {
        $size = 0;
        
        try {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \RecursiveDirectoryIterator::SKIP_DOTS)
            );
            
            foreach ($files as $file) {
                if ($file->isFile()) {
                    $size += $file->getSize();
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to get directory size: ' . $e->getMessage());
        }
        
        return $size;
    }

    /**
     * Get directory statistics
     */
    protected function getDirectoryStats($path)
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
            Log::error('Failed to get directory stats: ' . $e->getMessage());
        }
        
        return ['files_count' => $filesCount, 'total_size' => $totalSize];
    }
}