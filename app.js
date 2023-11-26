/* ========================================== import module ======================================= */
const express = require("express"); // import module express.js
const app = express(); // membuat aplikasi express
const expressLayouts = require("express-ejs-layouts"); // import module express-ejs-layouts
const host = "localhost";
const port = 3000; // konfigurasi port
const { body, check, validationResult } = require("express-validator"); // import module express validator, untuk melakukan unique pada data nama
const cookieParser = require("cookie-parser"); // import module cookie-parser
const flash = require("connect-flash"); // import module connect-flash
const session = require("express-session"); // import module express-session
const {ambilData} = require("./models/pegawaiModels"); // import module models
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

// ================================================= Start Route Dashboard ====================================
app.get('/dashboard', (req,res)=>{
    res.render('dashboard/home-dashboard', {
        title: "Aplikasi Absensi",
        layout:'dashboard/templates/main-layout'
    })
})

// Route ke table list pegawai
app.get('/dashboard/admin/', async (req, res)=>{
    //const employeesList = await pool.query("SELECT * FROM pegawai");
    // Mengambil data contact dari hasil kueri ke dalam variabel employees
    const employees = await ambilData();
    res.render('dashboard/admin/index-admin', {
        title: "Page Pegawai",
        layout: "dashboard/templates/main-layout",
        employees
    })
})

// Route ke table kehadiran absensi
app.get('/dashboard/kehadiran', async (req,res)=>{
    res.render('dashboard/kehadiran/index-kehadiran', {
        title: "Page Kehadiran",
        layout: "dashboard/templates/main-layout",
    })
})

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