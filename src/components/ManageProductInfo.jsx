// src/components/ManageProductInfo.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSpinner, faPlus, faSeedling } from '@fortawesome/free-solid-svg-icons';
import ProductInfoForm from './ProductInfoForm'; // Uses the new simplified form

export default function ManageProductInfo() {
  const [infos, setInfos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);

  useEffect(() => {
    const infoQuery = query(collection(db, 'productInfo'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(infoQuery, (snapshot) => {
      const infoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInfos(infoData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this info card?')) {
      await deleteDoc(doc(db, 'productInfo', id));
    }
  };

  const handleEdit = (info) => {
    setEditingInfo(info);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingInfo(null);
    setIsFormVisible(true);
  };
  
  const handleFormComplete = () => {
    setIsFormVisible(false);
    setEditingInfo(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><FontAwesomeIcon icon={faSpinner} className="animate-spin text-orange text-5xl" /></div>;
  }
  
  if (isFormVisible) {
    return <ProductInfoForm infoToEdit={editingInfo} onComplete={handleFormComplete} />;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-sand/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-mahogany">Flower Info Cards</h2>
        <button onClick={handleAddNew} className="bg-gradient-to-r from-orange to-amber text-white font-bold py-2 px-5 rounded-full flex items-center hover:shadow-lg">
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add New
        </button>
      </div>
      
      {infos.length === 0 ? (
         <div className="text-center py-16">
          <FontAwesomeIcon icon={faSeedling} className="text-sand text-6xl mb-4" />
          <h3 className="text-2xl font-bold text-mahogany">No Info Cards Found</h3>
          <p className="text-charcoal mt-2">Click "Add New" to create your first flower info card.</p>
        </div>
      ) : (
        // --- Display cards are now simpler ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {infos.map(info => (
            <div key={info.id} className="bg-ivory-white/50 rounded-lg shadow-md overflow-hidden flex flex-col">
              <img src={info.image} alt={info.name} className="w-full h-40 object-cover" />
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-mahogany">{info.name}</h3>
                <div className="flex-grow"></div>
                <div className="flex justify-end gap-2 mt-4">
                   <button onClick={() => handleEdit(info)} className="text-teak hover:text-amber p-2 transition-colors"><FontAwesomeIcon icon={faEdit} size="lg"/></button>
                   <button onClick={() => handleDelete(info.id)} className="text-orange hover:text-amber p-2 transition-colors"><FontAwesomeIcon icon={faTrash} size="lg"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}