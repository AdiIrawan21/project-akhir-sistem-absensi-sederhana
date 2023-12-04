/* ========================================== import module ======================================= */
const express = require("express"); // import module express.js
const app = express(); // membuat aplikasi express
const expressLayouts = require("express-ejs-layouts"); // import module express-ejs-layouts
//const paginate = require("express-paginate");
const host = "localhost";
const port = 3000; // konfigurasi port
const { body, validationResult } = require("express-validator"); // import module express validator, untuk melakukan unique pada data nama
const cookieParser = require("cookie-parser"); // import module cookie-parser
const flash = require("connect-flash"); // import module connect-flash
const session = require("express-session"); // import module express-session
const {ambilData, duplikatIDCheck, duplikatUsernameCheck, duplikatPasswordCheck, tambahData, searchPegawai, updateData, hapusData} = require("./models/pegawaiModels");
const {loadData, simpanDataKehadiran, cek_id, deleteData} = require("./models/kehadiranModels");
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
        const Id_duplicate = await duplikatIDCheck(value);
  
        if (Id_duplicate) {
          throw new Error('ID Pegawai sudah terdaftar');
        } else {
          return true;
        }
      }),

      body('username').custom(async (value) => {
        const cekUsername = await duplikatUsernameCheck(value);
  
        if (cekUsername) {
          throw new Error('Username sudah terdaftar');
        } else {
          return true;
        }
      }),
      body('password').custom(async (value) => {
        const cekPWD = await duplikatPasswordCheck(value);
      
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

          await tambahData(req.body.id_pegawai, req.body.username, req.body.password, req.body.nama, req.body.jabatan);
          req.flash('msg', 'Data Pegawai Baru Berhasil Ditambahkan!');
          res.redirect('/dashboard/admin/');
        } catch (err) {
          console.error(err.msg);
          req.flash('msg', "An error occured while adding data");
          res.status(500);
          res.redirect('/dashboard/admin/');
        }
      }
    }
  );

// Route untuk detail Pegawai
app.get('/dashboard/admin/:id_pegawai', async (req, res) =>{
  try {
    const pegawaiID = req.params.id_pegawai;
    const employees = await ambilData();
    const employee = employees.find((pegawai)=> pegawai.id_pegawai === pegawaiID);
    // Menemukan data berdasarkan id_pegawai untuk ditampilkan dalam halaman detail
    //const employee = await cekID(req.params.id_pegawai);
    
    // Menampilkan halaman detail-contact dengan data yang ditemukan
    res.render('dashboard/admin/detail-admin', {
      title: 'Page Detail Pegawai',
      layout: 'dashboard/templates/main-layout',
      employee,
    });
  } catch (err) {
    console.error(err.msg);

    // Menampilkan pesan flash jika terjadi kesalahan
    req.flash('msg', 'Terjadi kesalahan saat mengambil data untuk detail.');

    // Redirect ke halaman contact
    res.redirect('/dashboard/admin');
  }
})

// Route untuk update dan proses data Pegawai
app.get('/dashboard/admin/update/:id_pegawai', async (req, res) => {
  try {
    // Menemukan data berdasarkan id_pegawai untuk diupdate
    const employees = await searchPegawai(req.params.id_pegawai);

    if (!employees) {
      // Handle case when employee is not found
      req.flash('msg', 'Data Pegawai tidak ditemukan.');
      return res.redirect('dashboard/admin');
    }

    res.render('dashboard/admin/update-admin', {
      title: 'Page Update Pegawai',
      layout: 'dashboard/templates/main-layout',
      employees,
    });
  } catch (err) {
    console.error(err.msg);
    req.flash('msg', 'Terjadi kesalahan saat mengambil data untuk update.');
    res.redirect('/dashboard/admin');
  }
});

// Proses Update
app.post('/dashboard/admin/update', [
  body('password').custom(async (value) => {
    try {
      // Check for duplicate password
      const cekPassword = await duplikatPasswordCheck(value);
      if (cekPassword) {
        throw new Error('Password sudah terdaftar.');
      }
      return true;
    } catch (error) {
      console.error(error); // Tambahkan ini untuk melihat kesalahan
      throw new Error('Terjadi kesalahan saat memeriksa Password Pegawai.');
    }
  }),
],
async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('dashboard/admin/update-admin', {
        title: 'Page Update Pegawai',
        layout: 'dashboard/templates/main-layout',
        errors: errors.array(),
        employees: req.body,
      });
    }

    await updateData(req.body);
    req.flash('msg', 'Data Pegawai berhasil di update.');
    res.redirect('/dashboard/admin');
  } catch (err) {
    console.error(err.msg);
    req.flash('msg', 'Terjadi kesalahan saat mengupdate data Pegawai.');
    res.redirect('/dashboard/admin');
  }
});

