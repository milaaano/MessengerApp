import * as controllers from '../controllers/auth_controllers.js';
import { protectRoute } from '../middleware/auth_middleware.js';

const auth_routes = {
    '/signup': { 
        POST: [controllers.signup],
    },
    '/login': {
        POST: [controllers.login],
    },
    '/logout': {
        POST: [controllers.logout],
    },
    '/update-profile': {
        PUT: [protectRoute, controllers.updateProfile],
    },
    '/check': {
        GET: [protectRoute, controllers.checkAuth],
    }
};

export default auth_routes;