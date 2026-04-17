const mongoose = require('mongoose');
const mahasiswaSchema = new mongoose.Schema({
    Nama: {
        type: String,
        required: true
    },
    Nim: {
        type: String,
        required: true
    },
    Jurusan: {
        type: String,
        required: true
    },
    Angkatan: {
        type: String,
        required: true
    },
    Alamat: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('mahasiswa', mahasiswaSchema);