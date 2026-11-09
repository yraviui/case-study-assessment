# ABC Insurance Claims Management --- React Application

A modern React-based claims dashboard for managing insurance claims,
assigning work, controlling access by role, and opening claim documents
in a dedicated workspace.

> **Project scope:** This README describes the frontend application and
> its integration contract with the Express API. Backend authorization
> and document-processing services remain the source of truth for
> security and data consistency.

------------------------------------------------------------------------

## 1. Problem Statement

ABC Insurance wants to modernize its claims-processing application by
integrating internal and external services that support risk assessment
and claims adjudication. Claims may arrive through multiple channels,
including email, SFTP-based document transfers, and structured or
unstructured data feeds.

The legacy application is being rebuilt using a modern UI stack. The new
experience must support large claim datasets, role-based access, and
very large claim documents while remaining responsive, reliable, and
easy to use.

### Context

Design a scalable, high-performance web application that enables users
to manage large datasets and interact with extremely large documents
(approximately 100 MB--1 GB, with the detailed use case also referencing
documents up to 1,500 MB). The solution must support role-based access
and advanced data/document operations.

**Design inputs:** Figma screens and company-specific UX/UI standards,
such as a CRM Dashboard Customers List design.

## 2. Functional Requirements

### 2.1 Claims landing page

-   Display 20,000+ claims.
-   Support sorting, filtering, searching, and pagination.
-   Provide row actions such as View, Edit, Delete, and Assign, subject
    to permissions.
-   Prefer server-side pagination, filtering, and sorting for large
    datasets.
-   Avoid rendering all records in the browser at once.

### 2.2 Role-based access control (RBAC)

-   Filter records based on the authenticated user and their
    permissions.
-   Show, hide, or disable actions based on the user's permissions.
-   Enforce authorization on the backend for every protected API
    operation.
-   Treat frontend permission checks as user-experience controls only;
    they are not a security boundary.

### 2.3 Row-to-document navigation

Selecting a claim opens its associated document workspace. The UI should
transition smoothly from the grid to the workspace and show document
loading, progress, and error states.

### 2.4 Document workspace

The planned workspace supports:

-   Document viewing with progressive/partial loading.
-   Edit, split, merge, and delete operations.
-   Page-level comments.
-   Document annotations.
-   Progress, cancellation where supported, retry, and recovery for
    long-running operations.

Large-document operations should be performed by backend document
services rather than loading the entire document into browser memory.

## 3. Non-Functional Requirements

### Performance

-   Keep the 20k+ claims grid responsive.
-   Minimize unnecessary React renders and browser memory usage.
-   Load document content progressively and only retrieve the required
    pages or byte ranges.

### Scalability

Support growth in claim volume, document size, concurrent users, and
simultaneous document operations.

### User experience

Provide clear loading and progress indicators, meaningful errors,
retry/recovery options, and safe cancellation for operations that
support cancellation.

### Reliability

Split, merge, annotation, and comment operations must preserve
consistent document state. Long-running jobs should expose status and
recoverable failure information.

## 4. Technology Stack

Adjust this list to match the dependencies actually installed in the
project.

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  UI                                  React

  Styling                             Tailwind CSS

  Routing                             React Router

  HTTP client                         Axios

  Authentication state                Existing application auth
                                      hook/context

  Notifications                       React Hot Toast (if installed)

  API                                 Express / Node.js

  Data store                          Backend-managed database

  Document processing                 Backend document service / worker
                                      (integration contract)
  -----------------------------------------------------------------------

## 5. Authentication and API Integration

### 5.1 Assigned claims endpoint

The authenticated user's assigned claims are retrieved from:

``` http
GET http://localhost:5000/api/claims/my-assigned
Authorization: Bearer <access_token>
```

The access token must come from the current authenticated session (for
example, the existing `useAuth()` hook/context). Do not hard-code a
token or identify the user using a client-supplied email address. The
backend should derive the user identity from the validated bearer token.

### 5.2 Axios example

Adapt the auth property path to the actual shape returned by the
project's auth hook. This example assumes `auth.token` contains the
access token.

``` jsx
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export async function getMyAssignedClaims(token, params = {}) {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  const response = await axios.get(
    `${API_BASE_URL}/claims/my-assigned`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
```

Example use inside a component:

``` jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/auth";
import { getMyAssignedClaims } from "../api/claims";

function MyAssignedClaims() {
  const [auth] = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = auth?.token;

    if (!token) {
      setClaims([]);
      return;
    }

    let cancelled = false;

    async function loadClaims() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyAssignedClaims(token);

        if (!cancelled) {
          // Adjust this mapping to the response contract returned by the API.
          setClaims(Array.isArray(data) ? data : data.claims ?? data.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load assigned claims."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadClaims();

    return () => {
      cancelled = true;
    };
  }, [auth?.token]);

  if (loading) return <p>Loading assigned claims...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div>
      {claims.map((claim) => (
        <div key={claim._id || claim.id}>
          {claim.claimNumber} — {claim.title}
        </div>
      ))}
    </div>
  );
}

export default MyAssignedClaims;
```

