# AI Commerce Backend

A robust Node.js/TypeScript backend service that leverages **Sarvam AI** to provide intelligent product categorization, impact reports, and proposal generation for e-commerce applications.

## Features

- **AI-Powered Product Categorization** - Automatically categorize products using Sarvam AI
- **Impact Report Generation** - Generate detailed impact reports with AI assistance
- **Proposal Generator** - Create intelligent business proposals
- **Request Validation** - Input validation using express-validator
- **Error Handling** - Centralized error handling middleware
- **Logging System** - Comprehensive logging with Winston
- **MongoDB Integration** - Data persistence with Mongoose ODM
- **Docker Support** - Containerized deployment ready
- **Health Check Endpoint** - Monitor service status

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI Service**: Sarvam AI
- **HTTP Client**: Axios
- **Logging**: Winston
- **Validation**: Express-validator
- **Security**: Helmet, CORS
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Docker & Docker Compose (for containerized deployment)
- Sarvam AI API credentials

## Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-comm-backend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
    PORT=5000
    MONGO_URI=mongodb://mongo:27017
    CLIENT_URL=http://localhost:3000
    NODE_ENV="production"
    AI_API_KEY=sk_
   ```

4. **Run in development mode**
   ```bash
   yarn run dev
   ```

5. **Build for production**
   ```bash
   yarn run build
   yarn start
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop containers**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns service health status

### Product Categorization
```
POST /api/ai-categorize-product
```
Categorizes products using Sarvam AI

### Impact Report
```
POST /api/ai-impact-report
```
Generates AI-powered impact reports

### Proposal Generator
```
POST /api/ai-proposal-generator
```
Creates intelligent business proposals

## Project Structure

```
├── src/
│   ├── config/          # Configuration files (CORS, logger, dotenv)
│   ├── constants/       # Application constants
│   ├── controllers/     # Request handlers
│   ├── db/             # Database connection
│   ├── interface/      # TypeScript interfaces
│   ├── middlewares/    # Custom middleware (error handling)
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic layer
│   └── utils/          # Utility functions (Sarvam AI, error handling)
├── logs/               # Application logs
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
└── package.json        # Dependencies and scripts
```

## Error Handling

The application includes a centralized error handling middleware that:
- Catches and formats all errors
- Logs errors using Winston
- Returns consistent error responses
- Handles validation errors from express-validator

## Logging

Winston logger is configured to:
- Log to console and file
- Separate error and combined logs
- Include timestamps and log levels
- Support different log levels based on environment

## Validation

All API endpoints use express-validator to:
- Validate request payloads
- Sanitize input data
- Return detailed validation error messages

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `AI_API_KEY` | Sarvam AI API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Scripts

- `yarn run dev` - Run development server with hot reload
- `yarn run build` - Build TypeScript to JavaScript
- `yarn start` - Run production server

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions, please open an issue in the repository.
