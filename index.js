
// Modify the code by yourself for the error as get request
// http://localhost:9000/my_stars

const express = require('express');
const res = require('express/lib/response');
const fs = require('fs'); // Only reason to import fs to mimic DATABASE

const stars = require('./stars.json'); // ITS OUR ARRAY OF STARS

// CREATING SERVER
const app = express();

// middleware
app.use(express.json()); // JUST TO PARSE THE BODY "req.body"

const port = 9000; //just 


// ' Get all stars in our database
app.get('/', (req, res)=>{
    // JavrScript Code/Object- removing data for security

    // ! CHECK
    // const stars_ = stars.map(star=>{ // for simplicity remove .map replace with .forEach
    // other way of doing it
    stars.forEach((star) => {        
        delete star.email;
        delete star.code;
        return star;
    });

    res.status(200).json({
        message: 'Here are the stars ',
        // data : stars_,
        data : stars,
    });
});


// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Get a star by email and code
app.get('/my_stars', (req, res) => {
    const {email, code} = req.body;

    const star = stars.filter((star) => {
        return (star.email === email && 
        star.code === code
        );

    });

    if(!star)
    return res.status(404).json({
        status: 'fail',
        message: 'Stars not found',
    });
    res.status(200).json({
        status: "success",
        data: star,
        message: `Here is your star ${star.length}` ,
    });
});


// Add a new star to our database
app.delete('/:name', (req, res) => {
    const { name } = req.params;

    const starExists = stars.find(
        (star) => star.name === name 
    );

    if(!starExists){
        return res.status(404).json({
            status: 'fail',
            message: 'Star does not exist',
        })
    }
    
    const { email , code } = req.body;

    if(starExists.email !== email || starExists.code !== code ) {
        return res.status(401).json({
            status: 'fail',
            message: "You are not authorized to delete this star",
        })
    };

    // stars.slice(stars.indexOf(starExists), -1);
    const index = 
        stars.indexOf(starExists);
    stars.splice(index, 1);

    fs.writeFile(
        './stars.json',
        JSON.stringify(stars),
        (err) => {
            if (err) {
                res.status(500).json({
                    message:
                    'Interval Server Error',
                });
            }
        }
    );
    res.status(200).json({
        messege: 'Star deleted successfully',
    });

});


// 'ADDING a new star to our database
app.post('/', (req, res) => {
    
    const { name, email, code, person } =
        req.body;

    if(
        !name ||
        !email ||
        !code ||
        !person
    ){
        return res.status(400).json({
            status: 'fail',
            message:
             'Please fill our all fields',
        });
    }

    // Check if star already exists
    const starExists = stars.find(
        (star) => star.name === name
        );

        if(starExists){
            return res.status(405).json({
                status: 'fail',
                message:
                'Star already exists, Please choose a different name',
            });
        }
    // MongoDB
    const newStar = {
        name,
        email,
        code,
        person,
    };

    stars.push(newStar);

    fs.writeFile(
        './stars.json',
        JSON.stringify(stars),
        (err) => {
            if(err) {
                res.status(500).json({
                    message: 'Inteval Server Error',
                });
            }
        }
    );

    res.status(201).json({
        message: 'Star added succussfully',
        data: newStar,
    });
});

// Update the star in our database by put function.
// put or patch are same with a litle different that
// patch is used to update a single function put is used to update a whole function.
app.put('/:name', (req, res) => { // /:name is the parameters
    
    const { name } = req.params;
    // console.log("Name", name); // for checking
    
    // const { email, code, person } =req.body;
    
    const starExists = stars.find(
        (star) => star.name === name
    );
    
    if (!starExists) {
        return res.status(404).json({
            status: 'fail',
            message: 'Star does not exist'
        });
    }



    const { email, code, newName } = req.body;

    if(starExists.email !== email || starExists.code !== code ){ // should be 'or' not 'and'
        return res.status(401).json({
            status: 'fail',
            message: 'You are not authorized to update this star',
        });
    }

    starExists.name = newName;

    fs.writeFile(
        './stars.json',
        JSON.stringify(stars),
        (err) => {
            if (err) {
                res.status(500).json({
                    status: 'fail',
                    message: 'Internal Server Error'
                });
            }
        }
    );

    res.status(200).json({
        data: starExists,
        message: 
            'Star updated successfully',
    });
}); 

app.put('/found/:name', (req, res) => {
    const {name} = req.params;
    
    const starExists = stars.find(
        (star) => star.name === name
    );
    if (!starExists){
        return res.status(404).json({
            status: 'fail',
            message: 'Star does not exist',
        });
    }

    const { 
        secret , 
        distance ,
        size,
        color,
        constellation
        }    = req.body;
    
        if (secret !== "key"){
            return res.status(401).json({
                status: 'fail',
                message: "You are not authorized to perform this action",
            });
        }

        starExists.found = true;
        starExists.distance = distance;
        starExists.size = size;
        starExists.color = color;
        starExists.constellation = constellation;

        fs.writeFile(
            './stars.json',
            JSON.stringify(stars),
            (err) => {
                res.status(500).json({
                    message: 
                        'Interval Server Error',
                });
            }
        )
        
        res.status(200).json({
            message: 'Star found successfully',
            data: starExists,
        })
});

app.listen(port, () => {
    console.log(
        'Star are twinkling in the night sky @. \n' +
         port
    );
});