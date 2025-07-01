import React from 'react'
import CardGroup from '../ud/cardGroup'
import Navigation from '../dashboard/navigation'
import { Header } from '../dashboard/header'
import RecentMessages from '../dashboard/messages-panel'
import { ChartGroup } from '../dashboard/chartGroup'
import { LineGraph } from '../charts/Line'
import SideBar from '../dashboard/navigation'

function Dashboard() {
  return (
    <div className='flex'>
      <SideBar/>
      <div className='col-span-10 m-8 w-full flex flex-col gap-4 pt-12'>
        <CardGroup/>
        <div className='flex gap-4'>
          <RecentMessages/>
          <LineGraph/>
          <LineGraph/>
        </div>
      </div>
    </div>
  )
}

export default Dashboard