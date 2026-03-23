<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class GenerateMigrationsFromSQL extends Command
{
    protected $signature = 'make:migrations-from-sql
                            {--sql-file=dump.sql : Path to the SQL dump file}
                            {--path=database/migrations : Path where migrations will be created}
                            {--skip-tables= : Comma-separated list of tables to skip}';
    
    protected $description = 'Generate Laravel migrations from MySQL dump file';
    
    protected $skippedTables = [
        'migrations',
        'cache',
        'cache_locks',
        'failed_jobs',
        'jobs',
        'job_batches',
        'sessions',
        'password_reset_tokens'
    ];
    
    public function handle()
    {
        $sqlFile = $this->option('sql-file');
        
        // Check if file exists in current directory
        if (!File::exists($sqlFile)) {
            // Try with base path
            $sqlFile = base_path($sqlFile);
            if (!File::exists($sqlFile)) {
                $this->error("SQL file not found: {$sqlFile}");
                $this->info("Make sure your dump.sql is in: " . base_path());
                return 1;
            }
        }
        
        // Add custom skip tables if provided
        if ($this->option('skip-tables')) {
            $customSkip = explode(',', $this->option('skip-tables'));
            $this->skippedTables = array_merge($this->skippedTables, $customSkip);
        }
        
        $sqlContent = File::get($sqlFile);
        $tables = $this->parseTables($sqlContent);
        
        $this->info("Found " . count($tables) . " tables in SQL dump");
        
        $bar = $this->output->createProgressBar(count($tables));
        $bar->start();
        
        $migrationPath = $this->option('path');
        
        foreach ($tables as $tableName => $tableData) {
            if (in_array($tableName, $this->skippedTables)) {
                $this->newLine();
                $this->warn("Skipping table: {$tableName}");
                $bar->advance();
                continue;
            }
            
            $this->generateMigration($tableName, $tableData, $migrationPath);
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        $this->info('✅ All migrations generated successfully!');
        $this->info("Migrations created in: {$migrationPath}");
        
        return 0;
    }
    
    protected function parseTables($sqlContent)
    {
        $tables = [];
        $pattern = '/CREATE TABLE `(.*?)` \((.*?)\)(?: ENGINE=.*?)?;/s';
        
        preg_match_all($pattern, $sqlContent, $matches, PREG_SET_ORDER);
        
        foreach ($matches as $match) {
            $tableName = $match[1];
            $tableSchema = $match[2];
            
            $columns = $this->parseColumns($tableSchema);
            $indexes = $this->parseIndexes($tableSchema);
            
            $tables[$tableName] = [
                'columns' => $columns,
                'indexes' => $indexes
            ];
        }
        
        return $tables;
    }
    
    protected function parseColumns($schema)
    {
        $columns = [];
        $lines = explode("\n", $schema);
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            // Remove trailing comma
            $line = rtrim($line, ',');
            
            if (empty($line) || 
                str_starts_with($line, 'PRIMARY KEY') || 
                str_starts_with($line, 'UNIQUE KEY') ||
                str_starts_with($line, 'KEY') ||
                str_starts_with($line, 'CONSTRAINT') ||
                str_starts_with($line, 'FULLTEXT KEY')) {
                continue;
            }
            
            if (preg_match('/^`(\w+)`\s+([^,]+)/', $line, $matches)) {
                $columnName = $matches[1];
                $definition = trim($matches[2]);
                
                $columns[$columnName] = $this->parseColumnDefinition($columnName, $definition);
            }
        }
        
        return $columns;
    }
    
    protected function parseColumnDefinition($name, $definition)
    {
        $type = 'string';
        $nullable = false;
        $unsigned = false;
        $autoIncrement = false;
        $unique = false;
        $length = null;
        $default = null;
        
        // Parse data type
        if (str_contains($definition, 'bigint(') || str_contains($definition, 'bigint ')) {
            $type = 'bigInteger';
            $unsigned = str_contains($definition, 'unsigned');
            $autoIncrement = str_contains($definition, 'AUTO_INCREMENT');
        } elseif (str_contains($definition, 'int(') || str_contains($definition, 'int ')) {
            $type = 'integer';
            $unsigned = str_contains($definition, 'unsigned');
            $autoIncrement = str_contains($definition, 'AUTO_INCREMENT');
        } elseif (str_contains($definition, 'tinyint(') || str_contains($definition, 'tinyint ')) {
            // Check if it's a boolean (tinyint(1))
            if (preg_match('/tinyint\((\d+)\)/', $definition, $matches)) {
                if ($matches[1] == 1) {
                    $type = 'boolean';
                } else {
                    $type = 'integer';
                }
            } else {
                $type = 'integer';
            }
            $unsigned = str_contains($definition, 'unsigned');
            $autoIncrement = str_contains($definition, 'AUTO_INCREMENT');
        } elseif (str_contains($definition, 'varchar')) {
            $type = 'string';
            if (preg_match('/varchar\((\d+)\)/', $definition, $matches)) {
                $length = (int)$matches[1];
            }
        } elseif (str_contains($definition, 'text')) {
            $type = 'text';
        } elseif (str_contains($definition, 'longtext')) {
            $type = 'longText';
        } elseif (str_contains($definition, 'datetime')) {
            $type = 'dateTime';
        } elseif (str_contains($definition, 'timestamp')) {
            $type = 'timestamp';
            $nullable = str_contains($definition, 'NULL');
        } elseif (str_contains($definition, 'date')) {
            $type = 'date';
        } elseif (str_contains($definition, 'time')) {
            $type = 'time';
        } elseif (str_contains($definition, 'decimal')) {
            $type = 'decimal';
        } elseif (str_contains($definition, 'json')) {
            $type = 'json';
        }
        
        // Check for nullable
        $nullable = str_contains($definition, 'NULL') || str_contains($definition, 'DEFAULT NULL');
        
        // Check for unique
        $unique = str_contains($definition, 'UNIQUE');
        
        // Parse default value
        if (preg_match("/DEFAULT\s+([^,\s]+)/", $definition, $matches)) {
            $default = trim($matches[1]);
            // Remove quotes from string defaults
            if (str_starts_with($default, "'") && str_ends_with($default, "'")) {
                $default = "'" . trim($default, "'") . "'";
            }
        }
        
        return [
            'type' => $type,
            'nullable' => $nullable,
            'unsigned' => $unsigned,
            'auto_increment' => $autoIncrement,
            'unique' => $unique,
            'length' => $length,
            'default' => $default
        ];
    }
    
    protected function parseIndexes($schema)
    {
        $indexes = [];
        $lines = explode("\n", $schema);
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            // Parse UNIQUE KEY
            if (preg_match('/UNIQUE KEY\s+`?(\w+)`?\s*\(`(\w+)`/', $line, $matches)) {
                $indexes['unique'][] = $matches[2];
            }
            
            // Parse regular KEY
            if (preg_match('/KEY\s+`?(\w+)`?\s*\(`(\w+)`/', $line, $matches)) {
                $keyName = $matches[1];
                $column = $matches[2];
                if (!str_contains($line, 'PRIMARY') && !str_contains($line, 'UNIQUE')) {
                    $indexes['index'][] = $column;
                }
            }
        }
        
        return $indexes;
    }
    
    protected function generateMigration($tableName, $tableData, $migrationPath)
    {
        $timestamp = date('Y_m_d_His');
        $migrationName = "create_{$tableName}_table";
        $filename = "{$timestamp}_{$migrationName}.php";
        $fullPath = base_path("{$migrationPath}/{$filename}");
        
        $content = $this->generateMigrationContent($tableName, $tableData);
        
        File::put($fullPath, $content);
    }
    
    protected function generateMigrationContent($tableName, $tableData)
    {
        $columns = $tableData['columns'];
        $indexes = $tableData['indexes'];
        
        $columnCode = $this->generateColumnCode($columns);
        $indexCode = $this->generateIndexCode($indexes);
        
        return <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('{$tableName}', function (Blueprint \$table) {
{$columnCode}
{$indexCode}
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('{$tableName}');
    }
};
PHP;
    }
    
    protected function generateColumnCode($columns)
    {
        $code = [];
        $hasId = false;
        $hasTimestamps = false;
        $hasSoftDeletes = false;
        
        foreach ($columns as $name => $props) {
            // FORCE: Any column named 'id' should be primary key with auto-increment
            if ($name === 'id') {
                $hasId = true;
                continue; // Skip adding as regular column, we'll use $table->id()
            }
            
            // Skip timestamp columns (we'll use $table->timestamps())
            if ($name === 'created_at' || $name === 'updated_at') {
                $hasTimestamps = true;
                continue;
            }
            
            // Skip deleted_at column (we'll use $table->softDeletes())
            if ($name === 'deleted_at') {
                $hasSoftDeletes = true;
                continue;
            }
            
            // Handle other auto-increment fields (non-id)
            if ($props['auto_increment']) {
                $line = "            \$table->{$props['type']}('{$name}', true)";
                
                if ($props['nullable']) {
                    $line .= "->nullable()";
                }
                
                if ($props['unsigned']) {
                    $line .= "->unsigned()";
                }
                
                $line .= ";";
                $code[] = $line;
                continue;
            }
            
            // Build the column line
            $line = "            \$table->{$props['type']}('{$name}'";
            
            // Add length for string columns
            if ($props['type'] === 'string') {
                if (isset($props['length'])) {
                    $line .= ", {$props['length']}";
                } else {
                    $line .= ", 255";
                }
            }
            
            // Add precision for decimal
            if ($props['type'] === 'decimal') {
                $line .= ", 10, 2";
            }
            
            $line .= ")";
            
            // Add nullable
            if ($props['nullable']) {
                $line .= "->nullable()";
            }
            
            // Add unsigned for numeric columns
            if ($props['unsigned'] && !in_array($props['type'], ['boolean', 'string', 'text', 'longText', 'json'])) {
                $line .= "->unsigned()";
            }
            
            // Add unique
            if ($props['unique']) {
                $line .= "->unique()";
            }
            
            // Add default value
            if (isset($props['default'])) {
                $line .= "->default({$props['default']})";
            }
            
            $line .= ";";
            $code[] = $line;
        }
        
        // ALWAYS add id column with primary key and auto-increment if the table has an id column
        if ($hasId) {
            array_unshift($code, "            \$table->id();");
        }
        
        // Add timestamps if they exist
        if ($hasTimestamps) {
            $code[] = "            \$table->timestamps();";
        }
        
        // Add soft deletes if they exist
        if ($hasSoftDeletes) {
            $code[] = "            \$table->softDeletes();";
        }
        
        return implode("\n", $code);
    }
    
    protected function generateIndexCode($indexes)
    {
        $code = [];
        
        if (isset($indexes['unique'])) {
            foreach (array_unique($indexes['unique']) as $column) {
                if ($column !== 'id') {
                    $code[] = "            \$table->unique('{$column}');";
                }
            }
        }
        
        if (isset($indexes['index'])) {
            foreach (array_unique($indexes['index']) as $column) {
                $code[] = "            \$table->index('{$column}');";
            }
        }
        
        return implode("\n", $code);
    }
}