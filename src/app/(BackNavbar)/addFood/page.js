"use client"
import { useState, useEffect } from "react";
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SeparatorWithText } from "@/components/ui/separatorWithText";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScanBarcodeIcon, Loader2, Package, AlertCircle, Plus, ChevronDown, ChevronUp, CheckCircle, Zap, Candy, Droplets, Beef, Apple, Wheat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import Link from "next/link";

export default function AddFoodPage() {
  const [scanResult, setScanResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Debug auth state changes during scanning
  useEffect(() => {
    if (scanning) {
      console.log('[AddFood] Scanning started, current user:', !!user);
    }
  }, [scanning, user]);

  // Prevent navigation away during active scanning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (scanning) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    if (scanning) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      console.log('[AddFood] Added beforeunload listener during scanning');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [scanning]);

  const fetchProductData = async (barcode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,categories_tags,ingredients_text,nutriments,nutrition_grades,image_url,image_front_url,quantity,packaging&lc=en`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        setProductData(data.product);
        setError(null);
      } else {
        setProductData(null);
        setError("Product not found in Open Food Facts database");
      }
    } catch (err) {
      setError("Failed to fetch product information");
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanResult("");
    setProductData(null);
    setError(null);
    setScanning(true);
    
    console.log('[AddFood] Starting barcode scan...');
    
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({});
      console.log('[AddFood] Barcode scan result:', result);
      
      if (result && result.ScanResult) {
        console.log('[AddFood] Valid barcode detected:', result.ScanResult);
        setScanResult(result.ScanResult);
        await fetchProductData(result.ScanResult);
      } else {
        console.log('[AddFood] No barcode detected in result');
        setScanResult("No barcode detected.");
      }
    } catch (err) {
      console.error('[AddFood] Barcode scan error:', err);
      
      if (err && err.code === "OS-PLUG-BARC-0006") {
        setScanResult("Scan cancelled. Please ensure camera permissions are granted for this app in your device settings.");
      } else {
        setScanResult("Error: " + (err?.message || err));
      }
    } finally {
      console.log('[AddFood] Barcode scan completed, setting scanning to false');
      setScanning(false);
    }
  };

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

    const percentage = (adjustedValue / dailyValue.amount) * 100;
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
            <span className="text-sm font-semibold">{displayValue}{displayUnit}</span>
            {dailyValue && (
              <div className="text-xs text-muted-foreground">
                {dailyValue}% DV
              </div>
            )}
          </div>
        </div>
        {showProgress && dailyValue && (
          <Progress 
            value={Math.min(dailyValue, 100)} 
            className="h-1.5"
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start gap-4">
      {/* Scan Card */}
      <Card className="w-full max-w-md bg-primary/10 rounded-2xl">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="text-3xl font-bold">Add Food</CardTitle>
          <CardDescription className="text-center pt-4">
            <p>
              <b>Scan</b> the barcode
            </p>
            <SeparatorWithText>
              OR
            </SeparatorWithText>
            <p>
              <b>Scan</b> the food
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="flex items-center justify-around w-full bg-background rounded-2xl">
            <Button 
              variant="ghost" 
              onClick={handleScan} 
              disabled={scanning || loading} 
              className="size-16 flex flex-col items-center justify-center gap-0"
            >
              {scanning ? (
                <Loader2 className="text-primary size-10 animate-spin" />
              ) : (
                <ScanBarcodeIcon className="text-primary size-10 bg-primary/10 p-2 rounded-lg" />
              )}
              <p className="text-foreground/50 text-xs">
                {scanning ? "Scanning..." : "Barcode"}
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="animate-spin mr-2" />
            <span>Fetching product information...</span>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="flex items-center p-4">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              {scanResult && (
                <p className="text-red-500 text-xs mt-1">Barcode: {scanResult}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Information */}
      {productData && (
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
                  * Percent Daily Values are based on a 2,000 calorie diet
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
                <Link href={`https://world.openfoodfacts.org/api/v2/product/${scanResult}`} target="_blank" className="text-xs text-muted-foreground">openfoodfacts.org</Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {productData && (
        <div className="flex justify-center items-center sticky bottom-0 bg-background p-4 w-full rounded-t-3xl">
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                className="w-full"
                size="lg"
              >
                <Plus className="size-4 mr-2" />
                Add to Inventory
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Add to Inventory</DrawerTitle>
                <DrawerDescription>
                  <p>
                    Add the product to your inventory
                  </p>
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">

              </div>
              <DrawerFooter>
                <Button>Add to Inventory</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      )}

      {/* Scan Result (for debugging) */}
      {scanResult && !productData && !loading && !error && (
        <Card className="w-full max-w-md">
          <CardContent className="p-4">
            <div className="text-sm">
              <strong>Scanned Barcode:</strong> {scanResult}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}