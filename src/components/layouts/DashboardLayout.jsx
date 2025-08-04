import React, {useContext} from 'react';
import Navbar from './Navbar';
import { UserContext } from '../../context/userContext';

const DashboardLayout = ({ children }) => {
  const { user } = useContext(UserContext);
  return (
    <div className="">
      <Navbar />
      <main className="">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;