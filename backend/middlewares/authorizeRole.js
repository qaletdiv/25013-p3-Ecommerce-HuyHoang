const authorizeRole = (allowedRoles) => {
    const role = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        const userRole = req.user.role;
        if (!role.includes(userRole)) {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        next();
    }
};

module.exports = authorizeRole;