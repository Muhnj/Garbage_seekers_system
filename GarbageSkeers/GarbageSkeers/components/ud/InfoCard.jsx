import { Card,CardDescription } from '../ui/card';
import React from 'react';

const InfoCard = ({ icon: Icon, count, description }) => (
  <Card className="flex flex-col gap-4 p-4 justify-center items-center bg-white">
    <Icon className='text-emerald-500'/>
    <span className='text-2xl font-bold'>{count}</span>
    <CardDescription className="text-center">{description}</CardDescription>
  </Card>
);

export default InfoCard;