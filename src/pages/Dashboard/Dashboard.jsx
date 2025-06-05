import React from 'react';
import DashboardContent from './DashboardContent';

function Dashboard({ lokasi, curahHujan, loadingCuaca }) {
  return (
    <DashboardContent lokasi={lokasi} curahHujan={curahHujan} loading={loadingCuaca} />
  );
}

export default Dashboard;
