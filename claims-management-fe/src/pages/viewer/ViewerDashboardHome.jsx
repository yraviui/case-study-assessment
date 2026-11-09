
import React, { useState, useEffect, useCallback, useMemo, } from 'react';

import { useAuth } from '../../hooks/auth';
import * as Ri from 'react-icons/ri';

import Popup from '../popup/Popup';
import Add from '../claims/Add';
import Update from '../claims/Update';
import DashboardHeader from '../../components/DashboardHeader';
import ReportClaimsUpdates from '../../components/ReportClaimsUpdates';
import toast from 'react-hot-toast';

// =========================================================
// CONSTANTS
// =========================================================

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amountHigh', label: 'Amount: High to Low' },
  { value: 'amountLow', label: 'Amount: Low to High' },
  { value: 'status', label: 'Status' },
];

// =========================================================
// TABLE LOADING SKELETON
// =========================================================

const TableSkeleton = () => (
  <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm animate-pulse">
    <div className="h-8 bg-gray-100 rounded-xl w-1/4 mb-6" />

    <div className="space-y-4">
      <div className="h-12 bg-gray-50 rounded-xl w-full" />
      <div className="h-16 bg-gray-50/50 rounded-xl w-full" />
      <div className="h-16 bg-gray-50/50 rounded-xl w-full" />
      <div className="h-16 bg-gray-50/50 rounded-xl w-full" />
    </div>
  </div>
);

// =========================================================
// REUSABLE CLAIM INFORMATION FIELD
// =========================================================

const ClaimField = ({ label, children }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">
      {label}
    </label>

    <div className="text-sm text-gray-900 font-medium break-words">
      {children || 'N/A'}
    </div>
  </div>
);

// =========================================================
// PAGINATION COMPONENT
// =========================================================

const PaginationNav = ({
  currentPage,
  numOfTotalPages,
  goToPage,
}) => {
  if (numOfTotalPages <= 1) return null;

  const pages = Array.from(
    { length: numOfTotalPages },
    (_, index) => index + 1
  );

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Claim pagination"
    >
      {/* FIRST */}
      <button
        type="button"
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold
          text-gray-600 hover:bg-purple-50 hover:text-purple-700
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        First
      </button>

      {/* PREVIOUS */}
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-200
          text-gray-600 hover:bg-purple-50 hover:text-purple-700
          disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <Ri.RiArrowLeftSLine size={17} />
      </button>

      {/* PAGE NUMBERS */}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => goToPage(page)}
          aria-current={currentPage === page ? 'page' : undefined}
          className={`min-w-9 px-3 py-2 rounded-lg border text-xs font-bold transition-colors ${
            currentPage === page
              ? 'bg-[#5c3bf5] border-[#5c3bf5] text-white'
              : 'border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700'
          }`}
        >
          {page}
        </button>
      ))}

      {/* NEXT */}
      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === numOfTotalPages}
        className="px-3 py-2 rounded-lg border border-gray-200
          text-gray-600 hover:bg-purple-50 hover:text-purple-700
          disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <Ri.RiArrowRightSLine size={17} />
      </button>

      {/* LAST */}
      <button
        type="button"
        onClick={() => goToPage(numOfTotalPages)}
        disabled={currentPage === numOfTotalPages}
        className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold
          text-gray-600 hover:bg-purple-50 hover:text-purple-700
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Last
      </button>
    </nav>
  );
};

// =========================================================
// VIEWER DASHBOARD HOME
// =========================================================

const ViewerDashboardHome = () => {
  const { auth } = useAuth();

  // =======================================================
  // CLAIMS STATE
  // =======================================================

  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingClaimId, setDeletingClaimId] = useState(null);

  // =======================================================
  // SEARCH / SORT / PAGINATION STATE
  // =======================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [claimsPerPage, setClaimsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // =======================================================
  // POPUP STATE
  // =======================================================

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeClaim, setActiveClaim] = useState(null);
  const [popupType, setPopupType] = useState('review');

  const viewerName = auth?.user?.name || 'Viewer';

  // =======================================================
  // FETCH CLAIMS API
  // =======================================================

