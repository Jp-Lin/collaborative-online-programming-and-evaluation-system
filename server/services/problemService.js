const ProblemModel = require('../models/problemModel');

const getProblems = () => {
  return new Promise((resolve, reject) => {
    ProblemModel.find({}, (err, problems) => {
      if (err) {
        reject(err);
      } else {
        resolve(problems);
      }
    });
  });
}

const getProblem = (id) => {
  return new Promise((resolve, reject) => {
    ProblemModel.find({ id: id }, (err, problem) => {
      if (err) {
        reject(err);
      } else {
        resolve(problem);
      }
    });
  });
}

const addProblem = (newProblem) => {
  return new Promise((resolve, reject) => {
    ProblemModel.findOne({ name: newProblem.name }, (err, problem) => {
      if (problem) {
        reject("Problem name already exists");
      } else {
        ProblemModel.countDocuments({}, (err, num) => {
          newProblem.id = num + 1;
          var mongoProblem = new ProblemModel(newProblem);
          mongoProblem.save();
          resolve(newProblem);
        });
      }
    });
  });
}


module.exports = {
  getProblems,
  getProblem,
  addProblem
}