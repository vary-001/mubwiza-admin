// src/components/ProductInfoForm.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faImage, faLeaf, faTint, faSun, faAlignLeft } from '@fortawesome/free-solid-svg-icons';

// --- IMPORTANT: YOUR CLOUDINARY DETAILS ---
const CLOUDINARY_UPLOAD_PRESET = 'mubwiza-eden';
const CLOUDINARY_CLOUD_NAME = 'dliw90eyq';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
// ---------------------------------------------------------

// --- Simplified and updated preview component ---
const InfoCardPreview = ({ name, description, image, water, light }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-sand/20 font-poppins">
      <div className="relative h-48 overflow-hidden">
        <img src={image || 'https://via.placeholder.com/400x300?text=Upload+Image'} alt={name || "Preview"} className="w-full h-full object-cover" />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-mahogany mb-2">{name || 'Flower Name'}</h3>
        <p className="text-charcoal/90 text-sm mb-4 h-12 overflow-hidden">{description || 'A short description will appear here.'}</p>
        <div className="flex justify-around text-center text-sm text-charcoal/80">
          <div className="flex-1">
            <FontAwesomeIcon icon={faTint} className="text-amber mb-1"/>
            <p className="font-medium">{water || 'Water'}</p>
          </div>
          <div className="border-l border-sand/50 mx-2"></div>
          <div className="flex-1">
            <FontAwesomeIcon icon={faSun} className="text-amber mb-1"/>
            <p className="font-medium">{light || 'Light'}</p>
          </div>
        </div>
      </div>
    </div>
);

export default function ProductInfoForm({ infoToEdit, onComplete }) {
  // --- State simplified to only the required fields ---
  const [formData, setFormData] = useState({
    name: '', description: '', water: '', light: '', image: ''
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
      setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.image) {
        alert("Please provide at least a name and an image.");
        return;
    }
    setIsSaving(true);
    let imageUrl = formData.image;

    if (imageFile) {
      const cloudFormData = new FormData();
      cloudFormData.append('file', imageFile);
      cloudFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const response = await axios.post(CLOUDINARY_URL, cloudFormData);
      imageUrl = response.data.secure_url;
    }

    // --- Data object is now clean and simplified ---
    const dataToSave = {
      name: formData.name,
      description: formData.description,
      water: formData.water,
      light: formData.light,
      image: imageUrl
    };

    try {
      if (infoToEdit) {
        const docRef = doc(db, 'productInfo', infoToEdit.id);
        await updateDoc(docRef, { ...dataToSave, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'productInfo'), { ...dataToSave, createdAt: serverTimestamp() });
      }
      onComplete();
    } catch (error) {
      console.error("Error saving document: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- Form Fields (Simplified) --- */}
      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-sand/30 space-y-5">
        <h2 className="text-2xl font-bold text-mahogany mb-4">{infoToEdit ? 'Edit' : 'Add New'} Flower Info</h2>
        
        <div>
            <label className="flex items-center font-bold text-amber mb-2"><FontAwesomeIcon icon={faLeaf} className="mr-2"/> Flower Name</label>
            <input name="name" placeholder="e.g., Rwandan Rose" value={formData.name} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" required/>
        </div>

        <div>
            <label className="flex items-center font-bold text-amber mb-2"><FontAwesomeIcon icon={faAlignLeft} className="mr-2"/> Description</label>
            <textarea name="description" placeholder="Short description of the flower..." value={formData.description} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" rows="4"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center font-bold text-amber mb-2"><FontAwesomeIcon icon={faTint} className="mr-2"/> Water Needs</label>
              <input name="water" placeholder="e.g., Moderate" value={formData.water} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" />
            </div>
            <div>
              <label className="flex items-center font-bold text-amber mb-2"><FontAwesomeIcon icon={faSun} className="mr-2"/> Light Needs</label>
              <input name="light" placeholder="e.g., Full sun" value={formData.light} onChange={handleInputChange} className="w-full p-3 rounded-lg border focus:ring-orange" />
            </div>
        </div>

         <div>
            <label className="flex items-center font-bold text-amber mb-2"><FontAwesomeIcon icon={faImage} className="mr-2"/> Image</label>
            <label className="flex items-center gap-3 w-full p-3 rounded-lg border cursor-pointer hover:bg-ivory-white/50">
                <span className="text-charcoal truncate">{imageFile ? imageFile.name : 'Choose a file...'}</span>
                <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
            </label>
        </div>
      </div>

      {/* --- Preview and Actions --- */}
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