**Important:** If the existing `useAuth()` hook returns a different
shape (for example, `{ auth }`, `{ user, token }`, or
`[auth, setAuth, loading]`), update the token access accordingly. Keep
the token in the application's established authentication mechanism.

### 5.3 Expected backend behavior

`GET /api/claims/my-assigned` should:

1.  Require a valid bearer token.
2.  Identify the current user from the verified token.
3.  Return only claims assigned to that user.
4.  Apply server-side pagination, filtering, and sorting.
5.  Return a consistent response shape and useful HTTP error codes.

Example response contract (illustrative; align with the actual backend):

``` json
{
  "data": [
    {
      "_id": "claim-id",
      "claimNumber": "CLM-10001",
      "title": "Motor claim",
      "assignedTo": "user-id",
      "status": "Pending"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1,
    "totalPages": 1
  }
}
```

Typical responses:

  Status   Meaning
  -------- -------------------------------------
  200      Claims returned successfully
  401      Missing, invalid, or expired token
  403      Authenticated user is not permitted
  500      Unexpected server error

## 6. Demo Users and Permission Matrix

The following credentials are the demo credentials supplied for this
assessment. Use them only in a local/demo environment; do not use these
credentials in production.

  -----------------------------------------------------------------------
  Demo user               Credentials             Expected UI permissions
  ----------------------- ----------------------- -----------------------
  Admin                   `admin@test.com` /      Add, Assign, Edit,
                          `Test@123`              View, Delete

  Test user               `demo@test.com` /       Add, Edit, View,
                          `Test@123`              Delete; no Assign
                                                  action
  -----------------------------------------------------------------------

### Assigned-claims visibility

The `GET /api/claims/my-assigned` endpoint is a user-scoped endpoint: it
should return only records assigned to the authenticated user,
regardless of what email or user ID is sent by the browser.

**Important permission clarification:** The supplied notes describe
`admin@test.com` both as a full-access admin and as a user who can see
only assigned records. Those are different access policies. This README
separates the two concepts:

-   The **Admin full-access dashboard** may use an admin-authorized
    claims-list endpoint to retrieve all records and can expose
    Add/Assign/Edit/View/Delete.
-   The **My Assigned Claims** view uses `/api/claims/my-assigned` and
    returns only records assigned to the currently authenticated user.
-   If the intended requirement is that the admin account must also be
    restricted to assigned records, enforce that restriction in the
    backend and remove all-record access from that account. Do not rely
    on hiding rows in React.

The backend must independently enforce permissions for Add, Assign,
Edit, View, and Delete. A user must not gain access by manually calling
an API.

## 7. Suggested Frontend Structure

One possible structure (adapt it to the existing repository):

``` text
src/
├── api/
│   ├── axiosInstance.js
│   └── claims.js
├── components/
│   ├── claims/
│   │   ├── ClaimsTable.jsx
│   │   ├── ClaimsFilters.jsx
│   │   ├── ClaimsPagination.jsx
│   │   └── ClaimRowActions.jsx
│   └── common/
│       ├── LoadingState.jsx
│       ├── ErrorState.jsx
│       └── ConfirmDialog.jsx
├── hooks/
│   ├── auth.js
│   └── useClaims.js
├── pages/
│   ├── ClaimsDashboard.jsx
│   ├── MyAssignedClaims.jsx
│   └── ClaimWorkspace.jsx
├── routes/
│   └── ProtectedRoute.jsx
└── App.jsx
```

## 8. Architecture and Data Flow

### Claims grid flow

1.  User signs in.
2.  The authentication layer provides an access token.
3.  React calls the claims API with `Authorization: Bearer <token>`.
4.  The backend validates the token and checks the user's permissions.
5.  The backend applies user scoping, filtering, sorting, and
    pagination.
6.  React renders only the current page of records.
7.  Row actions are shown according to the permissions returned by the
    application or its permission model; the backend validates every
    action again.

### Document workspace flow

1.  User selects a claim.
2.  React opens the workspace and requests document metadata.
3.  The backend verifies that the user can access the claim and
    document.
4.  The viewer retrieves page thumbnails, page data, or byte ranges
    progressively.
5.  Split/merge and other expensive operations are submitted as backend
    jobs.
6.  The UI displays job progress and refreshes document metadata when
    the operation completes.
7.  The backend records the final document version and operation result.

## 9. Performance Strategy and Trade-offs

### 9.1 Handling 20,000+ grid records

Recommended approach: **server-side pagination + server-side
sorting/filtering**, with row virtualization if the page size or visible
row count still warrants it.

  -----------------------------------------------------------------------
  Approach                Advantages              Trade-offs
  ----------------------- ----------------------- -----------------------
  Pagination              Predictable payload and User moves between
                          memory use; easy        pages
                          navigation              

  Infinite scroll         Continuous browsing     More complex scroll
                                                  restoration and
                                                  accessibility

  Virtualization          Renders only visible    Requires careful
                          rows; useful for long   row-height, focus, and
                          lists                   accessibility handling
  -----------------------------------------------------------------------

