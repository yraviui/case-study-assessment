# ABC Insurance Claims Management System

A full-stack claims management application for managing insurance
claims, assigning work, controlling access by role, and retrieving
associated claim documents.

The solution combines a React-based dashboard with a RESTful backend
built using Node.js, Express.js, MongoDB, and Mongoose.

> **Project scope:** This README describes the frontend application,
> backend API, and their integration contract. Backend authorization and
> document-processing services remain the source of truth for security
> and data consistency. Features described as planned or architectural
> should not be considered implemented unless the corresponding UI and
> API are available in the project.

------------------------------------------------------------------------

## 1. Problem Statement

ABC Insurance wants to modernize its claims-processing application by
integrating internal and external services that support risk assessment
and claims adjudication. Claims may arrive through multiple channels,
including email, SFTP-based document transfers, and structured or
unstructured data feeds.

The application provides a modern experience for managing large claim
datasets, supporting role-based access, and working with large claim
documents while remaining responsive, reliable, and easy to use.

### Context

The solution is designed to support:

-   Large claim datasets, including 20,000+ records.
-   Role-based access and user-specific claim visibility.
-   Claim creation, viewing, updating, deletion, and assignment.
-   Associated claim document retrieval.
-   Large documents (approximately 100 MB--1 GB, with the detailed use
    case also referencing documents up to 1,500 MB).
-   Advanced document operations such as annotations, comments,
    splitting, and merging, where supported by the document services.

**Design inputs:** Figma screens and company-specific UX/UI standards,
such as a CRM Dashboard Customers List design.

------------------------------------------------------------------------

## 2. Key Features

### Frontend

-   React-based claims dashboard.
-   Claims grid with searching, sorting, filtering, and pagination.
-   Support for 20,000+ claims through server-side data operations.
-   Row actions such as View, Edit, Delete, and Assign, based on
    permissions.
-   Dedicated claim/document workspace.
-   Loading, empty, error, and progress states.
-   Integration with authenticated API endpoints.
-   Role-aware UI controls.

### Backend

-   RESTful API built with Node.js and Express.js.
-   User registration and login.
-   JWT authentication and authorization.
-   Access-token refresh and secure logout.
-   Retrieval of authenticated user details.
-   Claim creation, listing, retrieval, updating, and deletion.
-   Claim assignment.
-   Retrieval of documents associated with claims.
-   Password hashing using bcrypt.
-   Request validation using Zod.
-   Security middleware using Helmet.
-   Rate limiting to protect API endpoints.
-   CORS configuration.
-   HTTP request logging using Morgan.
-   MongoDB persistence through Mongoose.

### Document workspace

The planned document workspace supports:

-   Progressive or partial document loading.
-   Document viewing.
-   Page-level comments and annotations.
-   Edit, split, merge, and delete operations.
-   Progress indicators, retry, and recovery for long-running
    operations.
-   Cancellation where supported by the backend service.

Large-document operations should be handled by backend document services
rather than loading the entire document into browser memory.

------------------------------------------------------------------------

## 3. Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend runtime        React                   User interface

  Frontend tooling        Vite                    Development server and
                                                  build tooling

  Styling                 Tailwind CSS            UI styling

  Routing                 React Router            Frontend navigation

  HTTP client             Axios                   API communication

  Notifications           React Hot Toast (if     User feedback
                          installed)              

  Backend runtime         Node.js                 JavaScript runtime

  Backend framework       Express.js 5            REST API

  Database                MongoDB                 Data persistence

  ODM                     Mongoose                MongoDB object modeling

  Authentication          JSON Web Token (JWT)    Token-based
                                                  authentication

  Password security       bcryptjs                Password hashing

  Validation              Zod                     Request validation

  Security                Helmet                  HTTP security headers

  Cross-origin requests   CORS                    Cross-origin resource
                                                  sharing

  Cookies                 Cookie Parser           Cookie handling

  Rate limiting           Express Rate Limit      API request protection

  Logging                 Morgan                  HTTP request logging

  Configuration           dotenv                  Environment
                                                  configuration

  Development server      Nodemon                 Backend auto-restart

  Document processing     Backend document        Large-document
                          service/worker          operations
  -----------------------------------------------------------------------

Adjust this list to match the dependencies actually installed in the
project.

------------------------------------------------------------------------

## 4. Project Structure

The following is a suggested combined structure. Update it to match the
actual repository layout.

