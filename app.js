/* ========================================== import module ======================================= */
const express = require("express"); // import module express.js
const app = express(); // membuat aplikasi express
const expressLayouts = require("express-ejs-layouts"); // import module express-ejs-layouts
//const paginate = require("express-paginate");
const host = "localhost";
const port = 3000; // konfigurasi port
const { body, check, validationResult } = require("express-validator"); // import module express validator, untuk melakukan unique pada data nama
const cookieParser = require("cookie-parser"); // import module cookie-parser
const flash = require("connect-flash"); // import module connect-flash
const session = require("express-session"); // import module express-session
const {ambilData, cekID,cekUsername, cekPassword, tambahData, updateData, hapusData} = require("./models/pegawaiModels"); // import module models
const {loadData, simpanDataKehadiran} = require("./models/kehadiranModels");
/* ============================================ END =============================================== */

app.set("view engine", "ejs"); //informasi menggunakan ejs
app.use(expressLayouts); // Mengaktifkan fitur layout
app.use(express.static("public")); // untuk memanggil folder/file css, javascript.
app.use(express.urlencoded({ extended: true })); //menggunakan middleware express.urlencoded().
app.use(express.json()) // req.body
app.use(flash()); // mengaktifkan fitur flash

// config flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Route untuk halaman home-dashboard
app.get('/dashboard', (req,res)=>{
    res.render('dashboard/home-dashboard', {
        title: "Aplikasi Absensi",
        layout:'dashboard/templates/main-layout'
    })
})

// ================================================= Start Route Folder Admin Dashboard ====================================

// Route ke table list pegawai
app.get('/dashboard/admin/', async (req, res)=>{
        const employees = await ambilData();

        res.render("dashboard/admin/index-admin", {
          title: "Page Pegawai",
          layout: "dashboard/templates/main-layout",
          employees,
          msg: req.flash("msg"),
        })
})

// Route add dan proses table pegawai
app.get('/dashboard/admin/tambah', async (req, res) => {
    res.render('dashboard/admin/tambah-admin', {
        title: "Page Tambah Pegawai",
        layout: "dashboard/templates/main-layout"
    })
})
// Proses add data
app.post(
    '/dashboard/admin',
    [
      body('id_pegawai').custom(async (value) => {
        const cek_id = await cekID(value);
  
        if (cek_id) {
          throw new Error('ID Pegawai sudah terdaftar');
        } else {
          return true;
        }
      }),
      body('username').custom(async (value) => {
        const cekUser = await cekUsername(value);
  
        if (cekUser) {
          throw new Error('Username sudah terdaftar');
        } else {
          return true;
        }
      }),
      body('password').custom(async (value) => {
        const cekPWD = await cekPassword(value);
      
        if (cekPWD) {
          throw new Error('Password sudah terdaftar');
        } else {
          return true;
        }
      }),
      
    ],
    async (req, res) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        res.render('dashboard/admin/tambah-admin', {
          title: 'Page Tambah Pegawai',
          layout: 'dashboard/templates/main-layout',
          errors: errors.array(),
        });
      } else {
        try {
            console.log('Data yang dikirim:', req.body);
          await tambahData(req.body.id_pegawai, req.body.username, req.body.password, req.body.nama, req.body.jabatan); // menggunakan fungsi tambahData dari function.js
          req.flash('msg', 'Data Pegawai Baru Berhasil Ditambahkan!');
          res.redirect('/dashboard/admin/');
        } catch (err) {
          console.error(err.message);
          req.flash('msg', err.message);
          res.redirect('/dashboard/admin/');
        }
      }
    }
  );

// Route untuk detail Pegawai
app.get('/dashboard/admin/:id_pegawai', async (req, res) =>{
  try {
    // Menemukan data berdasarkan id_pegawai untuk ditampilkan dalam halaman detail
    const employee = await cekID(req.params.id_pegawai);
    
    // Menampilkan halaman detail-contact dengan data yang ditemukan
    res.render('dashboard/admin/detail-admin', {
      title: 'Page Detail Pegawai',
      layout: 'dashboard/templates/main-layout',
      employee,
    });
  } catch (err) {
    console.error(err.message);

    // Menampilkan pesan flash jika terjadi kesalahan
    req.flash('msg', 'Terjadi kesalahan saat mengambil data untuk detail.');

    // Redirect ke halaman contact
    res.redirect('/dashboard/admin');
  }
})

