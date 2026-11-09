
import React, { useMemo } from 'react';
import {
  RiFileList3Line,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from 'react-icons/ri';

const ReportClaimsUpdates = ({ claims = [] }) => {
    console.log('claims: ', claims)
  // =========================================================
  // NORMALIZE STATUS
  // =========================================================
  const normalizeStatus = (status) => {
    return String(status ?? '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');
  };

  // =========================================================
  // CLAIM STATISTICS
  // =========================================================
  const statistics = useMemo(() => {
    const safeClaims = Array.isArray(claims) ? claims : [];

    const pendingStatuses = [
      'submitted',
      'under review',
      'pending documents',
      'pending',
    ];

    const approvedStatuses = [
      'approved',
      'approve',
    ];

    const rejectedStatuses = [
      'rejected',
      'reject',
      'declined',
    ];

    const pendingActionCount = safeClaims.filter((claim) =>
      pendingStatuses.includes(normalizeStatus(claim?.status))
    ).length;

    const approvedClaimsCount = safeClaims.filter((claim) =>
      approvedStatuses.includes(normalizeStatus(claim?.status))
    ).length;

    const rejectedClaimsCount = safeClaims.filter((claim) =>
      rejectedStatuses.includes(normalizeStatus(claim?.status))
    ).length;

    return {
      totalClaims: safeClaims.length,
      pendingActionCount,
      approvedClaimsCount,
      rejectedClaimsCount,
    };
  }, [claims]);

  // =========================================================
  // DASHBOARD CARDS
  // =========================================================
  const cards = [
    {
      title: 'Total Claims',
      count: statistics.totalClaims,
      icon: RiFileList3Line,
      iconColor: 'text-[#00ac4f]',
      bgColor: 'bg-[#eefdf5]',
      description: 'All registered claims',
    },
    {
      title: 'Pending Action',
      count: statistics.pendingActionCount,
      icon: RiTimeLine,
      iconColor: 'text-[#f3a002]',
      bgColor: 'bg-[#fff9eb]',
      description: 'Submitted, under review and pending documents',
    },
    {
      title: 'Approved Claims',
      count: statistics.approvedClaimsCount,
      icon: RiCheckboxCircleLine,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Successfully approved claims',
    },
    {
      title: 'Rejected Claims',
      count: statistics.rejectedClaimsCount,
      icon: RiCloseCircleLine,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      description: 'Claims rejected',
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.title}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-3">

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-400 whitespace-nowrap">
                  {card.title}
                </span>

                <span className="text-3xl font-bold text-gray-800 tracking-tight mt-2">
                  {card.count.toLocaleString()}
                </span>
              </div>

              <div
                className={`w-14 h-14 shrink-0 rounded-2xl ${card.bgColor} flex items-center justify-center`}
              >
                <Icon
                  className={`${card.iconColor} text-3xl`}
                  aria-hidden="true"
                />
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-3">
              {card.description}
            </p>
          </div>
        );
      })}

    </div>
  );
};

export default ReportClaimsUpdates;
