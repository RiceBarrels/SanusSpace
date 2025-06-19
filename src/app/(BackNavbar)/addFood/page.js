"use client"
import { useState, useEffect } from "react";
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SeparatorWithText } from "@/components/ui/separatorWithText";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScanBarcodeIcon, Loader2, Package, AlertCircle, Plus, ChevronDown, ChevronUp, CheckCircle, Zap, Candy, Droplets, Beef, Apple, Wheat, SearchIcon, SearchCheck, SearchCheckIcon, XIcon, ArrowRightIcon, CornerDownLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "motion/react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { KeyboardHeightPx, KeyboardSafeArea, MobileSafeAreaBottom, MobileSafeAreaTop } from "@/lib/mobileSafeArea";
import ProductInfoCard from "@/components/ProductInfoCard";

export default function AddFoodPage() {
  const [scanResult, setScanResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { user } = useAuth();
  const keyboardHeight = KeyboardHeightPx();

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

  const handleSearch = () => {
    
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
      <ProductInfoCard productData={productData} scanResult={scanResult} />

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
            <div className="flex flex-1 items-end justify-center">
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
                    <Button variant="outline" className="size-10 rounded-full" onClick={()=>{

                    }}>
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
            >
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}