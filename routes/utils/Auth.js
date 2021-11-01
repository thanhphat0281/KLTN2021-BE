/**
 * @DESC Check Role Middleware
 */
const checkRole = (roles) => (req, res, next) =>
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();

function isLoggedIn(req, res, next) {
        console.log(req.isAuthenticated());
        if(req.isAuthenticated()) next();
        else return res.status(401).json({message:'Unauthorized Request'});
}

module.exports = {
   checkRole,
   isLoggedIn
};