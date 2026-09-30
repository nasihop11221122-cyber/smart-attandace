// Cross-site cookie (SameSite=None) use ho rahi hai, is liye state-changing requests par
// custom header lazmi hai. Browser cross-origin form/img se ye header nahi bhej sakta.
export const requireXHR = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return res.status(403).json({ message: 'Invalid request' });
  }
  next();
};
