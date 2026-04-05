import { User } from "../models/user.model.js";

const registerUser = async(req,res)=>{
    try {
        const {fullName, email, phone, password, confirmPassword, stream, program} = req.body;

        // Validate all required fields
        if(!fullName || !email || !phone || !password || !stream || !program){
            return res.status(400).json({message:"All fields are required!"})
        }

        // Check if passwords match
        if(password !== confirmPassword){
            return res.status(400).json({message:"Passwords do not match!"})
        }

        // Validate password length
        if(password.length < 8){
            return res.status(400).json({message:"Password must be at least 8 characters long!"})
        }

        // Check if user exists
        const exists = await User.findOne({email: email.toLowerCase()})

        if(exists){
            return res.status(400).json({message:"User already exists!"})
        }

        // Create user
        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            phone,
            password,
            stream,
            program,
            loggedIn:false,
        });
        
        res.status(201).json({
            message:"Applicant registered successfully!",
            user:{
                id:user._id,
                fullName:user.fullName,
                email:user.email,
                phone:user.phone,
                stream:user.stream,
                program:user.program,
                role:user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({message:"Internal server error!", error: error.message})
    }
}

const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        user.loggedIn = true;
        await user.save();

        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                stream: user.stream,
                program: user.program,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error!", error: error.message });
    }
}

export{registerUser, loginUser}