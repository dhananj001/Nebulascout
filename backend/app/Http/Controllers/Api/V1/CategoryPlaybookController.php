<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryPlaybook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryPlaybookController extends Controller
{
    /**
     * List all categories and playbooks.
     */
    public function index(): JsonResponse
    {
        $categories = Category::with(['playbooks' => fn ($q) => $q->orderBy('name')])
            ->withCount('prospects')
            ->get();

        return response()->json($categories);
    }

    /**
     * Create a category or custom playbook.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'category_name' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'ideal_customer_profile' => 'nullable|string',
            'search_terms' => 'nullable|array',
            'default_geography' => 'nullable|string',
            'research_questions' => 'nullable|array',
            'desired_attributes' => 'nullable|array',
            'opportunity_criteria' => 'nullable|array',
            'disqualifiers' => 'nullable|array',
            'scoring_weights' => 'nullable|array',
            'preferred_services' => 'nullable|array',
            'outreach_tone' => 'nullable|string',
            'prohibited_claims' => 'nullable|array',
            'sample_messages' => 'nullable|array',
            're_research_days' => 'nullable|integer|min:7|max:365',
        ]);

        $categoryId = $validated['category_id'] ?? null;
        if (! $categoryId && ! empty($validated['category_name'])) {
            $cat = Category::firstOrCreate(
                ['slug' => Str::slug($validated['category_name'])],
                ['name' => $validated['category_name'], 'icon' => 'Sparkles']
            );
            $categoryId = $cat->id;
        }

        $slug = Str::slug($validated['name']) . '-' . Str::random(5);

        $playbook = CategoryPlaybook::create(array_merge($validated, [
            'category_id' => $categoryId,
            'slug' => $slug,
        ]));

        return response()->json($playbook->load('category'), 201);
    }

    /**
     * Update an existing playbook.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $playbook = CategoryPlaybook::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'ideal_customer_profile' => 'nullable|string',
            'search_terms' => 'nullable|array',
            'default_geography' => 'nullable|string',
            'research_questions' => 'nullable|array',
            'desired_attributes' => 'nullable|array',
            'opportunity_criteria' => 'nullable|array',
            'disqualifiers' => 'nullable|array',
            'scoring_weights' => 'nullable|array',
            'preferred_services' => 'nullable|array',
            'outreach_tone' => 'nullable|string',
            'prohibited_claims' => 'nullable|array',
            'sample_messages' => 'nullable|array',
            're_research_days' => 'nullable|integer|min:7|max:365',
        ]);

        $playbook->update($validated);

        return response()->json($playbook->fresh('category'));
    }

    /**
     * Export a playbook definition as JSON.
     */
    public function exportPlaybook(int $id): JsonResponse
    {
        $playbook = CategoryPlaybook::with('category')->findOrFail($id);
        return response()->json($playbook);
    }

    /**
     * Import a playbook from JSON.
     */
    public function importPlaybook(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_name' => 'required|string',
            'name' => 'required|string',
            'ideal_customer_profile' => 'nullable|string',
            'scoring_weights' => 'nullable|array',
            'opportunity_criteria' => 'nullable|array',
            'preferred_services' => 'nullable|array',
        ]);

        $category = Category::firstOrCreate(
            ['slug' => Str::slug($data['category_name'])],
            ['name' => $data['category_name'], 'icon' => 'Sparkles']
        );

        $playbook = CategoryPlaybook::create([
            'category_id' => $category->id,
            'name' => $data['name'],
            'slug' => Str::slug($data['name']) . '-' . Str::random(5),
            'ideal_customer_profile' => $data['ideal_customer_profile'] ?? null,
            'scoring_weights' => $data['scoring_weights'] ?? null,
            'opportunity_criteria' => $data['opportunity_criteria'] ?? null,
            'preferred_services' => $data['preferred_services'] ?? null,
        ]);

        return response()->json($playbook->load('category'), 201);
    }
}
