<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GoogleMapsController extends Controller
{
    public function resolveUrl(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);
        
        $url = $request->input('url');
        
        try {
            // Follow redirects to get the final URL
            $response = Http::withoutVerifying()
                ->withOptions(['allow_redirects' => ['max' => 5]])
                ->get($url);
            
            $finalUrl = $response->effectiveUri() ?? $url;
            $finalUrl = (string) $finalUrl;
            
            // Extract coordinates from the final URL
            $coordinates = null;
            $placeName = null;
            $address = null;
            
            // Pattern: @lat,lng
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                $coordinates = [
                    'lat' => (float) $matches[1],
                    'lng' => (float) $matches[2]
                ];
            }
            
            // Extract place name from URL
            if (preg_match('/place\/([^\/]+)/', $finalUrl, $matches)) {
                $placeName = urldecode(str_replace('+', ' ', $matches[1]));
            }
            
            // Extract address from query parameter
            if (preg_match('/[?&]q=([^&]+)/', $finalUrl, $matches)) {
                $address = urldecode($matches[1]);
            }
            
            return response()->json([
                'success' => true,
                'original_url' => $url,
                'resolved_url' => $finalUrl,
                'coordinates' => $coordinates,
                'place_name' => $placeName,
                'address' => $address
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}