import * as controllers from '../controllers/auth_controllers.js';

const routes = {
    '/': {
        GET: controllers.getHomePage,
    },
    '/signup': {
        POST: controllers.signup,
    },
    '/login': {
        POST: controllers.login,
    },
    '/logout': {
        POST: controllers.logout,
    }
};

export default routes;