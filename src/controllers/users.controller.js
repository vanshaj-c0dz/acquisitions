import { getAllUsers } from "#services/users.services.js"
import logger from '#config/logger.js'

export const fetchAllUsers = async (req , res , next) => {
    try {
        logger.info('Getting users...')

        const allUsers = await getAllUsers()

        res.json({
            message: 'Successfully retrieved users',
            users: allUsers,
            count: allUsers.length,
        })
    } catch (e) {
        logger.error(e)
        next(e)
    }
}