let express = require('express');
let hbs = require('express-handlebars');
let db = require('mongoose');
let multer = require('multer');
let body = require('body-parser');
let fs = require('fs');


let userSchema = require('./model/userSchema');
let postSchema = require('./model/postSchema');
let adminSchema = require('./model/adminSchema');

let User = db.model('User', userSchema, 'users');
let Admin = db.model('Admin', adminSchema, 'admins');

db.connect('mongodb+srv://Nhom5qlda14351:quanlyduan123@cluster0-z9led.mongodb.net/TimtroDatabase?retryWrites=true&w=majority', {}).then(function (res) {
    console.log('conected');
})

let app = express();

let path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(body.json());
app.use(body.urlencoded({extended: true}));
app.engine('.hbs', hbs({
    extname: 'hbs',
    defaultLayout: '',
    layoutsDir: ''
}))
app.set('view engine', '.hbs')
app.listen(9090);
// phần sever

// đăng nhập
app.get('/', function (request, response) {
    response.render('login', {status: 'none', user: '', pass: ''});
});

let nameDN = '', allAdmin = '';
// kiểm tra đăng nhập nếu đúng hiện trang trủ index
app.get('/index', async function (request, response) {

    let listAdmin = await Admin.find({}).lean();   //dk

    allAdmin = listAdmin.length;


    let user = request.query.user;
    let pass = request.query.pass;
    let sm = request.query.sm;

    if (sm == 1) {
        nameDN = user;
        console.log(user + " " + sm);
    }

    let admins = await Admin.find({username: user, password: pass}).lean();   //dk

    if (admins.length <= 0 && sm == 1) {
        response.render('login', {
            status: 'block',
            data: 'Không thể đăng nhập, kiểm tra lại tài khoản và mật khẩu của bạn.',
            user: '',
            pass: ''
        });
    } else {
        response.render('index', {
            status: 'none',
            user: nameDN,
            pass: pass,
        });
    }


});
// thêm sửa xóa tài khoản admin
app.get('/createAdAc', async function (request, response) {
    let a = await Admin.find({}).lean();   //dk
    let search = request.query.search;
    let nameSP = request.query.nameSP;
    if (search == 1 && nameSP) {
        let seachAdmin = await Admin.find({username: nameSP}).lean();
        response.render('createAdAc', {
            status: 'none',
            data: seachAdmin,
        });
    } else {
        let sm = request.query.sm;
        let del = request.query.del;
        let edit = request.query.ud;
        if (sm == 1) {
            let nUser = request.query.nUser;
            let nPass = request.query.nPass;

            let findAdmin = await Admin.find({username: nUser}).lean();   //dk


            if (findAdmin.length <= 0) {
                let newAdmin = new Admin({
                    username: nUser,
                    password: nPass,
                });
                let status = await newAdmin.save();
                let admins = await Admin.find({}).lean();   //dk

                if (status) {
                    response.render('createAdAc', {
                        status: 'block',
                        textAlert: 'Tạo tài khoản thành công.',
                        data: admins,
                    });
                } else {
                    response.render('createAdAc', {
                        status: 'block',
                        textAlert: 'Tạo tài khoản thất bại.',
                        data: admins,
                    });
                }
            } else {

                response.render('createAdAc', {
                    status: 'block',
                    textAlert: 'Tài khoản đã tồn tại.Mời tạo tài khoản khác !',
                    data: a,
                });
            }
        } else if (del == 1) {
            console.log('del ad ' + request.query.idAD);
            let status = await Admin.findByIdAndDelete(request.query.idAD);
            let admins = await Admin.find({}).lean();   //dk
            if (status) {
                response.render('createAdAc', {
                    status: 'block',
                    textAlert: 'Xóa tài khoản thành công.',
                    data: admins,
                });
            } else {
                response.render('createAdAc', {
                    status: 'block',
                    textAlert: 'Xóa tài khoản thất bại.',
                    data: admins,
                });
            }
        } else if (edit == 1) {
            let nId = request.query.nId;
            let nUser = request.query.nUser;
            let nPass = request.query.nPass;
            console.log('edit ad ' + request.query.nId);

            let admins = await Admin.find({username: nUser, password: nPass}).lean();   //dk
            if (admins.length <= 0) {
                console.log(nId + "edit ad");
                let status = await Admin.findByIdAndUpdate(nId, {
                    username: nUser,
                    password: nPass
                });
                let nAdmins = await Admin.find({}).lean();
                if (status) {
                    response.render('createAdAc', {
                        status: 'block',
                        textAlert: 'Cập nhật tài khoản thành công.',
                        data: nAdmins,
                    });
                } else {
                    response.render('createAdAc', {
                        status: 'block',
                        textAlert: 'Cập nhật tài khoản thất bại.',
                        data: nAdmins,
                    });
                }
            } else {
                let nAdmins = await Admin.find({}).lean();
                response.render('createAdAc', {
                    status: 'block',
                    textAlert: 'Cập nhật tài khoản thất bại. Tài khoản đã tồn tại.',
                    data: nAdmins,
                });
            }

        } else {
            del = 0;
            edit = 0;
            response.render('createAdAc', {
                status: 'none',
                data: a,
            });
        }
    }
});



// phần kết nối sever với app
app.get('/getDL', async function (request, response) {
    response.render('getDL');
});


// nhận thông tin khách hàng để tạo tài khoản
app.post('/postUser', async function (request, response) {
    let nPhone = request.body.phone;
    let nFullName = request.body.fullname;
    let nPassword = request.body.password;
    let nPassword2 = request.body.password2;


    let newUser = new User({
        phone: nPhone,
        fullName: nFullName,
        password: nPassword,
        password2: nPassword2
    });
    let status = await newUser.save();
    if (status) {
        response.send(newUser)
    } else {
        response.send('Them thất bại.')
    }


});
// nhận thông tin giỏ hàng để thêm vào database
app.post('/postPost', async function (request, response) {
    let user = request.body.user;
    let productID = request.body.productID;
    let name = request.body.name;
    let price = request.body.price;
    let description = request.body.description;
    let type = request.body.type;
    let sl = request.body.sl;
    let image = request.body.image;


    let newCart = new Cart({
        user: user,
        productID: productID,
        name: name,
        price: price,
        image: image,
        description: description,
        type: type,
        sl: sl,
    });
    let status = await newCart.save();
    if (status) {
        response.send(newCart)
    } else {
        response.send('Them thất bại.')
    }


});

// trả về dữ liệu trong database
app.get('/getAlluser', async function (request, response) {
    let users = await User.find({});
    response.send(users);
});// đăng nhập
app.get('/getAllproduct', async function (request, response) {
    let products = await Product.find({});
    response.send(products);
});// tìm kiếm các bài đăng