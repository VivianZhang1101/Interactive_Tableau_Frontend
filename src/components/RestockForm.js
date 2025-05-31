import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

// Mock data 
// const mockProducts = [
//   { product_id: 'uuid-thermal-printer', name: 'Thermal Printer' },
//   { product_id: 'uuid-shipping-labels', name: 'Shipping Labels' },
//   { product_id: 'uuid-packing-tape', name: 'Packing Tape' }
// ];

// const mockEmployees = [
//   { employee_id: 'uuid-vivian', name: 'Vivian Shang', role: 'Inventory Manager' },
//   { employee_id: 'uuid-alice', name: 'Alice Powers', role: 'Sales Rep' },
//   { employee_id: 'uuid-jason', name: 'Jason Wu', role: 'Coordinator' }
// ];

function RestockForm({ onRequestSubmitted }) {
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    requested_by: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  // Load products and employees on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products and employees from API
        const [productsRes, employeesRes] = await Promise.all([
          fetch('/api/products').then(r => r.json()),
          fetch('/api/employees').then(r => r.json())
        ]);
        setProducts(productsRes);
        setEmployees(employeesRes);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.product_id) {
      newErrors.product_id = 'Please select a product';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.requested_by) {
      newErrors.requested_by = 'Please select who is requesting';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      formData.name = products.find(p => p.product_id === formData.product_id)?.name || '';
      const response = await fetch('/api/restock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Submission failed');
      
      
      setSubmitStatus('success');
      setFormData({ product_id: '', quantity: '', requested_by: '' });
      setErrors({});
      
      // Notify parent component
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
      
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-2xl">📥</div>
        <h2 className="text-xl font-semibold text-gray-800">Submit Restock Request</h2>
      </div>

      <div className="space-y-4">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product *
          </label>
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.product_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a product...</option>
            {products.map(product => (
              <option key={product.product_id} value={product.product_id}>
                {product.name}
              </option>
            ))}
          </select>
          {errors.product_id && (
            <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter quantity..."
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
          )}
        </div>

        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requested By *
          </label>
          <select
            name="requested_by"
            value={formData.requested_by}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.requested_by ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select employee...</option>
            {employees.map(employee => (
              <option key={employee.employee_id} value={employee.employee_id}>
                {employee.name} - {employee.role}
              </option>
            ))}
          </select>
          {errors.requested_by && (
            <p className="text-red-500 text-sm mt-1">{errors.requested_by}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full px-6 py-3 rounded-md font-medium text-sm transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Submitting Request...
              </div>
            ) : (
              'Submit Restock Request'
            )}
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="w-5 h-5" />
            <span>Request submitted successfully! Tableau will update shortly.</span>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-5 h-5" />
            <span>Submission failed. Please try again.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestockForm;