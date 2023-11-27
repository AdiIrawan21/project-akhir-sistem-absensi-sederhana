const pool = require("../models/db")

// Fungsi untuk ambil data dari database
const ambilData = async () => {
    // Membuka koneksi ke database menggunakan pool connection
    const connection = await pool.connect();
    // Membuat kueri SQL untuk mengambil semua data dari tabel pegawai
    const query = `SELECT * FROM pegawai`;
    // Menjalankan kueri SQL untuk mengambil data
    const results = await connection.query(query);
    // Menutup koneksi ke database
    connection.release();
    // Mengambil hasil kueri (data contact) dari baris hasil
    const employees = results.rows;
    // Mengembalikan data contact
    return employees;
  };

// Fungsi untuk Cek ID  pegawai
const cekID = async (id_pegawai) => {
  const connection = await pool.connect();

  try {
    // Mengecek apakah id_pegawai sudah terdaftar
    const cekDuplikat = await connection.query('SELECT COUNT(*) FROM pegawai WHERE id_pegawai = $1', [id_pegawai]);

    if (cekDuplikat.rows[0].count === 0) {
      // Jika tidak ada duplikat, mengembalikan null
      return null;
    }

    // Mengambil data pegawai berdasarkan id_pegawai
    const result = await connection.query('SELECT * FROM pegawai WHERE id_pegawai = $1', [id_pegawai]);

    // Mengembalikan data pegawai
    return result.rows[0];
  } finally {
    connection.release();
  }
};



// Fungsi untuk Cek username pegawai
const cekUsername = async (username) => {
  const connection = await pool.connect();
  try {
    const result = await connection.query('SELECT COUNT(*) FROM pegawai WHERE username = $1', [username]);
    return result.rows[0].count > 0;
  } finally {
    connection.release();
  }
};
// Fungsi untuk Cek password pegawai 
const cekPassword = async (password) => {
  const connection = await pool.connect();
  try {
    const result = await connection.query('SELECT COUNT(*) FROM pegawai WHERE password = $1', [password]);
    return result.rows[0].count > 0;
  } finally {
    connection.release();
  }
};

// Fungsi validasi untuk cekUsername di proses Update
// Validasi keunikan username (memperhitungkan ID pegawai tertentu)
const cekUsernameUnique = async (id_pegawai, username) => {
  const connection = await pool.connect();
  try {
    // Validasi username tidak boleh duplikat, kecuali untuk pegawai dengan id_pegawai tertentu
    const result = await connection.query('SELECT COUNT(*) FROM pegawai WHERE username = $1 AND id_pegawai <> $2', [username, id_pegawai]);
    return result.rows[0].count === 0;
  } finally {
    connection.release();
  }
};

// Validasi keunikan password (memperhitungkan ID pegawai tertentu)
const cekPasswordUnique = async (id_pegawai, password) => {
  const connection = await pool.connect();
  try {
    // Validasi password tidak boleh duplikat, kecuali untuk pegawai dengan id_pegawai tertentu
    const result = await connection.query('SELECT COUNT(*) FROM pegawai WHERE password = $1 AND id_pegawai <> $2', [password, id_pegawai]);
    return result.rows[0].count === 0;
  } finally {
    connection.release();
  }
};

// Fungsi untuk tambah data pegawai
const tambahData = async (id_pegawai, username, password, nama, jabatan) => {
  // Membuka koneksi ke database menggunakan pool connection
  const connection = await pool.connect();
  // Membuat kueri SQL untuk menambahkan data ke tabel pegawai
  const query = 'INSERT INTO pegawai (id_pegawai, username, password, nama, jabatan) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  // Menyusun nilai-nilai parameter untuk diikuti pada placeholder kueri SQL
  const values = [id_pegawai, username, password, nama, jabatan];
  // Menjalankan kueri SQL dengan nilai-nilai yang telah disusun
  const result = await connection.query(query, values);
  // Menutup koneksi ke database
  connection.release();
  // Mengembalikan data yang baru ditambahkan dari hasil kueri
  return result.rows[0];
  
};

// Fungsi untuk update pegawai
const updateData = async (id_pegawai, username, password, nama, jabatan) => {
  const connection = await pool.connect();

  try {
    // Membuat kueri SQL untuk memperbarui data pegawai
    const query = 'UPDATE pegawai SET username = $2, password = $3, nama = $4, jabatan = $5 WHERE id_pegawai = $1 RETURNING *';

    // Menyusun nilai-nilai parameter untuk diikuti pada placeholder kueri SQL
    const values = [id_pegawai, username, password, nama, jabatan];

    // Menjalankan kueri SQL dengan nilai-nilai yang telah disusun
    const result = await connection.query(query, values);

    // Memeriksa apakah data berhasil diupdate
    if (result.rows.length > 0) {
      // Mengembalikan data yang baru diupdate dari hasil kueri
      return result.rows[0];
    } else {
      // Jika tidak ada data yang diupdate, mungkin ID pegawai tidak ditemukan
      throw new Error('Data Pegawai tidak ditemukan.');
    }
  } finally {
    connection.release();
  }
};

// Fungsi untuk delete data pegawai
const hapusData =  async (id_pegawai) => {
  const connection = await pool.connect();
  try {
    // Melakukan kueri delete data dengan kondisi where id_pegawai
    const query = 'DELETE FROM pegawai WHERE id_pegawai = $1 RETURNING *';
    // Menjalankan kueri SQL untuk menghapus data
    const result = await connection.query(query, [id_pegawai]);
    // Mengembalikan data yang baru ditambahkan dari hasil kueri
    return result.rows[0];
  } finally {
     // Menutup koneksi ke database
    connection.release();
  }
}

  module.exports = {ambilData, cekID, cekPassword, cekUsername,cekUsernameUnique,cekPasswordUnique, tambahData, updateData, hapusData};