import logger from '#config/logger.js'
 
 
import {db} from '#config/database.js'
import {users} from '#models/user.model.js'
 

export const getAllUsers = async()=>{
    return await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
    }).from(users)

     
    try {
        
    } catch (e) {
        logger.error('Error getting users' , e)
        throw error
    }
}