``` text
claims-management/
│
├── claims-management-fe/             # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js
│   │   │   └── claims.js
│   │   ├── components/
│   │   │   ├── claims/
│   │   │   │   ├── ClaimsTable.jsx
│   │   │   │   ├── ClaimsFilters.jsx
│   │   │   │   ├── ClaimsPagination.jsx
│   │   │   │   └── ClaimRowActions.jsx
│   │   │   └── common/
│   │   ├── hooks/
│   │   │   └── auth.js
│   │   ├── pages/
│   │   │   ├── ClaimsDashboard.jsx
│   │   │   ├── MyAssignedClaims.jsx
│   │   │   └── ClaimWorkspace.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   └── App.jsx
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── claims-management-be/             # Node + Express backend
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── utils/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
└── README.md                         # Combined project documentation
```

------------------------------------------------------------------------

## 5. Installation and Setup

### Prerequisites

-   Node.js (use the version specified by the project, if present).
-   npm.
-   MongoDB running locally or an accessible MongoDB deployment.
-   Git.

### 5.1 Clone the repository

``` bash
git clone <repository-url>
cd claims-management
```

If the frontend and backend are maintained in separate repositories,
clone each repository and run the setup commands from its respective
directory.

### 5.2 Backend setup

``` bash
cd claims-management-be
npm install
```

Create a `.env` file in the backend root directory:

``` env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/claims-management

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:5173
```

Adjust environment variable names and values according to the actual
backend configuration. Use strong, unique secrets and do not commit
`.env` files.

Start the backend in development mode:

``` bash
npm run dev
```

Start the backend in production mode:

``` bash
npm start
```

The backend API is expected at:

``` text
http://localhost:5000
```

### 5.3 Frontend setup

Open a separate terminal:

``` bash
cd claims-management-fe
npm install
```

For a Vite application, create a frontend `.env` file:

``` env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

``` bash
npm run dev
```

For a Create React App project, use the start command and
environment-variable convention defined by that project's `package.json`
(commonly `npm start` and `REACT_APP_`).

Open the local frontend URL printed by Vite or the configured frontend
development server.

------------------------------------------------------------------------

## 6. Environment Variables

### Backend

  Variable               Description
  ---------------------- -------------------------------------
  `PORT`                 Backend server port
  `NODE_ENV`             Application environment
  `MONGODB_URI`          MongoDB connection string
  `JWT_SECRET`           JWT access-token secret
  `JWT_REFRESH_SECRET`   JWT refresh-token secret
  `CLIENT_URL`           Allowed frontend application origin

### Frontend

  -----------------------------------------------------------------------
  Variable                            Description
  ----------------------------------- -----------------------------------
  `VITE_API_BASE_URL`                 Backend API base URL for Vite

  `REACT_APP_API_BASE_URL`            Alternative API base URL convention
                                      for Create React App, if used
  -----------------------------------------------------------------------

Use only the variable names supported by the actual application code.
Add `.env` to `.gitignore` and provide a sanitized `.env.example`.

------------------------------------------------------------------------

## 7. API Documentation

### Base URL

``` text
http://localhost:5000/api
```

### 7.1 Authentication APIs

  Method   Endpoint               Description
  -------- ---------------------- -------------------------------------
  GET\*    `/api/auth/register`   User registration
  POST     `/api/auth/login`      User login
  POST     `/api/auth/refresh`    Refresh access token
  POST     `/api/auth/logout`     User logout
  POST\*   `/api/auth/me`         Retrieve authenticated user details

\*Confirm the registration and current-user HTTP methods against the
implemented backend routes. Registration is commonly implemented as
`POST`, and current-user retrieval as `GET`; this documentation retains
the methods supplied in the project API notes until verified.

### 7.2 Claims APIs

  -----------------------------------------------------------------------------
  Method                  Endpoint                      Description
  ----------------------- ----------------------------- -----------------------
  GET                     `/api/claims`                 List claims available
                                                        to the authenticated
                                                        user/role

  GET                     `/api/claims/my-assigned`     List claims assigned to
                                                        the current
                                                        authenticated user

  GET                     `/api/claims/:id`             Retrieve claim details

  POST                    `/api/claims`                 Create a claim

  PATCH                   `/api/claims/:id`             Update an existing
                                                        claim

  DELETE                  `/api/claims/:id`             Delete a claim

  PATCH                   `/api/claims/:id/assign`      Assign a claim

  GET                     `/api/claims/:id/documents`   List documents
                                                        associated with a claim
  -----------------------------------------------------------------------------

All protected endpoints must validate the authenticated user and enforce
the relevant permissions on the backend.

### 7.3 Assigned claims endpoint

The frontend retrieves the current user's assigned claims using:

``` http
GET http://localhost:5000/api/claims/my-assigned
Authorization: Bearer <access_token>
```

The access token must come from the current authenticated session (for
example, the existing `useAuth()` hook/context). Do not hard-code a
token or identify the user using a client-supplied email address. The
backend should derive the user identity from the validated bearer token.

Example Axios service:

``` jsx
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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

