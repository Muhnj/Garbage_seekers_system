import { LineGraph } from "../charts/Line";

export function ChartGroup(){
    return(
        <div className="grid grid-cols-12 w-1/2">
            <LineGraph/>
        </div>
    )
}