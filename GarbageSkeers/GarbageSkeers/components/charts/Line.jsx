'use client'
import { Line } from "react-chartjs-2";
import { CardHeader, Header } from '@/components/dashboard/header'
import { 
    Chart as ChartJS, LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    PointElement,
    LineElement
} from 'chart.js';
import { SecurityCompanyData } from "@/libs/data/clientsdata";

ChartJS.register({
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    PointElement,
    LineElement
})

export function LineGraph(){

    const Options = {
        responsive: true,
        plugins:{
            title: {
                display: true,
                text: "Client's Growth"
            },
            legend: {
                display: false
            }
        }
    }
    return(
        <div className="col-span-12 md:col-span-12 lg:col-span-8 bg-white rounded-lg p-8">
            <CardHeader title={"Mounthly Deployment"}/>
            <Line options={Options} data={SecurityCompanyData}/>
        </div>
    )
}