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

// Fungsi untuk ambil data berdasarkan ID
const ambilDataByID = async (id_pegawai)=>{
  const connection = await pool.connect();

  const query = "SELECT * FROM pegawai WHERE id_admin = $1";
  const result = await connection.query(query, [id_pegawai]);
  connection.release();

  return result.rows[0];
}

// fungsi cekID pegawai
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

// Fungsi untuk cekPassword yang duplikat
const duplikatPasswordCheck = async (password)=>{
  const employees = await ambilData();
  return employees.find((pegawai)=>pegawai.password === password);
}

// Fungsi untuk tambah data pegawai
const tambahData = async (id_pegawai,username, password, nama, jabatan) => {
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
const updateData = async (newData) => {
  const connection = await pool.connect();

  const query = `UPDATE pegawai SET password = $2, nama = $3, jabatan = $4 WHERE id_pegawai = $1`;
  await connection.query(query, [
    newData.id_pegawai,
    newData.password,
    newData.nama,
    newData.jabatan
  ]);
}

// Fungsi search pegawai 
const searchPegawai = async (id_pegawai) => {
  const employees = await ambilData();
  const employee = employees.find((pegawai)=>pegawai.id_pegawai.toLowerCase() === id_pegawai.toLowerCase());
  return employee;
}

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

module.exports = {ambilData, ambilDataByID, duplikatPasswordCheck, cekID, searchPegawai, updateData, tambahData,hapusData};