const { db } = require("../firestore");
const { prefix } = require("../config.json");

const readData = async (client, message, dataSet) => {
  let dbRef = getDbRef(client, message, dataSet);
  let doc = await dbRef.get();
  if (!doc.exists) {
    if (dataSet === "channelEmoji") return "swrpg";
    if (dataSet === "prefix") return prefix;
    return {};
  } else {
    let data = doc.data()[dataSet];
    if (!data) data = {};
    switch (dataSet) {
      case "characterStatus":
        Object.keys(data).forEach((name) => {
          if (!data[name].crit) data[name].crit = [];
          if (!data[name].obligation) data[name].obligation = {};
        });
        break;
      default:
        break;
    }
    return data;
  }
};

const writeData = (client, message, dataSet, data, merge = false) => {
  let dbRef = getDbRef(client, message, dataSet);
  dbRef.set({ [dataSet]: data }, { merge }).catch(console.error);
};

const writeDashboardData = (dataSet, data) => {
  let dbRef = getDashboardDbRef(dataSet);
  dbRef.update({ [dataSet]: data }).catch(console.error);
};

const createDashboardDb = (dataSet, data, message, merge = false) => {
  let dbRef = getDashboardDbRef(dataSet, message);
  dbRef.set({ [dataSet]: data }, { merge }).catch(console.error);
};

const getDbRef = (client, message, dataSet) => {
  let dbRef = db.collection("Bots").doc(`${client.user.username}_Discord`);

  if (message.guild) {
    dbRef = dbRef.collection("Guild").doc(message.guild.id);
  }

  if (dataSet !== "prefix") {
    dbRef = dbRef.collection("Channel").doc(message.channel.id);
  }

  if (dataSet === "diceResult") {
    dbRef = dbRef.collection("User").doc(message.author.id);
  }

  dbRef = dbRef.collection("Data").doc(dataSet);
  return dbRef;
};

const getDashboardDbRef = (dashboardDataSet) =>
  db.collection("Characters").doc(dashboardDataSet);

exports.readData = readData;
exports.writeData = writeData;
exports.writeDashboardData = writeDashboardData;
exports.createDashboardDb = createDashboardDb;
