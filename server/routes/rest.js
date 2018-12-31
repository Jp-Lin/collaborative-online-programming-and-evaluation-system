const express = require('express');
const router = express.Router();
const problemService = require('../services/problemService');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const node_rest_client = require('node-rest-client').Client;
const rest_client = new node_rest_client();

const EXECUTOR_SERVICE_URL = 'http://executor/build_and_run';

rest_client.registerMethod('build_and_run', EXECUTOR_SERVICE_URL, 'POST');

router.get('/problems', (req, res) => {
  problemService.getProblems()
    .then((problems) => res.json(problems))
});

router.get('/problems/:id', (req, res) => {
  var id = req.params.id;
  problemService.getProblem(+id)
    .then(problem => res.json(problem));
});

router.post('/problems', jsonParser, (req, res) => {
  problemService.addProblem(req.body)
    .then(
      problem => res.json(problem),
      err => res.status(400).send("Problem name already exists!")
    );
});

router.post('/build_and_run', jsonParser, (req, res) => {
  const user_code = req.body.user_code;
  const lang = req.body.lang;
  rest_client.methods.build_and_run({
    data: {
      code: user_code,
      lang: lang
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }, (result, response) => {
    console.log('Receive response from execution server.');
    const text = `Build output: ${result['build']}
 Execute output: ${result['run']}`;

    result.text = text;
    res.json(result);
  });
});

module.exports = router;