// Route untuk delete table pegawai
app.get('/dashboard/admin/delete/:id_pegawai', async (req, res) => {
  try {
    // Memastikan data ditemukan sebelum dihapus
    const dataPegawai = await hapusData(req.params.id_pegawai);

    if (!dataPegawai) {
      // Jika data tidak ditemukan, tampilkan pesan atau lakukan penanganan khusus
      req.flash('msg', 'Data Pegawai tidak ditemukan.');
    } else {
      req.flash("msg", "Data Pegawai berhasil dihapus.")
    }

    // Menghapus data
    //await hapusData(req.params.id_pegawai);

    // Menampilkan pesan flash
    //req.flash('msg', 'Data Pegawai Berhasil Dihapus!');

    // Redirect ke halaman dashboard index-admin
    res.redirect('/dashboard/admin');

  } catch (err) {
    console.error(err.msg);

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
    msg: req.flash("msg"),
  })
})

// Route ke detail kehadiran
app.get('/dashboard/kehadiran', async (req,res)=>{
  const kehadiran = await loadData();
    res.render('dashboard/kehadiran/index-kehadiran', {
        title: "Page Kehadiran",
        layout: "dashboard/templates/main-layout",
        kehadiran,
        msg: req.flash("msg"),
    })
})

// Route untuk menangani pengiriman data formulir absensi
app.post('/dashboard/kehadiran', async (req, res) => {
  const { kode, jabatan, nama, tanggal, keterangan, jam_masuk, jam_keluar } = req.body;

  try {
      // Simpan data kehadiran dengan tanggal yang sudah diformat
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

// Route untuk delete data absensi
app.get('/dashboard/kehadiran/delete/:id_kehadiran', async(req, res)=>{
  try {
    // Memastikan data ditemukan sebelum dihapus
    const dataKehadiran = await cek_id(req.params.id_kehadiran);

    if (!dataKehadiran) {
      // Jika data tidak ditemukan, tampilkan pesan atau lakukan penanganan khusus
      req.flash('msg', 'Data Kehadiran tidak ditemukan.');
      res.redirect('/dashboard/kehadiran');
      return;
    }

    // Menghapus data
    await deleteData(req.params.id_kehadiran);

    // Menampilkan pesan flash
    req.flash('msg', 'Data kehadiran Berhasil Dihapus!');

    // Redirect ke halaman dashboard index-admin
    res.redirect('/dashboard/kehadiran');
  } catch (err) {
    console.error(err.message);

    // Menampilkan pesan flash jika terjadi kesalahan
    req.flash('msg', 'Terjadi kesalahan saat menghapus data.');

    // Redirect ke halaman dashboard admin
    res.redirect('/dashboard/kehadiran');
  }
})

// Route ke table rekap absensi
app.get('/dashboard/rekap', async (req,res) => {
  const kehadiran = await loadData();
    res.render('dashboard/rekap/index-rekap', {
        title: "Page Rekap",
        layout: "dashboard/templates/main-layout",
        kehadiran,
    })
})

app.post('/dashboard/rekap', async (req, res) => {
  const { kode, jabatan, nama, tanggal, keterangan, jam_masuk, jam_keluar } = req.body;

  try {
      // Simpan data kehadiran
      await simpanDataKehadiran(kode, jabatan, nama, tanggal, keterangan, jam_masuk, jam_keluar);

      // Set pesan sukses menggunakan req.flash
      req.flash('msg', 'Terimakasih sudah mengisi absen hari ini!');

      // Redirect ke halaman form absensi
      res.redirect('/dashboard/admin/');
  } catch (err) {
      console.error(err.message);

      // Set pesan error menggunakan req.flash
      req.flash('error', 'Terjadi kesalahan saat menyimpan data absensi.');

      // Redirect ke halaman form absensi
      res.redirect('/dashboard/admin/');
  }
});

//===============================================================================================================
// route error handling jika tidak sesuai, maka akan menampilkan page not found
app.use("/", (req, res) => {
    res.status(404);
    res.send("Page not found : 404");
  });
  
  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`); // menampilkan pesan bahwa port sedang berjalan
  });