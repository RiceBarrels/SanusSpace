"use client"

import { useState } from "react";
import { cn } from '../../lib/utils';
import { ChevronRight } from "lucide-react";
import ForwardLink from "./forwardLink";
export function RoundedMenuSelections({title, items=[]}){
    return (
        <div className="flex flex-col gap-3 w-sm m-2">
            {title && <h3 className="text-xl font-[900]">{title}</h3> || <div className="h-0 w-full" />}
            <div className="flex flex-col gap-1">
                {items.map((item, index) => {
                    if(item.separator){
                        return (
                            <div className="h-2 w-full" key={`${item.title || 'item'}-${index}`} />
                        )
                    }
                    return (
                        <ForwardLink 
                            href={item.link || '#'} 
                            key={`${item.title || 'item'}-${index}`} 
                            className={cn("flex items-center gap-4 rounded-md p-3.5 bg-primary/10 text-foreground/80", index === 0 && "rounded-t-2xl", index === items.length - 1 && "rounded-b-2xl")}
                        >
                            <div className="">{item.icon}</div>
                            <span className="text-sm font-medium flex-1">{item.title}</span>
                            <ChevronRight className="size-3.5" />
                        </ForwardLink>
                    )
                })}
            </div>
        </div>
    )
}