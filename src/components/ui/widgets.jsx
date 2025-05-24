"use client"

import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BedDoubleIcon, ChevronRight, XIcon } from "lucide-react";

export default function Widgets({variant, isEditing, ...props}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({id: variant, disabled: !isEditing});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || !isDragging && 'transform 0.5s ease',
    touchAction: 'none',
  };

  if (variant === 1 || variant === "sleepTracker") {
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}  className={cn("w-86 h-36 rounded-2xl")}>
            <div className={cn("w-full h-full bg-background rounded-2xl shadow", isEditing && "animate-shake active:cursor-grabbing")}>
                <div 
                    className={cn("absolute -top-1.5 -left-1.5 size-5 flex justify-center items-center rounded-full bg-background border border-foreground/20 cursor-pointer transition-all duration-500 scale-100", (!isEditing || isDragging) && "scale-0")}
                >
                    <XIcon className="size-3"/>
                </div>
                <div className="w-full h-full bg-sleep/30 flex flex-col rounded-2xl p-4 cursor-grab">
                    <div className="flex justify-between">
                        <div className="flex flex-row items-center gap-4">
                            <BedDoubleIcon className="w-8 h-8 text-sleep" />
                            <h3 className="text-md font-bold text-sleep/70">Sleep Track</h3>
                        </div>
                        <small className="flex gap-1 text-xs font-bold text-foreground/40 justify-center items-center pb-2">Detailed Report <ChevronRight className="size-4" /></small>
                    </div>
                    
                </div>
            </div>
        </div>
    )
  } else if (variant === 2 || variant === "caloriesTracker") {
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}  className={cn("w-86 h-36 rounded-2xl")}>
            <div className={cn("w-full h-full bg-background rounded-2xl shadow", isEditing && "animate-shake cursor-grab active:cursor-grabbing")}>
                <div 
                    className={cn("absolute -top-1.5 -left-1.5 size-5 flex justify-center items-center rounded-full bg-background border border-foreground/20 cursor-pointer transition-all duration-500 scale-100", (!isEditing || isDragging) && "scale-0")}
                >
                    <XIcon className="size-3"/>
                </div>
                <div className="w-full h-full bg-sleep/30 flex flex-col rounded-2xl">
                
                </div>
            </div>
        </div>
    )
  } else if (variant === 3 || variant === "stepsTracker") {
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}  className={cn("w-86 h-36 rounded-2xl")}>
            <div className={cn("w-full h-full bg-background rounded-2xl shadow", isEditing && "animate-shake cursor-grab active:cursor-grabbing")}>
                <div 
                    className={cn("absolute -top-1.5 -left-1.5 size-5 flex justify-center items-center rounded-full bg-background border border-foreground/20 cursor-pointer transition-all duration-500 scale-100", (!isEditing || isDragging) && "scale-0")}
                >
                    <XIcon className="size-3"/>
                </div>
                <div className="w-full h-full bg-sleep/30 flex flex-col rounded-2xl">
                
                </div>
            </div>
        </div>
    )
  }
}
