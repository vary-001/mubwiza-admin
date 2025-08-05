// src/components/Products.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSpinner, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import EditProduct from './EditProduct';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    // Create a query to order products by their creation date, newest first
    const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error("Error removing document: ", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };
  
  // If we are editing a product, render the EditProduct component instead
  if (editingProduct) {
    return <EditProduct product={editingProduct} onEditDone={() => setEditingProduct(null)} />;
  }

  // Display a loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-orange text-5xl" />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg border border-sand/20">
      
      {/* Display a message if no products are found */}
      {!isLoading && products.length === 0 ? (
        <div className="text-center py-16">
          <FontAwesomeIcon icon={faBoxOpen} className="text-sand text-6xl mb-4" />
          <h3 className="text-2xl font-bold text-mahogany">No Products Found</h3>
          <p className="text-charcoal mt-2">Get started by adding your first product!</p>
        </div>
      ) : (
        <>
          {/* --- Desktop Table View (visible on md screens and up) --- */}
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-sand">
                  <th className="p-4 text-sm font-bold text-amber uppercase tracking-wider">Image</th>
                  <th className="p-4 text-sm font-bold text-amber uppercase tracking-wider">Name</th>
                  <th className="p-4 text-sm font-bold text-amber uppercase tracking-wider">Category</th>
                  <th className="p-4 text-sm font-bold text-amber uppercase tracking-wider">Price</th>
                  <th className="p-4 text-sm font-bold text-amber uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-ivory-white hover:bg-ivory-white/50">
                    <td className="p-4"><img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-lg shadow-sm" /></td>
                    <td className="p-4 font-bold text-mahogany">{product.name}</td>
                    <td className="p-4 text-charcoal capitalize">{product.category}</td>
                    <td className="p-4 text-charcoal font-medium">{product.price.toLocaleString()} RWF</td>
                    <td className="p-4 text-center">
                      <button onClick={() => setEditingProduct(product)} className="text-teak hover:text-amber p-2 transition-colors">
                        <FontAwesomeIcon icon={faEdit} size="lg"/>
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-orange hover:text-amber p-2 ml-3 transition-colors">
                        <FontAwesomeIcon icon={faTrash} size="lg"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- Mobile Card View (visible below md screens) --- */}
          <div className="md:hidden space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-gradient-to-r from-white to-ivory-white/30 p-4 rounded-xl shadow-md border border-sand/20 flex items-center space-x-4">
                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-lg shadow-sm flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-mahogany">{product.name}</h3>
                  <p className="text-sm text-charcoal capitalize">{product.category}</p>
                  <p className="text-md font-semibold text-amber mt-1">{product.price.toLocaleString()} RWF</p>
                </div>
                <div className="flex flex-col space-y-3">
                  <button onClick={() => setEditingProduct(product)} className="text-teak p-2">
                    <FontAwesomeIcon icon={faEdit} size="lg"/>
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-orange p-2">
                    <FontAwesomeIcon icon={faTrash} size="lg"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}