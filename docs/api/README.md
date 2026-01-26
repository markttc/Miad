# Miad Healthcare Training Portal - API Documentation

[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-green.svg)](https://swagger.io/specification/)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)]()

Complete API documentation for the Miad Healthcare Training Portal - a B2C healthcare training booking platform by TTC Group.

## Quick Links

- [Interactive API Documentation (Swagger UI)](https://ttcgroup.github.io/miad-api-docs/)
- [OpenAPI Specification](./openapi.yaml)

## Overview

The Miad API enables:

- Healthcare professionals to book live webinar training
- Purchase e-learning courses with instant access
- Automated booking confirmations and Zoom joining instructions
- Stripe payment processing
- Admin management of courses, bookings, and customer accounts

## API Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.miad.ttcgroup.com/v1` |
| Staging | `https://api-staging.miad.ttcgroup.com/v1` |
| Development | `http://localhost:3000/api/v1` |

## Authentication

### Booker Authentication (OTP)

Healthcare professionals authenticate via one-time passcode:

```bash
# Step 1: Request OTP
POST /auth/otp/request
Content-Type: application/json

{
  "email": "john.smith@nhs.uk"
}

# Step 2: Verify OTP
POST /auth/otp/verify
Content-Type: application/json

{
  "email": "john.smith@nhs.uk",
  "otp": "123456"
}
```

- OTP valid for **10 minutes**
- Session valid for **24 hours**
- Maximum **3 attempts** before lockout

### Admin Authentication (2FA)

Administrators authenticate via username/password + 2FA:

```bash
# Step 1: Login with credentials
POST /auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

# Step 2: Verify 2FA code
POST /auth/admin/verify-2fa
Content-Type: application/json

{
  "adminId": "admin-001",
  "code": "123456"
}
```

- 2FA code valid for **5 minutes**
- Session valid for **8 hours**
- Maximum **3 attempts** before lockout

### Using the Token

Include the JWT token in all authenticated requests:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints Summary

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/otp/request` | Request OTP for booker login |
| `POST` | `/auth/otp/verify` | Verify OTP and create session |
| `GET` | `/courses` | List all courses |
| `GET` | `/courses/{id}` | Get course details |
| `GET` | `/courses/{id}/sessions` | Get available sessions |
| `POST` | `/payments/validate/card` | Validate card number |

### Booker Endpoints (OTP Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bookings` | Create a booking |
| `GET` | `/bookings` | Get my bookings |
| `GET` | `/bookings/{ref}` | Get booking by reference |
| `POST` | `/bookings/{id}/cancel` | Cancel a booking |
| `POST` | `/bookings/{id}/resend-instructions` | Resend joining instructions |

### Admin Endpoints (2FA Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/bookings` | Create admin booking |
| `GET` | `/admin/bookings` | List all bookings |
| `GET` | `/admin/bookings/export` | Export bookings |
| `GET` | `/customer-accounts` | List customer accounts |
| `POST` | `/customer-accounts` | Create customer account |
| `GET` | `/trainers` | List trainers |
| `POST` | `/trainers` | Create trainer |
| `GET` | `/venues` | List venues |
| `POST` | `/venues` | Create venue |
| `GET` | `/audit/sessions/{id}` | Get session audit trail |

## Key Data Models

### Booking

```json
{
  "id": "bk_abc123",
  "bookingRef": "MIAD-12345",
  "status": "confirmed",
  "createdAt": "2026-02-01T10:30:00Z",
  "courseId": "bls",
  "courseName": "Basic Life Support",
  "coursePrice": 95.00,
  "sessionDate": "2026-02-15",
  "sessionTime": "09:00 - 13:00",
  "trainer": "Dr. Sarah Mitchell",
  "isElearning": false,
  "deliveryMethod": "webinar",
  "attendee": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@nhs.uk",
    "phone": "+44 7700 900000",
    "organisation": "NHS Trust",
    "jobTitle": "Staff Nurse"
  },
  "payment": {
    "amount": 95.00,
    "currency": "GBP",
    "status": "completed",
    "method": "stripe"
  },
  "zoomMeeting": {
    "joinUrl": "https://zoom.us/j/123456789",
    "password": "abc123",
    "dialIn": {
      "uk": "+44 330 088 5830",
      "us": "+1 646 876 9923"
    }
  }
}
```

### Course

```json
{
  "id": "bls",
  "name": "Basic Life Support",
  "category": "mandatory",
  "description": "...",
  "duration": "4 hours",
  "certification": "Resuscitation Council UK",
  "validityPeriod": "12 months",
  "price": 95.00,
  "deliveryMethods": ["webinar", "classroom"],
  "learningObjectives": ["..."],
  "accreditation": "CPD Certified"
}
```

### Customer Account (Purchase Order)

```json
{
  "id": "acc_abc123",
  "organisationName": "NHS Foundation Trust",
  "accountNumber": "ACC-NHS-001",
  "creditLimit": 5000.00,
  "currentBalance": 1250.00,
  "availableCredit": 3750.00,
  "status": "active",
  "primaryContact": {
    "name": "Jane Doe",
    "email": "jane.doe@nhs.uk",
    "phone": "+44 1onal 123456"
  },
  "paymentTerms": 30
}
```

## Integrations

### Zoom Integration

The API integrates with Zoom for webinar delivery:

- Automatic meeting creation on first booking
- Attendee registration with unique join URLs
- Dial-in numbers for accessibility (UK/US)
- Meeting password protection

### Stripe Integration

Payment processing via Stripe:

- Card validation (Luhn algorithm)
- Payment intents for secure processing
- Full and partial refunds
- Webhook support for payment events

### Email Notifications

Automated email notifications:

| Template | Trigger |
|----------|---------|
| `BOOKING_CONFIRMATION` | After successful booking |
| `JOINING_INSTRUCTIONS` | 24 hours before webinar |
| `REMINDER_24H` | 24 hours before session |
| `REMINDER_1H` | 1 hour before session |
| `ELEARNING_ACCESS` | Immediately for e-learning |
| `CERTIFICATE_READY` | After course completion |
| `BOOKING_CANCELLED` | On cancellation |

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "reason": "Detailed reason"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Authentication required |
| `402` | Payment Required - Payment failed |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| OTP Request | 3 per 10 minutes per email |
| 2FA Verify | 3 per 5 minutes per admin |
| General API | 100 requests per minute |

## Environment Variables

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Zoom
VITE_ZOOM_CLIENT_ID=xxx
VITE_ZOOM_CLIENT_SECRET=xxx
VITE_ZOOM_ACCOUNT_ID=xxx
```

## Running Locally

### View Documentation

1. Open `index.html` in a browser for Swagger UI
2. Or use any OpenAPI-compatible tool with `openapi.yaml`

### Using Swagger Editor

```bash
# Online
https://editor.swagger.io/?url=https://raw.githubusercontent.com/ttcgroup/miad-api-docs/main/openapi.yaml

# Local with Docker
docker run -p 8080:8080 swaggerapi/swagger-editor
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes to `openapi.yaml`
4. Validate with `swagger-cli validate openapi.yaml`
5. Submit a pull request

## Support

For API support, contact:

- Technical Issues: [support@miad.ttcgroup.com](mailto:support@miad.ttcgroup.com)
- Documentation: [Create an issue](https://github.com/ttcgroup/miad-api-docs/issues)

## License

Proprietary - TTC Group

---

*Generated for Miad Healthcare Training Portal - Part of TTC Group*
