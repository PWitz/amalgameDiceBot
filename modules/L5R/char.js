const functions = require("./");
const { readData, writeData, writeDashboardData } = require("../data");
const { createDashboardCharacter } = require("./DashboardDb");
const main = require("../../index");
const { indexOf, upperFirst } = require("lodash");
const { v4: uuidv4 } = require("uuid");

const school_rank_thresholds = {
  1: 20,
  2: 24,
  3: 32,
  4: 44,
  5: 60,
};

const char = async (client, message, params, channelEmoji) => {
  //setting the channel specific variables
  let characterStatus = await readData(client, message, "characterStatus");
  let characterName,
    character,
    onlineDataToUpdate = {};
  (modifier = 0), (command = "list");

  if (params[0]) command = params[0];
  if (params[1]) characterName = params[1].toUpperCase();
  if (params[2] && +params[2]) modifier = +params[2];
  if (characterName && characterStatus[characterName])
    character = { ...characterStatus[characterName] };
  if (!character && command !== "list" && command !== "reset") {
    if (command === "setup" || command === "add") {
      if (!characterName) {
        main.sendMessage(
          message,
          "No characterName, !help char for more information"
        );
        return;
      }
    } else {
      main.sendMessage(
        message,
        `${characterName} has not been set up.  Please use !char setup characterName [AIR] [EARTH] [FIRE] [WATER] [VOID] to complete setup.`
      );
      return;
    }
  }
  let text = "",
    name = "",
    type = "";
  switch (command) {
    case "setup":
    case "add":
      if (character) {
        text += `${characterName} already exists!`;
        break;
      }
      //init the new characters stats
      character = {
        endurance: 4,
        composure: 4,
        fatigue: 0,
        strife: 0,
        vigilance: 2,
        focus: 1,
        maxVoidPoints: 1,
        currentVoidPoints: 1,
        honor: 40,
        glory: 40,
        status: 30,
        rings: {
          AIR: 1,
          EARTH: 1,
          FIRE: 1,
          WATER: 1,
          VOID: 1,
        },
        money: 0,
        xp: 0,
        curriculum_xp: 0,
        school_rank: 1,
        active_title: {
          name: "",
          title_xp: 0,
          title_completion: 0,
        },
        other_titles: [],
        obligation: {},
        duty: {},
      };
      if (params[2]) character.rings.AIR = +params[2].replace(/\D/g, "");
      if (params[3]) character.rings.EARTH = +params[3].replace(/\D/g, "");
      if (params[4]) character.rings.FIRE = +params[4].replace(/\D/g, "");
      if (params[5]) character.rings.WATER = +params[5].replace(/\D/g, "");
      if (params[6]) character.rings.VOID = +params[6].replace(/\D/g, "");

      character.endurance = (character.rings.EARTH + character.rings.FIRE) * 2;
      character.composure = (character.rings.EARTH + character.rings.WATER) * 2;
      character.focus = character.rings.FIRE + character.rings.AIR;
      character.vigilance = Math.ceil(
        (character.rings.WATER + character.rings.AIR) / 2
      );
      character.maxVoidPoints = character.rings.VOID;
      character.currentVoidPoints = Math.ceil(character.rings.VOID / 2);

      text += buildCharacterStatus(characterName, character);
      break;

    case "honor":
    case "h":
    case "glory":
    case "g":
    case "status":
    case "st":
      if (command == "honor" || command == "h") type = "honor";
      if (command == "glory" || command == "g") type = "glory";
      if (command == "status" || command == "st") type = "status";
      if (!modifier) {
        text += `No modifier was entered.`;
      }
      if (modifier) {
        character[type] += modifier;
        if (character.id) onlineDataToUpdate[type] = character[type];
        if (character[type] > 100) character[type] = 100;
        if (character[type] < 0) character[type] = 0;
        if (modifier > 0)
          text += `${characterName} has gained ${modifier} ${type}, for a total of ${character[type]} ${type}.`;
        if (modifier < 0)
          text += `${characterName} has lost ${-modifier} ${type}, for a total of ${
            character[type]
          } ${type}.`;
      }
      break;

    case "ring":
    case "r":
      if (params[3]) ring = params[3].toUpperCase();
      if (!ring) {
        text += `No ring was entered.`;
        break;
      }

      if (modifier) {
        character.rings[ring] = +character.rings[ring] + modifier;
        if (character.id) onlineDataToUpdate["rings"] = character.rings;
      }
      if (character.rings[ring] > 5)
        text += `Careful ! ${characterName}'s affinity with ${ring} has exceeded human limits.`;
      if (character.rings[ring] < 1) character.rings[ring] = 1;
      text += `\n${characterName}'s ${ring} Ring is now ${character.rings[ring]}`;

      if (ring == "AIR") {
        character.focus = character.rings.FIRE + character.rings.AIR;
        character.vigilance = Math.ceil(
          (character.rings.WATER + character.rings.AIR) / 2
        );
        text += `\n${characterName} has now ${character.focus} focus and ${character.vigilance} vigilance.`;
        if (character.id) {
          onlineDataToUpdate["focus"] = character.focus;
          onlineDataToUpdate["vigilance"] = character.vigilance;
        }
      } else if (ring == "EARTH") {
        character.endurance =
          (character.rings.EARTH + character.rings.FIRE) * 2;
        character.composure =
          (character.rings.EARTH + character.rings.WATER) * 2;
        text += `\n${characterName} has now ${character.endurance} endurance and ${character.vigilance} composure.`;
        if (character.id) {
          onlineDataToUpdate["endurance"] = character.endurance;
          onlineDataToUpdate["composure"] = character.composure;
        }
      } else if (ring == "FIRE") {
        character.focus = character.rings.FIRE + character.rings.AIR;
        character.endurance =
          (character.rings.EARTH + character.rings.FIRE) * 2;
        text += `\n${characterName} has now ${character.focus} focus and ${character.endurance} endurance.`;
        if (character.id) {
          onlineDataToUpdate["focus"] = character.focus;
          onlineDataToUpdate["endurance"] = character.endurance;
        }
      } else if (ring == "WATER") {
        character.vigilance = Math.ceil(
          (character.rings.WATER + character.rings.AIR) / 2
        );
        character.composure =
          (character.rings.EARTH + character.rings.WATER) * 2;
        text += `\n${characterName} has now ${character.composure} composure and ${character.vigilance} vigilance.`;
        if (character.id) {
          onlineDataToUpdate["vigilance"] = character.vigilance;
          onlineDataToUpdate["composure"] = character.composure;
        }
      } else if (ring == "VOID") {
        character.maxVoidPoints = character.rings.VOID;
        text += `\n${characterName} has now ${character.maxVoidPoints} maxVoidPoints.`;
        if (character.id) {
          onlineDataToUpdate["maxVoidPoints"] = character.maxVoidPoints;
        }
      }

      break;

    case "voidpoint":
    case "vp":
    case "v":
      if (modifier) {
        if (
          modifier + +character.currentVoidPoints >
          +character.maxVoidPoints
        ) {
          text += `${characterName} cannot have more than ${character.maxVoidPoints} void points.`;
          break;
        }
        character.currentVoidPoints += modifier;
        if (character.currentVoidPoints < 0) {
          character.currentVoidPoints = 0;
        }
        text += `\n${characterName} has now ${character.currentVoidPoints} void points.`;

        if (character.id)
          onlineDataToUpdate["currentVoidPoints"] = character.currentVoidPoints;
      }
      break;

    case "damage":
    case "fatigue":
    case "f":
    case "wound":
    case "w":
      if (modifier) {
        character.fatigue = +character.fatigue + modifier;
        if (modifier > 0) text += `${characterName} takes ${modifier} damages`;
        if (modifier < 0)
          text += `${characterName} recovers from ${-modifier} damages.`;

        if (character.id) onlineDataToUpdate["fatigue"] = character.fatigue;
      }
      if (+character.fatigue < 0) character.fatigue = 0;
      text += `\nFatigue: \`${character.fatigue} / ${character.endurance}\``;
      if (+character.fatigue > +character.endurance)
        text += `\n${characterName} is incapacitated.`;
      break;

    case "strife":
    case "s":
      if (modifier) {
        character.strife = +character.strife + modifier;
        if (modifier > 0) text += `${characterName} takes ${modifier} strife`;
        else if (modifier < 0)
          text += `${characterName} recovers from ${-modifier} strife.`;
        if (character.id) onlineDataToUpdate["strife"] = character.strife;
      }
      if (+character.strife < 0) character.strife = 0;
      text += `\nStrife: \`${character.strife} / ${character.composure}\``;
      if (+character.strife > +character.composure)
        text += `\n${characterName} is compromised.`;
      break;

    case "obligation":
    case "o":
    case "d":
    case "duty":
    case "inventory":
    case "i":
    case "misc":
    case "m":
      if (command === "o" || command === "obligation") type = "obligation";
      if (command === "d" || command === "duty") type = "duty";
      if (command === "i" || command === "inventory") type = "inventory";
      if (command === "m" || command === "misc") type = "misc";
      if (!character[type]) character[type] = {};
      if (params[3]) name = params[3].toUpperCase();
      if (!name) {
        text += `No ${type} name was entered.`;
        break;
      }
      if (modifier > 0) {
        if (character[type] === "") character[type] = {};
        if (!character[type][name]) character[type][name] = 0;
        character[type][name] += modifier;
        text += `${characterName} has added ${modifier} to their ${name} ${type}, for a total of ${character[type][name]}`;
        if (character.id) {
          data = character[type];
          if (type == "misc" || type == "inventory")
            data = character["misc"]
              ? character["misc"].concat(character["inventory"] | [])
              : character["inventory"] || [];
          onlineDataToUpdate[type] = data;
        }
        //subtraction modifier
      } else if (modifier < 0) {
        if (!character[type][name])
          text += `${characterName} does not currently have any ${name} ${type}.`;
        else {
          character[type][name] += modifier;
          if (character[type][name] <= 0) {
            text += `${characterName} has removed all of their ${name} ${type}.`;
            delete character[type][name];
          }
          text += `${characterName} has removed ${-modifier} from their ${name} ${type}, for a total of ${
            character[type][name]
          }`;
        }
        if (character.id) {
          data = character[type];
          if (type == "misc" || type == "inventory")
            data = character["misc"]
              ? character["misc"].concat(character["inventory"] | [])
              : character["inventory"] || [];
          onlineDataToUpdate[type] = data;
        }
      }
      if (Object.keys(character[type]).length === 0)
        text += `\n${characterName} has no ${type}.`;
      else {
        text += `\n${characterName} has the following ${type}.`;
        Object.keys(character[type]).forEach(
          (key) => (text += `\n${key}: ${character[type][key]}`)
        );
      }
      break;

    case "koku":
    case "k":
    case "kokus":
    case "bu":
    case "b":
    case "bus":
    case "zeni":
    case "zenis":
    case "z":
      if (command === "koku" || command === "kokus" || command === "k") {
        money_modifier = modifier * 50;
        coin = "kokus";
      }
      if (command === "bu" || command === "bus" || command === "b") {
        money_modifier = modifier * 10;
        coin = "bus";
      }
      if (command === "zeni" || command === "zenis" || command === "z") {
        money_modifier = modifier;
        coin = "zenis";
      }
      if (modifier > 0 || character.money >= -money_modifier) {
        character.money += money_modifier;
        if (character.id) onlineDataToUpdate["money"] = character.money;
        if (modifier > 0) text += `${characterName} gets ${modifier} ${coin}.`;
        if (modifier < 0) text += `${characterName} pays ${-modifier} ${coin}.`;
      } else text += `${characterName} does not have ${-modifier} ${coin}!`;
      zeni = character.money % 10;
      bu = ((character.money - zeni) / 10) % 5;
      koku = ((character.money - zeni) / 10 - bu) / 5;
      text += `\n${characterName} has ${koku} kokus, ${bu} bus and ${zeni} zenis.`;
      break;

    case "xp":
      if (modifier) {
        character.xp += modifier;
        if (character.id) onlineDataToUpdate["xp"] = character.xp;
        if (modifier > 0)
          text += `${characterName} has added ${modifier} to their XP, for a total of ${character.xp}`;
        else {
          if (character.xp < 0) {
            character.xp = 0;
            text += `${characterName} has removed all of their XP.`;
            break;
          }
          text += `${characterName} has removed ${-modifier} to their XP, for a total of ${
            character.xp
          }`;
        }
      }
      break;

    case "curriculum_xp":
    case "cxp":
    case "cursus":
      if (modifier) {
        character.curriculum_xp += modifier;
        if (modifier > 0)
          text += `${characterName} has added ${modifier} to their curriculum XP, for a total of ${character.curriculum_xp}.`;
        else {
          if (character.curriculum_xp < 0) {
            character.curriculum_xp = 0;
            text += `${characterName} has removed all of their curriculum XP.`;
            break;
          }
          text += `${characterName} has removed ${-modifier} to their curriculum XP, for a total of ${
            character.curriculum_xp
          }.`;
        }
        if (character.id)
          onlineDataToUpdate["curriculum_xp"] = character.curriculum_xp;
      }
      var i = 0;
      while (
        character.curriculum_xp >= school_rank_thresholds[character.school_rank]
      ) {
        character.curriculum_xp =
          character.curriculum_xp -
          school_rank_thresholds[character.school_rank];
        character.school_rank += 1;
        if (character.id)
          onlineDataToUpdate["school_rank"] = character.school_rank;
        text += `\n${characterName} has gained a school rank.  School Rank: \`${character.school_rank}\`.`;
      }
      break;

    case "school_rank":
    case "sr":
      if (modifier) {
        if (+character.school_rank + modifier > 6) {
          character.school_rank = 6;
          text += `Congratulations ! You have mastered the teachings of your school. \n\`School Rank : ${character.school_rank}\``;
          break;
        }
        character.school_rank += modifier;
        if (character.school_rank < 1) character.school_rank = 1;
        text += `Congratulations ! You have reached the ${character.school_rank} rank in your school teachings.`;

        if (character.id)
          onlineDataToUpdate["school_rank"] = character.school_rank;
      }
      break;

    case "title":
    case "t":
      if (!character["active_title"]) {
        character.active_title = { name: "", title_xp: 0, title_completion: 0 };
        if (character.id) onlineDataToUpdate["active_title"] = "";
      }
      if (!character["other_titles"]) {
        character.other_titles = [];
        onlineDataToUpdate["titles"] = [character.active_title];
      }
      cmd = "";
      title_name = "";
      val = "";
      mtxp = "";
      if (params[2]) cmd = params[2];
      if (!cmd) {
        text += `ACTIVE TITLE: ${character.active_title.name}`;
        text += `\nTitle Curriculum: ${character.active_title.title_xp}/${character.active_title.title_completion}\n`;
        if (
          character.other_titles.length > 0 ||
          (character.other_titles.length == 1 &&
            character.other_titles[0].name == character.active_title.name)
        ) {
          text += `\n INACTIVE TITLES: \``;
          for (i = 0; i < character.other_titles.length; i++) {
            if (character.other_titles[i].name != character.active_title.name)
              text += `${character.other_titles[i].name} `;
          }
          text += "`";
        }
        break;
      }

      if (params[3]) title_name = params[3].toUpperCase();
      if (!title_name) {
        text += `No title was given`;
        break;
      }

      if (cmd == "remove" || cmd == "rm") {
        let index = character.other_titles.findIndex(
          (e) => e.name == title_name
        );
        if (index > -1) {
          character.other_titles.splice(index, 1);
          text += `${characterName} has removed the title:${title_name}.\n`;
          if (title_name == character.active_title.name) {
            character.active_title = {
              name: "",
              title_xp: 0,
              title_completion: 0,
            };
            text += `${characterName} has no active title`;
          }
        } else
          text += `${characterName} does not have the title:${title_name}.\n`;
        if (character.id) {
          onlineDataToUpdate["active_title"] = character.active_title.name;
          onlineDataToUpdate["titles"] = character.active_title
            ? [character.active_title].concat(character.other_titles || [])
            : character.other_titles || [];
        }
        break;
      } else if (cmd == "activate" || cmd == "active" || cmd == "act") {
        let index = character.other_titles.findIndex(
          (e) => e.name == title_name
        );
        if (index > -1) {
          character.active_title.name = character.other_titles[index].name;
          character.active_title.title_completion =
            character.other_titles[index].completion;
          character.active_title.title_xp = 0;
          text += `${characterName} has activated the title:${title_name}.\n`;
        } else
          text += `${characterName} does not have the title:${title_name}.\n`;
        if (character.id) {
          onlineDataToUpdate["active_title"] = character.active_title.name;
          onlineDataToUpdate["titles"] = character.active_title
            ? [character.active_title].concat(character.other_titles || [])
            : character.other_titles || [];
        }
        break;
      }

      if (cmd == "xp") {
        if (params[3]) val = Number(params[3]);
        if (!val) {
          text += `No value was given`;
          break;
        }
        character.active_title.title_xp += val;
        if (
          character.active_title.title_xp >=
          character.active_title.title_completion
        ) {
          character.active_title.title_xp =
            character.active_title.title_completion;
          text += `${characterName} has added ${val} to their title XP and completed their title curriculum. \n${characterName} can now change titles.`;
          if (character.id)
            onlineDataToUpdate["titles"] = character.active_title
              ? [character.active_title].concat(character.other_titles || [])
              : character.other_titles || [];
          break;
        }
        if (val > 0)
          text += `${characterName} has added ${val} to their title XP, for a total of ${character.active_title.title_xp}.`;
        else {
          if (character.active_title.title_xp < 0) {
            character.active_title.title_xp = 0;
            text += `${characterName} has removed all of their title XP.`;
            if (character.id)
              onlineDataToUpdate["titles"] = character.active_title
                ? [character.active_title].concat(character.other_titles || [])
                : character.other_titles || [];
            break;
          }
          text += `${characterName} has removed ${-val} to their title XP, for a total of ${
            character.active_title.title_xp
          }.`;
        }
        if (character.id)
          onlineDataToUpdate["titles"] = character.active_title
            ? [character.active_title].concat(character.other_titles || [])
            : character.other_titles || [];
        break;
      } else if (cmd == "max_xp" || cmd == "max" || cmd == "mxp") {
        if (params[3]) val = Number(params[3]);
        if (!val) {
          text += `No value was given`;
          break;
        }
        if (val > 0) {
          character.active_title.title_completion = val;
          text += `The curriculum for title ${character.active_title.name} now requires ${val} XP to be completed.`;
        } else text += `Please enter a positive value.`;
        if (character.id)
          onlineDataToUpdate["titles"] = character.active_title
            ? [character.active_title].concat(character.other_titles || [])
            : character.other_titles || [];
        break;
      }
      if (cmd == "add" || cmd == "set" || cmd == "a" || cmd == "s") {
        if (params[4]) mtxp = Number(params[4]);
        if (!mtxp) {
          text += `No value was given`;
          break;
        }
        character.other_titles.push({ name: title_name, completion: mtxp });
        text += `\n${characterName} has gained the title ${title_name}. Its curriculum will be complete after ${mtxp} XP.`;
        if (character.id)
          onlineDataToUpdate["titles"] = character.active_title
            ? [character.active_title].concat(character.other_titles || [])
            : character.other_titles || [];
        break;
      } else {
        text += `No correct command was given. Please use add, remove, max_xp, xp or activate.`;
      }
      break;

    case "txp":
    case "title_xp":
      if (!character["active_title"]) {
        character.active_title = { name: "", title_xp: 0, title_completion: 0 };
        if (character.link) onlineDataToUpdate["active_title"] = "";
      }
      if (!character["other_titles"]) {
        character.other_titles = [];
        if (character.id)
          onlineDataToUpdate["titles"] = [character.active_title];
      }
      if (modifier) {
        character.active_title.title_xp += modifier;
        if (
          character.active_title.title_xp >=
          character.active_title.title_completion
        ) {
          character.active_title.title_xp =
            character.active_title.title_completion;
          text += `${characterName} has added ${modifier} to their title XP and completed their title curriculum.`;
          if (character.id)
            onlineDataToUpdate["titles"] = character.active_title
              ? [character.active_title].concat(character.other_titles || [])
              : character.other_titles || [];
          break;
        }
        if (modifier > 0)
          text += `${characterName} has added ${modifier} to their title XP, for a total of ${character.active_title.title_xp}.`;
        else {
          if (character.active_title.title_xp < 0) {
            character.active_title.title_xp = 0;
            text += `${characterName} has removed all of their title XP.`;
            if (character.id)
              onlineDataToUpdate["titles"] = character.active_title
                ? [character.active_title].concat(character.other_titles || [])
                : character.other_titles || [];
            break;
          }
          text += `${characterName} has removed ${-modifier} to their title XP, for a total of ${
            character.active_title.title_xp
          }.`;
        }
      }
      if (character.id)
        onlineDataToUpdate["titles"] = character.active_title
          ? [character.active_title].concat(character.other_titles || [])
          : character.other_titles || [];
      break;

    case "show":
      text += buildCharacterStatus(characterName, character);
      break;

    case "modify":
      let stat;
      if (params[3] === "composure") stat = "composure";
      else if (params[3] === "endurance") stat = "endurance";

      if (!stat || !modifier) {
        text += "Bad Command, !help char for more information";
        break;
      }
      character[stat] = +character[stat] + modifier;
      if (character.id) onlineDataToUpdate[stat] = character[stat];
      if (character[stat] < 0) character[stat] = 0;
      text += `${characterName}'s ${stat} is modified to ${character[stat]}`;
      break;

    case "reset":
      text = "Deleting all the characters.";
      characterStatus = false;
      character = false;
      break;

    case "remove":
      character = false;
      delete characterStatus[characterName];
      text += `${characterName} has been removed.`;
      break;

    case "list":
      if (Object.keys(characterStatus).length < 1) text += "No characters.";
      else
        Object.keys(characterStatus)
          .sort()
          .forEach(
            (name) =>
              (text += `${buildCharacterStatus(
                name,
                characterStatus[name]
              )}\n\n`)
          );
      break;

    case "dashboard":
    case "web":
    case "link":
    case "id":
    case "online":
      cmd = "";
      command = "web";
      if (params[2]) cmd = params[2];
      if (!cmd) {
        if (!character["link"] || !character["id"]) {
          text = `There is no ${
            !character["link"] ? "link" : "id"
          }. To create one, please use the command !char online char_name create.`;
          break;
        }
        text = `To acces the character sheet online, please use this link: ${character.link}. You can also use the id: ${character.id}`;
      }
      if (cmd == "add" || cmd == "create") {
        text = "";
        if (character["link"] || character["id"]) {
          text += character["link"]
            ? `A link already exists for this character: ${character["link"]} and won't be used anymore with discord.\n`
            : "";
          text += character["id"]
            ? `An id already exists for this character: ${character["id"]} and won't be used anymore with discord.\n`
            : "";
          text +=
            "If you need to get the data back, please use the link or the id to access them online";
        }
        const id = uuidv4();
        character.link = `http://rokugan.dyvoire.fr?name=${characterName}&id=${id}`;
        character.id = id;
        const dashboardCharacter = createDashboardCharacter(
          character,
          characterName,
          message
        );
        writeDashboardData(character.id, dashboardCharacter);
        text += `\nA new online character has been created. \nIt is available at url: ${character["link"]} or with id ${character["id"]}`;
      } else {
        text =
          "No correct command was given. Please use '!char link char_name' or '!char link char_name add'.";
      }
      break;

    default:
      text += `Command:**${command}** not recognized`;
  }
  if (character) {
    if ("id" in character && command != "web" && command != "show") {
      writeDashboardData(`${character.id}`, onlineDataToUpdate, message, true);
    }
    characterStatus[characterName] = { ...character };
  }
  main.sendMessage(message, text);
  writeData(client, message, "characterStatus", characterStatus);
};

