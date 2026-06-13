const users = require("../Models/usersSchema");
const fs=require("node:fs");
const csv=require("fast-csv");
const BASE_URL=process.env.BASE_URL;
//register user
const registerUser = async (req, res) => {
  try {
    const file = req.file;
    const { FirstName, LastName, Email, Mobile, Gender, Status, Location } =req.body;
    if (!FirstName ||!LastName ||!Email ||!Gender ||!Status ||!Location ||!Mobile ||!file) {
      res.status(401).json({ message: "All Fields Are Required" });
    } else {
      let existingUser = await users.findOne({ Email });

      if (existingUser) {
        res.status(401).json({ message: "User already exists" });
      } else {
        let user = new users({FirstName: FirstName,LastName: LastName,Email: Email,Mobile: Mobile,Gender: Gender,Status: Status,Location: Location,Profile: file,});
        await user.save();
        res.status(200).json({ message: "user created successfully", data: user });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get all user list
const getAllUser = async (req, res) => {
  try {
    let { search, gender,status,sort ,page} = req.query;
    const ITEM_PER_PAGE=4; 
    search = search ? search.trim() : '';
     page=page || 1; 
     const skip = (page - 1) * ITEM_PER_PAGE;
     
    let query = {
      FirstName: { $regex: new RegExp(search, 'i') },
    
    };
    
    if(gender!=="All"){
      query.Gender=gender;
    }
    if(status!=="All"){
      query.Status=status;
    }

    const Sort={};
    
      if(sort==="New"){
        Sort.createdAt=-1;
      }else{
        Sort.createdAt=1;
      }
      const totalCount = await users.countDocuments(query);

      const totalPages = Math.ceil(totalCount / ITEM_PER_PAGE);
    

    const AllUsers = await users.find(query).sort(Sort).skip(skip).limit(ITEM_PER_PAGE);
  

    return res.status(200).json({ message: "Users List", data: AllUsers,page,totalPages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
  
};

// get details of single user using id

const getSingleUser = async (req, res) => {
  try {
    let { id } = req.params;
    
    if (!id) {
      res.status(400).json({ message: "Enter User Id" });
    } else {
      let userDetails = await users.find({ _id: id });
      if (userDetails.length===0) {
        res.status(400).json({ message: "User Does Not Exists"});
      } else {
        res.status(200).json({ message: "User Details", data: userDetails });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// update status of user

const updateStatus=async(req,res)=>{
  const {id}=req.params; 
  const {status}=req.body; 
  try {
       const user=await users.findOneAndUpdate({_id:id},{Status:status,updatedAt: new Date()},{new:true}); 
       res.status(200).json({message:"User Updated Successfully",data:user});

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

//delete User
const deleteUser= async(req,res)=>{
 try {
    let { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Enter User Id" });
    } else{
      const deletedUser=await users.findByIdAndDelete({_id:id}); 
      if(deletedUser){
        res.status(200).json({message:"User Deleted SuccessFully",data:deletedUser})
      }
      else{
        res.status(400).json({message:"Error While Deleting User!"})
      }

    }
 } catch (error) {
  console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
 }
}


const userExport = async (req, res) => {
  try {
    let { search, gender, status, sort } = req.query;
    search = search ? search.trim() : "";

    let query = {
      FirstName: { $regex: new RegExp(search, "i") },
    };

    if (gender !== "All") {
      query.Gender = gender;
    }

    if (status !== "All") {
      query.Status = status;
    }

    const Sort = {};
    Sort.createdAt = sort === "New" ? -1 : 1;

    const usersdata = await users.find(query).sort(Sort);

    // CSV headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users.csv"
    );

    const csvStream = csv.format({ headers: true });

    // pipe directly to browser
    csvStream.pipe(res);

    usersdata.forEach((user) => {
      csvStream.write({
        FirstName: user.FirstName || "-",
        LastName: user.LastName || "-",
        Email: user.Email || "-",
        Phone: user.Mobile || "-",
        Gender: user.Gender || "-",
        Status: user.Status || "-",
        Profile: user.Profile?.path || "-",
        Location: user.Location || "-",
        DateCreated: user.createdAt || "-",
        DateUpdated: user.updatedAt || "-",
      });
    });

    csvStream.end();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};


const editUser=async (req,res)=>{
    const { id } = req.params;
    const { FirstName, LastName, Email, Mobile, Gender, Location, Status, Profile } = req.body;
    const file = req.file ? req.file : Profile.filename
    try {
          const updatedUser = await users.findByIdAndUpdate({ _id: id }, {FirstName, LastName, Email, Mobile, Gender, Location, Status, Profile:file}, {new: true});
          updatedUser.updatedAt=new Date();
        await updatedUser.save();
        res.status(200).json({message:"user updated successfully",data:updatedUser});
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  
}

module.exports = {registerUser,getAllUser,getSingleUser,deleteUser,updateStatus,userExport,editUser};
