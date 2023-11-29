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

  const simpanDataKehadiran = async (kode, jabatan, nama, tanggal, keterangan, jam_masuk, jam_keluar) => {
    const connection = await pool.connect();
  
    try {
      // Query untuk menyimpan data kehadiran
      const query = `
        INSERT INTO kehadiran (kode, jabatan, nama, tanggal, keterangan, jam_masuk, jam_keluar)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
  
      // Eksekusi query dengan parameter yang sesuai
      await connection.query(query, [kode, jabatan, nama, tanggal, keterangan, jam_masuk, jam_keluar]);
    } finally {
      connection.release();
    }
  };
  

  module.exports = {loadData, simpanDataKehadiran};