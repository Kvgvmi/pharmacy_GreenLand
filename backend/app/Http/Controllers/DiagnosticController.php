<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DiagnosticController extends Controller
{
    public function index()
    {
        $diagnostics = [
            'api_status' => 'online',
            'timestamp' => now()->toDateTimeString(),
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
            'environment' => config('app.env')
        ];
        
        // Test database connection
        try {
            DB::connection()->getPdo();
            $diagnostics['database_connection'] = 'success';
            $diagnostics['database_name'] = DB::connection()->getDatabaseName();
        } catch (\Exception $e) {
            $diagnostics['database_connection'] = 'error';
            $diagnostics['database_error'] = $e->getMessage();
        }
        
        // Test storage
        try {
            $diagnostics['storage_writable'] = Storage::disk('public')->put('test.txt', 'Test file content');
            Storage::disk('public')->delete('test.txt');
        } catch (\Exception $e) {
            $diagnostics['storage_writable'] = false;
            $diagnostics['storage_error'] = $e->getMessage();
        }
        
        return response()->json($diagnostics);
    }
}