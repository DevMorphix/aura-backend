const { Users, UserDetails } = require('../models/users')

const isUserValidate = async (req, res, next) => {
    try {
        const current_user = req.user["email"];
        const user = await UserDetails.findOne({ email: current_user });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        next()
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message })
    }
}

module.exports = isUserValidate;