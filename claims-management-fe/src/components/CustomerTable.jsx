
import React, { useMemo, useState, useEffect, } from 'react';

import { FiSearch, FiChevronDown, } from 'react-icons/fi';

import PaginationNav from './PaginationNav';

const sortOptions = [ 'Newest', 'Oldest', 'Active', 'Inactive', ];

const pageSizeOptions = [5, 10, 15, 25, 50];

export default function CustomerTable({
  customers,
  searchTerm,
  setSearchTerm,
}) {
  const [sortBy, setSortBy] = useState('Newest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [baseCustomersPerPage, setBaseCustomersPerPage] =
    useState(5);

  const [currentPage, setCurrentPage] = useState(1);

  // Search customers
  const filteredCustomers = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return customers.filter((customer) =>
      [
        customer.name,
        customer.company,
        customer.email,
        customer.country,
        customer.phone,
        customer.status,
      ].some((value) =>
        value.toLowerCase().includes(searchLower)
      )
    );
  }, [customers, searchTerm]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      if (sortBy === 'Newest') {
        return b.id - a.id;
      }

      if (sortBy === 'Oldest') {
        return a.id - b.id;
      }

      if (sortBy === 'Active') {
        return a.status === b.status
          ? b.id - a.id
          : a.status === 'Active'
            ? -1
            : 1;
      }

      if (sortBy === 'Inactive') {
        return a.status === b.status
          ? b.id - a.id
          : a.status === 'Inactive'
            ? -1
            : 1;
      }

      return 0;
    });
  }, [filteredCustomers, sortBy]);

  // Pagination calculations
  const numOfTotalPages = Math.ceil(
    sortedCustomers.length / baseCustomersPerPage
  );

  // Keep current page within valid range
  useEffect(() => {
    setCurrentPage((page) =>
      Math.min(page, Math.max(numOfTotalPages, 1))
    );
  }, [numOfTotalPages]);

  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(numOfTotalPages, 1)
  );

  const indexOfFirstBaseCustomers =
    (safeCurrentPage - 1) * baseCustomersPerPage;

  const indexOfLastBaseCustomers =
    indexOfFirstBaseCustomers + baseCustomersPerPage;

  // Customers visible on the current page
  const visibleBaseCustomers = sortedCustomers.slice(
    indexOfFirstBaseCustomers,
    indexOfLastBaseCustomers
  );

  // Navigate to a specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= numOfTotalPages) {
      setCurrentPage(page);
    }
  };

  // Records information
  const startRecord =
    sortedCustomers.length === 0
      ? 0
      : indexOfFirstBaseCustomers + 1;

  const endRecord = Math.min(
    indexOfLastBaseCustomers,
    sortedCustomers.length
  );

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            All Customers
          </h2>

          <p className="mt-1 text-sm font-normal text-emerald-500">
            {searchTerm
              ? `Found ${sortedCustomers.length} results`
              : 'Active Members'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400" />

            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-transparent bg-gray-50/60 py-2 pl-10 pr-4 text-xs text-gray-700 placeholder-gray-400 focus:border-purple-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Sorting */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-transparent bg-gray-50/60 px-4 py-2 text-xs text-gray-400">

              <span>Sort by:</span>

              <button
                type="button"
                onClick={() =>
                  setIsDropdownOpen((open) => !open)
                }
                className="flex items-center gap-1 font-semibold text-gray-700 transition-colors hover:text-purple-600"
                aria-expanded={isDropdownOpen}
              >
                {sortBy}

                <FiChevronDown
                  className={`transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 z-20 mt-2 w-36 rounded-xl border border-gray-100 bg-white py-1 text-xs text-gray-700 shadow-lg">

                {sortOptions.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setCurrentPage(1);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-medium transition-colors hover:bg-purple-50 hover:text-purple-600 ${
                      sortBy === option
                        ? 'bg-purple-50/50 text-purple-600'
                        : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="-mx-5 overflow-x-auto sm:-mx-8">
        <div className="inline-block min-w-full align-middle px-5 sm:px-8">

          <table className="min-w-full divide-y divide-gray-100">

            <thead>
              <tr>
                <th className="w-[18%] pb-4 text-left text-sm font-normal tracking-wide text-gray-400">
                  Customer Name
                </th>

                <th className="w-[14%] pb-4 text-left text-sm font-normal tracking-wide text-gray-400">
                  Company
                </th>

                <th className="w-[18%] pb-4 text-left text-sm font-normal tracking-wide text-gray-400">
                  Phone Number
                </th>

                <th className="w-[22%] pb-4 text-left text-sm font-normal tracking-wide text-gray-400">
                  Email
                </th>

                <th className="w-[16%] pb-4 text-left text-sm font-normal tracking-wide text-gray-400">
                  Country
                </th>

                <th className="w-[12%] pb-4 text-center text-sm font-normal tracking-wide text-gray-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {visibleBaseCustomers.length > 0 ? (
                visibleBaseCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="group transition-colors hover:bg-gray-50/50"
                  >
                    <td className="whitespace-nowrap py-5 text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>

                    <td className="whitespace-nowrap py-5 text-sm text-gray-800">
                      {customer.company}
                    </td>

                    <td className="whitespace-nowrap py-5 text-sm text-gray-800">
                      {customer.phone}
                    </td>

                    <td className="whitespace-nowrap py-5 text-sm text-gray-800">
                      {customer.email}
                    </td>

                    <td className="whitespace-nowrap py-5 text-sm text-gray-800">
                      {customer.country}
                    </td>

                    <td className="whitespace-nowrap py-5 text-center">
                      <span
                        className={`inline-flex w-24 items-center justify-center rounded-lg border px-4 py-1.5 text-xs font-medium tracking-wide ${
                          customer.status === 'Active'
                            ? 'border-[#00b087] bg-[#eefdf5] text-[#008767]'
                            : 'border-[#df0404] bg-[#ffeff0] text-[#df0404]'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm font-medium text-gray-400"
                  >
                    No customers match your search filters.
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        </div>
      </div>

      {/* Pagination Footer */}
      <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-gray-100 pt-6 lg:flex-row">

        {/* Records Information & Page Size */}
        <div className="flex flex-wrap items-center justify-center gap-4">

          <p className="text-sm font-medium text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-700">
              {startRecord}–{endRecord}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-700">
              {sortedCustomers.length}
            </span>{' '}
            entries
          </p>

          {/* Rows Per Page */}
          <div className="flex items-center gap-2">

            <label
              htmlFor="pageSize"
              className="text-xs text-gray-400"
            >
              Rows per page:
            </label>

            <select
              id="pageSize"
              value={baseCustomersPerPage}
              onChange={(e) => {
                setBaseCustomersPerPage(
                  Number(e.target.value)
                );
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* Pagination Navigation */}
        <PaginationNav
          currentPage={safeCurrentPage}
          numOfTotalPages={numOfTotalPages}
          goToPage={goToPage}
        />

      </div>

    </div>
  );
}
