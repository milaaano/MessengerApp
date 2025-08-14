export const login = (req, res) => {
    res.writeHead(200, {"Content-Type": 'text/html'});
    res.end("Login Page");
};

export const signup = (req, res) => {
    
    try {

    } catch {

    }
};

export const logout = (req, res) => {
    res.writeHead(200, {"Content-Type": 'text/html'});
    res.end("Logout Page");
};

export const getHomePage = (req, res) => {
    res.writeHead(200, {"Content-Type": 'text/html'});
    res.end("Home Page");
};