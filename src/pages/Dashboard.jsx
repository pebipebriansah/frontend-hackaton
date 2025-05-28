import React from 'react';
import Layout from './Layout';
import DashboardContent from './DashboardContent';

function Dashboard({ lokasi, curahHujan, loadingCuaca }) {
  return (
    <Layout lokasi={lokasi} curahHujan={curahHujan} loadingCuaca={loadingCuaca}>
      <DashboardContent lokasi={lokasi} curahHujan={curahHujan} loading={loadingCuaca} />
    </Layout>
  );
}

export default Dashboard;