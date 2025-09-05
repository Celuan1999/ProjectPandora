"use client"
import Button from "@/app/components/ui/button";

export default function Hero() {
    return (
        <div className="flex flex-col items-center py-32 bg-gray-100">
            <h1 className="text-6xl text-center font-bold pb-2">Project Pandora</h1>
            <h2 className="text-2xl text-gray-500 pb-4">Secured Designs</h2>
            <Button className="px-16 py-2" onClick={() => {console.log("Give me some functionality boi")}}>Search</Button>
        </div>
    )
}