import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15d",
    }
  );
};

export const register = async (req, res) => {
  const { email, password, name, role, photo, gender } = req.body;
  console.log(req.body);

  try {
    let user = null;

    if (role === "patient") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    }

    //check if user exist
    if (user) {
      return res.status(400).json({ message: "User already exist" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    if (role === "patient") {
      user = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

    if (role === "doctor") {
      user = new Doctor({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User Successfully created" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error, Try again" });
  }
};

// export const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user = null;
//     let role = null;

//     // Try finding in User model
//     const patientOrAdmin = await User.findOne({ email });
//     if (patientOrAdmin) {
//       user = patientOrAdmin;
//       role = user.role === "admin" ? "admin" : "patient";
//     } else {
//       // If not found in User, try Doctor
//       const doctor = await Doctor.findOne({ email });
//       if (doctor) {
//         user = doctor;
//         role = "doctor";
//       }
//     }

//     // If user not found
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check password
//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return res
//         .status(401)
//         .json({ status: false, message: "Invalid Credentials, try again" });
//     }

//     // Generate token
//     const token = generateToken(user);

//     // Exclude sensitive fields
//     const { password: userPassword, appointments, ...rest } = user._doc;

//     return res.status(200).json({
//       status: true,
//       message: "Successfully logged in",
//       token,
//       data: { ...rest },
//       role,
//     });
//   } catch (error) {
//     console.error("Login error:", error.message);
//     return res.status(500).json({ status: false, message: "Failed to login" });
//   }
// };

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    let user = null;
    //check if user exist
    // let user = await User.findOne({ email });

    const patient = await User.findOne({ email, role: "patient" });
    if (patient) user = patient;

    const doctor = await User.findOne({ email, role: "doctor" });
    if (doctor) user = doctor;

    const admin = await User.findOne({ email, role: "admin" });
    if (admin) user = admin;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(404)
        .json({ status: false, message: "Invalid Credentials, try again" });
    }

    // get token
    const token = generateToken(user);
    const { password: userPassword, role, appointments, ...rest } = user._doc;
    res.status(200).json({
      status: true,
      message: "Successfully login",
      token,
      data: { ...rest },
      role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to login" });
  }
};
