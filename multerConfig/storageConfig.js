const multer=require('multer'); 


const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `image-${Date.now()}.${file.originalname}`)
      }
}); 


// filter image file

const filefilter = (req,file,callback)=>{
  if(file.mimetype === "image/png" ||file.mimetype === "image/jpg" ||file.mimetype === "image/jpeg" ||file.mimetype === "image/tiff"  ){
      callback(null,true)
  }else{
      callback(null,false)
      return callback(new Error("Only JPEG , PNG  and JPG files are allowed"))
  }
}
var upload = multer({ storage: storage, fileFilter:filefilter});
 
module.exports = upload;