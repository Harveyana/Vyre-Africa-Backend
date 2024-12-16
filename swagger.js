const swaggerAutogen = require('swagger-autogen')

const doc = {
    info: {
        version: '1.0.0',
        title: 'Qaya Backend Application',
        description: 'This is Qaya Backend application version 1',
    },

    securityDefinitions: {
        Bearer: { // Use 'Bearer' as the security definition name
            type: 'apiKey',
            in: 'header', // Specify 'header' as the location
            name: 'Authorization', // Use 'Authorization' as the header name
            description: 'Enter the token with the `Bearer ` prefix, e.g., "Bearer abcde12345"',
        },
    },
    paths: {
        '/organisation': {
            get: {
                summary: 'Handles organisation',
                tags: ['organisation'],
            },
        },
        '/products': {
            post: {
                summary: 'handles products',
                tags: ['pets'], // Also assign the 'pets' tag
            },
        },
    },
    basePath: '/api/v1',
    host: process.env.HOST,
    scheme: ['http'],
};

const outputFile = './swagger-output.json';
const routes = ['./src/routes/*.ts'];

swaggerAutogen(outputFile, routes, doc);
