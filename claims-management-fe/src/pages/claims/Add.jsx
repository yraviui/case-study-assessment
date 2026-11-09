import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/auth';

const Add = ({ onSuccess, onClose }) => {
  const { auth } = useAuth();

  // -------------------------------------------------------
  // FORM STATE ALIGNED TO MONGOOSE SCHEMA
  // -------------------------------------------------------
  const [formData, setFormData] = useState({
    claimNumber: '',
    claimantName: '',
    policyNumber: '',
    claimType: 'Motor',
    claimAmount: '',
    status: 'Submitted'
  });

  const [submitting, setSubmitting] = useState(false);

  // -------------------------------------------------------
  // HANDLE INPUT CHANGE
  // -------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------------------------------------
  // CREATE CLAIM API
  // -------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);

      const token = auth?.token || auth?.user?.token;
      if (!token) {
        throw new Error('Session expired. Please log in again.');
      }

      // Format clean numerical values for structural database typing
      const payload = {
        claimNumber: formData.claimNumber.trim(),
        claimantName: formData.claimantName.trim(),
        policyNumber: formData.policyNumber.trim(),
        claimType: formData.claimType,
        claimAmount: parseFloat(formData.claimAmount) || 0,
        status: formData.status
      };

      // POST API request
      const response = await fetch(`${API_URL}/api/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Safely parse API response
      const resBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          resBody?.message ||
          resBody?.error ||
          `Failed to create claim. Status: ${response.status}`
        );
      }

      // ---------------------------------------------------
      // SUCCESS ACTIONS
      // ---------------------------------------------------
      toast.success('New claim created successfully!', {
        duration: 3000,
        position: 'top-right',
      });

      if (onSuccess) {
        await onSuccess();
      } 
      if (onClose) {
        onClose();
      }

    } catch (err) {
      console.error('Failed creating claim:', err);

      toast.error(err.message || 'Failed to create claim.', {
        duration: 4000,
        position: 'top-right',
      });

    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------
  // UI FORM LAYOUT
  // -------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">

      {/* CLAIM NUMBER */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
          Claim Number
        </label>
        <input
          type="text"
          name="claimNumber"
          required
          value={formData.claimNumber}
          onChange={handleChange}
          placeholder="e.g. CLM-2026-N105"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
        />
      </div>

      {/* CLAIMANT NAME */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
          Claimant Name
        </label>
        <input
          type="text"
          name="claimantName"
          required
          value={formData.claimantName}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
        />
      </div>

      {/* POLICY NUMBER */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
          Policy Number
        </label>
        <input
          type="text"
          name="policyNumber"
          required
          value={formData.policyNumber}
          onChange={handleChange}
          placeholder="e.g. POL-998877"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
        />
      </div>

      {/* GRID COLUMN SECTION: TYPE & AMOUNT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CLAIM TYPE SELECTOR */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Claim Type
          </label>
          <select
            name="claimType"
            value={formData.claimType}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
          >
            <option value="Health">Health</option>
            <option value="Motor">Motor</option>
            <option value="Property">Property</option>
            <option value="Life">Life</option>
            <option value="Travel">Travel</option>
          </select>
        </div>

        {/* CLAIM AMOUNT */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Claim Amount ($)
          </label>
          <input
            type="number"
            name="claimAmount"
            step="0.01"
            min="0"
            required
            value={formData.claimAmount}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
          />
        </div>
      </div>

      {/* STATUS ENUM SELECTOR */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
          Initial Record Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
        >
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Pending Documents">Pending Documents</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* CONTROL FOOTER LAYOUT PANEL ACTION BUTTONS */}
      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="w-1/2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="w-1/2 rounded-xl bg-[#5c3bf5] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Saving Claim...' : 'Submit Claim'}
        </button>
      </div>

    </form>
  );
};

export default Add;
