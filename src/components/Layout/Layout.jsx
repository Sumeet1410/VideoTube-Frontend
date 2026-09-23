import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import './Layout.css';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={sidebarOpen} />
      <main className={`main-content ${sidebarOpen ? 'main-sidebar-open' : 'main-sidebar-collapsed'}`}>
        <Outlet />
      </main>
    </div>
  );
}
