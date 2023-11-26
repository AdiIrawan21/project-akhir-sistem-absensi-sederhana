const pool = require("../models/db")

// ambil data dari database
const ambilData = async () => {
    // Membuka koneksi ke database menggunakan pool connection
    const connection = await pool.connect();
    // Membuat kueri SQL untuk mengambil semua data dari tabel contacts
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

  module.exports = {ambilData};