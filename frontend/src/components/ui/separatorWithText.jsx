export function SeparatorWithText({children}){
    return (

        <small className="flex items-center text-foreground gap-2">
            <div className="flex-1 h-0.25 bg-foreground/40"/>
            {children}
            <div className="flex-1 h-0.25 bg-foreground/40"/>
        </small>
    )
}