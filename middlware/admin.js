const { Users, UserDetails } = require('../models/users')

const isAdmin = async (req, res, next) => {
    try {
        const current_admin = req.user["email"];
        const user = await UserDetails.findOne({ email: current_admin });
        if (!user.is_admin) {
            return res.status(500).json({ message: "User does not have admin access" })        }
        next()
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message })
    }
}

module.exports = isAdmin;