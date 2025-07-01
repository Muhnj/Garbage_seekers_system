'use client'
import useNavStore from "@/store/navStore";
import { Menu } from "lucide-react";

export default function NavBar(){
    const { toggleMenu } = useNavStore();

    return(
        <div 
        className='fixed w-full h-12 bg-white flex items-center px-4 shadow-md'
        >
            <Menu onClick={toggleMenu} className="border-x-2"></Menu>

        </div>
    )
}