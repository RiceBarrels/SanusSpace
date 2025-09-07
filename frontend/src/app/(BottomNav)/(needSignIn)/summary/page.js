"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight, TrendingUp, TrendingDown, Calendar, Clock, CalendarIcon } from "lucide-react";
import { FaBedPulse, FaFire } from "react-icons/fa6";
import { IoFootsteps } from "react-icons/io5";
import { MdRestaurant } from "react-icons/md";
import ForwardLink from "@/components/ui/forwardLink";
import { getSleepData, getCaloriesData, getStepsData, requestAuthorization } from "@/lib/healthKit";
import { getUserBMR } from "@/lib/healthFormulas";
import { Capacitor } from "@capacitor/core";
import { cn } from "@/lib/utils";
import { MobileSafeAreaTop } from "@/lib/mobileSafeArea";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, LineChart, Line } from "recharts";
import { PageHeader } from "@/components/ui/pageHeader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

export default function SummaryPage(){
    const { user, userData } = useAuth();
    const [localUserData, setLocalUserData] = useState(null);
    const [healthData, setHealthData] = useState({
        sleep: null,
        calories: null,
        steps: null
    });
    const [loading, setLoading] = useState(true);
    const [consumedCalories, setConsumedCalories] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const isNativeIos = Capacitor.getPlatform() === 'ios';

    // Calculate BMR when userData is available
    const bmr = localUserData ? getUserBMR(localUserData) : 0;

    // Calculate selected date's consumed calories from foodConsumes data
    const calculateSelectedDateConsumedCalories = (userData, date) => {
        if (!userData?.foodConsumes) return 0;
        
        const selectedDateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        
        const dateEntry = userData.foodConsumes.find(entry => entry.date === selectedDateStr);
        if (!dateEntry?.consumes) return 0;
        
        return dateEntry.consumes.reduce((total, food) => {
            const kcalPer100g = parseFloat(food.kcal_per_100g) || 0;
            const grams = parseFloat(food.grams) || 0;
            return total + (kcalPer100g * grams / 100);
        }, 0);
    };

    // Get selected date's food count
    const getSelectedDateFoodCount = (userData, date) => {
        if (!userData?.foodConsumes) return 0;
        
        const selectedDateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        
        const dateEntry = userData.foodConsumes.find(entry => entry.date === selectedDateStr);
        return dateEntry?.consumes?.length || 0;
    };

    // Process weekly data for chart centered around selected date
    const processWeeklyData = (userData, stepsData, caloriesData, sleepData, centerDate) => {
        const chartData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(centerDate);
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            // Get consumed calories for this day
            const dateKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
            const dayEntry = userData?.foodConsumes?.find(entry => entry.date === dateKey);
            const consumedCal = dayEntry?.consumes?.reduce((total, food) => {
                const kcalPer100g = parseFloat(food.kcal_per_100g) || 0;
                const grams = parseFloat(food.grams) || 0;
                return total + (kcalPer100g * grams / 100);
            }, 0) || 0;

            chartData.push({
                day: dayName,
                consumed: Math.round(consumedCal),
                isSelected: dateString === centerDate.toDateString()
            });
        }

        return chartData;
    };

    // Fetch user data and health data
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

                // Fetch health data
                if (isNativeIos) {
                    await requestAuthorization();
                    
                    // Sleep data - 24 hours before selected date
                    const sleepStartDate = new Date(selectedDate);
                    sleepStartDate.setDate(sleepStartDate.getDate() - 1);
                    const sleepEndDate = new Date(selectedDate);
                    
                    // Calories and steps data - selected date
                    const dayStartDate = new Date(selectedDate);
                    dayStartDate.setHours(0, 0, 0, 0);
                    const dayEndDate = new Date(selectedDate);
                    dayEndDate.setHours(23, 59, 59, 999);

                    const [sleepResult, caloriesResult, stepsResult] = await Promise.all([
                        getSleepData(sleepStartDate, sleepEndDate),
                        getCaloriesData(dayStartDate, dayEndDate),
                        getStepsData(dayStartDate, dayEndDate)
                    ]);

                    setHealthData({
                        sleep: sleepResult,
                        calories: caloriesResult,
                        steps: stepsResult
                    });

                    // Process weekly data for chart
                    if (userData) {
                        const weekly = processWeeklyData(userData, stepsResult, caloriesResult, sleepResult, selectedDate);
                        setWeeklyData(weekly);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, userData, isNativeIos, selectedDate]);

    // Calculate health metrics
    const sleepHours = healthData.sleep?.resultData ? 
        Math.floor(healthData.sleep.resultData.reduce((total, item) => total + (item.value || 0), 0) / 3600) : 0;
    
    const sleepMinutes = healthData.sleep?.resultData ? 
        Math.round((healthData.sleep.resultData.reduce((total, item) => total + (item.value || 0), 0) % 3600) / 60) : 0;

    const totalCaloriesBurned = (healthData.calories?.resultData ? 
        healthData.calories.resultData.reduce((total, item) => total + (item.value || 0), 0) : 0) + bmr;

    const totalSteps = healthData.steps?.resultData ? 
        healthData.steps.resultData.reduce((total, item) => total + (item.value || 0), 0) : 0;

    const calorieDeficit = totalCaloriesBurned - consumedCalories;
    const foodCount = getSelectedDateFoodCount(localUserData, selectedDate);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 pb-24">
                <MobileSafeAreaTop />
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
                    {/* Overview Card Skeleton */}
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                                    <Skeleton className="h-4 w-20 mx-auto" />
                                </div>
                                <div className="text-center">
                                    <Skeleton className="h-8 w-8 mx-auto mb-1" />
                                    <Skeleton className="h-4 w-16 mx-auto" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart Card Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-44" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-32 w-full mb-2" />
                            <Skeleton className="h-4 w-32 mx-auto" />
                        </CardContent>
                    </Card>

                    {/* Health Metric Cards Skeleton */}
                    {[1, 2, 3, 4].map((index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="size-8 rounded-full" />
                                        <div>
                                            <Skeleton className="h-6 w-16 mb-2" />
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <Skeleton className="h-6 w-12 mb-1" />
                                                    <Skeleton className="h-3 w-10" />
                                                </div>
                                                {index === 2 && (
                                                    <div className="text-center">
                                                        <Skeleton className="h-6 w-12 mb-1" />
                                                        <Skeleton className="h-3 w-14" />
                                                    </div>
                                                )}
                                                {index === 4 && (
                                                    <div className="text-center">
                                                        <Skeleton className="h-6 w-12 mb-1" />
                                                        <Skeleton className="h-3 w-12" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="size-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Quick Insights Card Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[1, 2, 3].map((index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
            <PageHeader title="Health Summary" description={
                <div className="flex items-center justify-between w-full">
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
            } className="w-full 4 rounded-b-3xl border-b border-foreground/10 flex flex-col gap-2" />
            {/* <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Health Summary</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-4" />
                    {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </p>
            </div> */}
            <div className="flex flex-col gap-6 p-4 pb-24">

                {/* Selected Date Overview */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="size-5 text-primary" />
                            {selectedDate.toDateString() === new Date().toDateString() ? "Today's Overview" : "Daily Overview"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {calorieDeficit > 0 ? `+${Math.round(calorieDeficit)}` : Math.round(calorieDeficit)}
                                </div>
                                <div className="text-xs text-muted-foreground">Calorie Balance</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{foodCount}</div>
                                <div className="text-xs text-muted-foreground">Foods Logged</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 7-Day Trends Chart */}
                {weeklyData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="size-5" />
                                7-Day Nutrition Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-32">
                                <ChartContainer config={{ consumed: { label: "Calories", color: "hsl(var(--primary))" } }} className="h-full">
                                    <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                        <XAxis 
                                            dataKey="day" 
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis hide />
                                        <ChartTooltip 
                                            content={<ChartTooltipContent 
                                                formatter={(value) => [`${Math.round(value)} cal`, 'Consumed']}
                                                labelFormatter={(label, payload) => {
                                                    if (payload && payload[0]) {
                                                        const data = payload[0].payload;
                                                        return data.isSelected ? `${label} (Selected)` : label;
                                                    }
                                                    return label;
                                                }}
                                            />} 
                                        />
                                        <Bar 
                                            dataKey="consumed" 
                                            radius={[2, 2, 0, 0]}
                                        >
                                            {weeklyData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`}
                                                    fill={entry.isSelected ? 'var(--primary)' : 'color-mix(in srgb, var(--primary) 50%, transparent)'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-xs text-muted-foreground">
                                    Weekly avg: {Math.round(weeklyData.reduce((sum, day) => sum + day.consumed, 0) / weeklyData.length)} cal/day
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sleep Section */}
                <ForwardLink href="/summary/sleep">
                    <Card className="bg-sleep/10 hover:bg-sleep/15 transition-colors cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <FaBedPulse className="size-8 text-sleep" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-sleep/80">Sleep</h3>
                                        <div className="flex items-center gap-2">
                                            {isNativeIos && healthData.sleep ? (
                                                <span className="text-2xl font-bold text-foreground">
                                                    {sleepHours}h {sleepMinutes}m
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    Enable in mobile app
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">View Details</span>
                                    <ChevronRight className="size-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ForwardLink>

                {/* Calories Section */}
                <ForwardLink href="/summary/calories">
                    <Card className="bg-cal/10 hover:bg-cal/15 transition-colors cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <FaFire className="size-8 text-cal" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-cal/80">Calories</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-foreground">
                                                    {Math.round(totalCaloriesBurned)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Burned</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-foreground">
                                                    {Math.round(consumedCalories)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Consumed</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">View Details</span>
                                    <ChevronRight className="size-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ForwardLink>

                {/* Steps Section */}
                <ForwardLink href="/summary/steps">
                    <Card className="bg-step/10 hover:bg-step/15 transition-colors cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <IoFootsteps className="size-8 text-step" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-step/80">Steps</h3>
                                        <div className="flex items-center gap-2">
                                            {isNativeIos && healthData.steps ? (
                                                <span className="text-2xl font-bold text-foreground">
                                                    {Math.round(totalSteps).toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    Enable in mobile app
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">View Details</span>
                                    <ChevronRight className="size-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ForwardLink>

                {/* Nutrition Section */}
                <ForwardLink href="/summary/nutrition">
                    <Card className="bg-green-500/10 hover:bg-green-500/15 transition-colors cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <MdRestaurant className="size-8 text-green-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-700">Nutrition</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-foreground">
                                                    {foodCount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Foods {selectedDate.toDateString() === new Date().toDateString() ? "Today" : "Logged"}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-foreground">
                                                    {Math.round(consumedCalories)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Calories</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">View Details</span>
                                    <ChevronRight className="size-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ForwardLink>

                {/* Goals & Insights */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="size-5" />
                            Quick Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Calorie Deficit Goal</span>
                            <span className={cn(
                                "text-sm font-semibold",
                                calorieDeficit >= 300 ? "text-green-600" : "text-orange-600"
                            )}>
                                {calorieDeficit >= 300 ? "On Track" : "Needs Attention"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Daily Step Goal</span>
                            <span className={cn(
                                "text-sm font-semibold",
                                totalSteps >= 8000 ? "text-green-600" : "text-orange-600"
                            )}>
                                {totalSteps >= 8000 ? "Achieved" : `${Math.round((totalSteps/8000)*100)}%`}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Sleep Goal (7-9h)</span>
                            <span className={cn(
                                "text-sm font-semibold",
                                sleepHours >= 7 && sleepHours <= 9 ? "text-green-600" : "text-orange-600"
                            )}>
                                {sleepHours >= 7 && sleepHours <= 9 ? "Optimal" : "Improve"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}