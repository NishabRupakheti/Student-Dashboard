// Authentication utility functions for authorization guards

/**
 * @param {Object} req - Express request object with session
 * @throws {Error} If user is not authenticated
 * @returns {string} The authenticated user's ID
 */


// this is checking if the user is logged in by looking for userId in the session
export const requireAuth = (req) => {
  if (!req.session || !req.session.userId) {
    throw new Error("Not authenticated. Please login first.");
  }
  return req.session.userId;
};

/**
 * @param {Object} req - Express request object with session
 * @param {string} resourceUserId - The userId that owns the resource
 * @throws {Error} If user doesn't own the resource
 */

 // this is checking if the user owns the resource by comparing userId in the session with resourceUserId
export const requireOwnership = (req, resourceUserId) => {
  const userId = requireAuth(req);
  if (userId !== resourceUserId) {
    throw new Error("Not authorized. You don't have permission to access this resource.");
  }
  return userId;
};
