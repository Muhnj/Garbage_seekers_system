"use client"
import clsx from "clsx";
import { Menu, Minimize, ShieldEllipsis, Users, Shield, FileText, Settings, LogOut, Home, Speaker, Bell, BookDashed } from "lucide-react";
import useNavStore from "@/store/navStore";
import { SearchBar } from "./search-bar";
import NavItem from "./nav-item";
import useAuthStore from "@/store/useAuthStore";
import { Logout } from "@/utils/authService";
import { Tooltip } from "react-tooltip";

export default function SideBar(){
    const {min, minimize, maximize, toggleMenu} = useNavStore();

    return(
    <div className={
        clsx(
            "hidden z-50 md:relative h-screen bg-main text-white p-4 md:flex flex-col gap-8",
            min ? " w-16 transition-all ease-in-out " : "min-w-[260px]"
        )
    }
    >
        <div className={clsx(
            "flex justify-between",
            min ? "flex-col " : ""
        )}>
            <span className="flex justify-center items-center gap-4">
                    <ShieldEllipsis size={24}/>
                    <span className={clsx(
                        "text-white font-black text-xs",
                        min ? "hidden" : "visible" 
                    )}>GARBAGE SEEKERS</span>
            </span>
            <span className={clsx(
                "",
                min ? "hidden" : "block"
            )}><Minimize onClick={minimize}/></span>
        </div>
        
        <div className="flex flex-col gap-2">
            <NavItem data-tooltip-id="my-tooltip" data-tooltip-content="Dashboard"  icon={Home} label="Dashboard" url={'/dashboard'}/>
            <NavItem icon={Users} label="Client Management" url={'/dashboard/client'}/>
            <NavItem icon={Shield} label="Collectors Management" url={'/dashboard/collectors'}/>
            <NavItem icon={BookDashed} label="Pickup Management" url={'/dashboard/pickups'}/>
            <Tooltip id="my-tooltip"/>
        </div>
        <div className="mt-40 flexx flex-col gap-2">
            <NavItem icon={LogOut} onClick={Logout} label="Logout" min={min} maximize={maximize} />
        </div>
    </div>
    )
}