var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', function (req, res, next) {
	return res.render('index.html');
});

router.get('/signup', function (req, res, next) {
	return res.render('signup.ejs');
});

router.post('/signup', function(req, res, next) {
    console.log(req.body);
    var personInfo = req.body;

    if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
        res.send();
    } else {
        // Check if the email address is from the @iiitu.ac.in domain
        if (personInfo.email.endsWith('@iiitu.ac.in')) {
            if (personInfo.password == personInfo.passwordConf) {
                User.findOne({ email: personInfo.email }, function(err, data) {
                    if (!data) {
                        var c;
                        User.findOne({}, function(err, data) {
                            if (data) {
                                console.log("if");
                                c = data.unique_id + 1;
                            } else {
                                c = 1;
                            }

                            var newPerson = new User({
                                unique_id: c,
                                email: personInfo.email,
                                username: personInfo.username,
                                password: personInfo.password,
                                passwordConf: personInfo.passwordConf
                            });

                            newPerson.save(function(err, Person) {
                                if (err)
                                    console.log(err);
                                else
                                    console.log('Success');
                            });

                        }).sort({ _id: -1 }).limit(1);
                        res.send({ "Success": "You are registered, You can login now." });
                    } else {
                        res.send({ "Success": "Email is already used." });
                    }

                });
            } else {
                res.send({ "Success": "Password is not matched" });
            }
        } else {
            res.send({ "Success": "Email domain must be @iiitu.ac.in" });
        }
    }
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
			}
			else{
				res.send({"Success":"Wrong password!"});
			}
		}
		else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email,"dob":data.dob,"phone":data.phone});
		}
	});
});


router.get('/profile/edit', function (req, res, next) {
	// Fetch user data and render an edit form
	User.findOne({ unique_id: req.session.userId }, function (err, data) {
	  if (!data) {
		res.redirect('/');
	  } else {
		return res.render('edit.ejs', {
		  "name": data.username,
		  "email": data.email,
		  "DOB": data.dob,
		  "Phone": data.phone
		});
	  }
	});
  });

router.post('/profile/edit', function (req, res, next) {
	// Retrieve the updated profile
	const updatedData = {
	  username: req.body.username,
	  email: req.body.email,
	  dob: req.body.dob,
	  phone: req.body.phone
	};
  
	// Update
	User.findOneAndUpdate({ unique_id: req.session.userId }, updatedData, function (err, updatedUser) {
	  if (err) {
		console.error(err);
		res.redirect('/profile/edit');
	  } else {
		res.redirect('/profile');
	  }
	});
  });

//   router.get('/profile/bookings', function (req, res, next) {
// 	// Fetch user data and render an edit form
// 	User.findOne({ unique_id: req.session.userId }, function (err, data) {
// 	  if (!data) {
// 		res.redirect('/');
// 	  } else {
// 		return res.render('bookings.ejs', {
// 		  "locate": data.locate,
// 		  "date": data.date,
// 		  "time": data.time,
// 		  "fare": data.fare
// 		});
// 	  }
// 	});
//   });

//   router.post('/profile/bookings', function (req, res, next) {
// 	// Retrieve the updated profile
// 	const myBookings = {
// 	  locate: req.body.locate,
// 	  date: req.body.date,
// 	  time: req.body.time,
// 	  fare: req.body.fare
// 	};
  
// 	// Update
// 	User.findOneAndUpdate({ unique_id: req.session.userId }, myBookings, function (err, myBookings) {
// 	  if (err) {
// 		console.error(err);
// 		res.redirect('/profile/bookings');
// 	  } else {
// 		res.redirect('/profile');
// 	  }
// 	});
//   });


//   router.post('/profile/bookings', function (req, res, next) {
// 	const { locate, date, time, fare } = req.body;
  
// 	if (!locate || !date || !time || !fare) {
// 	  return res.status(400).send("Please fill out all required fields.");
// 	}
  
// 	const newBooking = new Booking({
// 	  locate: locate,
// 	  date: date,
// 	  time: time,
// 	  fare: fare,
// 	  userId: req.session.userId,
// 	});
  
// 	newBooking.save(function (err) {
// 	  if (err) {
// 		console.error(err);
// 		return res.status(500).send("An error occurred while saving the booking.");
// 	  }
  
// 	  return res.status(200).send("Booking successful!");
// 	});
//   });
  

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;