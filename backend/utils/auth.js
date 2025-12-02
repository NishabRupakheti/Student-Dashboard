// Authentication utility functions for authorization guards

/**
 * Check if user is authenticated
 * @param {Object} req - Express request object with session
 * @throws {Error} If user is not authenticated
 * @returns {string} The authenticated user's ID
 */
export const requireAuth = (req) => {
  if (!req.session || !req.session.userId) {
    throw new Error("Not authenticated. Please login first.");
  }
  return req.session.userId;
};

/**
 * Check if the authenticated user owns the resource
 * @param {Object} req - Express request object with session
 * @param {string} resourceUserId - The userId that owns the resource
 * @throws {Error} If user doesn't own the resource
 */
export const requireOwnership = (req, resourceUserId) => {
  const userId = requireAuth(req);
  if (userId !== resourceUserId) {
    throw new Error("Not authorized. You don't have permission to access this resource.");
  }
  return userId;
};
