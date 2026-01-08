import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'trilogic_super_secret_key_2026';

/**
 * Generate JWT token for user
 */
export function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.full_name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Authentication middleware
 */
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }

    req.user = decoded;
    next();
}

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - Roles that can access this route
 */
export function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized for this action'
            });
        }

        next();
    };
}

// Role constants
export const ROLES = {
    CEO: 'CEO',
    CFO: 'CFO',
    CTO: 'CTO',
    PMO_DIRECTOR: 'PMO_Director',
    PROJECT_MANAGER: 'Project_Manager',
    TEAM_LEAD: 'Team_Lead',
    ENGINEER: 'Engineer',
    FINANCE: 'Finance',
    VIEWER: 'Viewer'
};

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = {
    'CEO': 10,
    'CFO': 9,
    'CTO': 9,
    'PMO_Director': 8,
    'Project_Manager': 6,
    'Team_Lead': 4,
    'Engineer': 2,
    'Finance': 5,
    'Viewer': 1
};

/**
 * Check if user has at least the required role level
 */
export function hasMinRole(userRole, requiredRole) {
    return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

export default {
    generateToken,
    verifyToken,
    authMiddleware,
    authorize,
    ROLES,
    hasMinRole
};