Do not fetch and render all 20,000+ rows by default. Use stable sorting,
indexed backend query fields, debounced search, and request cancellation
or stale-response protection.

### 9.2 Handling 100 MB--1 GB+ documents

-   Do not load the complete document into React state.
-   Fetch metadata and thumbnails first.
-   Use HTTP range requests or page-based APIs when supported by the
    storage and document service.
-   Render only visible pages and release resources for pages no longer
    needed.
-   Use Web Workers for CPU-intensive browser-side tasks that are
    appropriate for client processing.
-   Use chunked uploads/downloads and resumable operations where
    supported.
-   Run split/merge/conversion operations on backend workers.
-   Return an operation/job ID and expose progress/status endpoints.
-   Use object storage and short-lived authorized URLs where
    appropriate; do not expose permanent public document URLs.

### 9.3 State management and caching

-   Keep authentication and user permissions in the established auth
    layer.
-   Keep server data separate from transient UI state.
-   Use a query/cache library if already installed; otherwise use a
    small API hook/service layer.
-   Cache only data that is safe for the current user and invalidate it
    after mutations.
-   Clear user-scoped cached data when the user logs out or changes.
-   Avoid storing large document binaries in global React state.

### 9.4 Optimistic vs. pessimistic updates

-   Use optimistic updates only for low-risk actions with a clear
    rollback path.
-   Prefer pessimistic updates for delete, assign, split, merge, and
    other operations that change authoritative claim/document state.
-   Disable duplicate submissions while a mutation is pending.
-   Refresh or invalidate affected claim/document queries after success.

## 10. Reliability, Errors, and Recovery

-   Display skeleton/loading states while claims and document metadata
    load.
-   Distinguish empty results from API errors.
-   Handle 401 by following the application's token refresh/logout
    behavior.
-   Handle 403 with a clear access-denied state.
-   Preserve filters and pagination when returning from the document
    workspace.
-   Provide retry for transient failures.
-   Support cancellation only when the backend operation supports it.
-   Use operation IDs and idempotency keys for long-running or retryable
    mutations where appropriate.
-   Keep document versioning/audit history on the backend so partial
    failures can be diagnosed and recovered.

## 11. Local Development

### Prerequisites

-   Node.js (use the version specified by the project, if present).
-   npm.
-   The claims API running locally at `http://localhost:5000`.

### Install and run

``` bash
npm install
npm run dev
```

For a Create React App project, the start command may instead be:

``` bash
npm start
```

Use the command defined in the project's `package.json`.

### Environment configuration

For a Vite application, configure the API base URL in `.env`:

``` env
VITE_API_BASE_URL=http://localhost:5000/api
```

For Create React App, use the project's `REACT_APP_`
environment-variable convention instead.

Do not commit secrets or real credentials to the repository. Add `.env`
to `.gitignore` and provide a sanitized `.env.example`.

## 12. Security Checklist

-   [ ] Validate bearer tokens on every protected backend route.
-   [ ] Derive the current user from the verified token, not
    request-body identity fields.
-   [ ] Enforce record-level access on the backend.
-   [ ] Enforce Add/Assign/Edit/View/Delete permissions on the backend.
-   [ ] Validate all request payloads and document operation parameters.
-   [ ] Restrict document downloads to authorized users and use
    short-lived access.
-   [ ] Avoid logging tokens, sensitive claim data, or document
    contents.
-   [ ] Clear user-specific client caches on logout/account switch.
-   [ ] Keep demo credentials out of production.

## 13. Assessment Coverage

  -----------------------------------------------------------------------
  Evaluation area                     Proposed implementation
  ----------------------------------- -----------------------------------
  20k+ records                        Server-side pagination, filtering,
                                      sorting; optional virtualization

  RBAC                                Frontend action visibility plus
                                      mandatory backend authorization

  Current-user assigned records       Bearer-authenticated
                                      `GET /api/claims/my-assigned`

  Large documents                     Metadata-first, progressive
                                      page/range loading, backend
                                      processing

  Document operations                 Background jobs, progress,
                                      versioning, and recovery

  UX                                  Loading, empty, error, retry, and
                                      operation progress states

  Reliability                         Backend validation, idempotency
                                      where appropriate, audit/version
                                      history
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 14. Important Implementation Notes

1.  Confirm the exact return shape of the existing `useAuth()` hook and
    replace `auth?.token` in the example if needed.
2.  Confirm the actual claims API response structure and adjust the
    `data` mapping in the component.
3.  Confirm whether the admin account is intended to have all-claims
    access or assigned-only access. The same account cannot satisfy both
    policies in the same view.
4.  The document workspace features in this README are architecture and
    integration requirements; they should not be considered implemented
    unless the corresponding viewer and backend document APIs exist.
5.  Update this README as the actual API routes, permission names,
    environment variables, and implemented features are finalized.



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
