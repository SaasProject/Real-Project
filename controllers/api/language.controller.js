var config = require('config.json');
var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var languageService = require('services/language.service');
 
// routes
router.get('/getEnglishLanguage', getEnglishLanguage);
router.get('/getNihongoLanguage', getNihongoLanguage);
router.get('/getDefaultLanguage', getDefaultLanguage);
router.post('/saveDefaultLanguage', saveDefaultLanguage);

module.exports = router;

function getEnglishLanguage(req, res) {
    languageService.getEnglishLanguage(req, res)
        .then(function (language) {
            if (language) {
                res.send(language);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getNihongoLanguage(req, res) {
    languageService.getNihongoLanguage(req, res)
        .then(function (language) {
            if (language) {
                res.send(language);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getDefaultLanguage(req, res) {
    languageService.getDefaultLanguage(req, res)
        .then(function (language) {
            if (language) {
                res.send(language);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function saveDefaultLanguage(req, res) {
    languageService.saveDefaultLanguage(req, res)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}