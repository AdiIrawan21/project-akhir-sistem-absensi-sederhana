const pool = require("../models/db")

const loadData = async () => {
    // Membuka koneksi ke database menggunakan pool connection
    const connection = await pool.connect();
    // Membuat kueri SQL untuk mengambil semua data dari tabel pegawai
    const query = `SELECT * FROM kehadiran`;
    // Menjalankan kueri SQL untuk mengambil data
    const results = await connection.query(query);
    // Menutup koneksi ke database
    connection.release();
    // Mengambil hasil kueri (data contact) dari baris hasil
    const kehadiran = results.rows;
    // Mengembalikan data contact
    return kehadiran;
  };

  module.exports = {loadData};