"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Package, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProductInfoCard({ productData, scanResult, bmr }) {
  const getNutriScoreColor = (grade) => {
    const colors = {
      'a': 'bg-green-500',
      'b': 'bg-lime-500', 
      'c': 'bg-yellow-500',
      'd': 'bg-orange-500',
      'e': 'bg-red-500'
    };
    return colors[grade?.toLowerCase()] || 'bg-gray-500';
  };

  // Daily Value calculations based on FDA daily values
  const getDailyValue = (nutrient, value, unit) => {
    const dailyValues = {
      fat: { amount: 65, unit: 'g' },
      'saturated-fat': { amount: 20, unit: 'g' },
      cholesterol: { amount: 300, unit: 'mg' },
      sodium: { amount: 2300, unit: 'mg' },
      carbohydrates: { amount: 300, unit: 'g' },
      fiber: { amount: 25, unit: 'g' },
      protein: { amount: 50, unit: 'g' },
      proteins: { amount: 50, unit: 'g' }, // alias for protein
      sugars: { amount: 50, unit: 'g' }, // FDA daily value for added sugars
      sugar: { amount: 50, unit: 'g' }, // alias for sugars
      calcium: { amount: 1000, unit: 'mg' },
      iron: { amount: 18, unit: 'mg' },
      'vitamin-c': { amount: 60, unit: 'mg' },
      potassium: { amount: 3500, unit: 'mg' },
      salt: { amount: 6, unit: 'g' }, // WHO recommendation
      'vitamin-a': { amount: 900, unit: 'µg' },
      'vitamin-b12': { amount: 2.4, unit: 'µg' },
      'vitamin-b2': { amount: 1.3, unit: 'mg' },
      'vitamin-d': { amount: 20, unit: 'µg' }
    };

    if (!dailyValues[nutrient] || !value) return null;

    const dailyValue = dailyValues[nutrient];
    let adjustedValue = value;

    // Convert units if necessary
    if (unit !== dailyValue.unit) {
      if (unit === 'g' && dailyValue.unit === 'mg') {
        adjustedValue = value * 1000; // Convert g to mg
      } else if (unit === 'mg' && dailyValue.unit === 'g') {
        adjustedValue = value / 1000; // Convert mg to g
      } else if (unit === 'g' && dailyValue.unit === 'µg') {
        adjustedValue = value * 1000000; // Convert g to µg
      } else if (unit === 'mg' && dailyValue.unit === 'µg') {
        adjustedValue = value * 1000; // Convert mg to µg
      } else if (unit === 'µg' && dailyValue.unit === 'mg') {
        adjustedValue = value / 1000; // Convert µg to mg
      }
    }

    const percentage = ((adjustedValue / dailyValue.amount) * 100) * (bmr / 2000);
    return Math.round(percentage * 100) / 100;
  };

  // Component for nutrition row with progress bar
  const NutritionRow = ({ label, value, unit, nutrient, showProgress = true }) => {
    // Convert units for better display (e.g., g to mg for vitamins/minerals)
    let displayValue = value;
    let displayUnit = unit;
    
    // Convert very small gram values to milligrams for better readability
    if (unit === 'g' && value < 1 && ['calcium', 'iron', 'vitamin-c', 'sodium', 'potassium', 'vitamin-a', 'vitamin-b12', 'vitamin-b2', 'vitamin-d'].includes(nutrient)) {
      displayValue = Math.round(value * 1000 * 100) / 100; // Convert g to mg with 2 decimal places
      displayUnit = 'mg';
    }
    
    // Convert very small milligram values to micrograms for vitamins
    if (unit === 'g' && value < 0.001 && ['vitamin-b12', 'vitamin-d', 'vitamin-a'].includes(nutrient)) {
      displayValue = Math.round(value * 1000000 * 100) / 100; // Convert g to µg
      displayUnit = 'µg';
    } else if (displayUnit === 'mg' && displayValue < 1 && ['vitamin-b12', 'vitamin-d', 'vitamin-a'].includes(nutrient)) {
      displayValue = Math.round(displayValue * 1000 * 100) / 100; // Convert mg to µg
      displayUnit = 'µg';
    }
    
    const dailyValue = getDailyValue(nutrient, displayValue, displayUnit);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          <div className="text-right">
            <span className="text-sm font-semibold">{displayValue} {displayUnit}</span>
            {dailyValue && (
              <div className="text-xs text-muted-foreground">
                {dailyValue}% DV
              </div>
            )}
          </div>
        </div>
        {showProgress && (
          <Progress 
            value={Math.min(dailyValue, 100)} 
            className="h-1.5"
          />
        )}
      </div>
    );
  };

  if (!productData) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <small className="text-muted-foreground">Barcode: {scanResult}</small>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold leading-tight">
              {productData.product_name || "Unknown Product"}
            </CardTitle>
            {productData.brands && (
              <p className="text-sm text-muted-foreground mt-1">
                {productData.brands}
              </p>
            )}
          </div>
          {/* Nutrition Grade Display */}
          <div className="flex flex-col items-end gap-2">
            {/* Data source indicator */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs px-2 py-1",
                productData.dataSource === 'usda' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"
              )}
            >
              {productData.dataSource === 'usda' ? '🇺🇸 USDA' : '🌍 OpenFoodFacts'}
            </Badge>
            {productData.nutrition_grades && productData.nutrition_grades !== 'unknown' && (
              <Badge className={`${getNutriScoreColor(productData.nutrition_grades)} text-white font-bold text-xl px-4 py-2`}>
                {productData.nutrition_grades.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Image */}
        {(productData.image_front_url || productData.image_url) && (
          <div className="flex justify-center items-center w-full">
            <img 
              src={productData.image_front_url || productData.image_url}
              alt={productData.product_name || "Product image"}
              className="w-32 h-32 object-contain rounded-lg border bg-gray-50 mx-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Quantity */}
        {productData.quantity && (
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />
            <span className="text-sm">{productData.quantity}</span>
          </div>
        )}

        {/* Nutrition Information */}
        {productData.nutriments && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base">Nutrition Facts</h4>
              <Badge variant="outline" className="text-xs">per 100g</Badge>
            </div>
            
            {/* Calories - Highlighted Section */}
            {(productData.nutriments['energy-kcal_100g'] || productData.nutriments['energy-kj_100g']) && (
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-center items-center">
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <Zap className="size-5 text-primary" />
                        {productData.nutriments['energy-kcal_100g'] && (
                          <>
                            <span className="text-3xl font-bold text-primary">
                              {Math.round(productData.nutriments['energy-kcal_100g'])}
                            </span>
                            <span className="text-sm text-muted-foreground">kcal</span>
                          </>
                        )}
                      </div>
                      {productData.nutriments['energy-kj_100g'] && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round(productData.nutriments['energy-kj_100g'])} kJ
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Macronutrients - Always Shown */}
            <div className="space-y-4">
              <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Macronutrients</h5>
              
              {productData.nutriments.fat_100g && (
                <NutritionRow 
                  label="Total Fat" 
                  value={Math.round(productData.nutriments.fat_100g * 10) / 10} 
                  unit={productData.nutriments.fat_unit || 'g'} 
                  nutrient="fat" 
                />
              )}
              
              {productData.nutriments.carbohydrates_100g && (
                <NutritionRow 
                  label="Total Carbohydrates" 
                  value={Math.round(productData.nutriments.carbohydrates_100g * 10) / 10} 
                  unit={productData.nutriments.carbohydrates_unit || 'g'} 
                  nutrient="carbohydrates" 
                />
              )}
              
              {productData.nutriments.proteins_100g && (
                <NutritionRow 
                  label="Protein" 
                  value={Math.round(productData.nutriments.proteins_100g * 10) / 10} 
                  unit={productData.nutriments.proteins_unit || 'g'} 
                  nutrient="proteins" 
                />
              )}
            </div>
            
            {/* Detailed Nutrition - Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="detailed-nutrition">
                <AccordionTrigger className="text-sm font-medium">
                  Detailed Nutrition
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {productData.nutriments.sugars_100g && (
                      <NutritionRow 
                        label="Sugars" 
                        value={Math.round(productData.nutriments.sugars_100g * 10) / 10} 
                        unit={productData.nutriments.sugars_unit || 'g'} 
                        nutrient="sugars" 
                      />
                    )}
                    
                    {productData.nutriments.fiber_100g && (
                      <NutritionRow 
                        label="Dietary Fiber" 
                        value={Math.round(productData.nutriments.fiber_100g * 10) / 10} 
                        unit={productData.nutriments.fiber_unit || 'g'} 
                        nutrient="fiber" 
                      />
                    )}
                    
                    {productData.nutriments['saturated-fat_100g'] && (
                      <NutritionRow 
                        label="Saturated Fat" 
                        value={Math.round(productData.nutriments['saturated-fat_100g'] * 10) / 10} 
                        unit={productData.nutriments['saturated-fat_unit'] || 'g'} 
                        nutrient="saturated-fat" 
                      />
                    )}
                    
                    {productData.nutriments['trans-fat_100g'] && (
                      <div className="flex justify-between items-center pl-4">
                        <span className="text-sm text-muted-foreground">Trans Fat</span>
                        <span className="text-sm">{Math.round(productData.nutriments['trans-fat_100g'] * 10) / 10}{productData.nutriments['trans-fat_unit'] || 'g'}</span>
                      </div>
                    )}
                    
                    {productData.nutriments.sodium_100g && (
                      <NutritionRow 
                        label="Sodium" 
                        value={productData.nutriments.sodium_100g} 
                        unit={productData.nutriments.sodium_unit || 'g'} 
                        nutrient="sodium" 
                      />
                    )}
                    
                    {productData.nutriments.salt_100g && (
                      <NutritionRow 
                        label="Salt" 
                        value={Math.round(productData.nutriments.salt_100g * 10) / 10} 
                        unit={productData.nutriments.salt_unit || 'g'} 
                        nutrient="salt" 
                      />
                    )}
                    
                    {productData.nutriments.cholesterol_100g && (
                      <NutritionRow 
                        label="Cholesterol" 
                        value={productData.nutriments.cholesterol_100g} 
                        unit={productData.nutriments.cholesterol_unit || 'g'} 
                        nutrient="cholesterol" 
                      />
                    )}

                    {/* Vitamins & Minerals */}
                    {(productData.nutriments.calcium_100g || productData.nutriments.iron_100g || productData.nutriments['vitamin-c_100g'] || productData.nutriments.potassium_100g || productData.nutriments['vitamin-a_100g'] || productData.nutriments['vitamin-b12_100g'] || productData.nutriments['vitamin-b2_100g'] || productData.nutriments['vitamin-d_100g']) && (
                      <>
                        <Separator />
                        <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Vitamins & Minerals</h5>
                        
                        {productData.nutriments.calcium_100g && (
                          <NutritionRow 
                            label="Calcium" 
                            value={productData.nutriments.calcium_100g} 
                            unit={productData.nutriments.calcium_unit || 'g'} 
                            nutrient="calcium" 
                          />
                        )}
                        
                        {productData.nutriments.iron_100g && (
                          <NutritionRow 
                            label="Iron" 
                            value={productData.nutriments.iron_100g} 
                            unit={productData.nutriments.iron_unit || 'g'} 
                            nutrient="iron" 
                          />
                        )}
                        
                        {productData.nutriments['vitamin-c_100g'] && (
                          <NutritionRow 
                            label="Vitamin C" 
                            value={productData.nutriments['vitamin-c_100g']} 
                            unit={productData.nutriments['vitamin-c_unit'] || 'g'} 
                            nutrient="vitamin-c" 
                          />
                        )}
                        
                        {productData.nutriments.potassium_100g && (
                          <NutritionRow 
                            label="Potassium" 
                            value={productData.nutriments.potassium_100g} 
                            unit={productData.nutriments.potassium_unit || 'g'} 
                            nutrient="potassium" 
                          />
                        )}
                        
                        {productData.nutriments['vitamin-a_100g'] && (
                          <NutritionRow 
                            label="Vitamin A" 
                            value={productData.nutriments['vitamin-a_100g']} 
                            unit={productData.nutriments['vitamin-a_unit'] || 'g'} 
                            nutrient="vitamin-a" 
                          />
                        )}
                        
                        {productData.nutriments['vitamin-b12_100g'] && (
                          <NutritionRow 
                            label="Vitamin B12" 
                            value={productData.nutriments['vitamin-b12_100g']} 
                            unit={productData.nutriments['vitamin-b12_unit'] || 'g'} 
                            nutrient="vitamin-b12" 
                          />
                        )}
                        
                        {productData.nutriments['vitamin-b2_100g'] && (
                          <NutritionRow 
                            label="Vitamin B2 (Riboflavin)" 
                            value={productData.nutriments['vitamin-b2_100g']} 
                            unit={productData.nutriments['vitamin-b2_unit'] || 'g'} 
                            nutrient="vitamin-b2" 
                          />
                        )}
                        
                        {productData.nutriments['vitamin-d_100g'] && (
                          <NutritionRow 
                            label="Vitamin D" 
                            value={productData.nutriments['vitamin-d_100g']} 
                            unit={productData.nutriments['vitamin-d_unit'] || 'g'} 
                            nutrient="vitamin-d" 
                          />
                        )}
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Daily Value Note */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              * Percent Daily Values are based on a {bmr} calorie diet
            </div>
          </div>
        )}

        {/* Categories */}
        {productData.categories_tags && productData.categories_tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Categories</h4>
            <div className="flex flex-wrap gap-1">
              {productData.categories_tags.slice(0, 3).map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category.replace('en:', '').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {productData.ingredients_text && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Ingredients</h4>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {productData.ingredients_text}
            </p>
          </div>
        )}

        {/* source */}
        {productData.product_name && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Source:</h4>
            {productData.dataSource === 'usda' ? (
              <Link href={`https://fdc.nal.usda.gov/fdc-app.html#/food-details/${productData.fdcId}/nutrients`} target="_blank" className="text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs underline px-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-sm mr-1" />
                  USDA Food Data Central
                </Badge>
              </Link>
            ) : (
              <Link href={`https://world.openfoodfacts.org/api/v2/product/${scanResult}`} target="_blank" className="text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs underline px-3">
                  <img src="/openfoodfacts.png" alt="Open Food Facts" className="w-3 h-3 bg-white rounded-sm mr-1" />
                  openfoodfacts.org
                </Badge>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 