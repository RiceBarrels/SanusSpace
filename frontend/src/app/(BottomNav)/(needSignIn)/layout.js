import { SignInCheck } from "@/lib/signInCheck";

export default function layout({children}){
    return (
        <>
            <SignInCheck />
            {children}
        </>
    )
}