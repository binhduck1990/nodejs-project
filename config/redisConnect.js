const redis = require("redis");
const client = redis.createClient({ detect_buffers: true });
 
client.on("error", function(error) {
  console.error(error);
});

