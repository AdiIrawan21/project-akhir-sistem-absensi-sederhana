const pool = require("../models/db")
const { format, parseISO, addMinutes } = require('date-fns');

const loadData = async () => {
    // Membuka koneksi ke database menggunakan pool connection
    const connection = await pool.connect();
    // Membuat kueri SQL untuk mengambil semua data dari tabel pegawai
    const query = `SELECT id_kehadiran, kode, jabatan, nama, keterangan, TO_CHAR(tanggal, 'dd/mm/yyyy')AS tanggal_formatted, jam_masuk, jam_keluar, ROUND(EXTRACT(EPOCH FROM (jam_keluar - jam_masuk) / 3600)) AS total_jam FROM kehadiran`;
    // Menjalankan kueri SQL untuk mengambil data
    const results = await connection.query(query);
    // Menutup koneksi ke database
    connection.release();
    // Mengambil hasil kueri (data contact) dari baris hasil
    const kehadiran = results.rows;
    console.log(kehadiran)
    // Mengembalikan data contact
    return kehadiran;
  };

  // Function untuk simpanDataKehadiran di database dan dashboard admin
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

  // Function cek_id data kehadiran
const cek_id = async (id_kehadiran) => {
  const connection = await pool.connect();

  try {
    // Mengecek apakah id_pegawai sudah terdaftar
    const cekDuplikasi = await connection.query('SELECT COUNT(*) FROM kehadiran WHERE id_kehadiran = $1', [id_kehadiran]);

    if (cekDuplikasi.rows[0].count === 0) {
      // Jika tidak ada duplikat, mengembalikan null
      return null;
    }

    // Mengambil data pegawai berdasarkan id_pegawai
    const result = await connection.query('SELECT * FROM kehadiran WHERE id_kehadiran = $1', [id_kehadiran]);

    // Mengembalikan data pegawai
    return result.rows[0];
  } finally {
    connection.release();
  }
};

  // Function deletData kehadiran
  const deleteData = async (id_kehadiran) =>{
    const connection = await pool.connect();
    try {
      // Melakukan kueri delete data dengan kondisi where id_pegawai
      const query = 'DELETE FROM kehadiran WHERE id_kehadiran = $1 RETURNING *';
      // Menjalankan kueri SQL untuk menghapus data
      const result = await connection.query(query, [id_kehadiran]);
      // Mengembalikan data yang baru ditambahkan dari hasil kueri
      return result.rows[0];
    } finally {
       // Menutup koneksi ke database
      connection.release();
    }
  }
  

  


  module.exports = {loadData, simpanDataKehadiran, cek_id, deleteData};