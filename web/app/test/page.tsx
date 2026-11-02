"use client" 

import { usePriorities } from "@/lib/api/priorities";

export default function Testpage() {
    const {data : priorities, isPending, error} = usePriorities()
    console.log(isPending);
    return(
        <div>
            <ul>
                {priorities?.map((priority) =>(
                    <li key={priority.id}> 
                        {priority.text}
                    </li>
                ))}
            </ul>
        </div>
        
    );
}