import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.cookies.token
    if (authHeader) {
        jwt.verify(authHeader, process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid!");
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("You're not authenticated!");
    }
};

export const checkRole = (req, res, next) => {
    const authHeader = req.cookies.token;
    if (authHeader) {
        jwt.verify(authHeader, process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid!");
            }
            if (user.role !== "admin" && user.role !== "manager" && user.role !== "candidateService") {
                return res.status(403).json("You are not authorized!");
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("You're not authenticated!");
    }
};