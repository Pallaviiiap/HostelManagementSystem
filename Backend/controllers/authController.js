const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
    const { name, email, password, role } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, hashedPassword, role || 'student'], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "User registered successfully" });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err || results.length === 0)
            return res.status(400).json({ message: "User not found" });

        const user = results[0];

        const storedPassword = user.password || '';
        const looksLikeBcrypt =
            storedPassword.startsWith('$2a$') ||
            storedPassword.startsWith('$2b$') ||
            storedPassword.startsWith('$2y$');

        // bcryptjs may not accept $2y$ prefix from some systems; normalize to $2a$
        const normalizedHash = storedPassword.startsWith('$2y$')
            ? `$2a$${storedPassword.slice(4)}`
            : storedPassword;

        let valid = false;

        if (looksLikeBcrypt) {
            valid = bcrypt.compareSync(password, normalizedHash);
        } else {
            // Legacy support: if old users were inserted with plain text passwords,
            // allow login once and migrate them to bcrypt.
            valid = password === storedPassword;
            if (valid) {
                const newHash = bcrypt.hashSync(password, 8);
                db.query(
                    "UPDATE users SET password = ? WHERE id = ?",
                    [newHash, user.id],
                    () => {}
                );
            }
        }

        if (!valid) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

        res.json({ token, role: user.role });
    });
};