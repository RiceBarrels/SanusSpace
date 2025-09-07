"use client"

import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BedDoubleIcon, ChevronRight, MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getSleepData, getCaloriesData, getStepsData, requestAuthorization } from "@/lib/healthKit";
import { Capacitor } from "@capacitor/core";
import { FaBedPulse, FaFire } from "react-icons/fa6";
import { IoFootsteps } from "react-icons/io5";
import { lightHapticsImpact, mediumHapticsImpact, doubleHapticsImpact } from "@/lib/haptics";
import { getUserBMR } from "@/lib/healthFormulas";
import { useAuth } from "@/context/AuthContext";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

export default function Widgets({variant, isEditing, className = "", onDelete, size = "medium", ...props}) {
  const { id } = props;
  const { userData: contextUserData } = useAuth();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({id: id, disabled: !isEditing});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || !isDragging && 'transform 0.5s ease',
    touchAction: isEditing ? 'none' : null,
    zIndex: isDragging ? 10 : 0,
  };

  const [sleepData, setSleepData] = useState(null);
  const [caloriesData, setCaloriesData] = useState(null);
  const [stepsData, setStepsData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHoveringClose, setIsHoveringClose] = useState(false);
  const [consumedCalories, setConsumedCalories] = useState(0);
  const isNativeIos = Capacitor.getPlatform() === 'ios'
  
  // Calculate BMR when userData is available
  const bmr = userData ? getUserBMR(userData) : 0;

  // Calculate today's consumed calories from foodConsumes data
  const calculateTodaysConsumedCalories = (userData) => {
    if (!userData?.foodConsumes) return 0;
    
    // Get today's date in MM/DD/YYYY format
    const today = new Date();
    const todayDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    
    // Find today's food consumption entry
    const todayEntry = userData.foodConsumes.find(entry => entry.date === todayDate);
    if (!todayEntry?.consumes) return 0;
    
    // Calculate total calories consumed today
    return todayEntry.consumes.reduce((total, food) => {
      const kcalPer100g = parseFloat(food.kcal_per_100g) || 0;
      const grams = parseFloat(food.grams) || 0;
      return total + (kcalPer100g * grams / 100);
    }, 0);
  };

  // Set user data from context
  useEffect(() => {
    if (contextUserData) {
      setUserData(contextUserData);
      
      // Calculate consumed calories when user data is available
      const todaysConsumed = calculateTodaysConsumedCalories(contextUserData);
      setConsumedCalories(todaysConsumed);
    }
  }, [contextUserData]);

  // Update consumed calories when userData changes or for calories widget
  useEffect(() => {
    if (userData && (variant === 2 || variant === "caloriesTracker")) {
      const todaysConsumed = calculateTodaysConsumedCalories(userData);
      setConsumedCalories(todaysConsumed);
    }
  }, [userData, variant]);

  // Add haptic feedback when dragging starts
  useEffect(() => {
    if (isDragging) {
      mediumHapticsImpact();
    }
  }, [isDragging]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        let startDate, endDate;
        
        if (variant === 1 || variant === "sleepTracker") {
          // For sleep data, get last 24 hours from this time yesterday to now
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 1); // Start from exactly 24 hours ago
          
          endDate = new Date(today); // End at current time
        } else if (variant === 3 || variant === "stepsTracker") {
          // For steps data, get last 7 days including today
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 6); // Start from 6 days ago (7 days total including today)
          startDate.setHours(0, 0, 0, 0); // Start at 0:00am
          
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999); // End at 11:59pm today
        } else {
          // For other data types, use today's range
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0); // Start at 0:00am

          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999); // End at 11:59pm
        }
        
        await requestAuthorization();
        
        if (variant === 1 || variant === "sleepTracker") {
          const result = isNativeIos ? await getSleepData(startDate, endDate) : null;
          console.log('Sleep data result:', result);
          setSleepData(result);
        } else if (variant === 2 || variant === "caloriesTracker") {
          const result = isNativeIos ? await getCaloriesData(startDate, endDate) : null;
          console.log('Calories data result:', result);
          setCaloriesData(result);
        } else if (variant === 3 || variant === "stepsTracker") {
          const result = isNativeIos ? await getStepsData(startDate, endDate) : null;
          console.log('Steps data result:', result);
          setStepsData(result);
        }
      } catch (error) {
        console.error("Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, variant]); // Re-run effect if id or variant changes

  // Helper function to render health data
  const renderHealthData = (data, type) => {
    if (!data) {
      return <small>Please download mobile App in order for us to get your data.</small>;
    }

    if (!data.resultData || data.resultData.length === 0) {
      return <small>No {type} data available for the selected period.</small>;
    }

    // Show summary instead of raw JSON
    const count = data.countReturn || data.resultData.length;
    
    if (type === 'sleep') {
      // Calculate total sleep duration
      const totalSleepMinutes = data.resultData.reduce((total, item) => {
        // HealthKit sleep duration is typically in seconds, convert to minutes
        const durationMinutes = item.value ? item.value / 60 : 0;
        return total + durationMinutes;
      }, 0);
      
      const hours = Math.floor(totalSleepMinutes / 60);
      const minutes = Math.round(totalSleepMinutes % 60);
      
      // For medium size, show simple stats
      if (size === "medium") {
        return (
          <div className="flex-1 flex flex-col w-full h-full">
              <div className="h-full text-3xl font-bold text-gray-950/80 flex items-end justify-start gap-0.5">
                  <span>{hours}</span>
                  <small className="text-sm text-gray-950/60 mb-1">hr</small> 
                  <span className="ml-1">{minutes}</span>
                  <small className="text-sm text-gray-950/60 mb-1">min</small>
              </div>
          </div>
        );
      }
      
      // For large size, show detailed breakdown with sleep stages chart
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-gray-950/80">
                {hours}h {minutes}m
              </div>
              <div className="text-xs text-gray-950/60 font-medium">Last Night</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-gray-950/80">
                7.5h
              </div>
              <div className="text-xs text-gray-950/60 font-medium">7-Day Avg</div>
            </div>
          </div>
          
          {/* Sleep quality indicator */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-950/70">Sleep Quality</div>
              <div className="text-sm text-gray-950/50">Good</div>
            </div>
          </div>
        </div>
      );
    }
    
    if (type === 'steps') {
      // Get today's date for comparison
      const today = new Date();
      const todayDateString = today.toDateString();
      
      // Group steps by day and calculate daily totals
      const dailySteps = {};
      data.resultData.forEach(item => {
        const dateKey = new Date(item.startDate).toDateString();
        if (!dailySteps[dateKey]) {
          dailySteps[dateKey] = 0;
        }
        dailySteps[dateKey] += item.value || 0;
      });
      
      // Calculate 7-day average
      const dailyTotals = Object.values(dailySteps);
      const averageSteps = dailyTotals.length > 0 
        ? Math.round(dailyTotals.reduce((sum, steps) => sum + steps, 0) / dailyTotals.length)
        : 0;
      
      const todaySteps = dailySteps[todayDateString] || 0;

      // For medium size, show simple stats
      if (size === "medium") {
        return (
          <div className="w-full h-full flex justify-around items-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-gray-950/80">
                {Math.round(todaySteps).toLocaleString()}
              </div>
              <div className="text-xs text-gray-950/60 font-medium">Today</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-gray-950/80">
                {averageSteps.toLocaleString()}
              </div>
              <div className="text-xs text-gray-950/60 font-medium">7-Day Avg</div>
            </div>
          </div>
        );
      }

      // For large size, show full chart
      // Create chart data for the past 7 days
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isToday = dateString === todayDateString;
        
        chartData.push({
          day: dayName,
          steps: dailySteps[dateString] || 0,
          isToday,
          date: dateString
        });
      }

      const chartConfig = {
        steps: {
          label: "Steps",
          color: "hsl(var(--step))",
        },
      };

      return (
        <div className="w-full h-full flex flex-col justify-around items-center">
          {/* Stats Row */}
          <div className="flex justify-around w-full items-center mb-2">
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-gray-950/80">
                {Math.round(todaySteps).toLocaleString()}
              </div>
              <div className="text-xs text-gray-950/60 font-medium">Today</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-gray-950/80">
                {averageSteps.toLocaleString()}
              </div>
              <div className="text-xs text-gray-950/60 font-medium">7-Day Avg</div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="w-full h-48 flex justify-center items-center">
            <ChartContainer config={chartConfig} className="h-full flex-1">
              <BarChart data={chartData} margin={{ top: 2, right: 5, left: 5, bottom: 2 }}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 9, fill: 'color-mix(in srgb, var(--foreground) 60%, transparent)' }}
                />
                <YAxis 
                  width={36}
                  tick={{ fontSize: 9, fill: 'color-mix(in srgb, var(--foreground) 60%, transparent)' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [
                      `${Math.round(value).toLocaleString()} steps`,
                      name
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload;
                        return data.isToday ? `${label} (Today)` : label;
                      }
                      return label;
                    }}
                  />} 
                />
                <Bar 
                  dataKey="steps" 
                  radius={[2, 2, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.isToday ? 'var(--step)' : 'color-mix(in srgb, var(--step) 40%, transparent)'}
                    />
                  ))}
                </Bar>
                <ReferenceLine 
                  y={averageSteps} 
                  stroke="color-mix(in srgb, var(--step) 100%, transparent)" 
                  strokeDasharray="4 4"
                  label={{ 
                    value: `Avg: ${averageSteps.toLocaleString()}`, 
                    position: "topRight",
                    style: { 
                      fontSize: '10px', 
                      fill: 'color-mix(in srgb, var(--foreground) 50%, var(--step))',
                      fontWeight: 'bold',
                      backgroundColor: 'var(--background)',
                      padding: '2px 4px',
                      borderRadius: '4px'
                    }
                  }}
                />
                <ReferenceLine 
                  y={todaySteps} 
                  stroke="color-mix(in srgb, var(--foreground) 100%, var(--step))" 
                  strokeDasharray="4 4"
                  label={{ 
                    value: `Today: ${todaySteps.toLocaleString()}`, 
                    position: "topRight",
                    style: { 
                      fontSize: '10px', 
                      fill: 'color-mix(in srgb, var(--foreground) 100%, var(--step))',
                      fontWeight: 'bold',
                      backgroundColor: 'var(--background)',
                      padding: '2px 4px',
                      borderRadius: '4px'
                    }
                  }}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      );
    }
    
    // For calories data
    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold">
          Found {count} {type} records
        </div>
        <div className="text-xs text-gray-950/70 max-h-20 overflow-y-auto">
          {data.resultData.slice(0, 3).map((item, index) => (
            <div key={index} className="mb-1">
              {type === 'calories' && `${Math.round(item.value || 0)} cal | ${new Date(item.startDate).toLocaleTimeString()}`}
            </div>
          ))}
          {data.resultData.length > 3 && (
            <div className="text-xs text-gray-950/50">...and {data.resultData.length - 3} more</div>
          )}
        </div>
      </div>
    );
  };

  const handleWidgetClick = () => {
    if (!isEditing) {
      lightHapticsImpact();
    }
  };

  const handleDeleteClick = () => {
    doubleHapticsImpact();
    onDelete(id);
    setIsHoveringClose(false);
  };

  // Helper function to get size classes
  const getSizeClasses = () => {
    switch(size) {
      case "large":
        return "size-86";
      case "medium":
      default:
        return "w-86 h-38";
    }
  };

  if (variant === 1 || variant === "sleepTracker") {
    return (
        <div ref={setNodeRef} style={isEditing ? style : null } {...attributes} {...isEditing && !isHoveringClose ? listeners : null} {...props} className={cn(getSizeClasses(), "rounded-2xl", className)}>
            <div className={cn("w-full h-full bg-amber-50 rounded-2xl text-gray-950/80 shadow", isEditing && "animate-shake active:cursor-grabbing")}>
                <div 
                    className={cn("absolute -top-1.5 -left-1.5 size-5 flex justify-center items-center rounded-full bg-background/5 backdrop-blur-sm border border-foreground/20 cursor-pointer transition-all duration-500 scale-100", (!isEditing || isDragging) && "scale-0")}
                    onClick={handleDeleteClick}
                    onMouseEnter={()=>{
                        setIsHoveringClose(true)
                    }}
                    onMouseLeave={()=>{
                        setIsHoveringClose(false)
                    }}
                    onTouchStart={handleDeleteClick}
                >
                    <XIcon className="size-3"/>
                </div>
                <div 
                    className={cn("w-full h-full bg-sleep/30 flex flex-col rounded-2xl p-4", isEditing ? "cursor-grab" : "cursor-pointer")}
                    onClick={handleWidgetClick}
                >
                    <div className="flex justify-between">
                        <div className="flex flex-row items-center gap-4">
                            <FaBedPulse className="size-7 text-sleep" />
                            <h3 className="text-md font-bold text-sleep/70">Sleep Track</h3>
                        </div>
                        <small className="flex gap-1 text-xs font-bold text-gray-950/40 justify-center items-center pb-2">Detailed Report <ChevronRight className="size-4" /></small>
                    </div>
                    <div className="mt-4 flex-1 flex h-full">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            renderHealthData(sleepData, 'sleep')
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
  } else if (variant === 2 || variant === "caloriesTracker") {
    // Calculate total calories spent
    const totalCaloriesSpent = caloriesData?.resultData?.reduce((total, item) => {
      return total + (item.value || 0);
    }, 0) || 0;

    return (
        <div ref={setNodeRef} style={isEditing ? style : null } {...attributes} {...isEditing && !isHoveringClose ? listeners : null} {...props} className={cn(getSizeClasses(), "rounded-2xl", className)}>
            <div className={cn("w-full h-full bg-amber-50 rounded-2xl text-gray-950/80 shadow", isEditing && "animate-shake active:cursor-grabbing")}>
                <div 
                    className={cn("absolute -top-1.5 -left-1.5 size-5 flex justify-center items-center rounded-full bg-background/5 backdrop-blur-sm border border-foreground/20 cursor-pointer transition-all duration-500 scale-100", (!isEditing || isDragging) && "scale-0")}
                    onClick={handleDeleteClick}
                    onMouseEnter={()=>{
                        setIsHoveringClose(true)
                    }}
                    onMouseLeave={()=>{
                        setIsHoveringClose(false)
                    }}
                    onTouchStart={handleDeleteClick}
                >
                    <XIcon className="size-3"/>
                </div>
                <div 
                    className={cn("w-full h-full bg-cal/30 flex flex-col rounded-2xl p-4", isEditing ? "cursor-grab" : "cursor-pointer")}
                    onClick={handleWidgetClick}
                >
                    <div className="flex justify-between">
                        <div className="flex flex-row items-center gap-4">
                            <FaFire className="size-7 text-cal" />
                            <h3 className="text-md font-bold text-cal/70">Calories</h3>
                        </div>
                        <small className="flex gap-1 text-xs font-bold text-gray-950/40 justify-center items-center pb-2">Detailed Report <ChevronRight className="size-4" /></small>
                    </div>
                    <div className="mt-4 flex-1 flex">
                        {loading ? (
                            <p>Loading...</p>
                        ) : !isNativeIos ? (
                            <small>Please download mobile App in order for us to get your data.</small>
                        ) : size === "medium" ? (
                            // Medium size: Show simple burned vs consumed
                            <div className="flex justify-around items-center w-full">
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl font-bold text-gray-950/80">
                                        {Math.round(totalCaloriesSpent + bmr)}
                                    </div>
                                    <div className="text-xs text-gray-950/60 font-medium">Burned</div>
                                </div>
                                
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl font-bold text-gray-950/80">
                                        {Math.round(consumedCalories)}
                                    </div>
                                    <div className="text-xs text-gray-950/60 font-medium">Consumed</div>
                                </div>
                            </div>
                        ) : (
                            // Large size: Show detailed breakdown with icons
                            <div className="flex flex-col justify-center items-center w-full h-full gap-4">
                                <div className="flex justify-around items-center w-full">
                                    {/* Total Calories Burned */}
                                    <div className="flex flex-col items-center bg-amber-50/20 rounded-xl w-32 h-18 justify-center">
                                        <div className="text-3xl font-bold text-gray-950/80">
                                            {(Math.round((totalCaloriesSpent + bmr)*10)/10).toString().split(".")[0]}
                                            <small className="text-sm text-gray-950/80">.{(Math.round((totalCaloriesSpent + bmr)*10)/10).toString().split(".")[1] || "0"}</small>
                                        </div>
                                        <MinusIcon className="size-3 stroke-[4] text-cal/70" />
                                    </div>
                                    
                                    {/* Total Calories Consumed */}
                                    <div className="flex flex-col items-center bg-amber-50/20 rounded-xl w-32 h-18 justify-center">
                                        <div className="text-3xl font-bold text-gray-950/80">
                                            {(Math.round(consumedCalories*10)/10).toString().split(".")[0]}
                                            <small className="text-sm text-gray-950/80">.{(Math.round(consumedCalories*10)/10).toString().split(".")[1] || "0"}</small>
                                        </div>
                                        <PlusIcon className="size-3 stroke-[4] text-cal/70" />
                                    </div>
                                </div>
                                
                                {/* Net calories */}
                                <div className="flex flex-col items-center">
                                    <div className="text-lg font-bold text-gray-950/60">
                                        Net: {Math.round(consumedCalories - (totalCaloriesSpent + bmr))} cal
                                    </div>
                                    <div className="text-xs text-gray-950/40">Deficit Goal: 500 cal</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
  } else if (variant === 3 || variant === "stepsTracker") {
    return (
        <div ref={setNodeRef} style={isEditing ? style : null } {...attributes} {...isEditing && !isHoveringClose ? listeners : null} {...props} className={cn(getSizeClasses(), "rounded-2xl", className)}>
            <div className={cn("w-full h-full bg-amber-50 rounded-2xl text-gray-950/80 shadow", isEditing && "animate-shake active:cursor-grabbing")}>
                <div 
                    className={cn("absolute -top-1.5 -left-1.5 size-5 flex justify-center items-center rounded-full bg-background/5 backdrop-blur-sm border border-foreground/20 cursor-pointer transition-all duration-500 scale-100", (!isEditing || isDragging) && "scale-0")}
                    onClick={handleDeleteClick}
                    onMouseEnter={()=>{
                        setIsHoveringClose(true)
                    }}
                    onMouseLeave={()=>{
                        setIsHoveringClose(false)
                    }}
                    onTouchStart={handleDeleteClick}
                >
                    <XIcon className="size-3"/>
                </div>
                <div 
                    className={cn("w-full h-full bg-step/30 flex flex-col rounded-2xl p-4", isEditing ? "cursor-grab" : "cursor-pointer")}
                    onClick={handleWidgetClick}
                >
                    <div className="flex justify-between">
                        <div className="flex flex-row items-center gap-4">
                            <IoFootsteps className="size-7 text-step" />
                            <h3 className="text-md font-bold text-step/70">Steps</h3>
                        </div>
                        <small className="flex gap-1 text-xs font-bold text-gray-950/40 justify-center items-center pb-2">Detailed Report <ChevronRight className="size-4" /></small>
                    </div>
                    <div className="mt-4 flex-1 flex">
                        {loading ? (
                            <p>Loading...</p>
                        ) : !isNativeIos ? (
                            <small>Please download mobile App in order for us to get your data.</small>
                        ) : (
                            renderHealthData(stepsData, 'steps')
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
  }
}
