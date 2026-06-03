# API Documentation

## Overview

CivicBirth API is a RESTful service built with Express.js and TypeScript. All endpoints return JSON responses with appropriate HTTP status codes.

**Base URL**: `http://localhost:3000/api` (development)  
**Production URL**: `https://civicbirth.gov.cm/api`

## Authentication

### Login

```http
POST /auth/login

Content-Type: application/json

{
  "email": "admin@civicbirth.local",
  "password": "Admin@2026!"
}
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@civicbirth.local",
    "name": "Admin User",
    "role": "NATIONAL_ADMIN",
    "region": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Refresh Token

```http
POST /auth/refresh

Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "email": "admin@civicbirth.local",
  "name": "Admin User",
  "role": "NATIONAL_ADMIN",
  "region": null,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

## Birth Registrations

### List Registrations

```http
GET /registrations?page=1&limit=25&status=PENDING&region=1&sex=MALE
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 25, max: 100) - Items per page
- `status` (enum) - Filter: PENDING, VALIDATED, REJECTED, CERTIFICATE_ISSUED
- `region` (uuid) - Filter by region ID
- `sex` (enum) - Filter: MALE, FEMALE
- `channel` (enum) - Filter: FIELD, FACILITY, COMMUNITY, POSTAL
- `search` (string) - Search child name or parent names
- `sort` (string) - Sort field: createdAt, status, childName

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "referenceNumber": "CM-2026-0000001",
      "childName": "Jean Nkomo",
      "sex": "MALE",
      "dob": "2025-12-15T00:00:00Z",
      "region": {
        "id": "uuid",
        "name": "Littoral",
        "nameFr": "Littoral"
      },
      "district": "Douala 1st",
      "village": "Bonanjo",
      "fatherName": "Pierre Nkomo",
      "motherName": "Marie Epee",
      "agent": {
        "id": "uuid",
        "name": "Agent Jean",
        "agentCode": "000042"
      },
      "channel": "FIELD",
      "status": "VALIDATED",
      "notes": "Registration completed successfully",
      "createdAt": "2026-01-10T10:30:00Z",
      "updatedAt": "2026-01-11T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 152,
    "totalPages": 7,
    "hasMore": true
  }
}
```

### Create Registration

```http
POST /registrations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childName": "Jean Nkomo",
  "sex": "MALE",
  "dob": "2025-12-15T00:00:00Z",
  "regionId": "uuid",
  "district": "Douala 1st",
  "village": "Bonanjo",
  "fatherName": "Pierre Nkomo",
  "fatherOccupation": "Teacher",
  "motherName": "Marie Epee",
  "motherOccupation": "Nurse",
  "agentId": "uuid",
  "channel": "FIELD",
  "notes": "Optional notes about registration"
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "referenceNumber": "CM-2026-0000001",
  "childName": "Jean Nkomo",
  "status": "PENDING",
  "createdAt": "2026-01-10T10:30:00Z"
}
```

### Get Registration

```http
GET /registrations/{id}
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "referenceNumber": "CM-2026-0000001",
  "childName": "Jean Nkomo",
  "sex": "MALE",
  "dob": "2025-12-15T00:00:00Z",
  "region": {...},
  "status": "VALIDATED",
  "createdAt": "2026-01-10T10:30:00Z",
  "updatedAt": "2026-01-11T14:20:00Z"
}
```

### Update Registration

```http
PATCH /registrations/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "childName": "Jean Nkomo Updated",
  "notes": "Updated notes"
}
```

**Response (200 OK)**: Updated registration object

### Validate Registration

```http
PATCH /registrations/{id}/validate
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "status": "VALIDATED",
  "message": "Registration validated successfully"
}
```

### Reject Registration

