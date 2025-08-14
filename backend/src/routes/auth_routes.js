import * as controllers from '../controllers/auth_controllers.js';

const routes = {
    '/': {
        GET: controllers.getHomePage,
    },
    '/auth/signup': {
        POST: controllers.signup,
    },
    '/auth/login': {
        POST: controllers.login,
    },
    '/auth/logout': {
        POST: controllers.logout,
    }
};

export default routes;