Example component integration (adapt the auth property path and response
mapping to the actual application):

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

        const result = await getMyAssignedClaims(token);

        if (!cancelled) {
          setClaims(
            Array.isArray(result)
              ? result
              : result.claims ?? result.data ?? []
          );
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

If the existing `useAuth()` hook returns a different shape (for example,
`{ auth }`, `{ user, token }`, or `[auth, setAuth, loading]`), update
the token access accordingly. Keep the token in the application's
established authentication mechanism.

### 7.4 Expected assigned-claims backend behavior

`GET /api/claims/my-assigned` should:

1.  Require a valid bearer token.
2.  Identify the current user from the verified token.
3.  Return only claims assigned to that user.
4.  Apply server-side pagination, filtering, and sorting.
5.  Return a consistent response shape and useful HTTP error codes.

Illustrative response contract (align this with the actual backend
response):

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

------------------------------------------------------------------------

## 8. Authentication and Authorization

The application uses JSON Web Tokens (JWT) for authentication.

Authentication functionality includes:

-   User registration.
-   User login.
-   Access-token generation.
-   Refresh-token handling.
-   Secure logout.
-   Retrieval of authenticated user information.
-   Password hashing using bcrypt.

Protected endpoints require valid authentication credentials. Depending
on the implementation, tokens may be transmitted through HTTP-only
cookies or the `Authorization` header.

Example bearer-token header:

``` http
Authorization: Bearer <access_token>
```

### Role-based access control (RBAC)

-   Claims and actions must be filtered according to the authenticated
    user's permissions.
-   The frontend may show, hide, or disable actions based on
    permissions.
-   The backend must enforce authorization for every protected API
    operation.
-   The backend is the security boundary; frontend permission checks are
    only user-experience controls.
-   Record-level access must be checked on the backend, not inferred
    from browser-supplied user IDs or email addresses.

### Demo users and permission matrix

The following credentials are the demo credentials supplied for this
assessment. Use them only in a local/demo environment; do not use them
in production.

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

`GET /api/claims/my-assigned` is a user-scoped endpoint. It should
return only records assigned to the authenticated user, regardless of
what email or user ID is sent by the browser.

**Permission clarification:** The project notes describe the admin
account both as a full-access administrator and as a user who can see
only assigned records. These are different access policies:

-   The **Admin full-access dashboard** may use an admin-authorized
    claims-list endpoint to retrieve all records and expose
    Add/Assign/Edit/View/Delete.
-   The **My Assigned Claims** view uses `/api/claims/my-assigned` and
    returns only records assigned to the currently authenticated user.
-   If the intended requirement is that the admin account must also be
    restricted to assigned records, enforce that restriction in the
    backend and remove all-record access from that account.

The backend must independently enforce Add, Assign, Edit, View, and
Delete permissions. A user must not gain access by manually calling an
API.

------------------------------------------------------------------------

## 9. Architecture and Data Flow

### Claims grid flow

1.  User signs in.
2.  The authentication layer provides an access token.
3.  React calls the claims API with `Authorization: Bearer <token>`.
4.  The backend validates the token and checks the user's permissions.
5.  The backend applies user scoping, filtering, sorting, and
    pagination.
6.  React renders only the current page of records.
7.  Row actions are shown according to the application's permission
    model; the backend validates every action again.

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

------------------------------------------------------------------------

## 10. Performance and Scalability

### 10.1 Handling 20,000+ claims

Recommended approach: **server-side pagination, sorting, and
filtering**, with row virtualization if the page size or visible row
count still warrants it.

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

### 10.2 Handling 100 MB--1 GB+ documents

-   Do not load the complete document into React state.
-   Fetch metadata and thumbnails first.
-   Use HTTP range requests or page-based APIs when supported by the
    storage and document service.
-   Render only visible pages and release resources for pages no longer
    needed.
-   Use Web Workers for suitable CPU-intensive browser-side tasks.
-   Use chunked uploads/downloads and resumable operations where
    supported.
-   Run split, merge, and conversion operations on backend workers.
-   Return an operation/job ID and expose progress/status endpoints.
-   Use object storage and short-lived authorized URLs where
    appropriate; do not expose permanent public document URLs.

### 10.3 State management and caching

-   Keep authentication and user permissions in the established auth
    layer.
-   Keep server data separate from transient UI state.
-   Use a query/cache library if already installed; otherwise use a
    small API hook/service layer.
-   Cache only data that is safe for the current user and invalidate it
    after mutations.
-   Clear user-scoped cached data when the user logs out or changes.
-   Avoid storing large document binaries in global React state.

### 10.4 Optimistic vs. pessimistic updates

-   Use optimistic updates only for low-risk actions with a clear
    rollback path.
-   Prefer pessimistic updates for delete, assign, split, merge, and
    other operations that change authoritative claim/document state.
-   Disable duplicate submissions while a mutation is pending.
-   Refresh or invalidate affected claim/document queries after success.

------------------------------------------------------------------------

## 11. Reliability, Errors, and Recovery

-   Display skeleton/loading states while claims and document metadata
    load.
-   Distinguish empty results from API errors.
-   Handle `401` by following the application's token refresh/logout
    behavior.
-   Handle `403` with a clear access-denied state.
-   Preserve filters and pagination when returning from the document
    workspace.
-   Provide retry for transient failures.
-   Support cancellation only when the backend operation supports it.
-   Use operation IDs and idempotency keys for long-running or retryable
    mutations where appropriate.
-   Keep document versioning and audit history on the backend so partial
    failures can be diagnosed and recovered.

------------------------------------------------------------------------

## 12. Security

The backend uses or is intended to use the following security-related
packages:

  Package                Purpose
  ---------------------- -------------------------------
  `bcryptjs`             Password hashing
  `jsonwebtoken`         Token-based authentication
  `helmet`               Secure HTTP headers
  `express-rate-limit`   API rate limiting
  `cors`                 Cross-origin request handling
  `zod`                  Input validation
  `cookie-parser`        Cookie parsing

### Security checklist

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
-   [ ] Keep secrets in environment variables and out of source control.

------------------------------------------------------------------------

## 13. NPM Scripts

### Backend

  Command         Description
  --------------- ---------------------------------------
  `npm install`   Install project dependencies
  `npm run dev`   Start development server with Nodemon
  `npm start`     Start production server
  `npm test`      Run tests (not configured yet)

Use only scripts that exist in the backend `package.json`.

### Frontend

  Command             Description
  ------------------- -----------------------------------
  `npm install`       Install frontend dependencies
  `npm run dev`       Start Vite development server
  `npm run build`     Build the frontend for production
  `npm run preview`   Preview the production build

Use only scripts that exist in the frontend `package.json`.

------------------------------------------------------------------------

## 14. Testing

Automated backend tests are not configured yet, according to the
supplied backend notes.

The APIs can be tested manually using:

-   Postman
-   Thunder Client
-   cURL

Verify frontend behavior in the browser, including:

-   Login and logout.
-   Claims list, search, filters, sorting, and pagination.
-   Role-specific action visibility.
-   Assigned-claims filtering for the current user.
-   Claim creation, editing, assignment, and deletion.
-   Unauthorized and forbidden API responses.
-   Document loading, error, retry, and progress states where
    implemented.

------------------------------------------------------------------------

## 15. Assessment Coverage

  -----------------------------------------------------------------------
  Evaluation area                     Proposed implementation
  ----------------------------------- -----------------------------------
  20k+ records                        Server-side pagination, filtering,
                                      sorting; optional virtualization

  RBAC                                Frontend action visibility plus
                                      mandatory backend authorization

  Current-user assigned records       Bearer-authenticated
                                      `GET /api/claims/my-assigned`

  Authentication                      JWT access/refresh flow, logout,
                                      and authenticated-user retrieval

  Claims operations                   Create, view, update, delete, and
                                      assign APIs

  Claim documents                     Authenticated document retrieval
                                      and workspace integration

  Large documents                     Metadata-first, progressive
                                      page/range loading, backend
                                      processing

  Document operations                 Background jobs, progress,
                                      versioning, and recovery where
                                      implemented

  UX                                  Loading, empty, error, retry, and
                                      operation progress states

  Reliability                         Backend validation, idempotency
                                      where appropriate, audit/version
                                      history
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 16. Important Implementation Notes

1.  Confirm the exact return shape of the existing `useAuth()` hook and
    replace `auth?.token` in the example if needed.
2.  Confirm the actual claims API response structure and adjust the
    frontend data mapping accordingly.
3.  Confirm the implemented HTTP methods for registration and
    authenticated-user retrieval.
4.  Confirm whether the admin account is intended to have all-claims
    access or assigned-only access. The same account cannot satisfy both
    policies in the same view.
5.  The document workspace capabilities in this README are architecture
    and integration requirements; they should not be considered
    implemented unless the corresponding viewer and backend document
    APIs exist.
6.  Update this README as the actual API routes, permission names,
    environment variables, dependencies, and implemented features are
    finalized.
7.  Update the suggested project structure to reflect the actual
    repository layout.

------------------------------------------------------------------------

## 17. License

This project is licensed under the ISC License, as specified in the
backend project notes. Confirm that the repository includes the
corresponding `LICENSE` file.

------------------------------------------------------------------------

**ABC Insurance Claims Management System**\
Built with React, Vite, Node.js, Express.js, and MongoDB.
