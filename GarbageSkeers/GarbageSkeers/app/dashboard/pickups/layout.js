'use client';
import React from "react";
import { usePathname } from "next/navigation"; // Import usePathname
import { useFilterStore } from "@/store/filterStore";
import AddWeaponModal from "@/components/Data Models/addWeapon";
import Modal from "@/components/Data Models/modal"; // Ensure this is imported
import { Filter, Plus } from "lucide-react";

export default function WeaponSectionHeader({ children }) {
  const pathname = usePathname(); // Get the current path
  const {pickupFilter} = useFilterStore();

  const navigation = [
    { href: "/dashboard/pickups/inventory", name: pickupFilter },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 pt-4 md:px-8">
      <div className="items-start justify-between flex">
        <h3 className="text-gray-800 text-2xl font-bold">Pickups</h3>
      </div>

      <div className="mt-6 md:mt-4">
        <ul className="w-full border-b flex items-center gap-x-3 overflow-x-auto">
          {navigation.map((item, idx) => (
            <li
              key={idx}
              className={`py-2 border-b-2 ${
                pathname === item.href
                  ? "border-emerald-500 text-emerald-500"
                  : "border-white text-gray-500"
              }`}
            >
              <a
                href={item.href}
                className="py-2.5 px-4 rounded-lg duration-150 text-sm hover:text-emerald-500 hover:bg-gray-50 active:bg-gray-100 font-medium"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">{children}</div>

      {/* Modal Component */}
      <Modal />
    </div>
  );
}
