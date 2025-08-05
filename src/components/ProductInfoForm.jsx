// src/components/ProductInfoForm.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faImage, faLeaf, faTag, faCalendarAlt, faTint, faSun } from '@fortawesome/free-solid-svg-icons';

// --- IMPORTANT: CONFIGURE YOUR CLOUDINARY DETAILS ---
const CLOUDINARY_UPLOAD_PRESET = 'mubwiza-eden'; // Replace with your actual upload preset name
const CLOUDINARY_CLOUD_NAME = 'dliw90eyq';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
// ---------------------------------------------------------

// A small, reusable preview card component
const InfoCardPreview = ({ name, botanical, image }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-sand/20">
      <div className="relative h-48 overflow-hidden">
        <img src={image || 'https://via.placeholder.com/400x300?text=Upload+Image'} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <span className="absolute top-3 right-3 bg-white/90 text-orange font-bold py-1 px-3 rounded-full text-xs shadow-md">{botanical || 'Botanical Name'}</span>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-mahogany">{name || 'Flower Name'}</h3>
      </div>
    </div>
);


export default function ProductInfoForm({ infoToEdit, onComplete }) {
  const [formData, setFormData] = useState({
    name: '', description: '', botanical: '', blooms: '', water: '', light: '', tag: '', image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (infoToEdit) {
      setFormData(infoToEdit);
    }
  }, [infoToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a temporary URL for the live preview
      setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let imageUrl = formData.image; // Keep existing image by default

    // If a new image file was selected, upload it to Cloudinary
    if (imageFile) {
      const cloudFormData = new FormData();
      cloudFormData.append('file', imageFile);
      cloudFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const response = await axios.post(CLOUDINARY_URL, cloudFormData);
      imageUrl = response.data.secure_url;
    }

    const dataToSave = { ...formData, image: imageUrl };

    try {
      if (infoToEdit) { // If editing, update the existing document
        const docRef = doc(db, 'productInfo', infoToEdit.id);
        await updateDoc(docRef, dataToSave);
      } else { // If creating, add a new document
        await addDoc(collection(db, 'productInfo'), { ...dataToSave, createdAt: serverTimestamp() });
      }
      onComplete(); // Signal that the form is done
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("Failed to save. Please check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Fields (takes up 2 columns on large screens) */}
      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-sand/30 space-y-4">
        <h2 className="text-2xl font-bold text-mahogany mb-4">{infoToEdit ? 'Edit' : 'Add New'} Flower Info</h2>
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" placeholder="Flower Name (e.g., Rwandan Rose)" value={formData.name} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" required/>
            <input name="botanical" placeholder="Botanical Name (e.g., Rosa rwandensis)" value={formData.botanical} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" />
        </div>
        <textarea name="description" placeholder="Short description of the flower..." value={formData.description} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" rows="4"></textarea>
        
        {/* Care Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="blooms" placeholder="Blooms (e.g., Year-round)" value={formData.blooms} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" />
            <input name="water" placeholder="Water (e.g., Moderate)" value={formData.water} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" />
            <input name="light" placeholder="Light (e.g., Full sun)" value={formData.light} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" />
        </div>
        
        {/* Tag and Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="tag" placeholder="Tag (e.g., Native)" value={formData.tag} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" />
            <label className="flex items-center gap-3 w-full p-3 rounded-lg border cursor-pointer hover:bg-ivory-white/50">
                <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                <span className="text-charcoal truncate">{imageFile ? imageFile.name : 'Upload Image'}</span>
                <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
            </label>
        </div>
      </div>

      {/* Preview and Actions (takes up 1 column) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-mahogany">Live Preview</h3>
        <InfoCardPreview {...formData} />
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onComplete} className="py-2 px-6 rounded-full text-charcoal font-medium hover:bg-gray-100" disabled={isSaving}>Cancel</button>
          <button type="submit" className="bg-gradient-to-r from-orange to-amber text-white font-bold py-2 px-6 rounded-full flex items-center disabled:opacity-50" disabled={isSaving}>
            {isSaving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> : <FontAwesomeIcon icon={faSave} className="mr-2" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}