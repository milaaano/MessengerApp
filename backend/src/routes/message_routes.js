import * as controllers from '../controllers/message_controllers.js';
import { protectRoute } from '../middleware/auth_middleware.js';

const message_routes = {
    '/users': { 
        GET: [protectRoute, controllers.getUsersForSiderbar],
    },
};

export default message_routes;