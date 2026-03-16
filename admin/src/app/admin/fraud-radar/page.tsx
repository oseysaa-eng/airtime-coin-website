"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/adminApi";
import { getAdminSocket } from "@/lib/adminSocket";

export default function FraudRadarPage(){

const [events,setEvents] = useState<any[]>([]);

const load = async()=>{

const res = await adminApi.get("/fraud-radar");

setEvents(res.data);

};

useEffect(()=>{

load();

const socket = getAdminSocket();

socket.on("fraud.event",(event:any)=>{

setEvents(prev=>[event,...prev]);

});

return ()=>{

socket.off("fraud.event");

};

},[]);

return(

<div className="p-6 space-y-6">

<h1 className="text-2xl font-bold">
Fraud Radar
</h1>

<div className="space-y-3">

{events.map((e:any)=>(

<div
key={e._id}
className={`p-3 rounded border
${e.severity==="critical"?"bg-red-100":
e.severity==="high"?"bg-orange-100":
e.severity==="medium"?"bg-yellow-100":
"bg-gray-100"}`}
>

<div className="font-semibold">
{e.type}
</div>

<div className="text-sm">
{e.message}
</div>

<div className="text-xs text-gray-500">
{new Date(e.createdAt).toLocaleString()}
</div>

</div>

))}

</div>

</div>

);

}