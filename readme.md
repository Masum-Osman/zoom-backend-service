# Zoom Backend Service

A Node.js backend service that handles Zoom meeting creation and JWT token generation for Zoom SDK integration.

## Features

- Create instant Zoom meetings
- Generate Zoom SDK JWT signatures
- Generate Zoom API JWT tokens
- Handle authentication for Zoom SDK integration

## Prerequisites

- Node.js (v12 or higher)
- npm
- Zoom SDK credentials
- Zoom API credentials

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```plaintext
SDK_KEY=your_sdk_key
SDK_SECRET=your_sdk_secret
API_KEY=your_api_key
API_SECRET=your_api_secret
USER_ID=your_zoom_email
```

## API Endpoints

### Create Meeting
- **POST** `/create_meeting`
- Creates an instant Zoom meeting and returns meeting details
- Response includes:
  - signature
  - meetingNumber
  - password
  - sdkKey

### Generate SDK JWT
- **POST** `/zoom_auth_jwt`
- Generates JWT signature for Zoom SDK
- Required body parameters:
  - meetingNumber
  - role (0 for attendee, 1 for host)

### Generate API JWT
- **GET** `/zoom_jwt`
- Generates JWT token for Zoom API authentication

## Environment Variables

- `SDK_KEY`: Your Zoom SDK key
- `SDK_SECRET`: Your Zoom SDK secret
- `API_KEY`: Your Zoom API key
- `API_SECRET`: Your Zoom API secret
- `USER_ID`: Your Zoom user email

## Running the Service

Start the server:
```bash
node server.js
```

The service will run on `http://localhost:4000`

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- Always use environment variables for sensitive credentials
- The service includes CORS configuration for development purposes

## License

MIT
```

This README provides a comprehensive overview of your service, including setup instructions, available endpoints, and important security considerations. Feel free to modify any sections to better match your specific requirements or add additional information as needed.