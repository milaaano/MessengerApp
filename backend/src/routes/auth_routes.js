import * as controllers from '../controllers/auth_controllers.js';
import * as middleware from '../middleware/auth_middleware.js';

const routes = {
    '/': {
        GET: [controllers.getHomePage],
    },
    '/auth/signup': { 
        POST: [controllers.signup],
    },
    '/auth/login': {
        POST: [controllers.login],
    },
    '/auth/logout': {
        POST: [controllers.logout],
    },
    '/update-profile': {
        PATCH: [middleware.protectRoute, controllers.updateProfile],
    },
};

export default routes;