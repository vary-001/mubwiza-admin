// src/components/ManageBanner.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faSpinner, faCheckCircle, faTimesCircle, faSave, faEdit, faTrash, faLink, faEye } from '@fortawesome/free-solid-svg-icons';

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
  const [bannerData, setBannerData] = useState({ title: '', message: '', isEnabled: false, link: '' });
  const [formData, setFormData] = useState({ title: '', message: '', isEnabled: false, link: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bannerDocRef = doc(db, 'siteConfiguration', 'mainBanner');

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(bannerDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setBannerData(data);
        setFormData(data);
      } else {
        setIsEditing(true); // If no banner exists, go directly to edit mode
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [bannerDocRef]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(bannerDocRef, { ...formData, updatedAt: serverTimestamp() });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving banner:", error);
      alert("Failed to save banner. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClearBanner = async () => {
    if (window.confirm("Are you sure you want to clear and disable the banner?")) {
      setIsSaving(true);
      try {
        const clearedData = { title: '', message: '', isEnabled: false, link: '', updatedAt: serverTimestamp() };
        await setDoc(bannerDocRef, clearedData);
        setFormData(clearedData); // Also clear the form state
        setIsEditing(false);
      } catch(error) {
        console.error("Error clearing banner:", error);
      } finally {
        setIsSaving(false);
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (value) => {
    setFormData(prev => ({ ...prev, isEnabled: value }));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-orange text-5xl" /></div>;
  }
  
  // --- BANNER PREVIEW COMPONENT ---
  const BannerPreview = ({ title, message, link, isEnabled }) => (
    <div className="p-6 rounded-lg bg-hero-gradient shadow-lg text-white font-poppins text-center transition-opacity duration-500" style={{ opacity: isEnabled ? 1 : 0.6 }}>
      <h3 className="text-xl font-bold">{title || "Banner Title"}</h3>
      <p className="mt-2 text-ivory-white/90">{message || "This is a preview of your banner message."}</p>
      {link && <button className="mt-4 bg-white text-mahogany font-bold py-2 px-5 rounded-full shadow-md hover:bg-ivory-white transition-all">Learn More</button>}
      {!isEnabled && <div className="mt-3 text-xs font-bold uppercase text-yellow-300 tracking-wider">Preview - Banner is Disabled</div>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {isEditing ? (
        // --- EDITING VIEW ---
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side: Form inputs */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-sand/30 space-y-6">
              <h2 className="text-2xl font-bold text-mahogany mb-4">Edit Site Banner</h2>
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
            </div>
            {/* Right side: Live preview */}
            <div className="space-y-4">
               <h3 className="text-lg font-bold text-mahogany flex items-center"><FontAwesomeIcon icon={faEye} className="mr-3 text-amber"/>Live Preview</h3>
               <BannerPreview {...formData} />
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsEditing(false)} className="py-2 px-6 rounded-full text-charcoal font-medium hover:bg-gray-100 transition-all" disabled={isSaving}>Cancel</button>
                  <button type="submit" className="bg-gradient-to-r from-orange to-amber text-white font-bold py-2 px-6 rounded-full flex items-center disabled:opacity-50 hover:shadow-lg hover:shadow-orange/30" disabled={isSaving}>
                    {isSaving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> : <FontAwesomeIcon icon={faSave} className="mr-2" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
            </div>
          </div>
        </form>
      ) : (
        // --- DISPLAY VIEW ---
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border-t-4 border-amber">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-mahogany">Current Site Banner</h2>
            <div className={`flex items-center font-bold text-sm py-1 px-3 rounded-full self-start ${bannerData.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              <FontAwesomeIcon icon={bannerData.isEnabled ? faCheckCircle : faTimesCircle} className="mr-2" />
              {bannerData.isEnabled ? 'Live on Site' : 'Disabled'}
            </div>
          </div>
          
          <div className="mt-6">
            <BannerPreview {...bannerData} />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <button onClick={handleClearBanner} className="border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white font-medium py-2 px-5 rounded-full transition-all flex items-center justify-center">
                <FontAwesomeIcon icon={faTrash} className="mr-2" /> Clear Banner
            </button>
            <button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-orange to-amber text-white font-bold py-2 px-5 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-orange/30">
                <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Banner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}