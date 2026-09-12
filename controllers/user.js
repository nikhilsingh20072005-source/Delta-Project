const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};


module.exports.signup = async (req, res) => {
    try{
       let { username, email, password } = req.body;
       const userUser = new User({ username, email });
       const registeredUser = await User.register(userUser, password);
       console.log(registeredUser);
       req.login(registeredUser, (err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", " Welcome to Wanderlust!");
        res.redirect("/listings");
    });
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/users/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {   
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
};
