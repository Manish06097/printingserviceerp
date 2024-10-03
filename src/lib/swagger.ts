import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Next.js API Documentation',
      version: '1.0.0',
      description: 'API documentation for Next.js backend',
    },
    servers: [
      {
        url: 'https://priyanshart.com', // Your live domain
      },
      {
        url: 'https://www.priyanshart.com', // Your live www subdomain
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    './src/app/api/**/*.ts',  
    './src/app/api/auth/**/*.ts', 
    './src/app/api/admin/users/**/*.ts',
  ], // Path to the API handler files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
