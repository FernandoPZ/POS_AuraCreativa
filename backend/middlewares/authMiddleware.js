const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.query && req.query.token) {
        token = req.query.token;
    }
    if (!token) {
        return res.status(401).json({ msg: 'No autorizado, no se encontró token.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
        req.user = decoded;
        return next();
    } catch (error) {
        console.error('Error de token:', error.message);
        return res.status(401).json({ msg: 'No autorizado, token fallido o expirado.' });
    }
};

module.exports = protect;