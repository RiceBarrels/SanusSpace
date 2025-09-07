"use client"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import Widgets from "./widgets";
import { CheckIcon, ChevronLeft, ChevronRight, PencilLineIcon, PlusIcon, SquareDashed, XIcon, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { PiArrowBendRightUpBold } from "react-icons/pi";
import { lightHapticsImpact, doubleHapticsImpact, mediumHapticsImpact } from "@/lib/haptics";

// todo: haptics on release and click
export default function WidgetPanel() {
    const [items, setItems] = useState(() => {
        try {
            if (typeof window !== 'undefined' && localStorage.widgetPosition) {
                return JSON.parse(localStorage.widgetPosition);
            }
        } catch (error) {
            console.error('Error parsing localStorage widgetPosition:', error);
        }
        return [
            { id: "widget-1-default", variant: 1, size: "medium" },
            { id: "widget-2-default", variant: 2, size: "medium" },
            { id: "widget-3-default", variant: 3, size: "medium" },
        ];
    });
    const [isEditing, setIsEditing] = useState(false);
    const isNative = Capacitor.isNativePlatform();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSizeOpen, setIsSizeOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedSize, setSelectedSize] = useState("medium");
    const [carouselApi, setCarouselApi] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const sizeOptions = [
        { id: "medium", label: "Medium", icon: Minimize2 },
        { id: "large", label: "Large", icon: Maximize2 }
    ];

    useEffect(()=>{
        try {
            if (typeof window !== 'undefined') {
                localStorage.widgetPosition = JSON.stringify(items);
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },[items])

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );
  
    function handleDragEnd(event) {
        const {active, over} = event;
        
        if (active.id !== over.id) {
          // Haptic feedback when drag operation completes successfully
          lightHapticsImpact();
          setItems((currentItems) => {
            const oldIndex = currentItems.findIndex(item => item.id === active.id);
            const newIndex = currentItems.findIndex(item => item.id === over.id);
            
            return arrayMove(currentItems, oldIndex, newIndex);
          });
        }
    }

    const handleDelete = (idToDelete) => {
      setItems((currentItems) => currentItems.filter(item => item.id !== idToDelete));
    };

    const handleEditToggle = () => {
        if(!isEditing){
            mediumHapticsImpact();
            setIsEditing(true);
            setIsAddOpen(false);
        } else if (isEditing) {
            lightHapticsImpact();
            setIsAddOpen(true);
            setSelectedId(null);
        }
    };

    const handleDoneClick = () => {
        mediumHapticsImpact();
        setIsEditing(false);
    };

    const handleWidgetSelection = (item) => {
        lightHapticsImpact();
        setSelectedId(item);
        setIsSizeOpen(true);
    };

    const handleSizeSelection = (size) => {
        lightHapticsImpact();
        setSelectedSize(size);
        doubleHapticsImpact();
        setItems([...items, { id: `widget-${selectedId}-${Date.now()}`, variant: selectedId, size: size }]);
        setIsSizeOpen(false);
        setIsAddOpen(false);
        setSelectedId(null);
        setSelectedSize("medium");
        setCurrentSlide(0);
    };

    const handleAddWidget = () => {
        doubleHapticsImpact();
        setItems([...items, { id: `widget-${selectedId}-${Date.now()}`, variant: selectedId, size: selectedSize }]);
        setIsAddOpen(false);
        setSelectedId(null);
        setSelectedSize("medium");
    };

    useEffect(() => {
        if (!carouselApi) return;

        carouselApi.on("select", () => {
            setCurrentSlide(carouselApi.selectedScrollSnap());
            lightHapticsImpact();
        });
    }, [carouselApi]);

    return (
        <motion.div 
            className={cn("w-full h-full flex flex-col items-center z-[999]", isEditing && "fixed top-0 left-0 bg-background", isNative && isEditing && "pt-10")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            layout
        >
            <div className={cn("p-4 flex flex-col items-center gap-4 w-screen")}>
                <div className="flex flex-row items-center justify-between w-full">
                    <motion.h3 
                        className={isEditing ? "flex gap-1 justify-center items-center" : "text-xl font-bold"}
                        key={isEditing ? "up" : "down"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        onClick={handleDoneClick}
                    >
                        {isEditing ? <Button variant="outline" className="text-xs"><CheckIcon className="size-4" /> Done</Button> : "Widget"}
                    </motion.h3>
                    <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <Button 
                            variant="outline" 
                            className={cn("flex flex-row justify-center w-18 duration-400", isEditing && "w-17.5")} 
                            onClick={handleEditToggle}
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
                        <DrawerContent className="">
                            <DrawerHeader>
                                <DrawerTitle>Add a Widget</DrawerTitle>
                                <DrawerDescription>Select a widget type to add to your dashboard.</DrawerDescription>
                            </DrawerHeader>
                            <div className="flex flex-col items-center gap-4 h-[80dvh] overflow-y-auto rounded-4xl">
                                {/* Widget Selection */}
                                <div className="w-full px-4">
                                    <h4 className="text-sm font-medium mb-2">Widget Type</h4>
                                </div>
                                {[1,2,3].map((item)=>{
                                    return (
                                        <div 
                                            key={`add-widget-${item}`}
                                            className={cn("flex flex-col items-center gap-4 p-2 bg-foreground/10 rounded-3xl transition active:scale-95 hover:duration-75 duration-300")}
                                            onMouseDown={() => handleWidgetSelection(item)}
                                        >
                                            <Widgets variant={item} size="medium" isEditing={false} className="pointer-events-none" />
                                        </div>
                                    )
                                })}
                            </div>
                        </DrawerContent>
                    </Drawer>

                    {/* Size Selection Drawer */}
                    <Drawer open={isSizeOpen} onOpenChange={setIsSizeOpen}>
                        <DrawerContent className="">
                            <DrawerHeader>
                                <DrawerTitle>Select Size</DrawerTitle>
                                <DrawerDescription>Swipe to preview different sizes.</DrawerDescription>
                            </DrawerHeader>
                            <div className="flex flex-col items-center gap-6 p-4 h-[55dvh] overflow-y-auto">
                                {/* Carousel Widget Preview */}
                                {selectedId && (
                                    <div className="w-full max-w-md mx-auto">
                                        <h4 className="text-sm font-medium mb-4 text-center">
                                            {sizeOptions[currentSlide]?.label} Widget
                                        </h4>
                                        <Carousel
                                            setApi={setCarouselApi}
                                            className="w-full"
                                            opts={{
                                                align: "center",
                                                loop: false,
                                            }}
                                        >
                                            <CarouselContent>
                                                {sizeOptions.map((size, index) => (
                                                    <CarouselItem key={size.id} className="flex justify-center">
                                                        <div className="p-4 bg-foreground/10 rounded-3xl">
                                                            <Widgets 
                                                                variant={selectedId} 
                                                                size={size.id} 
                                                                isEditing={false} 
                                                                className="pointer-events-none" 
                                                            />
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious className="left-2" />
                                            <CarouselNext className="right-2" />
                                        </Carousel>
                                        
                                        {/* Carousel Indicators */}
                                        <div className="flex justify-center gap-2 mt-4">
                                            {sizeOptions.map((_, index) => (
                                                <motion.div
                                                    key={index}
                                                    className={cn(
                                                        "w-2 h-2 rounded-full cursor-pointer",
                                                        index === currentSlide ? "bg-primary" : "bg-muted-foreground/30"
                                                    )}
                                                    onClick={() => {
                                                        carouselApi?.scrollTo(index);
                                                        lightHapticsImpact();
                                                    }}
                                                    whileHover={{ scale: 1.2 }}
                                                    whileTap={{ scale: 0.8 }}
                                                    animate={{
                                                        scale: index === currentSlide ? 1.5 : 1
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            ))}
                                        </div>
                                        
                                        {/* Navigation hint */}
                                        <div className="flex justify-center mt-2">
                                            <small className="text-muted-foreground text-center">
                                                ← Swipe or use arrows to change size →
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DrawerFooter>
                                <Button 
                                    onClick={() => handleSizeSelection(sizeOptions[currentSlide]?.id)}
                                    className="w-full"
                                >
                                    Add {sizeOptions[currentSlide]?.label} Widget
                                </Button>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
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
                            {items.length ? 
                                items.map((item) => (
                                    <Widgets key={item.id} id={item.id} variant={item.variant} size={item.size} isEditing={isEditing} onDelete={handleDelete} />
                                )): (   
                                        <div className="flex flex-col pb-12 w-screen px-8">
                                            <div className="flex justify-end gap-2 text-foreground/50 pb-12">
                                                <small className="h-6 flex items-end font-pacifico font-light">{isEditing ? "Click Again to Add Widget" : "Click Here to Edit"}</small>
                                                <PiArrowBendRightUpBold className="size-4 animate-bounce" />
                                            </div>
                                            <div className="flex items-center gap-4 w-full text-foreground/75">
                                                <SquareDashed className="size-12" />
                                                <small className="flex-1 text-center ">No Selected Widget to be Displayed...</small>
                                                
                                            </div>
                                        </div>
                                    )
                            }
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </motion.div>
    )
}