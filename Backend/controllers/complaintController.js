const db = require('../config/db');

exports.createComplaint = (req, res) => {
    const { category, description, priority } = req.body;
    const userId = req.user.id;

    const sql = "INSERT INTO complaints (user_id, category, description, priority, status) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [userId, category, description, priority, 'pending'], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Complaint submitted" });
    });
};

exports.getComplaints = (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
    }

    const sql = `
        SELECT c.*, u.name AS studentName, u.email AS studentEmail
        FROM complaints c
        JOIN users u ON u.id = c.user_id
        ORDER BY c.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(results);
    });
};

exports.getMyComplaints = (req, res) => {
    const userId = req.user.id;

    db.query(
        "SELECT * FROM complaints WHERE user_id = ? ORDER BY id DESC",
        [userId],
        (err, results) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json(results);
        }
    );
};

exports.updateComplaintStatus = (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
    }

    const { status } = req.body;
    const complaintId = req.params.id;

    // Align with DB enum values: 'pending', 'in-progress', 'resolved'
    const incoming = String(status).toLowerCase();
    const normalized =
        incoming === 'inprogress' || incoming === 'in progress'
            ? 'in-progress'
            : incoming;

    const allowed = new Set(['pending', 'in-progress', 'resolved']);
    if (!status || !allowed.has(normalized)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    db.query(
        "UPDATE complaints SET status = ? WHERE id = ?",
        [normalized, complaintId],
        (err, result) => {
            if (err) return res.status(400).json({ error: err.message });
            if (!result || result.affectedRows === 0) {
                return res.status(404).json({ message: "Complaint not found" });
            }
            res.json({ message: "Status updated" });
        }
    );
};