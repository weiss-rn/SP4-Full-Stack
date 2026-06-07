import pool from './database.js';

export async function getUsers() {
    try {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
        return {
            success: true,
            data: rows,
            message: 'Users fetched successfully'
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

export async function getUserById(id) {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return {
                success: false,
                data: null,
                message: 'User not found'
            };
        }
        return {
            success: true,
            data: rows[0],
            message: 'User fetched successfully'
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

export async function createUser(name, email) {
    try {
        if (!name || !email) {
            return {
                success: false,
                data: null,
                message: 'Name and email are required'
            };
        }
        const [result] = await pool.query(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [name, email]
        );
        return {
            success: true,
            data: { id: result.insertId, name, email },
            message: 'User created successfully'
        };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function updateUser(id, name, email) {
    try {
        const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, id]
        );
        if (result.affectedRows === 0) {
            return {
                success: false,
                data: null,
                message: 'User not found'
            };
        }
        return {
            success: true,
            data: { id: Number(id), name, email },
            message: 'User updated successfully'
        };
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function deleteUser(id) {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return {
                success: false,
                data: null,
                message: 'User not found'
            };
        }
        return {
            success: true,
            data: { id: Number(id) },
            message: 'User deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}
