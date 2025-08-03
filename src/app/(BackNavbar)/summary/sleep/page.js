"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock, TrendingUp, Bed, Moon, Sun } from "lucide-react";
import { FaBedPulse } from "react-icons/fa6";
import { getSleepData, requestAuthorization } from "@/lib/healthKit";
import { Capacitor } from "@capacitor/core";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/pageHeader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { CalendarIcon } from "lucide-react";

export default function SleepDetailPage() {
    const { user } = useAuth();
    const [sleepData, setSleepData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const isNativeIos = Capacitor.getPlatform() === 'ios';

    useEffect(() => {
        const fetchSleepData = async () => {
            setLoading(true);
            try {
                if (isNativeIos) {
                    await requestAuthorization();
                    
                    // Get selected date's sleep (previous 24 hours)
                    const selectedDateStart = new Date(selectedDate);
                    selectedDateStart.setDate(selectedDateStart.getDate() - 1);
                    const selectedDateEnd = new Date(selectedDate);
                    
                    // Get 7 days of sleep data for chart centered around selected date
                    const weekStart = new Date(selectedDate);
                    weekStart.setDate(weekStart.getDate() - 7);
                    const weekEnd = new Date(selectedDate);

                    const [selectedDateResult, weeklyResult] = await Promise.all([
                        getSleepData(selectedDateStart, selectedDateEnd),
                        getSleepData(weekStart, weekEnd)
                    ]);

                    setSleepData(selectedDateResult);
                    
                    // Process weekly data for chart
                    if (weeklyResult?.resultData) {
                        const dailySleep = {};
                        
                        weeklyResult.resultData.forEach(item => {
                            const date = new Date(item.startDate).toDateString();
                            if (!dailySleep[date]) {
                                dailySleep[date] = 0;
                            }
                            dailySleep[date] += (item.value || 0);
                        });

                        const chartData = [];
                        for (let i = 6; i >= 0; i--) {
                            const date = new Date(selectedDate);
                            date.setDate(date.getDate() - i);
                            const dateString = date.toDateString();
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const sleepSeconds = dailySleep[dateString] || 0;
                            const sleepHours = sleepSeconds / 3600;
                            
                            chartData.push({
                                day: dayName,
                                hours: Math.round(sleepHours * 10) / 10,
                                date: dateString,
                                isSelected: dateString === selectedDate.toDateString()
                            });
                        }
                        
                        setWeeklyData(chartData);
                    }
                }
            } catch (error) {
                console.error("Error fetching sleep data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSleepData();
        }
    }, [user, isNativeIos, selectedDate]);

    // Calculate sleep metrics
    const totalSleepSeconds = sleepData?.resultData ? 
        sleepData.resultData.reduce((total, item) => total + (item.value || 0), 0) : 0;
    
    const sleepHours = Math.floor(totalSleepSeconds / 3600);
    const sleepMinutes = Math.round((totalSleepSeconds % 3600) / 60);
    
    const averageWeeklySleep = weeklyData.length > 0 ? 
        weeklyData.reduce((sum, day) => sum + day.hours, 0) / weeklyData.length : 0;

    const getSleepQuality = (hours) => {
        if (hours >= 7 && hours <= 9) return { quality: "Excellent", color: "text-green-600", bg: "bg-green-100" };
        if (hours >= 6 && hours < 7) return { quality: "Good", color: "text-yellow-600", bg: "bg-yellow-100" };
        if (hours >= 5 && hours < 6) return { quality: "Fair", color: "text-orange-600", bg: "bg-orange-100" };
        return { quality: "Poor", color: "text-red-600", bg: "bg-red-100" };
    };

    const selectedDateQuality = getSleepQuality(sleepHours + sleepMinutes/60);
    const chartConfig = {
        hours: {
            label: "Hours",
            color: "hsl(var(--sleep))",
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
                    {/* Last Night's Sleep Skeleton */}
                    <Card className="bg-sleep/10">
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <Skeleton className="h-16 w-24 mx-auto mb-2" />
                                <Skeleton className="h-4 w-20 mx-auto" />
                            </div>
                            <Skeleton className="h-6 w-24" />
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="text-center">
                                        <Skeleton className="h-8 w-8 mx-auto mb-1" />
                                        <Skeleton className="h-3 w-16 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 7-Day Trend Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-40 w-full" />
                        </CardContent>
                    </Card>

                    {/* Sleep Insights Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((i) => (
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

            {/* Last Night's Sleep */}
            <Card className="bg-sleep/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Moon className="size-5 text-sleep" />
                        {selectedDate.toDateString() === new Date().toDateString() ? "Last Night" : "Sleep Data"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isNativeIos && sleepData ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-sleep">
                                    {sleepHours}h {sleepMinutes}m
                                </div>
                                <div className="text-muted-foreground">Total Sleep</div>
                            </div>
                            
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedDateQuality.bg} ${selectedDateQuality.color}`}>
                                <Bed className="size-4 mr-2" />
                                {selectedDateQuality.quality} Sleep
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="text-center">
                                                                    <div className="text-2xl font-bold text-foreground">
                                    {sleepData.resultData?.length || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">Sleep Sessions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">
                                    {Math.round(averageWeeklySleep * 10) / 10}h
                                </div>
                                    <div className="text-xs text-muted-foreground">7-Day Average</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Bed className="size-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Sleep tracking requires the mobile app with HealthKit access
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 7-Day Trend */}
            {isNativeIos && weeklyData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="size-5" />
                            7-Day Sleep Trend
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
                                        width={30}
                                    />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent 
                                            formatter={(value, name) => [
                                                `${value} hours`,
                                                'Sleep Duration'
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
                                        dataKey="hours" 
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {weeklyData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`}
                                                fill={entry.isSelected ? 'var(--sleep)' : 'color-mix(in srgb, var(--sleep) 60%, transparent)'}
                                            />
                                        ))}
                                    </Bar>
                                    <ReferenceLine 
                                        y={7} 
                                        stroke="color-mix(in srgb, var(--sleep) 80%, transparent)" 
                                        strokeDasharray="4 4"
                                        label={{ 
                                            value: "Recommended: 7-9h", 
                                            position: "topRight",
                                            style: { 
                                                fontSize: '10px', 
                                                fill: 'hsl(var(--muted-foreground))',
                                                fontWeight: 'bold'
                                            }
                                        }}
                                    />
                                    <ReferenceLine 
                                        y={9} 
                                        stroke="color-mix(in srgb, var(--sleep) 80%, transparent)" 
                                        strokeDasharray="4 4"
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sleep Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sun className="size-5" />
                        Sleep Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Sleep Goal (7-9 hours)</span>
                            <span className={`text-sm font-semibold ${selectedDateQuality.color}`}>
                                {sleepHours >= 7 && sleepHours <= 9 ? "✅ Achieved" : "⚠️ Missed"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Sleep Consistency</span>
                            <span className="text-sm font-semibold text-blue-600">
                                {weeklyData.length > 0 ? "Good" : "Enable tracking"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Weekly Average</span>
                            <span className="text-sm font-semibold">
                                {Math.round(averageWeeklySleep * 10) / 10}h
                            </span>
                        </div>
                    </div>

                    {isNativeIos && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <h4 className="font-semibold text-blue-900 mb-2">Sleep Tips</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Aim for 7-9 hours of sleep each night</li>
                                <li>• Keep a consistent sleep schedule</li>
                                <li>• Avoid screens 1 hour before bedtime</li>
                                <li>• Keep your bedroom cool and dark</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
        </div>
    );
}