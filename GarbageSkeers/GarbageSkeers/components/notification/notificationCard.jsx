import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useRouter } from "next/navigation";

export default function NotificationCard({ user }) {
    const { markAsRead } = useNotificationStore();
    const router = useRouter();

    const handleClick = async () => {
        await markAsRead(user.id); // Mark as read in Firestore
        router.push(`/dashboard/users/${user.id}`); // Navigate to user details page
    };

    return (
        <div
            className={`flex items-center bg-white shadow-lg p-2 mb-2 w-full cursor-pointer ${
                user.isRead ? "border-l-4 border-red-500" : "border-l-4 border-emerald-500"
            }`}
            onClick={handleClick}
        >
            {/* Profile Image */}
            <Image
                src={user.photoURL || "/default-user.png"}
                alt={user.name}
                width={50}
                height={50}
                className="rounded-full object-cover mr-4"
            />
            
            {/* Notification Content */}
            <div className="flex-1">
                <h3 className="font-semibold text-gray-800">New signup!</h3>
                <p className="text-gray-600 text-sm">
                    {user.name} just created an account with us.
                </p>
            </div>

            {/* Time Ago */}
            <span className="text-gray-400 text-sm">
                {/* {user.createdAt ? formatDistanceToNow(user.createdAt.toDate(), { addSuffix: true }) : "Just now"} */}
            </span>
        </div>
    );
}
