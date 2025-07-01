'use client'
import React, { useEffect, useState } from 'react';
import InfoCard from '@/components/ud/InfoCard';
import { User, Shield, AlertCircle, Activity, Home, Recycle, LocateFixed, TicketCheck } from 'lucide-react';
import { Header } from '../dashboard/header';
import Link from 'next/link';
import { collectorManager, pickupsManager, userManager } from '@/libs/resourceManagement';

export default function CardGroup() {

  const [Collectors, setCollectors] = useState([]);
  const [clients, setResidents] = useState([]);
  const [pickups, setPickups] = useState([]);

  useEffect(()=> {
    async function fetchData(){
      const Collectors = await collectorManager.getAll();
      console.log("Collectors Data:", Collectors);
      setCollectors(Collectors);

      const clients = await userManager.getAll();
      console.log("Residents Data: ", clients);
      setResidents(clients)

      const pickupsData = await pickupsManager.getAll();
      console.log("Pickups Data: ", pickupsData);
      setPickups(pickupsData);
    }

    fetchData()
  }, []);
  
  return (
    <div className="flex p-2 md:p-8 bg-white rounded-lg flex-col gap-6 overflow-hidden">
      <Header title={"Dashboard"}/>
      <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Link href={'/dashboard/collectors/overview'}>
          <InfoCard icon={Recycle} count={Collectors.length} description="Garbage Collectors" />
        </Link>
        <InfoCard icon={Home} count={clients.length} description="Residents" />
        <InfoCard icon={LocateFixed} count={pickups.length} description="Pickups" />
        <InfoCard icon={TicketCheck} count={300000} description="Total Revenue" />
      </div>
    </div>
  );
}
