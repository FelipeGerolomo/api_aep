const express = require('express');
const request = require("request");
const app = express();
const cheerio = require('cheerio')
const moment = require('moment');
moment.locale("pt-br");

app.use(express.static('public'));
app.set('view engine', 'pug');



app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

app.get('/regex', function (req, res) {
    var txt = '04/05/2018 às 23:59:59';

    var re1 = '((?:(?:[0-2]?\\d{1})|(?:[3][01]{1}))[-:\\/.](?:[0]?[1-9]|[1][012])[-:\\/.](?:(?:[1]{1}\\d{1}\\d{1}\\d{1})|(?:[2]{1}\\d{3})))(?![\\d])';	// DDMMYYYY 1

    var p = new RegExp(re1, ["i"]);
    var m = p.exec(txt);
    if (m != null) {
        var ddmmyyyy1 = m[1];
        console.log(ddmmyyyy1.replace(/</, "&lt;") + "\n");
    }
});

app.get('/aeps', function (req, res) {
    request.post('http://moodle.unicesumar.edu.br/acompanhamento/acompanhamento_presencial.php', { form: { ra: '1607515-2' } }, function (error, response, body) {
        console.log('error:', error);
        page(body, res);
    });
});

function page(html, res) {
    const $ = cheerio.load(html);
    const aeps = [];
    let disciplina;
    let data;
    let data_entrega;
    let hora_entrega;
    let qtd_aep;
    let expiration;

    $('.container-pendente').each(function (i, elem) {
        disciplina = $(this).children('td').first().text();
        disciplina = disciplina.replace(/[0-9]/g, '');
        data = $(this).children('td').last().text();
        data_entrega = regexData(data);
        hora_entrega = regexTime(data);
        qtd_aep = $(this).children('td').children('span').text();
        expiration = newDate(data_entrega, hora_entrega);
        aeps[i] = {
            disciplina: disciplina,
            data_entrega: data_entrega,
            hora_entrega: hora_entrega,
            qtd_aep: qtd_aep,
            expiration: expiration
        };
    });

    aeps.join(', ');
    // res.send(aeps)
    console.log("aeps");
    res.render('index', { title: 'AEPS', aeps: aeps });
}

function regexData(data_entrega) {
    var expression = '((?:(?:[0-2]?\\d{1})|(?:[3][01]{1}))[-:\\/.](?:[0]?[1-9]|[1][012])[-:\\/.](?:(?:[1]{1}\\d{1}\\d{1}\\d{1})|(?:[2]{1}\\d{3})))(?![\\d])';	// DDMMYYYY 1
    var regex = new RegExp(expression, ["i"]);
    var mDate = regex.exec(data_entrega);
    if (mDate != null) {
        var ddmmyyyy = mDate[1];
        let data = (ddmmyyyy.replace(/</, "&lt;"));
        return data;
    }

    console.log(data)
}


function regexTime(data_entrega) {
    var expression = '((?:(?:[0-1][0-9])|(?:[2][0-3])|(?:[0-9])):(?:[0-5][0-9])(?::[0-5][0-9])?(?:\\s?(?:am|AM|pm|PM))?)';;	// DDMMYYYY 1
    var regex = new RegExp(expression, ["i"]);
    var mHora = regex.exec(data_entrega);
    if (mHora != null) {
        var time1 = mHora[1];
        let time = (time1.replace(/</, "&lt;"));
        return time;
    }
}

function newDate(dia, hora) {
    let day_now = new Date();
    let fullday = moment(dia + " " + hora, "DD-MM-YYYY HH:mm").format()
    let exp = moment(fullday).fromNow();
    return exp;
}


//PEGA CERTO

// $('.container-pendente').each(function (i, elem) {
//     disciplina = $(this).children('td').first().text();
//     data_entrega = $(this).children('td').last().text();
//     qtd_aep = $(this).children('td').children('span').text();
//     aeps[i] = { DISCIPLINA: disciplina, DTA_ENTREGA: data_entrega, QTD_AEP: qtd_aep };
// });


// app.get('/index', (req, res, next) => {
//     res.sendFile('public/index.html', { root: __dirname });
// });


app.get('/index', function (req, res) {
    res.render('index', { title: 'Hey', message: 'Hello there!' });
});
