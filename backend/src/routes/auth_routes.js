import * as controllers from '../controllers/auth_controllers.js';
import * as middleware from '../middleware/auth_middleware.js';

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
        PATCH: [middleware.protectRoute, controllers.updateProfile],
    },
    // '/check': {
    //     GET: [protectRoute, checkAuth],
    // }
};

export default auth_routes;