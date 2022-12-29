const bcrypt = require("bcrypt");
//updated code
// "password"; usually stored in the database in the user's row.
var stored_hash = '$2a$10$vxliJ./aXotlnxS9HaJoXeeASt48.ddU7sHNOpXC/cLhgzJGdASCe'
bcrypt.compare('', stored_hash, function(err, res) {
console.log("response>>>", res)
})