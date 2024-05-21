const { Users, UserDetails } = require('../models/users')

const isDoctor = async (req, res, next) => {
    try {
        const current_doctor = req.user["email"];
        const user = await UserDetails.findOne({ email: current_doctor });
        if (!user.doctor) {
            return res.status(500).json({ message: "You are not a doctor" })}
        next()
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message })
    }
}

module.exports = isDoctor;