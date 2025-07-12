import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const createUser = async ({ email, hashedPassword, firstName, lastName }) => {
  const [result] = await pool.query(
    'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
    [email, hashedPassword, firstName, lastName]
  );
  return result.insertId;
};