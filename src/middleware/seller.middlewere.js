
export function sellerAuth(req,res,next){
    if(req.user.role !== "seller"){
        return res.status(401).json({
            success:false,
            message:"Unauthorised!"
        })
    }
    next()
}