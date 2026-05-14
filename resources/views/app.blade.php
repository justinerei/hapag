<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Hapag</title>
    <link rel="icon" type="image/png" href="/images/favicon.png">
    <link rel="icon" type="image/png" href="/images/favicon_dark.png" media="(prefers-color-scheme: light)">
    <link rel="icon" type="image/png" href="/images/favicon.png" media="(prefers-color-scheme: dark)">
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-gray-50 text-gray-800">
    @inertia
</body>
</html>