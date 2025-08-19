import * as controllers from '../controllers/auth_controllers.js';
import { protectRoute } from '../middleware/auth_middleware.js';

const auth_routes = {
    '/api/auth/signup': { 
        POST: [controllers.signup],
    },
    '/api/auth/login': {
        POST: [controllers.login],
    },
    '/api/auth/logout': {
        POST: [controllers.logout],
    },
    '/api/auth/update-profile': {
        PUT: [protectRoute, controllers.updateProfile],
    },
    '/api/auth/check': {
        GET: [protectRoute, controllers.checkAuth],
    }
};

export default auth_routes;