```http
PATCH /registrations/{id}/reject
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "Missing parent documentation"
}
```

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "status": "REJECTED",
  "rejectionReason": "Missing parent documentation"
}
```

### Public Verification (No Auth)

```http
GET /registrations/verify/{referenceNumber}
```

Returns limited info for public verification (no authentication required):

**Response (200 OK)**:
```json
{
  "childName": "Jean Nkomo",
  "dob": "2025-12-15",
  "region": "Littoral",
  "status": "VALIDATED",
  "registrationDate": "2026-01-10"
}
```

## Certificates

### List Certificates

```http
GET /certificates?page=1&limit=25
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "registration": {
        "id": "uuid",
        "referenceNumber": "CM-2026-0000001",
        "childName": "Jean Nkomo"
      },
      "qrCode": "data:image/png;base64,...",
      "certificateNumber": "CERT-2026-000001",
      "issuedAt": "2026-01-12T10:00:00Z",
      "downloadCount": 2
    }
  ],
  "pagination": {...}
}
```

### Generate Certificate

```http
POST /certificates/{registrationId}/generate
Authorization: Bearer {accessToken}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "certificateNumber": "CERT-2026-000001",
  "issuedAt": "2026-01-12T10:00:00Z",
  "qrCode": "data:image/png;base64,..."
}
```

### Get Certificate

```http
GET /certificates/{id}
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "certificateNumber": "CERT-2026-000001",
  "registration": {...},
  "qrCode": "...",
  "issuedAt": "2026-01-12T10:00:00Z",
  "downloadCount": 2
}
```

### Download Certificate

```http
GET /certificates/{id}/download
Authorization: Bearer {accessToken}
```

Returns PDF or binary file. Increments download counter.

## Field Agents

### List Agents

```http
GET /agents?page=1&limit=25&region={regionId}&status=ACTIVE
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Jean Smith",
      "email": "jean.smith@civicbirth.local",
      "phone": "+237 6XX XXX XXX",
      "agentCode": "000042",
      "region": {
        "id": "uuid",
        "name": "Littoral"
      },
      "status": "ACTIVE",
      "certifications": ["UNICEF_CERTIFIED"],
      "registrationsCount": 142
    }
  ],
  "pagination": {...}
}
```

### Create Agent

```http
POST /agents
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Jean Smith",
  "email": "jean.smith@civicbirth.local",
  "phone": "+237 6XX XXX XXX",
  "regionId": "uuid"
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "name": "Jean Smith",
  "agentCode": "000042",
  "status": "ACTIVE"
}
```

### Get Agent Performance

```http
GET /agents/{id}/performance
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "agentId": "uuid",
  "total": 142,
  "validated": 128,
  "thisMonth": 15,
  "accuracy": 90.14,
  "trend": "up"
}
```

## Analytics

### Summary Statistics

```http
GET /analytics/summary
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "allTime": 5248,
  "thisMonth": 420,
  "thisYear": 1245,
  "pending": 38,
  "validated": 5102,
  "rejected": 108,
  "certificatesIssued": 5002,
  "genderPercentage": {
    "male": 51.2,
    "female": 48.8
  },
  "byChannel": {
    "FIELD": 2100,
    "FACILITY": 1800,
    "COMMUNITY": 980,
    "POSTAL": 368
  },
  "statusSummary": {
    "PENDING": 38,
    "VALIDATED": 5102,
    "REJECTED": 108,
    "CERTIFICATE_ISSUED": 5002
  }
}
```

### Regional Performance

```http
GET /analytics/by-region
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "name": "Littoral",
    "nameFr": "Littoral",
    "count": 1200,
    "target": 1000,
    "achievement": 120,
    "status": "COMPLETE"
  },
  {
    "name": "North",
    "nameFr": "Nord",
    "count": 850,
    "target": 1000,
    "achievement": 85,
    "status": "AT_RISK"
  }
]
```

### Monthly Trend

```http
GET /analytics/by-month?months=12
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {"month": "January", "count": 420},
  {"month": "February", "count": 385},
  {"month": "March", "count": 410}
]
```

### SDG 16.9 Tracker

```http
GET /analytics/sdg-tracker
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "regionId": "uuid",
    "regionName": "Littoral",
    "estimatedPopulation": 3929984,
    "registrations": 1200,
    "sdgProgress": 30.5,
    "status": "ON_TRACK"
  }
]
```

## Users (Admin Only)

### List Users

```http
GET /users?page=1&limit=25&role=NATIONAL_ADMIN
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "admin@civicbirth.local",
      "name": "Admin User",
      "role": "NATIONAL_ADMIN",
      "region": null,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### Create User

```http
POST /users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "officer@civicbirth.local",
  "name": "Regional Officer",
  "password": "SecurePassword@123",
  "role": "REGIONAL_OFFICER",
  "regionId": "uuid"
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "email": "officer@civicbirth.local",
  "name": "Regional Officer",
  "role": "REGIONAL_OFFICER"
}
```

### Update User

```http
PATCH /users/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Name",
  "password": "NewPassword@123"
}
```

### Delete User

```http
DELETE /users/{id}
Authorization: Bearer {accessToken}
```

**Response (204 No Content)**

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation Error",
  "message": "Invalid request body",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate Limited",
  "message": "Too many requests. Please try again later"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- **General endpoints**: 100 requests/minute
- **Authentication**: 10 requests/minute
- **Public endpoints**: 50 requests/minute

Headers indicate when limits reset:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1673890234
```

## Pagination

List endpoints support pagination:

```
GET /registrations?page=2&limit=50

Response includes:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 234,
    "totalPages": 5,
    "hasMore": true
  }
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Server Error |

## Filtering & Sorting

Most list endpoints support filtering:

```
GET /registrations?status=VALIDATED&region=uuid&sort=-createdAt
```

Format:
- Multiple filters: `?field1=value1&field2=value2`
- Sorting: `sort=fieldName` (ascending) or `sort=-fieldName` (descending)

---

**API Version**: 1.0.0  
**Last Updated**: January 2026
