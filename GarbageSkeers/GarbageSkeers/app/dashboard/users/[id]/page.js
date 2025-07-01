import Image from "next/image";

export default function UserDetailsPage({ params }) {
    const { userId } = params;

    return <div> {`id: ${userId}`} </div>
}