const buildCharacterStatus = (name, character) => {
  let text = `__**${name}**__`;
  if (character.active_title) text += `\n__${character.active_title.name}__`;
  text += `\n \`AIR:${character.rings.AIR}\` \`EARTH:${character.rings.EARTH}\` \`FIRE:${character.rings.FIRE}\` 
        \`WATER:${character.rings.WATER}\` \`VOID:${character.rings.VOID}\` `;

  if (character.endurance > 0)
    text += `\nFatigue: \`${character.fatigue} / ${character.endurance}\``;
  if (character.composure > 0)
    text += `\nStrife: \`${character.strife} / ${character.composure}\``;
  text += `\nVoid Points: \`${character.currentVoidPoints} / ${character.maxVoidPoints}\``;
  text += `\nVigilance: \`${character.vigilance}\``;
  text += `\nFocus: \`${character.focus}\``;
  text += `\nHonor: \`${character.honor}\``;
  text += `\nGlory: \`${character.glory}\``;
  text += `\nStatus: \`${character.status}\``;

  if (character.money > 0) {
    zeni = character.money % 10;
    bu = ((character.money - zeni) / 10) % 5;
    koku = ((character.money - zeni) / 10 - bu) / 5;
    text += `\nMoney: \`Koku: ${koku}\` \`Bu: ${bu}\` \`Zeni: ${zeni}\``;
  }
  text += `\nSchool Rank: \`${character.school_rank}\` `;
  if (character.xp > 0) text += `XP: \`${character.xp}\` `;
  if (character.curriculum_xp > 0)
    text += `Curriculum_XP: \`${character.curriculum_xp}\``;
  ["obligation", "duty", "inventory", "misc"].forEach((type) => {
    if (character[type]) {
      if (Object.keys(character[type]).length > 0) {
        text += `\n${upperFirst(type)}: \``;
        Object.keys(character[type]).forEach((name) => {
          text += `${name}: ${character[type][name]}  `;
        });
        text += "`";
      }
    }
  });
  if (
    (character.endurance < character.fatigue && character.endurance > 0) ||
    (character.composure < character.strife && character.composure)
  ) {
    text += `\n\`INCAPACITATED\``;
  }
  return text;
};

exports.char = char;
