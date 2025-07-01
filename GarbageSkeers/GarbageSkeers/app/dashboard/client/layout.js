'use client'
import { usePathname } from "next/navigation";
import useModalStore from "@/store/modalStore";
import AddResidentModal from "@/components/Data Models/addClient";
import Modal from "@/components/Data Models/modal";
import { Filter, Plus } from "lucide-react";

export default function SectionHeader({ children }) {
    const { openModal } = useModalStore();
    const pathname = usePathname(); // get current path

    const handleOpenModal = () => {
        openModal(<AddResidentModal />);
    };

    const navigation = [
        { href: "/dashboard/client", name: "Overview" },
    ];

    return (
        <div className="max-w-screen-xl mx-auto px-4 pt-4 md:px-8">
            <div className="items-start justify-between flex">
                <h3 className="text-gray-800 text-2xl font-bold">Residents</h3>
                <div className="items-center gap-x-3 mt-6 md:mt-0 justify-center hidden md:flex">
                    <button
                        onClick={handleOpenModal}
                        className="px-4 py-2 mt-3 text-white font-medium bg-main rounded-lg hover:bg-emerald-500 active:bg-emerald-700 sm:mt-0 md:text-sm"
                    >
                        Register Client
                    </button>
                </div>
                <div className="items-center gap-x-3 md:mt-0 flex md:hidden justify-center">
                    <span className="p-2 bg-slate-200 text-slate-800 rounded-full"><Filter /></span>
                    <span
                        onClick={handleOpenModal}
                        className="p-2 bg-slate-200 text-slate-800 rounded-full cursor-pointer"
                    >
                        <Plus />
                    </span>
                </div>
            </div>

            <div className="mt-6 md:mt-4">
                <ul className="w-full border-b flex items-center gap-x-3 overflow-x-auto">
                    {navigation.map((item, idx) => {
                        const isActive = pathname === item.href;
                        return (
                            <li
                                key={idx}
                                className={`py-2 border-b-2 ${isActive ? "border-emerald-500 text-emerald-500" : "border-transparent text-gray-500"}`}
                            >
                                <a
                                    href={item.href}
                                    className={`py-2.5 px-4 rounded-lg duration-150 text-sm hover:text-emerald-500 hover:bg-gray-50 active:bg-gray-100 font-medium`}
                                >
                                    {item.name}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Render page content */}
            <div className="mt-4">{children}</div>
            <Modal />
        </div>
    );
}
