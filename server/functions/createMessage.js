const supabase = require("../supabase");

async function createMessage(message, username, timestamp) {
  const { data, error } = await supabase.from("messages").insert({
    message: message,
    username: username,
    timestamp: timestamp,
  });

  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}

module.exports = createMessage;
