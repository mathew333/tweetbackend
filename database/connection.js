const mongoose = require("mongoose");
const mongoURL = process.env.MONGODB_URL;
mongoose.set('runValidators', true);
mongoose.connect(mongoURL).then(() => {
    console.log(`Database Connection Successful...`);
}).catch((e) => {
    console.log(e);
})