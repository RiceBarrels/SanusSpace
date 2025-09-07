"use client"
import { useState, useEffect } from "react";
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScanBarcodeIcon, Loader2, Package, AlertCircle, Plus, SearchIcon, SearchCheckIcon, XIcon, ArrowRightIcon, CornerDownLeftIcon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "motion/react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { KeyboardHeightPx, MobileSafeAreaBottom, MobileSafeAreaTop } from "@/lib/mobileSafeArea";
import ProductInfoCard from "@/components/ProductInfoCard";
import { mediumHapticsImpact } from "@/lib/haptics";
import { getUserBMR } from "@/lib/healthFormulas";
import { SeparatorWithText } from "@/components/ui/separatorWithText";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AddFoodPage() {
  const [scanResult, setScanResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lastSearchKeyword, setLastSearchKeyword] = useState(null);
  const [localUserData, setLocalUserData] = useState(null);
  const [gramsAmount, setGramsAmount] = useState("");
  const [addingToInventory, setAddingToInventory] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, userData } = useAuth();
  const keyboardHeight = KeyboardHeightPx();

  // Set user data from context
  useEffect(() => {
    if (userData) {
      setLocalUserData(userData);
    }
  }, [userData]);

  // search when is not loading haptics
  useEffect(() => {
    if (!searchLoading) {
      mediumHapticsImpact();
    }
  }, [searchLoading]);

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
        setGramsAmount(""); // Reset grams input for new product
        setDrawerOpen(false); // Close drawer for new product
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

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Search both OpenFoodFacts and USDA API in parallel
      const [openFoodFactsResponse, usdaResponse] = await Promise.all([
        fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,brands,image_front_url,nutrition_grades,nutriments`),
        fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&dataType=Foundation&api_key=mX7pvLXL9fZiG4ytPCzkVIXsLW0k5IQTPGRz84C7&pageSize=10`)
      ]);
      
      const openFoodFactsData = await openFoodFactsResponse.json();
      const usdaData = await usdaResponse.json();
      
      let results = [];
      
      // Add USDA results first (normalized to match OpenFoodFacts structure)
      if (usdaData.foods) {
        const normalizedUsdaProducts = usdaData.foods.map(food => normalizeUsdaFood(food));
        results = [...results, ...normalizedUsdaProducts];
      }
      
      // Add OpenFoodFacts results
      if (openFoodFactsData.products) {
        results = [...results, ...openFoodFactsData.products.map(product => ({
          ...product,
          dataSource: 'openfoodfacts'
        }))];
      }
      
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to normalize USDA food data to match OpenFoodFacts structure
  const normalizeUsdaFood = (usdaFood) => {
    const nutriments = {};
    
    // Map USDA nutrients to OpenFoodFacts format
    usdaFood.foodNutrients.forEach(nutrient => {
      const name = nutrient.nutrientName.toLowerCase();
      const value = nutrient.value;
      const unit = nutrient.unitName.toLowerCase();
      
             // Map common nutrients  
       if (name.includes('energy') && unit === 'kcal') {
         nutriments['energy-kcal_100g'] = value;
       } else if (name.includes('energy') && unit === 'kj') {
         nutriments['energy-kj_100g'] = value;
      } else if (name === 'protein') {
        nutriments.proteins_100g = value;
        nutriments.proteins_unit = unit;
      } else if (name === 'total lipid (fat)') {
        nutriments.fat_100g = value;  
        nutriments.fat_unit = unit;
      } else if (name === 'carbohydrate, by difference') {
        nutriments.carbohydrates_100g = value;
        nutriments.carbohydrates_unit = unit;
      } else if (name === 'total sugars' || name === 'sugars, total') {
        nutriments.sugars_100g = value;
        nutriments.sugars_unit = unit;
      } else if (name === 'fiber, total dietary') {
        nutriments.fiber_100g = value;
        nutriments.fiber_unit = unit;
      } else if (name === 'sodium, na') {
        // Convert mg to g for consistency with OpenFoodFacts
        nutriments.sodium_100g = unit === 'mg' ? value / 1000 : value;
        nutriments.sodium_unit = 'g';
      } else if (name === 'calcium, ca') {
        nutriments.calcium_100g = unit === 'mg' ? value / 1000 : value;
        nutriments.calcium_unit = 'g';
      } else if (name === 'iron, fe') {
        nutriments.iron_100g = unit === 'mg' ? value / 1000 : value;
        nutriments.iron_unit = 'g';
      } else if (name === 'potassium, k') {
        nutriments.potassium_100g = unit === 'mg' ? value / 1000 : value;
        nutriments.potassium_unit = 'g';
      } else if (name === 'vitamin c' || name.includes('ascorbic')) {
        nutriments['vitamin-c_100g'] = unit === 'mg' ? value / 1000 : value;
        nutriments['vitamin-c_unit'] = 'g';
      } else if (name === 'thiamin') {
        nutriments['vitamin-b1_100g'] = unit === 'mg' ? value / 1000 : value;
        nutriments['vitamin-b1_unit'] = 'g';
      } else if (name === 'riboflavin') {
        nutriments['vitamin-b2_100g'] = unit === 'mg' ? value / 1000 : value;
        nutriments['vitamin-b2_unit'] = 'g';
      } else if (name === 'vitamin b-6') {
        nutriments['vitamin-b6_100g'] = unit === 'mg' ? value / 1000 : value;
        nutriments['vitamin-b6_unit'] = 'g';
      }
    });

    return {
      code: `usda_${usdaFood.fdcId}`,
      product_name: usdaFood.description,
      brands: usdaFood.brandName || (usdaFood.foodCategory ? `USDA - ${usdaFood.foodCategory}` : 'USDA Database'),
      nutriments,
      dataSource: 'usda',
      fdcId: usdaFood.fdcId,
      categories_tags: usdaFood.foodCategory ? [`en:${usdaFood.foodCategory.toLowerCase().replace(/\s+/g, '-')}`] : []
    };
  };

  const handleSearch = async () => {
    setLastSearchKeyword(searchValue);
    await searchProducts(searchValue);
  };

  const selectProduct = async (product) => {
    setSearchOpen(false);
    setSearchValue("");
    setSearchResults([]);
    setScanResult(product.code);
    setProductData(product);
    setGramsAmount(""); // Reset grams input for new product
    setDrawerOpen(false); // Close drawer for new product
    mediumHapticsImpact();
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

  const addToMyDiet = async () => {
    if (!user || !productData || !gramsAmount || parseFloat(gramsAmount) <= 0) {
      toast.error("Please enter a valid amount in grams");
      return;
    }

    setAddingToInventory(true);
    
    try {
      // Get current user data first
      const { data: currentUserData, error: fetchError } = await supabase
        .from('userdatas')
        .select('foodConsumes')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw fetchError;
      }

      // Get current date in MM/DD/YYYY format
      const today = new Date();
      const currentDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

      // Prepare food consumption data
      const foodConsumption = {
        source: productData.dataSource === 'usda' ? 'usda' : 'OFD',
        id: productData.dataSource === 'usda' ? productData.fdcId.toString() : productData.code,
        title: productData.product_name || 'Unknown Product',
        kcal_per_100g: (productData.nutriments?.['energy-kcal_100g'] || productData.nutriments?.energy_kcal_100g || 0).toString(),
        grams: gramsAmount
      };

      // Get existing foodConsumes array or initialize empty array
      const existingFoodConsumes = currentUserData?.foodConsumes || [];
      
      // Find if there's already an entry for today
      const todayEntryIndex = existingFoodConsumes.findIndex(entry => entry.date === currentDate);
      
      let updatedFoodConsumes;
      if (todayEntryIndex !== -1) {
        // Add to existing date entry
        updatedFoodConsumes = [...existingFoodConsumes];
        updatedFoodConsumes[todayEntryIndex] = {
          ...updatedFoodConsumes[todayEntryIndex],
          consumes: [...updatedFoodConsumes[todayEntryIndex].consumes, foodConsumption]
        };
      } else {
        // Create new date entry and add to front (newest first)
        const newDateEntry = {
          date: currentDate,
          consumes: [foodConsumption]
        };
        updatedFoodConsumes = [newDateEntry, ...existingFoodConsumes];
      }

      // Update the database
      const { error: updateError } = await supabase
        .from('userdatas')
        .update({
          foodConsumes: updatedFoodConsumes
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Success feedback
      toast.success(`Added ${gramsAmount}g of ${productData.product_name} to your diet!`);
      mediumHapticsImpact();
      
      // Reset form and close drawer
      setGramsAmount("");
      setDrawerOpen(false);
      
    } catch (error) {
      console.error('Error adding food to diet:', error);
      toast.error("Failed to add food to your diet. Please try again.");
    } finally {
      setAddingToInventory(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start gap-4">
      {/* Scan Card */}
      <Card className="w-full max-w-md bg-primary/10 rounded-4xl">
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
        <CardContent className="flex flex-col items-center px-2">
          <Card className="w-full">
            <CardContent className="flex items-center justify-around w-full">
              <Button 
                variant="ghost" 
                onClick={handleScan} 
                disabled={scanning || loading} 
                className="size-16 flex flex-col items-center justify-center gap-0"
              >
                {scanning ? (
                  <Loader2 className="text-primary size-10 animate-spin" />
                ) : (
                  <ScanBarcodeIcon className="text-primary size-10 bg-primary/10 p-2 rounded-lg border-t border-b border-white/10" />
                )}
                <p className="text-foreground/50 text-xs">
                  {scanning ? "Scanning..." : "Barcode"}
                </p>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={()=>setSearchOpen(true)} 
                disabled={scanning || loading} 
                className="size-16 flex flex-col items-center justify-center gap-0"
              >
                <SearchCheckIcon className="text-primary size-10 bg-primary/10 p-2 rounded-lg border-t border-b border-white/10" />
                <p className="text-foreground/50 text-xs">
                  Search
                </p>
              </Button>
            </CardContent>
          </Card>
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

      {/* Product Information - Now using the separate component */}
                  <ProductInfoCard productData={productData} scanResult={scanResult} bmr={getUserBMR(localUserData) || 2000} />

      {productData && (
        <div className="flex justify-center items-center sticky bottom-0 bg-background p-4 w-full rounded-t-3xl">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button 
                className="w-full"
                size="lg"
              >
                <Plus className="size-4 mr-2" />
                Add to My Diet
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Add to My Diet</DrawerTitle>
                <DrawerDescription>
                  <p>
                    Specify how many grams you consumed
                  </p>
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grams">Amount (grams)</Label>
                  <Input
                    id="grams"
                    type="number"
                    placeholder="e.g. 100"
                    value={gramsAmount}
                    onChange={(e) => setGramsAmount(e.target.value)}
                    min="0"
                    step="0.1"
                    className="text-lg"
                  />
                  {gramsAmount && parseFloat(gramsAmount) > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Calories: {Math.round((parseFloat(gramsAmount) * (productData.nutriments?.['energy-kcal_100g'] || productData.nutriments?.energy_kcal_100g || 0)) / 100)} kcal
                      </p>
                    </div>
                  )}
                </div>
                {/* Product Summary */}
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {productData.image_front_url && (
                        <img 
                          src={productData.image_front_url} 
                          alt={productData.product_name}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight line-clamp-1">
                          {productData.product_name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {productData.brands}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(productData.nutriments?.['energy-kcal_100g'] || productData.nutriments?.energy_kcal_100g || 0)} kcal/100g
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <DrawerFooter className="pb-0">
                <Button 
                  className="w-full"
                  onClick={addToMyDiet}
                  disabled={addingToInventory || !gramsAmount || parseFloat(gramsAmount) <= 0}
                >
                  {addingToInventory ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Adding to Diet...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="size-4 mr-2" />
                      Add to My Diet
                    </>
                  )}
                </Button>
                
                {/* Safe area handling */}
                <div className="flex flex-col">
                  <MobileSafeAreaBottom />
                  <motion.div
                    className="w-full"
                    initial={{ height: 0 }}
                    animate={{ height: keyboardHeight }}
                    exit={{ height: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      mass: 0.5,
                    }}
                  />
                </div>
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

      {/* Search Drawer */}
      <AnimatePresence mode="wait">
        {searchOpen && (
          <motion.div className="flex flex-col items-center justify-center fixed top-0 left-0 w-full h-full bg-foreground/10 z-50"
            initial={{ opacity: 0, backdropFilter: "blur(0px)", blur: 16 }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)", blur: 0 }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", blur: 16 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 0.8,
            }}
          >
            <div className="flex flex-col items-start justify-start w-full px-4 gap-4">
              <MobileSafeAreaTop />
              <Button variant="outline" className="h-10 rounded-full" onClick={()=>setSearchOpen(false)}>
                <XIcon className="size-4 text-muted-foreground" /> Close
              </Button>
            </div>
            <div className="flex flex-col items-center justify-start flex-1 w-full overflow-y-auto mt-4 rounded-t-3xl">
              {/* search results */}
              {searchLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin mr-2" />
                  <span>Searching...</span>
                </div>
              )}
              
              {!searchLoading && searchResults.length > 0 && lastSearchKeyword === searchValue && (
                <div className="w-full space-y-3 py-4 px-4">
                  {searchResults.map((product) => (
                    <Card 
                      key={product.code} 
                      className="w-full cursor-pointer bg-background/70 hover:bg-accent/50 transition-colors backdrop-blur-sm"
                      onClick={() => selectProduct(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {product.image_front_url && (
                            <img 
                              src={product.image_front_url} 
                              alt={product.product_name}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                              {product.product_name || 'Unknown Product'}
                            </h3>
                            {product.brands && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {product.brands}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Data source indicator */}
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs px-2 py-0.5",
                                  product.dataSource === 'usda' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"
                                )}
                              >
                                {product.dataSource === 'usda' ? '🇺🇸 USDA' : '🌍 OpenFoodFacts'}
                              </Badge>
                              {product.nutrition_grades && (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs px-2 py-0.5",
                                    product.nutrition_grades === 'a' && "bg-green-100 text-green-800 border-green-200",
                                    product.nutrition_grades === 'b' && "bg-lime-100 text-lime-800 border-lime-200",
                                    product.nutrition_grades === 'c' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                                    product.nutrition_grades === 'd' && "bg-orange-100 text-orange-800 border-orange-200",
                                    product.nutrition_grades === 'e' && "bg-red-100 text-red-800 border-red-200"
                                  )}
                                >
                                  Nutri-Score {product.nutrition_grades?.toUpperCase()}
                                </Badge>
                              )}
                              {(product.nutriments?.['energy-kcal_100g'] || product.nutriments?.energy_kcal_100g) && (
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(product.nutriments['energy-kcal_100g'] || product.nutriments.energy_kcal_100g)} kcal/100g
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ArrowRightIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {!searchLoading && searchValue.trim() && searchResults.length === 0 && lastSearchKeyword === searchValue && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground">Try a different search term</p>
                </div>
              )}
              
              {!searchValue.trim() && !searchLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <SearchIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Search for food products</p>
                  <p className="text-sm text-muted-foreground">Enter a product name or brand</p>
                </div>
              )}

              {!searchLoading && searchValue.trim() && searchResults.length > 0 && lastSearchKeyword !== searchValue && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CornerDownLeftIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Press the search button to search for products</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center fixed bottom-0 left-0 w-full">
              <div className="flex items-end justify-center">
                <motion.div 
                  className="flex items-center px-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, width: searchValue.length > 0 ? "calc(100vw - 64px)" : "calc(100vw - 128px)" }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    mass: 0.8,
                  }}
                >
                  <Input
                    placeholder="Search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={()=>{
                      setSearchFocused(true);
                    }}
                    onBlur={()=>{
                      setSearchFocused(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className={cn("p-6 rounded-full")}
                  />
                </motion.div>

                <AnimatePresence mode="wait">
                  {searchValue.length > 0 && (
                    <motion.div 
                      className={cn("flex flex-col items-center justify-center")}
                      initial={{ opacity: 0, height: 0, width: 0, x: -64 }}
                      animate={{ opacity: 1, height: 48, width: 48, x: 0 }}
                      exit={{ opacity: 0, height: 0, width: 0, x: -64}}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        mass: 0.8,
                      }}
                    >
                      <Button variant="outline" className="size-10 rounded-full" onClick={handleSearch}>
                        <CornerDownLeftIcon className={cn("size-4 text-muted-foreground", !searchValue.length > 0 && "rotate-180 size-0")} />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
                <MobileSafeAreaBottom />
                <motion.div
                  className="w-full"
                  initial={{ height: 0 }}
                  animate={{ height: keyboardHeight }}
                  exit={{ height: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                    mass: 0.5,
                  }}
                />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
