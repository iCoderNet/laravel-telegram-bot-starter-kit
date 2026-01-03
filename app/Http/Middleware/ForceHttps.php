<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Force HTTPS when behind proxy (tmole, ngrok, etc.)
        if (
            app()->environment('production') ||
            $request->header('X-Forwarded-Proto') === 'https' ||
            $request->header('X-Forwarded-Ssl') === 'on' ||
            $request->isSecure()
        ) {
            URL::forceScheme('https');

            // Get the forwarded host if available, otherwise use request host
            $host = $request->header('X-Forwarded-Host') ?? $request->getHost();
            $port = $request->header('X-Forwarded-Port') ?? $request->getPort();

            // Build the HTTPS URL
            $httpsUrl = 'https://' . $host;
            if ($port && $port != 443) {
                $httpsUrl .= ':' . $port;
            }

            // Update app.url and app.asset_url
            Config::set('app.url', $httpsUrl);
            Config::set('app.asset_url', $httpsUrl);
        }

        return $next($request);
    }
}
