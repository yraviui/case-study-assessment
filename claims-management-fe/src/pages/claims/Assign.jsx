
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/auth';
import toast from 'react-hot-toast';
import * as Ri from 'react-icons/ri';

const Assign = ({ claimData, onSuccess, onClose }) => {

  const { auth } = useAuth();

  const claimId = claimData?._id || claimData?.id;

  const existingAssignedUser =
    claimData?.assignedTo?._id ||
    claimData?.assignedTo ||
    '';

  const [assignedTo, setAssignedTo] = useState(
    typeof existingAssignedUser === 'string'
      ? existingAssignedUser
      : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // VALIDATE CLAIM DATA
  // =====================================================

  useEffect(() => {

    if (!claimId) {
      toast.error('Claim ID not found.');
    }

    if (!auth?.token) {
      toast.error('Authentication credentials not found.');
    }

  }, [claimId, auth?.token]);

  // =====================================================
  // VALIDATE MONGODB OBJECT ID
  // =====================================================

  const isValidObjectId = (id) => {
    return /^[a-f\d]{24}$/i.test(id);
  };

  // =====================================================
  // ASSIGN CLAIM API
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (isSubmitting) return;

    // Validate claim ID
    if (!claimId) {
      toast.error('Claim ID not found.');
      return;
    }

    // Validate authentication
    if (!auth?.token) {
      toast.error('Authentication credentials not found.');
      return;
    }

    // Validate assigned user ID
    const userId = assignedTo.trim();

    if (!userId) {
      toast.error('Please enter an assigned User ID.');
      return;
    }

    if (!isValidObjectId(userId)) {
      toast.error('Please enter a valid MongoDB User ID.');
      return;
    }

    // Prevent assigning the same user again
    if (
      existingAssignedUser &&
      String(existingAssignedUser) === userId
    ) {
      toast.error('This user is already assigned to this claim.');
      return;
    }

    try {

      setIsSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/claims/${claimId}/assign`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },

          body: JSON.stringify({
            assignedTo: userId,
          }),
        }
      );

      const resBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          resBody?.message || 'Failed to assign claim.'
        );
      }

      toast.success('Claim assigned successfully!');

      // Refresh dashboard and close popup
      if (onSuccess) {
        await onSuccess();
      }

    } catch (error) {

      console.error('Assign claim error:', error);

      toast.error(
        error.message || 'Unable to assign claim.'
      );

    } finally {

      setIsSubmitting(false);

    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5 max-w-2xl mx-auto"
    >

      {/* HEADER */}

      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">

        <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">

          <Ri.RiUserSharedLine
            size={23}
            className="text-[#5c3bf5]"
          />

        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900">
            Assign Claim
          </h3>

          <p className="text-xs text-gray-400">
            Assign this claim to a user.
          </p>
        </div>

      </div>

      {/* CLAIM DETAILS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {[
          {
            label: 'Claim Number',
            value: claimData?.claimNumber,
          },
          {
            label: 'Policy Number',
            value: claimData?.policyNumber,
          },
          {
            label: 'Claimant Name',
            value: claimData?.claimantName || claimData?.holderName,
          },
          {
            label: 'Claim Type',
            value: claimData?.claimType,
          },
          {
            label: 'Claim Amount',
            value: Number(claimData?.claimAmount || 0).toLocaleString(
              'en-US',
              {
                style: 'currency',
                currency: 'USD',
              }
            ),
          },
          {
            label: 'Current Status',
            value: claimData?.status || 'Submitted',
          },
        ].map((field) => (

          <div key={field.label}>

            <label className="block text-xs font-bold text-gray-500 mb-2">
              {field.label}
            </label>

            <input
              value={field.value || 'N/A'}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-600 cursor-not-allowed"
            />

          </div>

        ))}

      </div>

      {/* ASSIGNED USER */}

      <div className="pt-3 border-t border-gray-100">

        <label className="block text-xs font-bold text-gray-700 mb-2">
          Assigned User ID
        </label>

        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Enter assigned user's MongoDB ID"
          required
          maxLength={24}
          minLength={24}
          disabled={isSubmitting}
          pattern="[a-fA-F0-9]{24}"
          title="Enter a valid 24-character MongoDB ObjectId."
          className="w-full px-4 py-3 rounded-xl border border-purple-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 disabled:bg-gray-100"
        />

        <p className="text-xs text-gray-400 mt-2">
          Enter the MongoDB ObjectId of the user who should handle this claim.
        </p>

      </div>

      {/* ACTION BUTTONS */}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">

        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            !isValidObjectId(assignedTo.trim())
          }
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5c3bf5] hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >

          {isSubmitting ? (

            <>
              <Ri.RiLoader4Line
                className="animate-spin"
                size={16}
              />
              Assigning...
            </>

          ) : (

            <>
              <Ri.RiUserSharedLine size={16} />
              Assign Claim
            </>

          )}

        </button>

      </div>

    </form>
  );
};

export default Assign;
