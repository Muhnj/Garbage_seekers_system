'use client'
import { useEffect, useState } from "react";

export default function ViewPickups({ data }) {
    const [weapons, setPickups] = useState([]);

    useEffect(() => {
        if (data) {
            setPickups(data);
        }
    }, [data]);

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Registered Pickups</h2>
            {weapons.length === 0 ? (
                <p className="text-gray-500">No weapons registered yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weapons.map((weapon, index) => (
                        <div key={index} className="border p-4 rounded shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800">{weapon.name}</h3>
                            <p className="text-sm text-gray-600"><strong>Serial:</strong> {weapon.serial}</p>
                            <p className="text-sm text-gray-600"><strong>Type:</strong> {weapon.type}</p>
                            <p className="text-sm text-gray-600"><strong>Status:</strong> {weapon.status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
