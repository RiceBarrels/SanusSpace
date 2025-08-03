"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Target, Award, MapPin } from "lucide-react";
import { IoFootsteps } from "react-icons/io5";
import { getStepsData, requestAuthorization } from "@/lib/healthKit";
import { Capacitor } from "@capacitor/core";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/pageHeader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { CalendarIcon } from "lucide-react";

export default function StepsDetailPage() {
    const { user } = useAuth();
    const [stepsData, setStepsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const isNativeIos = Capacitor.getPlatform() === 'ios';

    useEffect(() => {
        const fetchStepsData = async () => {
            setLoading(true);
            try {
                if (isNativeIos) {
                    await requestAuthorization();
                    
                    // Selected date's steps
                    const dayStartDate = new Date(selectedDate);
                    dayStartDate.setHours(0, 0, 0, 0);
                    const dayEndDate = new Date(selectedDate);
                    dayEndDate.setHours(23, 59, 59, 999);

                    // Weekly steps (7 days centered around selected date)
                    const weekStart = new Date(selectedDate);
                    weekStart.setDate(weekStart.getDate() - 6);
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(selectedDate);
                    weekEnd.setHours(23, 59, 59, 999);

                    // Monthly steps (30 days ending on selected date)
                    const monthStart = new Date(selectedDate);
                    monthStart.setDate(monthStart.getDate() - 29);
                    monthStart.setHours(0, 0, 0, 0);
                    const monthEnd = new Date(selectedDate);
                    monthEnd.setHours(23, 59, 59, 999);

                    const [todayResult, weeklyResult, monthlyResult] = await Promise.all([
                        getStepsData(dayStartDate, dayEndDate),
                        getStepsData(weekStart, weekEnd),
                        getStepsData(monthStart, monthEnd)
                    ]);

                    setStepsData(todayResult);
                    
                    // Process weekly data for chart
                    if (weeklyResult?.resultData) {
                        const dailySteps = {};
                        
                        weeklyResult.resultData.forEach(item => {
                            const date = new Date(item.startDate).toDateString();
                            if (!dailySteps[date]) {
                                dailySteps[date] = 0;
                            }
                            dailySteps[date] += (item.value || 0);
                        });

                        const chartData = [];
                        for (let i = 6; i >= 0; i--) {
                            const date = new Date(selectedDate);
                            date.setDate(date.getDate() - i);
                            const dateString = date.toDateString();
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const steps = dailySteps[dateString] || 0;
                            
                            chartData.push({
                                day: dayName,
                                steps: Math.round(steps),
                                date: dateString,
                                isSelected: dateString === selectedDate.toDateString(),
                                goalMet: steps >= 10000
                            });
                        }
                        
                        setWeeklyData(chartData);
                    }

                    // Process monthly data for trend
                    if (monthlyResult?.resultData) {
                        const weeklyTotals = {};
                        
                        monthlyResult.resultData.forEach(item => {
                            const date = new Date(item.startDate);
                            const weekStart = new Date(date);
                            weekStart.setDate(date.getDate() - date.getDay());
                            const weekKey = weekStart.toDateString();
                            
                            if (!weeklyTotals[weekKey]) {
                                weeklyTotals[weekKey] = 0;
                            }
                            weeklyTotals[weekKey] += (item.value || 0);
                        });

                        const monthlyChart = Object.entries(weeklyTotals)
                            .sort(([a], [b]) => new Date(a) - new Date(b))
                            .map(([weekStart, totalSteps], index) => ({
                                week: `Week ${index + 1}`,
                                steps: Math.round(totalSteps),
                                average: Math.round(totalSteps / 7)
                            }));
                        
                        setMonthlyData(monthlyChart);
                    }
                }
            } catch (error) {
                console.error("Error fetching steps data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStepsData();
        }
    }, [user, isNativeIos, selectedDate]);

    // Calculate step metrics
    const selectedDateSteps = stepsData?.resultData ? 
        stepsData.resultData.reduce((total, item) => total + (item.value || 0), 0) : 0;
    
    const weeklyAverage = weeklyData.length > 0 ? 
        weeklyData.reduce((sum, day) => sum + day.steps, 0) / weeklyData.length : 0;
    
    const goalAchievedDays = weeklyData.filter(day => day.goalMet).length;
    const estimatedCaloriesBurned = Math.round((selectedDateSteps * 0.04)); // Rough estimate: 0.04 cal per step
    const estimatedDistance = Math.round((selectedDateSteps * 0.0008 * 100)) / 100; // Rough estimate: 0.8m per step

    const getStepGoalStatus = (steps) => {
        if (steps >= 10000) return { status: "Excellent", color: "text-green-600", bg: "bg-green-100" };
        if (steps >= 7500) return { status: "Good", color: "text-yellow-600", bg: "bg-yellow-100" };
        if (steps >= 5000) return { status: "Fair", color: "text-orange-600", bg: "bg-orange-100" };
        return { status: "Needs Improvement", color: "text-red-600", bg: "bg-red-100" };
    };

    const selectedDateGoalStatus = getStepGoalStatus(selectedDateSteps);
    const chartConfig = {
        steps: {
            label: "Steps",
            color: "hsl(var(--step))",
        },
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 pb-24">
                {/* Header Skeleton */}
                <div className="w-full pb-4 rounded-b-3xl border-b border-foreground/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between w-full p-4">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-8 w-36" />
                            <Skeleton className="h-5 w-60" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>

                <div className="flex flex-col gap-6 p-4 pb-24">
                    {/* Today's Activity Skeleton */}
                    <Card className="bg-step/10">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <Skeleton className="h-16 w-32 mx-auto mb-2" />
                                <Skeleton className="h-4 w-20 mx-auto" />
                            </div>
                            <Skeleton className="h-6 w-24" />
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="text-center">
                                        <Skeleton className="h-6 w-12 mx-auto mb-1" />
                                        <Skeleton className="h-3 w-10 mx-auto" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 7-Day Chart Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-40 w-full" />
                        </CardContent>
                    </Card>

                    {/* Monthly Trend Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>

                    {/* Performance Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-24" />
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

            {/* Today's Steps Summary */}
            <Card className="bg-step/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="size-5 text-step" />
                        {selectedDate.toDateString() === new Date().toDateString() ? "Today's Activity" : "Daily Activity"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isNativeIos && stepsData ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-step">
                                    {Math.round(selectedDateSteps).toLocaleString()}
                                </div>
                                <div className="text-muted-foreground">
                                    Steps {selectedDate.toDateString() === new Date().toDateString() ? "Today" : ""}
                                </div>
                            </div>
                            
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedDateGoalStatus.bg} ${selectedDateGoalStatus.color}`}>
                                <Award className="size-4 mr-2" />
                                {selectedDateGoalStatus.status}
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">
                                        {estimatedDistance} km
                                    </div>
                                    <div className="text-xs text-muted-foreground">Distance</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">
                                        {estimatedCaloriesBurned}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Calories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">
                                        {Math.round(weeklyAverage).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">7-Day Avg</div>
                                </div>
                            </div>

                            {/* Progress bar to 10k goal */}
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Progress to 10,000 steps</span>
                                    <span>{Math.round((selectedDateSteps/10000)*100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-step h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((selectedDateSteps/10000)*100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <IoFootsteps className="size-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Steps tracking requires the mobile app with HealthKit access
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 7-Day Steps Chart */}
            {isNativeIos && weeklyData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="size-5" />
                            7-Day Steps Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-40">
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
                                        width={35}
                                    />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent 
                                            formatter={(value, name) => [
                                                `${Math.round(value).toLocaleString()} steps`,
                                                'Daily Steps'
                                            ]}
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
                                        dataKey="steps" 
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {weeklyData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`}
                                                fill={entry.isSelected ? 'var(--step)' : 
                                                     entry.goalMet ? 'color-mix(in srgb, var(--step) 80%, transparent)' :
                                                     'color-mix(in srgb, var(--step) 40%, transparent)'}
                                            />
                                        ))}
                                    </Bar>
                                    <ReferenceLine 
                                        y={10000} 
                                        stroke="color-mix(in srgb, var(--step) 80%, transparent)" 
                                        strokeDasharray="4 4"
                                        label={{ 
                                            value: "Goal: 10,000 steps", 
                                            position: "topRight",
                                            style: { 
                                                fontSize: '10px', 
                                                fill: 'hsl(var(--muted-foreground))',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Monthly Trend */}
            {isNativeIos && monthlyData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="size-5" />
                            Monthly Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-32">
                            <ChartContainer config={chartConfig} className="h-full">
                                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                    <XAxis 
                                        dataKey="week" 
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        width={35}
                                    />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent 
                                            formatter={(value, name) => [
                                                `${Math.round(value).toLocaleString()} steps/day`,
                                                'Weekly Average'
                                            ]}
                                        />} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="average" 
                                        stroke="var(--step)" 
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--step)', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Steps Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="size-5" />
                        Weekly Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">10K Step Goal Achievement</span>
                            <span className={cn(
                                "text-sm font-semibold",
                                goalAchievedDays >= 5 ? "text-green-600" : "text-orange-600"
                            )}>
                                {goalAchievedDays}/7 days
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Weekly Average</span>
                            <span className="text-sm font-semibold">
                                {Math.round(weeklyAverage).toLocaleString()} steps/day
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Estimated Weekly Distance</span>
                            <span className="text-sm font-semibold">
                                {Math.round((weeklyAverage * 7 * 0.0008) * 10) / 10} km
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Estimated Calories Burned</span>
                            <span className="text-sm font-semibold">
                                {Math.round(weeklyAverage * 7 * 0.04)} cal/week
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-semibold text-blue-900 mb-2">Step Goals & Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Aim for 10,000 steps daily for optimal health</li>
                            <li>• Take the stairs instead of elevators</li>
                            <li>• Park farther away or get off one stop earlier</li>
                            <li>• Take walking breaks every hour during work</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
}