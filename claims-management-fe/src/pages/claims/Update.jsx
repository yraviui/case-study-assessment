import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/auth';

const Update = ({ claimData, onSuccess, onClose }) => {
  const { auth } = useAuth();

  // -------------------------------------------------------
  // FORM STATE SEEDED WITH ACTIVE CLAIM DATA PROPERTIES
  // -------------------------------------------------------
  const [formData, setFormData] = useState({
    claimNumber: '',
    claimantName: '',
    policyNumber: '',
    claimType: 'Motor',
    claimAmount: '',
    status: 'Submitted',
  });

  const [submitting, setSubmitting] = useState(false);

  // Sync state cleanly if the active selection row updates or hydration shifts
  useEffect(() => {
    if (claimData) {
      setFormData({
        claimNumber: claimData.claimNumber || '',
        claimantName: claimData.claimantName || '',
        policyNumber: claimData.policyNumber || '',
        claimType: claimData.claimType || 'Motor',
        claimAmount: claimData.claimAmount ?? '',
        status: claimData.status || 'Submitted',
      });
    }
  }, [claimData]);

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
  // PATCH RECORD SUBMITTER HANDLER
  // -------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    // Safety layer verification check
    const claimId = claimData?._id || claimData?.id;
    if (!claimId) {
      toast.error('Unable to target record: missing claim identity ID pointer.');
      return;
    }

    try {
      setSubmitting(true);

      const token = auth?.token || auth?.user?.token;
      if (!token) {
        throw new Error('Session expired. Please log in again.');
      }

      // Build out structured document body schema matching model constraints
      const payload = {
        claimNumber: formData.claimNumber.trim(),
        claimantName: formData.claimantName.trim(),
        policyNumber: formData.policyNumber.trim(),
        claimType: formData.claimType,
        claimAmount: parseFloat(formData.claimAmount) || 0,
        status: formData.status,
      };

      // PATCH API request targeted towards parameter route locator index entry
      const response = await fetch(`${API_URL}/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          resBody?.message ||
          resBody?.error ||
          `Failed to update record index block. Server response status: ${response.status}`
        );
      }

      // ---------------------------------------------------
      // SUCCESS ACTIONS
      // ---------------------------------------------------
      toast.success('Claim metadata updated successfully!', {
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
      console.error('Failed modifying record execution layer:', err);

      toast.error(err.message || 'Error occurred while saving modifications.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl animate-fadeIn">
      {/* ADVISORY RESTRICTION TOP BANNER */}
      <p className="text-xs text-amber-600 font-semibold bg-amber-50 p-3 rounded-xl border border-amber-100 shadow-sm">
        Modification Mode Context Workspace: Edits will push operational audit trail telemetry entries.
      </p>

      {/* CLAIM NUMBER (READ-ONLY ID FIELD GENERATION PRESERVATION) */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-400 tracking-wider">
          Claim Number (Read-Only)
        </label>
        <input
          type="text"
          name="claimNumber"
          disabled
          value={formData.claimNumber}
          className="w-full rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2 text-sm text-gray-400 outline-none cursor-not-allowed select-none"
        />
      </div>

      {/* CLAIMANT NAME */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500 tracking-wider">
          Claimant Name (Read-Only)
        </label>
        <input
          type="text"
          name="claimantName"
          disabled
          value={formData.claimantName}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
        />
      </div>

      {/* POLICY NUMBER */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500 tracking-wider">
          Policy Number (Read-Only)
        </label>
        <input
          type="text"
          name="policyNumber"
          disabled
          value={formData.policyNumber}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
        />
      </div>

      {/* ROW LAYER SPLIT MATRIX CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TYPE SELECTION LAYER */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500 tracking-wider">
            Claim Type (Read-Only)
          </label>
          <select
            name="claimType"
            value={formData.claimType}
            onChange={handleChange}
            disabled
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-purple-500"
          >
            <option value="Health">Health</option>
            <option value="Motor">Motor</option>
            <option value="Property">Property</option>
            <option value="Life">Life</option>
            <option value="Travel">Travel</option>
          </select>
        </div>

        {/* FINANCIAL AMOUNT COMPONENT TRACKING */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500 tracking-wider">
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

      {/* STATUS SCHEMA SELECTOR SLOT */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase text-gray-500 tracking-wider">
          Review Lifecycle Status (Read-Only)
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled
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

      {/* FOOTER DIALOG CONTROLS */}
      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="w-1/2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          Discard Changes
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="w-1/2 rounded-xl bg-[#5c3bf5] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Saving Adjustments...' : 'Apply Modifications'}
        </button>
      </div>
    </form>
  );
};

export default Update;
