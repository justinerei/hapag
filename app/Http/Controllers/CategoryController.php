<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:80|unique:categories,name',
            'icon'        => 'required|string|max:10',
            'weather_tag' => 'required|in:rainy,hot,cool,cloudy',
        ]);

        $category = Category::create($data);

        return response()->json(['created' => true, 'category' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:80|unique:categories,name,' . $category->id,
            'icon'        => 'required|string|max:10',
            'weather_tag' => 'required|in:rainy,hot,cool,cloudy',
        ]);

        $category->update($data);

        return response()->json(['updated' => true, 'category' => $category->fresh()]);
    }

    public function destroy(Category $category)
    {
        try {
            $category->delete();
        } catch (\Illuminate\Database\QueryException $e) {
            // categories.id has restrictOnDelete on restaurants — cannot delete if restaurants are assigned
            return response()->json(
                ['error' => 'This category cannot be deleted because restaurants are assigned to it.'],
                409
            );
        }

        return response()->json(['deleted' => true]);
    }
}