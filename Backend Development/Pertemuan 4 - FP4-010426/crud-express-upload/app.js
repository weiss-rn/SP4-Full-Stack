const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const conn = require('./db');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Minimal improvement: Prepend timestamp to filename to avoid overwrites
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    conn.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query failed');
        }
        res.render('index', { users: results });
    });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/upload', upload.single('file'), (req, res) => {
    const { name, email } = req.body;
    const filepath = req.file ? req.file.path.replace(/\\/g, '/') : null; // Normalize slashes for db

    if (!filepath) {
        return res.status(400).send('File is required.');
    }

    conn.query('INSERT INTO users (name, email, filepath) VALUES (?, ?, ?)', [name, email, filepath], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to insert record');
        }
        res.redirect('/');
    });
});

app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    conn.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query failed');
        }
        if (results.length === 0) return res.status(404).send('User not found');
        res.render('edit', { user: results[0] });
    });
});

app.post('/edit/:id', upload.single('file'), (req, res) => {
    const { name, email } = req.body;
    const id = req.params.id;
    const newFilepath = req.file ? req.file.path.replace(/\\/g, '/') : null;

    conn.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to update record');
        }

        if (newFilepath) {
            conn.query('SELECT filepath FROM users WHERE id = ?', [id], (err, results) => {
                if (err) return console.error(err);
                const oldFilepath = results[0]?.filepath;

                if (oldFilepath && fs.existsSync(oldFilepath)) {
                    fs.unlink(oldFilepath, (err) => {
                        if (err) console.error('Failed to delete old image', err);
                    });
                }

                conn.query('UPDATE users SET filepath = ? WHERE id = ?', [newFilepath, id], (err) => {
                    if (err) console.error(err);
                    res.redirect('/');
                });
            });
        } else {
            res.redirect('/');
        }
    });
});

app.get('/delete/:id', (req, res) => {
    const id = req.params.id;

    conn.query('SELECT filepath FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database search failed');
        }
        const imagePath = results[0]?.filepath;

        if (imagePath && fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Failed to delete user image', err);
            });
        }

        conn.query('DELETE FROM users WHERE id = ?', [id], (err) => {
            if (err) console.error(err);
            res.redirect('/');
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