const fetchClaimsData = useCallback(async () => {
  try {
    setIsLoading(true);
    setError(null);

    if (!auth?.token) {
      throw new Error('Authentication credentials not found.');
    }

    const response = await fetch(
      `${API_URL}/api/claims`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Unable to fetch claims. Server status: ${response.status}`
      );
    }

    const resBody = await response.json();

    const claimsData = resBody?.data ?? [];

    if (!Array.isArray(claimsData)) {
      throw new Error('Invalid claims response received.');
    }

    setClaims(claimsData);
    setCurrentPage(1);

    console.table(
      claimsData.map((claim) => ({
        claimNumber: claim.claimNumber,
        status: claim.status,
      }))
    );

  } catch (err) {
    console.error('Failed to fetch claims:', err);
    setError(err.message || 'Failed to sync claims records.');
    setClaims([]);
  } finally {
    setIsLoading(false);
  }
}, [auth?.token]);

  // =======================================================
  // INITIAL API CALL
  // =======================================================

  useEffect(() => {
    fetchClaimsData();
  }, [fetchClaimsData]);

  // =======================================================
  // SEARCH HANDLER
  // =======================================================

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // =======================================================
  // SORT HANDLER
  // =======================================================

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // =======================================================
  // PAGE SIZE HANDLER
  // =======================================================

  const handlePageSizeChange = (value) => {
    setClaimsPerPage(Number(value));
    setCurrentPage(1);
  };

  // =======================================================
  // FILTER CLAIMS
  // Search across relevant claim fields
  // =======================================================

  const filteredClaims = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return claims;

    return claims.filter((claim) => {
      const searchableFields = [
        claim.claimNumber,
        claim.claimantName,
        claim.holderName,
        claim.policyNumber,
        claim.claimType,
        claim.claimAmount,
        claim.status,
      ];

      return searchableFields.some((field) =>
        String(field ?? '').toLowerCase().includes(search)
      );
    });
  }, [claims, searchTerm]);

  // =======================================================
  // SORT CLAIMS
  // =======================================================

  const sortedClaims = useMemo(() => {
    const result = [...filteredClaims];

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => {
          const dateA = new Date(
            a.createdAt || a.updatedAt || 0
          ).getTime();

          const dateB = new Date(
            b.createdAt || b.updatedAt || 0
          ).getTime();

          return dateB - dateA;
        });
        break;

      case 'oldest':
        result.sort((a, b) => {
          const dateA = new Date(
            a.createdAt || a.updatedAt || 0
          ).getTime();

          const dateB = new Date(
            b.createdAt || b.updatedAt || 0
          ).getTime();

          return dateA - dateB;
        });
        break;

      case 'amountHigh':
        result.sort(
          (a, b) =>
            Number(b.claimAmount || 0) -
            Number(a.claimAmount || 0)
        );
        break;

      case 'amountLow':
        result.sort(
          (a, b) =>
            Number(a.claimAmount || 0) -
            Number(b.claimAmount || 0)
        );
        break;

      case 'status':
        result.sort((a, b) =>
          String(a.status || '').localeCompare(
            String(b.status || '')
          )
        );
        break;

      default:
        break;
    }

    return result;
  }, [filteredClaims, sortBy]);

  // =======================================================
  // PAGINATION CALCULATIONS
  // =======================================================

  const numOfTotalPages = Math.ceil(
    sortedClaims.length / claimsPerPage
  );

  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(numOfTotalPages, 1)
  );

  const startIndex = (safeCurrentPage - 1) * claimsPerPage;

  const endIndex = Math.min(
    startIndex + claimsPerPage,
    sortedClaims.length
  );

  const visibleClaims = sortedClaims.slice(
    startIndex,
    endIndex
  );

  // =======================================================
  // GO TO PAGE
  // =======================================================

  const goToPage = (pageNumber) => {
    const targetPage = Math.max(
      1,
      Math.min(pageNumber, numOfTotalPages || 1)
    );

    setCurrentPage(targetPage);
  };

  // =======================================================
  // OPEN POPUP
  // =======================================================

  const handleOpenAction = (type, claimItem = null) => {
    setPopupType(type);
    setActiveClaim(claimItem);
    setIsPopupOpen(true);
  };

  // =======================================================
  // CLOSE POPUP
  // =======================================================

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setActiveClaim(null);
  };

  // =======================================================
  // REFRESH AFTER ADD / UPDATE
  // =======================================================

  const handleSuccess = async () => {
    await fetchClaimsData();
    setIsPopupOpen(false);
    setActiveClaim(null);
  };

  // =======================================================
  // STATUS BADGE STYLES
  // =======================================================

  const getStatusClass = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      ['approved', 'closed', 'completed'].includes(normalizedStatus)
    ) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    }

    if (
      ['rejected', 'cancelled'].includes(normalizedStatus)
    ) {
      return 'bg-red-50 text-red-700 border border-red-100';
    }

    return 'bg-amber-50 text-amber-700 border border-amber-100';
  };

  // =======================================================
  // FORMAT CLAIM AMOUNT
  // =======================================================

  const formatAmount = (amount) => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return '$0.00';
    }

    return numericAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =======================================================
  // RENDER PAGE
  // =======================================================

  // =======================================================
// DELETE CLAIM API
// =======================================================

const handleDeleteClaim = async (claim) => {
  const claimId = claim?._id || claim?.id;

  if (!claimId) {
    toast.error('Claim ID not found.');
    return;
  }

  if (!auth?.token) {
    toast.error('Authentication credentials not found.');
    return;
  }

  if (deletingClaimId) return;

  try {
    setDeletingClaimId(claimId);

    const response = await fetch(
      `${API_URL}/api/claims/${claimId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    const resBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        resBody?.message || 'Failed to delete claim.'
      );
    }

    toast.success('Claim deleted successfully!');

    // Reload claims table
    await fetchClaimsData();

  } catch (error) {
    console.error('Delete claim error:', error);

    toast.error(
      error.message || 'Unable to delete claim.'
    );
  } finally {
    setDeletingClaimId(null);
  }
};
  

  return (
    <div className="space-y-8 w-full animate-fadeIn">

      <DashboardHeader  name={viewerName} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {/* ===================================================
          WELCOME BANNER
      =================================================== */}

      {/* <div className="bg-gradient-to-r from-[#2D3E50] to-[#4CA1AF]
        rounded-3xl p-8 text-white shadow-xl">

        <div className="flex flex-col sm:flex-row sm:items-center
          sm:justify-between gap-4">

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {viewerName}!
            </h1>

            <p className="text-gray-200 text-sm mt-2">
              Operational claims dashboard and records management workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10
            rounded-2xl px-5 py-3">

            <Ri.RiFileList3Line size={24} />

            <div>
              <p className="text-xs text-gray-200">Total Claims</p>
              <p className="text-xl font-bold">{claims.length}</p>
            </div>

          </div>
        </div>
      </div> */}

      {/* ===================================================
          CLAIMS REPOSITORY
      =================================================== */}

      <ReportClaimsUpdates claims={claims} />

      <div className="w-full">

        {/* LOADING */}

        {isLoading ? (
          <TableSkeleton />

        ) : error ? (

          /* ERROR */

          <div className="w-full rounded-3xl border border-red-100
            bg-red-50/50 p-8 text-center">

            <Ri.RiErrorWarningLine
              size={32}
              className="mx-auto text-red-500 mb-3"
            />

            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchClaimsData}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2
                rounded-xl bg-red-600 hover:bg-red-700 text-white
                text-xs font-semibold transition-colors"
            >
              <Ri.RiRefreshLine size={16} />
              Retry
            </button>

          </div>

        ) : (

          /* CLAIMS TABLE */

          <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            {/* TABLE HEADER */}

            <div className="p-6 border-b border-gray-100
              flex flex-col gap-5">

              <div className="flex flex-col sm:flex-row
                sm:items-center sm:justify-between gap-4">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    All Claims
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Found {sortedClaims.length} matching records
                  </p>
                </div>

                {/* ADD CLAIM BUTTON */}

                <button
                  type="button"
                  onClick={() => handleOpenAction('add')}
                  className="flex items-center justify-center gap-2
                    px-4 py-2.5 bg-[#5c3bf5] hover:bg-purple-700
                    text-white rounded-xl text-xs font-bold
                    tracking-wide transition-colors cursor-pointer
                    shadow-sm shadow-purple-100"
                >
                  <Ri.RiAddLine size={17} />
                  Add Claim
                </button>

              </div>

              {/* SEARCH AND SORT CONTROLS */}

              <div className="flex flex-col md:flex-row
                md:items-center gap-3">

                {/* SEARCH */}

                <div className="relative flex-1">

                  <Ri.RiSearchLine
                    size={18}
                    className="absolute left-3 top-1/2
                      -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      handleSearchChange(e.target.value)
                    }
                    placeholder="Search claim number, claimant, policy, type..."
                    className="w-full pl-10 pr-10 py-2.5
                      border border-gray-200 rounded-xl
                      text-sm text-gray-700
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2
                      focus:ring-purple-100 focus:border-purple-400"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="absolute right-3 top-1/2
                        -translate-y-1/2 text-gray-400
                        hover:text-red-500"
                      aria-label="Clear search"
                    >
                      <Ri.RiCloseCircleLine size={18} />
                    </button>
                  )}

                </div>

                {/* SORT */}

                <div className="relative md:w-56">

                  <Ri.RiArrowUpDownLine
                    size={17}
                    className="absolute left-3 top-1/2
                      -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      handleSortChange(e.target.value)
                    }
                    className="w-full appearance-none pl-10 pr-8 py-2.5
                      border border-gray-200 rounded-xl
                      text-sm text-gray-600 bg-white
                      focus:outline-none focus:ring-2
                      focus:ring-purple-100 focus:border-purple-400"
                    aria-label="Sort claims"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

            </div>

            {/* TABLE CONTENT */}

            <div className="overflow-x-auto w-full px-4">

              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="bg-gray-50/70 text-gray-400
                    text-xs font-semibold tracking-wider
                    uppercase border-b border-gray-100">

                    <th className="py-4 px-2 whitespace-nowrap">
                      Claim Number
                    </th>

                    <th className="py-4 px-2 whitespace-nowrap">
                      Claimant Name
                    </th>

                    <th className="py-4 px-2 whitespace-nowrap">
                      Policy Number
                    </th>

                    <th className="py-4 px-2 whitespace-nowrap">
                      Claim Type
                    </th>

                    <th className="py-4 px-2 whitespace-nowrap text-right">
                      Claim Amount
                    </th>

                    <th className="py-4 px-2 whitespace-nowrap text-right">
                      Record Status
                    </th>

                    <th className="py-4 px-2 whitespace-nowrap text-left">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100
                  text-sm text-gray-700">

                  {visibleClaims.length > 0 ? (

                    visibleClaims.map((claim) => (

                      <tr
                        key={
                          claim._id ||
                          claim.id ||
                          claim.claimNumber
                        }
                        className="hover:bg-gray-50/50 transition-colors"
                      >

                        {/* CLAIM NUMBER */}

                        <td className="py-4 px-2 font-semibold
                          text-gray-900 whitespace-nowrap">
                          {claim.claimNumber || 'N/A'}
                        </td>

                        {/* CLAIMANT NAME */}

                        <td className="py-4 px-2 whitespace-nowrap">
                          {claim.claimantName ||
                            claim.holderName ||
                            'N/A'}
                        </td>

                        {/* POLICY NUMBER */}

                        <td className="py-4 px-2 whitespace-nowrap">
                          {claim.policyNumber || 'N/A'}
                        </td>

                        {/* CLAIM TYPE */}

                        <td className="py-4 px-2 whitespace-nowrap">
                          <span className="inline-flex items-center
                            px-2.5 py-1 rounded-lg bg-purple-50
                            text-[#5c3bf5] text-xs font-semibold uppercase">
                            {claim.claimType || 'General'}
                          </span>
                        </td>

                        {/* CLAIM AMOUNT */}

                        <td className="py-4 px-2 text-right whitespace-nowrap">
                          <span className="font-bold text-emerald-600">
                            {formatAmount(claim.claimAmount)}
                          </span>
                        </td>
                        {/* CLAIM STATUS */}

                        <td className="py-4 px-2 text-right whitespace-nowrap">
                          <span className="font-bold text-emerald-600">
                            {claim.status}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="py-4 px-2">
                          <div className="flex items-center
                            justify-end gap-3">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenAction('edit', claim)
                              }
                              className="text-xs font-semibold
                                text-gray-400 hover:text-[#5c3bf5]
                                hover:underline transition-colors"
                            >
                              <Ri.RiFileEditFill className="text-red-600 font-bold text-sm cursor-pointer" title='Edit / Update' />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenAction('review', claim)
                              }
                             /*  className="px-3 py-1.5 rounded-xl
                                bg-gray-50 hover:bg-[#5c3bf5]
                                text-gray-600 hover:text-white
                                text-xs font-semibold transition-colors
                                border border-gray-100 whitespace-nowrap" */
                            >
                             {/*  Review Details */}
                             <Ri.RiTableView className="text-green-600 font-bold text-sm cursor-pointer" title='Review Details' />
                             
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClaim(claim)}
                              disabled={deletingClaimId === (claim._id || claim.id)}
                              className="text-xs font-semibold
                                text-gray-400 hover:text-red-600
                                transition-colors
                                disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Delete Claim"
                            >
                              <Ri.RiDeleteRow
                                className={`text-red-600 font-bold text-sm cursor-pointer ${
                                  deletingClaimId === (claim._id || claim.id)
                                    ? 'animate-pulse'
                                    : ''
                                }`}
                              />
                            </button>

                          </div>
                        </td>

                      </tr>

                    ))

                  ) : (

                    /* EMPTY STATE */

                    <tr>
                      <td colSpan={6} className="py-16 text-center">

                        <Ri.RiInboxLine
                          size={36}
                          className="mx-auto text-gray-300 mb-3"
                        />

                        <p className="text-sm font-semibold text-gray-500">
                          {searchTerm
                            ? 'No matching claims found'
                            : 'No claims available'}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {searchTerm
                            ? 'Try another search term.'
                            : 'Create a new claim to get started.'}
                        </p>

                        {searchTerm && (
                          <button
                            type="button"
                            onClick={() => handleSearchChange('')}
                            className="mt-3 text-xs font-semibold
                              text-[#5c3bf5] hover:underline"
                          >
                            Clear Search
                          </button>
                        )}

                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* TABLE FOOTER */}

            <div className="px-6 py-5 border-t border-gray-100 flex flex-col gap-6">
              {/* TOP CONTROLS BAR */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                
                {/* LEFT SIDE: ALL COUNTERS & PAGE SIZE SELECTOR */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="text-xs text-gray-500">
                    Showing{' '}
                    <span className="font-semibold text-gray-800">
                      {sortedClaims.length > 0 ? startIndex + 1 : 0}
                    </span>{' '}
                    -{' '}
                    <span className="font-semibold text-gray-800">
                      {endIndex}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-gray-800">
                      {sortedClaims.length}
                    </span>{' '}
                    entries
                  </p>
                  
                  <span className="text-gray-300 hidden sm:inline">|</span>
                  
                  <p className="text-xs text-gray-500">
                    Total claims:{' '}
                    <span className="font-semibold text-gray-800">
                      {claims.length}
                    </span>
                  </p>

                  <span className="text-gray-300 hidden sm:inline">|</span>

                  <div className="flex items-center gap-2">
                    <label htmlFor="claimsPageSize" className="text-xs text-gray-500 whitespace-nowrap">
                      Rows per page
                    </label>
                    <select
                      id="claimsPageSize"
                      value={claimsPerPage}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 cursor-pointer"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* RIGHT SIDE: PAGINATION NAVIGATION */}
                <div className="flex justify-center sm:justify-end">
                  <PaginationNav 
                    currentPage={safeCurrentPage} 
                    numOfTotalPages={numOfTotalPages} 
                    goToPage={goToPage} 
                  />
                </div>
              </div>

              {/* REFRESH ACTION CONTAINER */}
              <div className="flex justify-end pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={fetchClaimsData}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#5c3bf5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Ri.RiRefreshLine 
                    size={15} 
                    className={isLoading ? 'animate-spin' : ''} 
                  />
                  Refresh Claims
                </button>
              </div>
            </div>


          </div>
        )}

      </div>

      {/* ===================================================
          FULL-BROWSER LIGHTBOX / RIGHT-SIDE DRAWER
      =================================================== */}

      <Popup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title={
          popupType === 'add'
            ? 'Create New Claim Entry'
            : popupType === 'edit'
              ? `Modify Claim: ${activeClaim?.claimNumber || ''}`
              : `Claim Audit: ${activeClaim?.claimNumber || ''}`
        }
      >

        {/* ADD CLAIM */}

        {popupType === 'add' && (
          <Add
            onSuccess={handleSuccess}
            onClose={handleClosePopup}
          />
        )}

        {/* UPDATE CLAIM */}

        {popupType === 'edit' && activeClaim && (
          <Update
            claimData={activeClaim}
            onSuccess={handleSuccess}
            onClose={handleClosePopup}
          />
        )}

        {/* REVIEW CLAIM DETAILS */}

        {popupType === 'review' && activeClaim && (

          <div className="space-y-5 max-w-2xl mx-auto">

            {/* REVIEW HEADER */}

            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">

              <div className="w-11 h-11 rounded-xl bg-purple-50
                flex items-center justify-center">

                <Ri.RiFileSearchLine
                  size={22}
                  className="text-[#5c3bf5]"
                />

              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Claim Information
                </h3>

                <p className="text-xs text-gray-400">
                  Read-only claim audit details
                </p>
              </div>

            </div>

            {/* CLAIM ID AND POLICY NUMBER */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ClaimField label="Claim ID">
                {activeClaim.claimNumber || activeClaim.id}
              </ClaimField>

              <ClaimField label="Policy Number">
                {activeClaim.policyNumber}
              </ClaimField>

            </div>

            {/* CLAIMANT NAME */}

            <ClaimField label="Claimant Full Name">
              {activeClaim.claimantName || activeClaim.holderName}
            </ClaimField>

            {/* CLAIM TYPE AND AMOUNT */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ClaimField label="Coverage Category">
                <span className="inline-flex items-center px-2.5 py-1
                  rounded-md text-xs font-semibold bg-purple-50
                  text-[#5c3bf5] border border-purple-100 uppercase">
                  {activeClaim.claimType || 'General'}
                </span>
              </ClaimField>

              <ClaimField label="Assigned Financial Amount">
                <span className="font-bold text-emerald-600 text-base">
                  {formatAmount(activeClaim.claimAmount)}
                </span>
              </ClaimField>

            </div>

            {/* STATUS */}

            <ClaimField label="Lifecycle Processing Status">
              <span
                className={`inline-flex items-center px-2.5 py-1
                  rounded-full text-xs font-bold uppercase
                  tracking-wider ${getStatusClass(activeClaim.status)}`}
              >
                {activeClaim.status || 'Submitted'}
              </span>
            </ClaimField>

            {/* DESCRIPTION */}

            <ClaimField label="Claim Description">
              <p className="font-normal text-gray-700 whitespace-pre-wrap">
                {activeClaim.description || 'No description provided.'}
              </p>
            </ClaimField>

            {/* CLOSE BUTTON */}

            <div className="pt-5 border-t border-gray-100
              flex justify-end">

              <button
                type="button"
                onClick={handleClosePopup}
                className="inline-flex items-center gap-2
                  px-5 py-2.5 rounded-xl bg-gray-900
                  text-white font-semibold text-xs
                  tracking-wide hover:bg-gray-800
                  transition-colors cursor-pointer shadow-sm"
              >
                <Ri.RiCloseLine size={16} />
                Close Audit View
              </button>

            </div>

          </div>
        )}

      </Popup>

    </div>
  );
};

export default ViewerDashboardHome;
