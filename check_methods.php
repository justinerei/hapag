$reflection = new ReflectionClass('App\Http\Controllers\AIController');
echo implode(', ', array_column($reflection->getMethods(), 'name'));
