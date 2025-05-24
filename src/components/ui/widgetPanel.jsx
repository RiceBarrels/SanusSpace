"use client"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import Widgets from "./widgets";
import { Button } from "./button";
import { CheckIcon, ChevronLeft, ChevronRight, PencilLineIcon, PlusIcon, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";

export default function WidgetPanel() {
    const [items, setItems] = useState([1, 2, 3]);
    const [isEditing, setIsEditing] = useState(false);
    const isNative = Capacitor.isNativePlatform();

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );
  
    function handleDragEnd(event) {
        const {active, over} = event;
        
        if (active.id !== over.id) {
          setItems((currentItems) => {
            const oldIndex = currentItems.indexOf(active.id);
            const newIndex = currentItems.indexOf(over.id);
            
            return arrayMove(currentItems, oldIndex, newIndex);
          });
        }
    }

    return (
        <motion.div 
            className={cn("w-full h-full flex flex-col items-center z-[999]", isEditing && "fixed top-0 left-0 bg-background", isNative && isEditing && "pt-10")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            layout
        >
            <div className={cn("p-4 flex flex-col items-center gap-4")}>
                <div className="flex flex-row items-center justify-between w-full">
                    <motion.h3 
                        className={isEditing ? "flex gap-1 justify-center items-center" : "text-xl font-bold"}
                        key={isEditing ? "up" : "down"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        onClick={()=>{
                            if(isEditing){
                                setIsEditing(false)
                            }
                        }}
                    >
                        {isEditing ? <Button variant="outline" className="text-xs"><CheckIcon className="size-4" /> Done</Button> : "Widget"}
                    </motion.h3>

                    <Button 
                        variant="outline" 
                        className={cn("flex flex-row justify-center w-18 duration-400", isEditing && "w-17.5")} 
                        onClick={
                            () => {
                                if(!isEditing){
                                    setIsEditing(true)
                                }
                            }
                        }
                    >
                        <motion.div
                            className={cn(isEditing && "rotate-360", "transition-transform duration-400")}
                        >
                            {isEditing ? <PlusIcon className={""} /> : <PencilLineIcon/>}
                        </motion.div>
                        
                        <motion.small
                            key={isEditing ? "up" : "down"}
                            className=""
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                        >
                            {isEditing ? "Add" : "Edit"}
                        </motion.small>
                    </Button>
                </div>
                <div className="flex-1 w-full flex flex-col items-center gap-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((id) => (
                                <Widgets key={id} variant={id} isEditing={isEditing} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </motion.div>
    )
}