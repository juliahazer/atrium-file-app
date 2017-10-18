exports.loginRequired = function(req,res,next){
    if(!req.isAuthenticated()){
        req.flash('error', 'Please log in!')
        res.redirect('/users/login')
    } else {
        next();
    }
}
