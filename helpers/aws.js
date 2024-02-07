const aws = require("aws-sdk");

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: "ca-central-1"
});

module.exports = aws;