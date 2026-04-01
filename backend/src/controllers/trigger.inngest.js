const { inngest } = require("../inngest");

await inngest.send({
  name: "app/hello",
  data: {
    name: "Abhigyan",
  },
});
