import clsx from "clsx";
import React from "react";
import Link from "next/link";
import useNavStore from "@/store/navStore";


const NavItem = ({ icon: Icon, label, url=""}) => {
  const {min, maximize} = useNavStore();

  return (
    <Link 
    href={url}
    className="text-white w-full flex items-center gap-4 p-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-300 hover:font-semibold hover:bg-opacity-30 transition-all ease-in-out"
    onDoubleClick= {maximize}
    >
      <Icon size={20}/>
      <span className={clsx(min ? "hidden" : "visible")}>
        {label}
      </span>
    </Link>
  );
};

export default NavItem;
