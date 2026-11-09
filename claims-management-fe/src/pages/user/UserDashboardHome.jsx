
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { useAuth } from '../../hooks/auth';
import * as Ri from 'react-icons/ri';

import Popup from '../popup/Popup';

import DashboardHeader from '../../components/DashboardHeader';
import ReportClaimsUpdates from '../../components/ReportClaimsUpdates';

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
// HELPER: GET USER / ASSIGNED USER ID
// =========================================================

const getUserId = (user) => {
  if (!user) return '';

  if (typeof user === 'string') {
    return user;
  }

  return String(
    user._id ||
    user.id ||
    user.userId ||
    ''
  );
};

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
        className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        First
      </button>

      {/* PREVIOUS */}
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <Ri.RiArrowRightSLine size={17} />
      </button>

      {/* LAST */}
      <button
        type="button"
        onClick={() => goToPage(numOfTotalPages)}
        disabled={currentPage === numOfTotalPages}
        className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Last
      </button>
    </nav>
  );
};

// =========================================================
// USER DASHBOARD HOME
// =========================================================

const UserDashboardHome = () => {
  const { auth } = useAuth();

  // =======================================================
  // USER INFORMATION
  // =======================================================

  const currentUserId = getUserId(
    auth?.user?._id ||
    auth?.user?.id ||
    auth?.user?.userId ||
    auth?._id ||
    auth?.id ||
    auth?.userId
  );

  const viewerName = auth?.user?.name || 'User';

  // =======================================================
  // CLAIMS STATE
  // =======================================================

  const [claims, setClaims] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  // =======================================================
  // SEARCH / SORT / PAGINATION STATE
  // =======================================================

  const [searchTerm, setSearchTerm] = useState('');

  const [sortBy, setSortBy] = useState('newest');

  const [claimsPerPage, setClaimsPerPage] = useState(5);

  const [currentPage, setCurrentPage] = useState(1);

  // =======================================================
  // REVIEW POPUP STATE
  // =======================================================

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [activeClaim, setActiveClaim] = useState(null);

  // =======================================================
  // FETCH MY ASSIGNED CLAIMS API
  // =======================================================

  const fetchClaimsData = useCallback(async (resetPage = false) => {
    try {
      setIsLoading(true);

      setError(null);

      if (!auth?.token) {
        throw new Error('Authentication credentials not found.');
      }

      const response = await fetch(
        `${API_URL}/api/claims/my-assigned`,
        {
          method: 'GET',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const resBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          resBody?.message ||
          `Unable to fetch assigned claims. Server status: ${response.status}`
        );
      }

      const claimsData = resBody?.data ?? [];

      if (!Array.isArray(claimsData)) {
        throw new Error('Invalid claims response received.');
      }

      // ===================================================
      // FILTER CLAIMS BY CURRENT LOGGED-IN USER
      // ===================================================

      const myAssignedClaims = currentUserId
        ? claimsData.filter((claim) => {
            const assignedUserId = getUserId(claim?.assignedTo);

            return (
              assignedUserId.toLowerCase() ===
              currentUserId.toLowerCase()
            );
          })
        : claimsData;

      setClaims(myAssignedClaims);

      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to fetch assigned claims:', err);

      setError(err.message || 'Failed to sync assigned claims.');

      setClaims([]);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.token, currentUserId]);

  // =======================================================
  // INITIAL API CALL
  // =======================================================

  useEffect(() => {
    fetchClaimsData(true);
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
  // OPEN CLAIM REVIEW POPUP
  // =======================================================

  const handleOpenReview = (claim) => {
    setActiveClaim(claim);
    setIsPopupOpen(true);
  };

  // =======================================================
  // CLOSE CLAIM REVIEW POPUP
  // =======================================================

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setActiveClaim(null);
  };

  // =======================================================
  // STATUS BADGE STYLES
  // =======================================================

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || '')
      .trim()
      .toLowerCase();

    const statusClasses = {
      approved:
        'bg-emerald-50 text-emerald-700 border border-emerald-100',

      completed:
        'bg-emerald-50 text-emerald-700 border border-emerald-100',

      closed:
        'bg-emerald-50 text-emerald-700 border border-emerald-100',

      rejected:
        'bg-red-50 text-red-700 border border-red-100',

      cancelled:
        'bg-red-50 text-red-700 border border-red-100',

      pending:
        'bg-amber-50 text-amber-700 border border-amber-100',

      submitted:
        'bg-blue-50 text-blue-700 border border-blue-100',

      assigned:
        'bg-purple-50 text-purple-700 border border-purple-100',

      under_review:
        'bg-indigo-50 text-indigo-700 border border-indigo-100',

      'under review':
        'bg-indigo-50 text-indigo-700 border border-indigo-100',
    };

    return (
      statusClasses[normalizedStatus] ||
      'bg-gray-50 text-gray-700 border border-gray-100'
    );
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

  return (
    <div className="space-y-8 w-full animate-fadeIn">

      {/* ===================================================
          DASHBOARD HEADER
      =================================================== */}

      <DashboardHeader
        name={viewerName}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
      />

      {/* ===================================================
          MY ASSIGNED CLAIMS SUMMARY
      =================================================== */}

      <ReportClaimsUpdates claims={claims} />

      {/* ===================================================
          MY ASSIGNED CLAIMS TABLE
      =================================================== */}

      <div className="w-full">

        {isLoading ? (

          <TableSkeleton />

        ) : error ? (

          <div className="w-full rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center">

            <Ri.RiErrorWarningLine
              size={32}
              className="mx-auto text-red-500 mb-3"
            />

            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchClaimsData(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
            >
              <Ri.RiRefreshLine size={16} />
              Retry
            </button>

          </div>

        ) : (

          <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            {/* ===================================================
                TABLE HEADER
            =================================================== */}

            <div className="p-6 border-b border-gray-100 flex flex-col gap-5">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    My Assigned Claims
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Found {sortedClaims.length} matching records
                  </p>

                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-[#5c3bf5] rounded-xl text-xs font-bold">
                  <Ri.RiUserLine size={16} />
                  My Claims
                </div>

              </div>

              {/* ===================================================
                  SEARCH AND SORT
              =================================================== */}

              <div className="flex flex-col md:flex-row md:items-center gap-3">

                {/* SEARCH */}

                <div className="relative flex-1">

                  <Ri.RiSearchLine
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      handleSearchChange(e.target.value)
                    }
                    placeholder="Search claim number, claimant, policy, type..."
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
                  />

                  {searchTerm && (

                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      handleSortChange(e.target.value)
                    }
                    className="w-full appearance-none pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400"
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

            {/* ===================================================
                CLAIMS TABLE
            =================================================== */}

            <div className="overflow-x-auto w-full px-4">

              <table className="w-full text-left border-collapse">

                <thead>

                  <tr className="bg-gray-50/70 text-gray-400 text-xs font-semibold tracking-wider uppercase border-b border-gray-100">

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

                    <th className="py-4 px-2 whitespace-nowrap text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">

                  {visibleClaims.length > 0 ? (

                    visibleClaims.map((claim) => {

                      const claimId = claim._id || claim.id;

                      return (

                        <tr
                          key={claimId || claim.claimNumber}
                          className="hover:bg-gray-50/50 transition-colors"
                        >

                          {/* CLAIM NUMBER */}

                          <td className="py-4 px-2 font-semibold text-gray-900 whitespace-nowrap">
                            {claim.claimNumber || 'N/A'}
                          </td>

                          {/* CLAIMANT NAME */}

                          <td className="py-4 px-2 whitespace-nowrap">
                            {claim.claimantName || claim.holderName || 'N/A'}
                          </td>

                          {/* POLICY NUMBER */}

                          <td className="py-4 px-2 whitespace-nowrap">
                            {claim.policyNumber || 'N/A'}
                          </td>

                          {/* CLAIM TYPE */}

                          <td className="py-4 px-2 whitespace-nowrap">

                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 text-[#5c3bf5] text-xs font-semibold uppercase">
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

                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusClass(claim.status)}`}
                            >
                              {claim.status || 'Submitted'}
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="py-4 px-2">

                            <div className="flex items-center justify-end gap-3">

                              {/* REVIEW */}

                              <button
                                type="button"
                                onClick={() => handleOpenReview(claim)}
                                title="Review Claim"
                                aria-label={`Review claim ${claim.claimNumber || ''}`}
                                className="text-green-600 hover:text-green-700 transition-colors"
                              >
                                <Ri.RiTableView
                                  className="font-bold text-lg cursor-pointer"
                                />
                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    })

                  ) : (

                    /* EMPTY STATE */

                    <tr>

                      <td colSpan={7} className="py-16 text-center">

                        <Ri.RiInboxLine
                          size={36}
                          className="mx-auto text-gray-300 mb-3"
                        />

                        <p className="text-sm font-semibold text-gray-500">
                          {searchTerm
                            ? 'No matching claims found'
                            : 'No claims assigned to you'}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {searchTerm
                            ? 'Try another search term.'
                            : 'Your assigned claims will appear here.'}
                        </p>

                        {searchTerm && (

                          <button
                            type="button"
                            onClick={() => handleSearchChange('')}
                            className="mt-3 text-xs font-semibold text-[#5c3bf5] hover:underline"
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

            {/* ===================================================
                TABLE FOOTER / PAGINATION
            =================================================== */}

            <div className="px-6 py-5 border-t border-gray-100 flex flex-col gap-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* LEFT SIDE */}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

                  <p className="text-xs text-gray-500">

                    Showing{' '}

                    <span className="font-semibold text-gray-800">
                      {sortedClaims.length > 0 ? startIndex + 1 : 0}
                    </span>

                    {' '}-{' '}

                    <span className="font-semibold text-gray-800">
                      {endIndex}
                    </span>

                    {' '}of{' '}

                    <span className="font-semibold text-gray-800">
                      {sortedClaims.length}
                    </span>

                    {' '}entries

                  </p>

                  <span className="text-gray-300 hidden sm:inline">
                    |
                  </span>

                  <p className="text-xs text-gray-500">

                    Total assigned claims:{' '}

                    <span className="font-semibold text-gray-800">
                      {claims.length}
                    </span>

                  </p>

                  <span className="text-gray-300 hidden sm:inline">
                    |
                  </span>

                  {/* PAGE SIZE */}

                  <div className="flex items-center gap-2">

                    <label
                      htmlFor="claimsPageSize"
                      className="text-xs text-gray-500 whitespace-nowrap"
                    >
                      Rows per page
                    </label>

                    <select
                      id="claimsPageSize"
                      value={claimsPerPage}
                      onChange={(e) =>
                        handlePageSizeChange(e.target.value)
                      }
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

                {/* RIGHT SIDE */}

                <div className="flex justify-center sm:justify-end">

                  <PaginationNav
                    currentPage={safeCurrentPage}
                    numOfTotalPages={numOfTotalPages}
                    goToPage={goToPage}
                  />

                </div>

              </div>

              {/* REFRESH */}

              <div className="flex justify-end pt-2 border-t border-gray-50">

                <button
                  type="button"
                  onClick={() => fetchClaimsData()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#5c3bf5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  <Ri.RiRefreshLine
                    size={15}
                    className={isLoading ? 'animate-spin' : ''}
                  />

                  Refresh My Claims

                </button>

              </div>

            </div>

          </div>

        )}

      </div>

      {/* ===================================================
          CLAIM REVIEW POPUP / RIGHT-SIDE DRAWER
      =================================================== */}

      <Popup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title={`Claim Audit: ${activeClaim?.claimNumber || ''}`}
      >

        {activeClaim && (

          <div className="space-y-5 max-w-2xl mx-auto">

            {/* REVIEW HEADER */}

            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">

              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">

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
                  Read-only claim details
                </p>

              </div>

            </div>

            {/* CLAIM ID / POLICY */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ClaimField label="Claim ID">
                {activeClaim.claimNumber || activeClaim.id}
              </ClaimField>

              <ClaimField label="Policy Number">
                {activeClaim.policyNumber}
              </ClaimField>

            </div>

            {/* CLAIMANT */}

            <ClaimField label="Claimant Full Name">
              {activeClaim.claimantName || activeClaim.holderName}
            </ClaimField>

            {/* TYPE / AMOUNT */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ClaimField label="Coverage Category">

                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-[#5c3bf5] border border-purple-100 uppercase">
                  {activeClaim.claimType || 'General'}
                </span>

              </ClaimField>

              <ClaimField label="Claim Amount">

                <span className="font-bold text-emerald-600 text-base">
                  {formatAmount(activeClaim.claimAmount)}
                </span>

              </ClaimField>

            </div>

            {/* STATUS */}

            <ClaimField label="Processing Status">

              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusClass(activeClaim.status)}`}
              >
                {activeClaim.status || 'Submitted'}
              </span>

            </ClaimField>

            {/* ASSIGNED USER */}

            <ClaimField label="Assigned To">
              {activeClaim.assignedTo?.name ||
                activeClaim.assignedTo?.email ||
                getUserId(activeClaim.assignedTo) ||
                'Not Assigned'}
            </ClaimField>

            {/* DESCRIPTION */}

            <ClaimField label="Claim Description">

              <p className="font-normal text-gray-700 whitespace-pre-wrap">
                {activeClaim.description || 'No description provided.'}
              </p>

            </ClaimField>

            {/* CLOSE */}

            <div className="pt-5 border-t border-gray-100 flex justify-end">

              <button
                type="button"
                onClick={handleClosePopup}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs tracking-wide hover:bg-gray-800 transition-colors cursor-pointer shadow-sm"
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

export default UserDashboardHome;
