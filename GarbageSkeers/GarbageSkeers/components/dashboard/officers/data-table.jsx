import { getGuards } from "@/libs/database"
import { useEffect, useState } from "react"

export default function OfficerTable(){

    const {collectors, setCollectors} = useState([])
    useEffect(() => {
        async function fetchData(){
            await getGuards();
        }
    })
    return(
        <div className="w-full h-full bg-white">

        </div>
    )
}