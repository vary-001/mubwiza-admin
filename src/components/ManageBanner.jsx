// src/components/ManageBanner.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle, faTrash, faLink, faEye, faSave } from '@fortawesome/free-solid-svg-icons';

// A reusable, modern toggle switch component
const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber ${
      enabled ? 'bg-orange' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);


export default function ManageBanner() {
  // Local state for the form, updates instantly for a responsive UI
  const [formData, setFormData] = useState({ title: '', message: '', isEnabled: false, link: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusText, setStatusText] = useState('');

  // useRef to hold the document reference and debounce timer
  const bannerDocRef = useRef(doc(db, 'siteConfiguration', 'mainBanner'));
  const debounceTimer = useRef(null);

  // Effect to subscribe to Firestore changes
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(bannerDocRef.current, (doc) => {
      if (doc.exists()) {
        setFormData(doc.data());
      } else {
        // If no banner exists, initialize with empty state
        setFormData({ title: '', message: '', isEnabled: false, link: '' });
      }
      setIsLoading(false);
    });
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once

  // Debounced save function using useCallback for performance
  const debouncedSave = useCallback((data) => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setIsSaving(true);
    setStatusText('Saving...');

    // Set a new timer
    debounceTimer.current = setTimeout(async () => {
      try {
        await setDoc(bannerDocRef.current, { ...data, updatedAt: serverTimestamp() });
        setStatusText('Saved!');
      } catch (error) {
        console.error("Error saving banner:", error);
        setStatusText('Error!');
        alert("Failed to save banner. Please try again.");
      } finally {
        // Clear the saving status after a short delay
        setTimeout(() => {
          setIsSaving(false);
          setStatusText('');
        }, 1500);
      }
    }, 1000); // 1-second debounce delay
  }, []);

  // Handle changes for text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Update local form state immediately for smooth typing
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    // Debounce the save operation
    debouncedSave(updatedData);
  };

  // Handle changes for the toggle switch
  const handleToggleChange = (isEnabled) => {
    const updatedData = { ...formData, isEnabled };
    setFormData(updatedData);
    // Save immediately since it's a single click event
    debouncedSave(updatedData);
  };

  // Function to clear the banner
  const handleClearBanner = async () => {
    if (window.confirm("Are you sure you want to clear and disable the banner?")) {
      const clearedData = { title: '', message: '', isEnabled: false, link: '' };
      setFormData(clearedData);
      debouncedSave(clearedData);
    }
  };
  
  // --- BANNER PREVIEW COMPONENT ---
  const BannerPreview = ({ title, message, link, isEnabled }) => (
    <div className="p-6 rounded-lg bg-hero-gradient shadow-lg text-white font-poppins text-center transition-opacity duration-500" style={{ opacity: isEnabled ? 1 : 0.6 }}>
      <h3 className="text-xl font-bold">{title || "Banner Title"}</h3>
      <p className="mt-2 text-ivory-white/90">{message || "This is a preview of your banner message."}</p>
      {link && <button className="mt-4 bg-white text-mahogany font-bold py-2 px-5 rounded-full shadow-md hover:bg-ivory-white transition-all">Learn More</button>}
      {!isEnabled && <div className="mt-3 text-xs font-bold uppercase text-yellow-300 tracking-wider">Preview - Banner is Disabled</div>}
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-orange text-5xl" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 font-poppins">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left side: Form inputs */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-sand/30 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-mahogany">Manage Site Banner</h2>
            <div className={`flex items-center font-bold text-sm py-1 px-3 rounded-full self-start ${formData.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              <FontAwesomeIcon icon={formData.isEnabled ? faCheckCircle : faTimesCircle} className="mr-2" />
              {formData.isEnabled ? 'Live on Site' : 'Disabled'}
            </div>
          </div>
          <div>
            <label className="font-bold text-amber">Title</label>
            <input name="title" type="text" placeholder="e.g., Summer Sale!" value={formData.title} onChange={handleInputChange} className="w-full mt-2 p-3 rounded-lg border border-sand focus:outline-none focus:ring-2 focus:ring-orange" />
          </div>
          <div>
            <label className="font-bold text-amber">Message</label>
            <textarea name="message" placeholder="e.g., Get 20% off all flower bouquets!" value={formData.message} onChange={handleInputChange} className="w-full mt-2 p-3 rounded-lg border border-sand focus:outline-none focus:ring-2 focus:ring-orange" rows="3"></textarea>
          </div>
          <div>
            <label className="font-bold text-amber">Button Link (Optional)</label>
            <div className="relative mt-2">
               <FontAwesomeIcon icon={faLink} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input name="link" type="url" placeholder="https://... or /products" value={formData.link} onChange={handleInputChange} className="w-full pl-12 p-3 rounded-lg border border-sand focus:outline-none focus:ring-2 focus:ring-orange" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-ivory-white p-4 rounded-lg">
            <span className="font-bold text-mahogany">Enable Banner on Site?</span>
            <ToggleSwitch enabled={formData.isEnabled} onChange={handleToggleChange} />
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={handleClearBanner} className="border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white font-medium py-2 px-5 rounded-full transition-all flex items-center justify-center">
                <FontAwesomeIcon icon={faTrash} className="mr-2" /> Clear Banner
            </button>
          </div>
        </div>

        {/* Right side: Live preview and status */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-mahogany flex items-center"><FontAwesomeIcon icon={faEye} className="mr-3 text-amber"/>Live Preview</h3>
            {/* Saving Status Indicator */}
            <div className={`transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center text-charcoal text-sm font-medium">
                    {statusText === 'Saved!' ? 
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-500" /> :
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    }
                    <span>{statusText}</span>
                </div>
            </div>
           </div>
           <BannerPreview {...formData} />
        </div>

      </div>
    </div>
  );
}