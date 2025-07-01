import React, { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { collectorManager } from "@/libs/resourceManagement";
import { toast } from "react-toastify";

const MessageCard = ({ user, message, status, time }) => {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const confirmed = window.confirm("Are you sure you want to verify Collect before reviewing details?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await collectorManager.updateResource(user?.id, {
        status: "verified",
      });
      alert("Collector Verified successfully!");
    } catch (error) {
      alert("Failed to verify collector.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded w-full border-b-2 border-gray-200">
      <div className="flex gap-4 justify-between items-center relative p-2 rounded-lg">

        {/* User Name and Message */}
        <Link href={`/dashboard/collectors/overview/${user?.id}`} className="flex justify-between items-center gap-4 w-full">
          <div className="flex flex-col gap-1 leading-[16px] text-sm w-3/5">
            <span className="font-normal">{user?.firstName} {user?.lastName}</span>
            <span className="font-normal text-xs text-slate-600">{user?.email} || {user?.phone}</span>
            <span className="text-gray-400 text-sm">{user.status}</span>
          </div>
          
        </Link>
        {user.status === 'pending_approval' && (<button onClick={() => handleVerify()} className="py-1 px-4 rounded-md bg-emerald-600 text-white">Verify</button>)}
        {/* Timestamp */}
        <div className="text-xs ml-4">

        </div>
      </div>
    </div>
  );
};

export default MessageCard;
