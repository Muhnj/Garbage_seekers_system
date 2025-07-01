import clsx from "clsx";
import { Search } from "lucide-react";

export function SearchBar({min}){
    return(
        <div className="relative text-xs">
            <Search className="absolute top-[5px] left-2 size-4" size={20}/>
            <input type="text" className={clsx("rounded-lg border border-slate-100 bg-slate-400 py-1 pl-6 w-full ",
                min ? "placeholder-transparent" : "placeholder-slate-50"
            )} placeholder="Search"></input>
        </div>
    )
}