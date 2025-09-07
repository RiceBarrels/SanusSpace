"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Apple, Clock, Plus, PieChart, CalendarIcon } from "lucide-react";
import { MdRestaurant } from "react-icons/md";
import ForwardLink from "@/components/ui/forwardLink";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/pageHeader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";


export default function NutritionDetailPage() {
    const { user, userData } = useAuth();
    const [localUserData, setLocalUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [todaysFoods, setTodaysFoods] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [nutritionSummary, setNutritionSummary] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Calculate selected date's consumed calories from foodConsumes data
    const calculateSelectedDateData = (userData, date) => {
        if (!userData?.foodConsumes) return { foods: [], summary: nutritionSummary };
        
        const selectedDateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        
        const selectedEntry = userData.foodConsumes.find(entry => entry.date === selectedDateStr);
        if (!selectedEntry?.consumes) return { foods: [], summary: nutritionSummary };
        
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let totalFiber = 0;
        let totalSugar = 0;

        const foods = selectedEntry.consumes.map(food => {
            const kcalPer100g = parseFloat(food.kcal_per_100g) || 0;
            const grams = parseFloat(food.grams) || 0;
            const calories = (kcalPer100g * grams) / 100;
            
            totalCalories += calories;
            
            return {
                ...food,
                calculatedCalories: Math.round(calories),
                displayGrams: grams
            };
        });

        return {
            foods,
            summary: {
                calories: Math.round(totalCalories),
                protein: Math.round(totalProtein),
                carbs: Math.round(totalCarbs),
                fat: Math.round(totalFat),
                fiber: Math.round(totalFiber),
                sugar: Math.round(totalSugar)
            }
        };
    };

    // Get weekly nutrition data centered around selected date
    const getWeeklyNutritionData = (userData, centerDate) => {
        if (!userData?.foodConsumes) return [];
        
        const weeklyData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(centerDate);
            date.setDate(date.getDate() - i);
            const dateString = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const dayEntry = userData.foodConsumes.find(entry => entry.date === dateString);
            let dayCalories = 0;
            let foodCount = 0;
            
            if (dayEntry?.consumes) {
                dayCalories = dayEntry.consumes.reduce((total, food) => {
                    const kcalPer100g = parseFloat(food.kcal_per_100g) || 0;
                    const grams = parseFloat(food.grams) || 0;
                    return total + (kcalPer100g * grams / 100);
                }, 0);
                foodCount = dayEntry.consumes.length;
            }
            
            weeklyData.push({
                day: dayName,
                calories: Math.round(dayCalories),
                foodCount,
                date: dateString,
                isSelected: dateString === `${String(centerDate.getMonth() + 1).padStart(2, '0')}/${String(centerDate.getDate()).padStart(2, '0')}/${centerDate.getFullYear()}`
            });
        }
        
        return weeklyData;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Use user data from context
                if (userData) {
                    setLocalUserData(userData);
                    
                    const { foods, summary } = calculateSelectedDateData(userData, selectedDate);
                    setTodaysFoods(foods);
                    setNutritionSummary(summary);
                    
                    const weekly = getWeeklyNutritionData(userData, selectedDate);
                    setWeeklyData(weekly);
                }
            } catch (error) {
                console.error("Error fetching nutrition data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, userData, selectedDate]);

    const weeklyAvgCalories = weeklyData.length > 0 ? 
        weeklyData.reduce((sum, day) => sum + day.calories, 0) / weeklyData.length : 0;
    
    const weeklyAvgFoods = weeklyData.length > 0 ? 
        weeklyData.reduce((sum, day) => sum + day.foodCount, 0) / weeklyData.length : 0;

    const chartConfig = {
        calories: {
            label: "Calories",
            color: "hsl(var(--primary))",
        },
        foodCount: {
            label: "Foods",
            color: "hsl(142, 76%, 36%)",
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 pb-24">
                {/* Header Skeleton */}
                <div className="w-full pb-4 rounded-b-3xl border-b border-foreground/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between w-full p-4">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-8 w-44" />
                            <Skeleton className="h-5 w-60" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>

                <div className="flex flex-col gap-6 p-4 pb-24">
                    {/* Today's Summary Skeleton */}
                    <Card className="bg-green-500/10">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center">
                                    <Skeleton className="h-12 w-20 mx-auto mb-2" />
                                    <Skeleton className="h-4 w-16 mx-auto" />
                                </div>
                                <div className="text-center">
                                    <Skeleton className="h-12 w-8 mx-auto mb-2" />
                                    <Skeleton className="h-4 w-20 mx-auto" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-24" />
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-3 bg-white rounded-lg border">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-32 mb-1" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <Skeleton className="h-4 w-12" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weekly Chart Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-40 w-full mb-4" />
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>

                    {/* Insights Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between w-full p-8 pb-4">
                <span className="flex gap-2 items-center">
                    <Calendar className="size-4" />
                    {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </span>
                <Drawer open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DrawerTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <CalendarIcon className="size-4" />
                            Change Date
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Select Date</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 flex justify-center">
                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) {
                                        setSelectedDate(date);
                                        setIsCalendarOpen(false);
                                    }
                                }}
                                disabled={(date) => 
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
            <div className="flex flex-col gap-6 p-4 pb-24">

            {/* Today's Summary */}
            <Card className="bg-green-500/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Apple className="size-5 text-green-600" />
                        {selectedDate.toDateString() === new Date().toDateString() ? "Today's Intake" : "Daily Intake"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {nutritionSummary.calories}
                            </div>
                            <div className="text-muted-foreground">Total Calories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {todaysFoods.length}
                            </div>
                            <div className="text-muted-foreground">Foods Logged</div>
                        </div>
                    </div>

                    {/* Selected Date's Food List */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">
                            {selectedDate.toDateString() === new Date().toDateString() ? "Today's Foods:" : "Foods Logged:"}
                        </h4>
                        {todaysFoods.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {todaysFoods.map((food, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm line-clamp-1">
                                                {food.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {food.displayGrams}g • {food.source.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-sm">
                                                {food.calculatedCalories} cal
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Apple className="size-12 mx-auto mb-4 opacity-50" />
                                <p>
                                    {selectedDate.toDateString() === new Date().toDateString() 
                                        ? "No foods logged today" 
                                        : "No foods logged for this date"
                                    }
                                </p>
                                <ForwardLink href="/addFood" className="mt-2">
                                    <div className="inline-flex items-center gap-2 text-primary hover:underline">
                                        <Plus className="size-4" />
                                        Add your first food
                                    </div>
                                </ForwardLink>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Nutrition Trend */}
            {weeklyData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="size-5" />
                            7-Day Nutrition Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-40 mb-4">
                            <ChartContainer config={chartConfig} className="h-full">
                                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                    <XAxis 
                                        dataKey="day" 
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        width={40}
                                    />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent 
                                            formatter={(value, name) => [
                                                name === 'calories' ? `${Math.round(value)} cal` : `${value} foods`,
                                                name === 'calories' ? 'Calories' : 'Foods Logged'
                                            ]}
                                        />} 
                                    />
                                    <Bar 
                                        dataKey="calories" 
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {weeklyData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`}
                                                fill={entry.isSelected ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 60%, transparent)'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </div>
                        
                        {/* Food Count Line Chart */}
                        <div className="w-full h-32">
                            <ChartContainer config={chartConfig} className="h-full">
                                <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                    <XAxis 
                                        dataKey="day" 
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        width={30}
                                    />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent 
                                            formatter={(value, name) => [
                                                `${value} foods`,
                                                'Foods Logged'
                                            ]}
                                        />} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="foodCount" 
                                        stroke="hsl(142, 76%, 36%)" 
                                        strokeWidth={3}
                                        dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Nutrition Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="size-5" />
                        Nutrition Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Daily Calorie Average</span>
                            <span className="text-sm font-semibold">
                                {Math.round(weeklyAvgCalories)} cal/day
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Foods Logged per Day</span>
                            <span className="text-sm font-semibold">
                                {Math.round(weeklyAvgFoods * 10) / 10} foods/day
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Tracking Consistency</span>
                            <span className="text-sm font-semibold text-green-600">
                                {weeklyData.filter(day => day.foodCount > 0).length}/7 days
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Data Sources</span>
                            <span className="text-sm font-semibold">
                                USDA & OpenFoodFacts
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <ForwardLink href="/addFood">
                            <Card className="bg-primary/10 hover:bg-primary/15 transition-colors cursor-pointer">
                                <CardContent className="p-4 text-center">
                                    <Plus className="size-6 mx-auto mb-2 text-primary" />
                                    <div className="font-semibold text-sm">Add Food</div>
                                </CardContent>
                            </Card>
                        </ForwardLink>
                        
                        <Card className="bg-green-500/10 hover:bg-green-500/15 transition-colors cursor-pointer">
                            <CardContent className="p-4 text-center">
                                <Clock className="size-6 mx-auto mb-2 text-green-600" />
                                <div className="font-semibold text-sm">Meal Plans</div>
                                <div className="text-xs text-muted-foreground">Coming Soon</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-semibold text-blue-900 mb-2">Nutrition Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Log all foods and beverages for accurate tracking</li>
                            <li>• Focus on whole, nutrient-dense foods</li>
                            <li>• Pay attention to portion sizes and serving amounts</li>
                            <li>• Stay consistent with daily food logging</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
}