// src/components/EditProduct.jsx
import { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faDollarSign, faAlignLeft, faList, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function EditProduct({ product, onEditDone }) {
  const [productName, setProductName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [category, setCategory] = useState(product.category);
  const [description, setDescription] = useState(product.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        name: productName,
        price: parseFloat(price),
        category: category,
        description: description,
      });
      onEditDone(); // Close the edit form
    } catch (err) {
      setError('Failed to update product. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-sand/30 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-mahogany mb-6">Edit Product</h2>
       <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Name */}
        <div className="relative">
          <FontAwesomeIcon icon={faTag} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-sand focus:outline-none focus:ring-2 focus:ring-orange/50" required />
        </div>
        
        {/* Price and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
                 <FontAwesomeIcon icon={faDollarSign} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input type="number" placeholder="Price (RWF)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-sand focus:outline-none focus:ring-2 focus:ring-orange/50" required />
            </div>
            <div className="relative">
                <FontAwesomeIcon icon={faList} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-full border border-sand focus:outline-none focus:ring-2 focus:ring-orange/50 appearance-none" required>
                    <option value="flowers">Flowers</option>
                    <option value="arts-crafts">Arts & Crafts</option>
                    <option value="crop-seedling">Crop Seedling</option>
                    <option value="flower-seedling">Flower Seedling</option>
                    <option value="vegetables">Vegetables</option>
                </select>
            </div>
        </div>

        {/* Description */}
        <div className="relative">
          <FontAwesomeIcon icon={faAlignLeft} className="absolute left-4 top-4 text-gray-400" />
          <textarea placeholder="Product Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-sand focus:outline-none focus:ring-2 focus:ring-orange/50" rows="4"></textarea>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onEditDone} className="py-2 px-6 rounded-full text-charcoal font-medium hover:bg-gray-100 transition-all">Cancel</button>
            <button type="submit" disabled={isLoading} className="bg-gradient-to-r from-orange to-amber text-white font-bold py-2 px-6 rounded-full hover:shadow-lg hover:shadow-orange/30 transition-all flex items-center disabled:opacity-50">
                {isLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />}
                {isLoading ? 'Updating...' : 'Save Changes'}
            </button>
        </div>
      </form>
    </div>
  );
}