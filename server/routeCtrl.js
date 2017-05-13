const routeCtrl = {
  get: (req, res, next) => {
    res.locals.successMsg = `redirected to '/'`;
    res.redirect('/');
    return next();
  },

  post: (req, res, next) => {
    res.locals.successMsg = `redirected to '/'`;
    res.redirect('/');
    return next();
  }
}

module.exports = routeCtrl;