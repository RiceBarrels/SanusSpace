"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Target, Flame, Plus, Minus } from "lucide-react";
import { FaFire } from "react-icons/fa6";
import { getCaloriesData, requestAuthorization } from "@/lib/healthKit";
import { getUserBMR } from "@/lib/healthFormulas";
import { Capacitor } from "@capacitor/core";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/pageHeader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { CalendarIcon } from "lucide-react";

export default function CaloriesDetailPage() {
    const { user, userData } = useAuth();
    const [localUserData, setLocalUserData] = useState(null);
    const [caloriesData, setCaloriesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState([]);
    const [consumedCalories, setConsumedCalories] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const isNativeIos = Capacitor.getPlatform() === 'ios';

    // Calculate BMR when userData is available
    const bmr = localUserData ? getUserBMR(localUserData) : 0;

    // Calculate selected date's consumed calories from foodConsumes data
    const calculateSelectedDateConsumedCalories = (userData, date) => {
        if (!userData?.foodConsumes) return 0;
        
        const selectedDateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        
        const selectedEntry = userData.foodConsumes.find(entry => entry.date === selectedDateStr);
        if (!selectedEntry?.consumes) return 0;
        
        return selectedEntry.consumes.reduce((total, food) => {
            const kcalPer100g = parseFloat(food.kcal_per_100g) || 0;
            const grams = parseFloat(food.grams) || 0;
            return total + (kcalPer100g * grams / 100);
        }, 0);
    };

    // Get weekly consumed calories centered around selected date
    const getWeeklyConsumedCalories = (userData, centerDate) => {
        if (!userData?.foodConsumes) return {};
        
        const weeklyConsumed = {};
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(centerDate);
            date.setDate(date.getDate() - i);
            const dateString = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
            
            const dayEntry = userData.foodConsumes.find(entry => entry.date === dateString);
            const dayCalories = dayEntry?.consumes?.reduce((total, food) => {
                const kcalPer100g = parseFloat(food.kcal_per_100g) || 0;
                const grams = parseFloat(food.grams) || 0;
                return total + (kcalPer100g * grams / 100);
            }, 0) || 0;
            
            weeklyConsumed[date.toDateString()] = dayCalories;
        }
        
        return weeklyConsumed;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Use user data from context
                if (userData) {
                    setLocalUserData(userData);
                    
                    const selectedDateConsumed = calculateSelectedDateConsumedCalories(userData, selectedDate);
                    setConsumedCalories(selectedDateConsumed);
                }

                // Fetch calories burned data
                if (isNativeIos) {
                    await requestAuthorization();
                    
                    // Selected date's calories
                    const dayStartDate = new Date(selectedDate);
                    dayStartDate.setHours(0, 0, 0, 0);
                    const dayEndDate = new Date(selectedDate);
                    dayEndDate.setHours(23, 59, 59, 999);

                    // Weekly calories centered around selected date
                    const weekStart = new Date(selectedDate);
                    weekStart.setDate(weekStart.getDate() - 6);
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(selectedDate);
                    weekEnd.setHours(23, 59, 59, 999);

                    const [todayResult, weeklyResult] = await Promise.all([
                        getCaloriesData(dayStartDate, dayEndDate),
                        getCaloriesData(weekStart, weekEnd)
                    ]);

                    setCaloriesData(todayResult);
                    
                    // Process weekly data for chart
                    if (weeklyResult?.resultData && userData) {
                        const weeklyConsumed = getWeeklyConsumedCalories(userData, selectedDate);
                        const dailyBurned = {};
                        
                        weeklyResult.resultData.forEach(item => {
                            const date = new Date(item.startDate).toDateString();
                            if (!dailyBurned[date]) {
                                dailyBurned[date] = 0;
                            }
                            dailyBurned[date] += (item.value || 0);
                        });

                        const chartData = [];
                        for (let i = 6; i >= 0; i--) {
                            const date = new Date(selectedDate);
                            date.setDate(date.getDate() - i);
                            const dateString = date.toDateString();
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const exerciseCalories = dailyBurned[dateString] || 0;
                            const totalBurned = exerciseCalories + bmr;
                            const consumed = weeklyConsumed[dateString] || 0;
                            const balance = consumed - totalBurned;
                            
                            chartData.push({
                                day: dayName,
                                burned: Math.round(totalBurned),
                                consumed: Math.round(consumed),
                                balance: Math.round(balance),
                                date: dateString,
                                isSelected: dateString === selectedDate.toDateString()
                            });
                        }
                        
                        setWeeklyData(chartData);
                    }
                }
            } catch (error) {
                console.error("Error fetching calories data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, userData, isNativeIos, bmr, selectedDate]);

    // Calculate today's metrics
    const totalExerciseCalories = caloriesData?.resultData ? 
        caloriesData.resultData.reduce((total, item) => total + (item.value || 0), 0) : 0;
    
    const totalBurnedCalories = totalExerciseCalories + bmr;
    const calorieBalance = consumedCalories - totalBurnedCalories;
    const weeklyAvgBalance = weeklyData.length > 0 ? 
        weeklyData.reduce((sum, day) => sum + day.balance, 0) / weeklyData.length : 0;

    const chartConfig = {
        burned: {
            label: "Burned",
            color: "hsl(var(--cal))",
        },
        consumed: {
            label: "Consumed", 
            color: "hsl(var(--primary))",
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 pb-24">
                {/* Header Skeleton */}
                <div className="w-full pb-4 rounded-b-3xl border-b border-foreground/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between w-full p-4">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-5 w-60" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>

                <div className="flex flex-col gap-6 p-4 pb-24">
                    {/* Today's Balance Skeleton */}
                    <Card className="bg-cal/10">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <Skeleton className="h-16 w-24 mx-auto mb-2" />
                                <Skeleton className="h-4 w-20 mx-auto" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-cal/20 rounded-lg">
                                    <Skeleton className="h-5 w-5 mx-auto mb-2" />
                                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-20 mx-auto" />
                                    <Skeleton className="h-3 w-24 mx-auto mt-1" />
                                </div>
                                <div className="text-center p-4 bg-primary/20 rounded-lg">
                                    <Skeleton className="h-5 w-5 mx-auto mb-2" />
                                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-24 mx-auto" />
                                    <Skeleton className="h-3 w-32 mx-auto mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 7-Day Trend Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-44" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-40 w-full mb-4" />
                            <div className="flex justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-3 h-3 rounded" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-3 h-3 rounded" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Insights Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <Skeleton className="h-4 w-40" />
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

            {/* Today's Calorie Summary */}
            <Card className="bg-cal/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="size-5 text-cal" />
                        {selectedDate.toDateString() === new Date().toDateString() ? "Today's Balance" : "Daily Balance"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center mb-6">
                        <div className={cn(
                            "text-4xl font-bold",
                            calorieBalance > 0 ? "text-orange-600" : "text-green-600"
                        )}>
                            {calorieBalance > 0 ? `+${Math.round(calorieBalance)}` : Math.round(calorieBalance)}
                        </div>
                        <div className="text-muted-foreground">
                            {calorieBalance > 0 ? "Calorie Surplus" : "Calorie Deficit"}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-cal/20 rounded-lg">
                            <Minus className="size-5 mx-auto mb-2 text-cal" />
                            <div className="text-2xl font-bold text-foreground">
                                {Math.round(totalBurnedCalories)}
                            </div>
                            <div className="text-xs text-muted-foreground">Calories Burned</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                BMR: {Math.round(bmr)} | Exercise: {Math.round(totalExerciseCalories)}
                            </div>
                        </div>
                        
                        <div className="text-center p-4 bg-primary/20 rounded-lg">
                            <Plus className="size-5 mx-auto mb-2 text-primary" />
                            <div className="text-2xl font-bold text-foreground">
                                {Math.round(consumedCalories)}
                            </div>
                            <div className="text-xs text-muted-foreground">Calories Consumed</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                From food & beverages
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 7-Day Trend */}
            {weeklyData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="size-5" />
                            7-Day Calorie Trend
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
                                                `${Math.round(value)} cal`,
                                                name === 'burned' ? 'Burned' : 'Consumed'
                                            ]}
                                        />} 
                                    />
                                    <Bar dataKey="burned" fill="var(--cal)" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="consumed" fill="var(--primary)" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                        
                        <div className="flex justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-cal rounded"></div>
                                <span>Burned</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-primary rounded"></div>
                                <span>Consumed</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Calorie Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flame className="size-5" />
                        Insights & Goals
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Daily Deficit Goal (-500 cal)</span>
                            <span className={cn(
                                "text-sm font-semibold",
                                calorieBalance <= -300 ? "text-green-600" : "text-orange-600"
                            )}>
                                {calorieBalance <= -300 ? "✅ On Track" : "⚠️ Behind"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Weekly Average Balance</span>
                            <span className={cn(
                                "text-sm font-semibold",
                                weeklyAvgBalance <= -300 ? "text-green-600" : "text-orange-600"
                            )}>
                                {weeklyAvgBalance > 0 ? `+${Math.round(weeklyAvgBalance)}` : Math.round(weeklyAvgBalance)} cal
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">BMR (Base Metabolic Rate)</span>
                            <span className="text-sm font-semibold">
                                {Math.round(bmr)} cal/day
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-semibold text-blue-900 mb-2">Calorie Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• A deficit of 500 cal/day = 1 lb weight loss per week</li>
                            <li>• Focus on nutrient-dense, low-calorie foods</li>
                            <li>• Track everything you eat and drink</li>
                            <li>• Combine diet with regular exercise for best results</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
}