// Route untuk update dan proses data Pegawai
app.get('/dashboard/admin/update/:id_pegawai', async (req,  res)=>{
  try {
    // Menemukan data berdasarkan id_pegawai untuk diupdate
    const employee = await cekID(req.params.id_pegawai);
    if (employee) {
      res.render('dashboard/admin/update-admin', {
        title: 'Page Update Pegawai',
        layout: 'dashboard/templates/main-layout',
        employee,
        oldID: req.params.id_pegawai,
      });
    } else {
      // Jika data pegawai tidak ditemukan, redirect ke halaman index pegawai
      req.flash('msg', 'Data kontak tidak ditemukan.');
      res.redirect('/dashboard/admin');
    }
  } catch (err) {
    console.error(err.message);

    // Menampilkan pesan flash jika terjadi kesalahan
    req.flash('msg', 'Terjadi kesalahan saat mengambil data untuk detail.');

    // Redirect ke halaman contact
    res.redirect('/dashboard/admin');
  }
})

// Proses Update
// Route untuk proses update data pegawai
// app.post('/dashboard/admin/update', async (req, res) => {
//   const { id_pegawai, username, password, nama, jabatan } = req.body;
//   const employee = await cekID(req.params.id_pegawai);
//   console.log(employee);
//   try {
//     // console.log('Data dari form:', req.body);
//     // Update data tanpa validasi username dan password
//     await updateData(id_pegawai, username, password, nama, jabatan);

//     // Handle berhasil update data
//     req.flash('msg', 'Data Pegawai berhasil diupdate!');
//     res.redirect('/dashboard/admin');
//   } catch (error) {
//     // Handle kesalahan validasi atau update data
//     console.error(error.message);
//     req.flash('msg', error.message);
//     res.redirect('/dashboard/admin');
//   }
// });




// Route untuk delete table pegawai
app.get('/dashboard/admin/delete/:id_pegawai', async (req, res) => {
  try {
    // Memastikan data ditemukan sebelum dihapus
    const dataPegawai = await cekID(req.params.id_pegawai);

    if (!dataPegawai) {
      // Jika data tidak ditemukan, tampilkan pesan atau lakukan penanganan khusus
      req.flash('msg', 'Data Pegawai tidak ditemukan.');
      res.redirect('/dashboard/admin');
      return;
    }

    // Menghapus data
    await hapusData(req.params.id_pegawai);

    // Menampilkan pesan flash
    req.flash('msg', 'Data Pegawai Berhasil Dihapus!');

    // Redirect ke halaman dashboard index-admin
    res.redirect('/dashboard/admin');
  } catch (err) {
    console.error(err.message);

    // Menampilkan pesan flash jika terjadi kesalahan
    req.flash('msg', 'Terjadi kesalahan saat menghapus data.');

    // Redirect ke halaman dashboard admin
    res.redirect('/dashboard/admin');
  }
});



// ================================================= Start Route Folder Kehadiran Dashboard ====================================
// Route utama halaman absensi
app.get('/', async(req, res) =>{
  res.render('dashboard/kehadiran/form-kehadiran', {
    title: "Page Form Absensi",
    layout: "layouts/core-layouts",
  })
})

// Route ke detail kehadiran
app.get('/dashboard/kehadiran', async (req,res)=>{
  const kehadiran = await loadData();
    res.render('dashboard/kehadiran/index-kehadiran', {
        title: "Page Kehadiran",
        layout: "dashboard/templates/main-layout",
        kehadiran,
    })
})


// Route untuk menangani pengiriman data formulir absensi
app.post('/dashboard/kehadiran', async (req, res) => {
  const { kode, jabatan, nama, tanggal, keterangan, jam_masuk, jam_keluar } = req.body;

  try {
      // Simpan data kehadiran
      await simpanDataKehadiran(kode, jabatan, nama, tanggal, keterangan, jam_masuk, jam_keluar);

      // Set pesan sukses menggunakan req.flash
      req.flash('msg', 'Terimakasih sudah mengisi absen hari ini!');

      // Redirect ke halaman form absensi
      res.redirect('/');
  } catch (err) {
      console.error(err.message);

      // Set pesan error menggunakan req.flash
      req.flash('error', 'Terjadi kesalahan saat menyimpan data absensi.');

      // Redirect ke halaman form absensi
      res.redirect('/');
  }
});

// Route ke table rekap absensi
app.get('/dashboard/rekap', (req,res) => {
    res.render('dashboard/rekap/index-rekap', {
        title: "Page Rekap",
        layout: "dashboard/templates/main-layout"
    })
})

//===============================================================================================================
// route error handling jika tidak sesuai, maka akan menampilkan page not found
app.use("/", (req, res) => {
    res.status(404);
    res.send("Page not found : 404");
  });
  
  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`); // menampilkan pesan bahwa port sedang berjalan
  });