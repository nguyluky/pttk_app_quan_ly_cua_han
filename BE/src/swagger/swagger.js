const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Quản lý cửa hàng API',
            version: '1.0.0',
            description: 'API Documentation cho ứng dụng quản lý cửa hàng',
            contact: {
                name: 'Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: '/api',
                description: 'API Server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            BearerAuth: []
        }]
    },
    apis: ['./src/routes/*.js', './src/models/*.js', './src/swagger/definitions.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;