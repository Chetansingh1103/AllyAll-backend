const cron = require('node-cron');
const Post = require('../models/Post');

const cleanUpBin = () => {
    cron.schedule("0 0 1 * * *", async () => {
        console.log("cron is running")

        const deletedPosts = await Post.find({isDeleted: true});

        if(deletedPosts.length > 0) {
            deletedPosts.forEach(async (post) => {
                const diff = (post.deletiondateTime - post.creationDateTime) / (1000 * 60 * 60 * 24);

                if(diff >= 30){
                    try{
                        await Post.findByIdAndDelete(post._id);
                    }
                    catch(err){
                        console.log(err);
                    }
                }
            })
        }
    },{
        scheduled: true,
        timezone: "Asia/Kolkata"
    })
}

const keepBackendActive = () => {

    cron.schedule('*/2 * * * *', async () => {

        let endpint = "https://allyall-backend.onrender.com/user/refresh";

        try {
          let response = await fetch(endpint);
      
          let result = await response.json();
      
          console.log(result)
      
      
        } catch (error) {
          console.log(error);
        }
        

    },{
        scheduled: true,
        timezone: "Asia/Kolkata"
    })

}

module.exports = { cleanUpBin, keepBackendActive }

//  # ┌────────────── second (optional)
//  # │ ┌──────────── minute
//  # │ │ ┌────────── hour
//  # │ │ │ ┌──────── day of month
//  # │ │ │ │ ┌────── month
//  # │ │ │ │ │ ┌──── day of week
//  # │ │ │ │ │ │
//  # │ │ │ │ │ │
//  # * * * * * *
