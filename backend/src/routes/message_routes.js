import * as controllers from '../controllers/message_controllers.js';
import { protectRoute } from '../middleware/auth_middleware.js';

const message_routes = {
    '/users': { 
        GET: [protectRoute, controllers.getUsersForSiderbar],
    },
    '/:id': {
        GET: [protectRoute, controllers.getMessages],
    },
    
};

export default message_routes;