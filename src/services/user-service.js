const { StatusCodes } = require("http-status-codes")
const {userRepo} = require("../repositories")
const bcrypt = require('bcrypt')
const AppError = require("../utils/errors/app-error")
const {Auth} = require("../utils/common")
const {RoleRepo} = require("../repositories")
const usercreateRepo = new userRepo()
const roleRepo = new RoleRepo()
const {ENUMS} = require("../utils/common")
const {ADMIN,CUSTOMER,FLIGHT_COMPANY} = ENUMS.Roles
async function Createuser(data){
    try {
        const user = await usercreateRepo.create(data) 
        const role = await roleRepo.getRoleByname(CUSTOMER)
        // console.log(role);
        user.addRole(role)
        return user
    } catch (error) {
        // console.log(error.name);
        if(error.name == "SequelizeValidationError"){
            let Explanation = [];
            error.errors.forEach(function(error) {
                Explanation.push(error.message);
            })
            throw new AppError(Explanation,StatusCodes.BAD_REQUEST)
        }
        // console.log(error);  
        throw new AppError("can't create a user object", StatusCodes.INTERNAL_SERVER_ERROR)
    }

}

async function signin(data) {
  try {
    const user = await usercreateRepo.getuserByEmail(data.email)
    if(!user){
        throw new AppError("user not found for the given email",StatusCodes.NOT_FOUND)
    }

    const passwordmatch = Auth.checkPassword(data.password,user.password)
    if(!passwordmatch){
        throw new AppError("invalid password",StatusCodes.UNAUTHORIZED)
    }

    const jwt = Auth.createToken({id:user.id,email:user.email})
    return jwt
  } catch (error) {
    if(error instanceof AppError) throw error;
    throw new AppError('something went wrong', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

async function isAuthenticated(token){
    try {
        if(!token){
            throw new AppError("token not found",StatusCodes.UNAUTHORIZED)
        }
        const response = Auth.verifyjwt(token)
        const user = await usercreateRepo.get(response.id)
        if(!user){
            throw new AppError("user not found",StatusCodes.NOT_FOUND)
        }
        return user.id
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name === 'jsonWebTokenError'){
            throw new AppError("invalid token",StatusCodes.UNAUTHORIZED)
        }
    }
}

async function addRoletouser(data){
    try {
        const user = await usercreateRepo.get(data.id)
        if(!user){
            throw new AppError("user not found for the given id ",StatusCodes.NOT_FOUND)
        }
        const role = await roleRepo.getRoleByname(data.role)
        if(!role){
            throw new AppError("role not found for the given name ",StatusCodes.NOT_FOUND)
        }
        user.addRole(role)
        return user
    } catch (error) {
        if(error instanceof AppError) throw error;
        throw new AppError('something went wrong', StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
async function isAdmin(id){
    try {
        const user = await usercreateRepo.get(id)
        if(!user){
            throw new AppError("user not found for the given id ",StatusCodes.NOT_FOUND)
        }
        const adminrole = await roleRepo.getRoleByname(ADMIN)
        if(!adminrole){
            throw new AppError("role not found for the given name ",StatusCodes.NOT_FOUND)
        }
        user.hasRole(adminrole)
        return true
    } catch (error) {
        console.log(error);
        if(error instanceof AppError) throw error;
        throw new AppError('something went wrong', StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
module.exports = {
    Createuser,
    signin,
    isAuthenticated,
    addRoletouser,
    isAdmin
}
