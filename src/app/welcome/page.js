"use client"
import { BallRotatingWitIcons } from "@/components/magicui/ballRotatingWitIcons"
import { TextAnimate } from "@/components/magicui/text-animate"
import { Button } from "@/components/ui/button"
import ForwardLink from "@/components/ui/forwardLink"
import { SeparatorWithText } from "@/components/ui/separatorWithText"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
export default function WelcomePage(){
    return (
        <div className="flex flex-col justify-center items-center h-[100dvh] gap-12">
            <div className="flex flex-col justify-center items-center gap-2">
                <BallRotatingWitIcons />
                <h1 className="text-4xl font-black flex">
                    <motion.div 
                        initial={{x:-16, y:-32,scale: 0}} 
                        animate={{x:0, y:0,scale: 1}} 
                        transition={{
                            duration: 0.2,
                            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                        }}
                        className="text-foreground/80"
                    >
                        Sanus
                    </motion.div>
                    <motion.div
                        initial={{x:32, y:-32}} 
                        animate={{x:0, y:0}}
                        transition={{
                            duration: 0.2,
                            x: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                        }}
                    >
                        Space
                    </motion.div>
                    <motion.div
                        initial={{x:64, y:32}} 
                        animate={{x:0, y:0}}
                        transition={{
                            duration: 0.2,
                            x: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                        }}
                    >
                        .
                    </motion.div>
                </h1>
                <motion.div
                    initial={{scale:0}} 
                    animate={{scale: 1}}
                    transition={{
                        duration: 0.2,
                        delay: 0.2,
                        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                    }}
                >
                    <TextAnimate delay={0.2} className="text-lg font-extralight">Everyone&apos;s Professional Health Assistant</TextAnimate>
                </motion.div>
            </div>
            <motion.div
                className="mt-4 flex flex-col gap-2"
                initial={{scale:0}} 
                animate={{scale: 1}}
                transition={{
                    duration: 0.2,
                    delay: 0.4,
                    scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                }}
            >
                <ForwardLink href="login" className="flex flex-col w-full">
                    <Button variant="outline">Login to <span className="font-black m-0 p-0"><span className="opacity-80">Sanus</span>Space.</span></Button>
                </ForwardLink>
                <SeparatorWithText>OR</SeparatorWithText>
                <ForwardLink href="signup" className="flex flex-col w-full">
                    <Button>I&apos;m new to<span className="font-black m-0 p-0"><span className="opacity-90">Sanus</span>Space.</span></Button>
                </ForwardLink>
            </motion.div>
            
        </div>
    )
}