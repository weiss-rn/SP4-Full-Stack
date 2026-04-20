const Mahasiswa = require('../models/mahasiswa');

// GET all mahasiswa
exports.getAll = async (req, res) => {
  try {
    const mahasiswa = await Mahasiswa.find();
    res.render('index', { mahasiswa, message: req.flash() });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET add form
exports.addForm = (req, res) => {
  res.render('add');
};

// POST create mahasiswa
exports.create = async (req, res) => {
  try {
    const { Nama, Nim, Jurusan, Angkatan, Alamat } = req.body;
    
    const mahasiswa = new Mahasiswa({
      Nama,
      Nim,
      Jurusan,
      Angkatan,
      Alamat
    });

    await mahasiswa.save();
    req.flash('success', 'Data mahasiswa berhasil ditambahkan');
    res.redirect('/mahasiswa');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// GET edit form
exports.editForm = async (req, res) => {
  try {
    const mahasiswa = await Mahasiswa.findById(req.params.id);
    res.render('edit', { mahasiswa });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// POST update mahasiswa
exports.update = async (req, res) => {
  try {
    const { Nama, Nim, Jurusan, Angkatan, Alamat } = req.body;
    
    await Mahasiswa.findByIdAndUpdate(req.params.id, {
      Nama,
      Nim,
      Jurusan,
      Angkatan,
      Alamat
    });

    req.flash('success', 'Data mahasiswa berhasil diubah');
    res.redirect('/mahasiswa');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// DELETE mahasiswa
exports.delete = async (req, res) => {
  try {
    await Mahasiswa.findByIdAndDelete(req.params.id);
    req.flash('success', 'Data mahasiswa berhasil dihapus');
    res.redirect('/mahasiswa');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
