// src/pages/Dashboard.jsx
import { useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Products from '../components/Product';
import AddProduct from '../components/Addproduct';
import ManageBanner from '../components/ManageBanner';
import ManageProductInfo from '../components/ManageProductInfo'; // --- IMPORTED
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// --- ADDED faBookOpen ICON ---
import { faSignOutAlt, faPlus, faBoxOpen, faBullhorn, faBookOpen, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

// You can create a logo component or just use text
const Logo = () => (
    <div className="p-4 text-center">
        <h1 className="text-2xl font-bold text-ivory-white">mubwiza<span className="text-orange">.</span>eden</h1>
        <p className="text-xs text-sand">Admin Panel</p>
    </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // An object to hold the titles for each view
  const viewTitles = {
    products: 'Product Collection',
    addProduct: 'Add a New Product',
    banner: 'Manage Site Banner',
    productInfo: 'Manage Flower Info' // --- TITLE ADDED ---
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  // Updated to handle all views
  const renderContent = () => {
    switch (currentView) {
      case 'products':
        return <Products />;
      case 'addProduct':
        return <AddProduct onProductAdded={() => setCurrentView('products')} />;
      case 'banner':
        return <ManageBanner />;
      // --- CASE FOR NEW COMPONENT ADDED ---
      case 'productInfo':
        return <ManageProductInfo />;
      default:
        return <Products />;
    }
  };

  const NavLink = ({ icon, text, viewName }) => (
    <button
      onClick={() => {
        setCurrentView(viewName);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center text-left py-3 px-6 transition-colors duration-200 ${
        currentView === viewName
          ? 'bg-amber text-white font-bold'
          : 'text-ivory-white hover:bg-teak'
      }`}
    >
      <FontAwesomeIcon icon={icon} className="mr-4 w-5" />
      <span>{text}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-ivory-white font-poppins">
      {/* --- Sidebar --- */}
      <aside className={`fixed inset-y-0 left-0 bg-mahogany text-white w-64 transform transition-transform duration-300 ease-in-out z-30
                         ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                         lg:translate-x-0 lg:relative lg:flex-shrink-0`}>
        <Logo />
        {/* --- NAVIGATION UPDATED --- */}
        <nav className="mt-8">
          <NavLink icon={faBoxOpen} text="Manage Products" viewName="products" />
          <NavLink icon={faPlus} text="Add New Product" viewName="addProduct" />
          <NavLink icon={faBullhorn} text="Manage Banner" viewName="banner" />
          <NavLink icon={faBookOpen} text="Manage Flower Info" viewName="productInfo" />
        </nav>
        <div className="absolute bottom-0 w-full p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center text-left py-3 px-6 rounded-lg text-ivory-white bg-teak/50 hover:bg-teak"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-4" />
              <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col">
        {/* --- Header --- */}
        <header className="bg-white shadow-md lg:shadow-none">
          <div className="px-6 py-4 flex justify-between items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="text-mahogany lg:hidden"
              aria-label="Open sidebar"
            >
              <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg"/>
            </button>
            <div className="lg:hidden w-8"></div>
            
            {/* --- HEADER TITLE IS NOW FULLY DYNAMIC --- */}
            <h1 className="text-xl md:text-2xl font-bold text-mahogany text-center">
              {viewTitles[currentView] || 'Dashboard'}
            </h1>
            
            <div className="w-8"></div>
          </div>
        </header>

        {/* --- Content Area --- */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* --- Mobile Overlay --- */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-charcoal bg-opacity-50 z-20 lg:hidden"
        ></div>
      )}
    </div>
  );
}