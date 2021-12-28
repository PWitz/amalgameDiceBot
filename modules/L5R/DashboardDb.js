const dashboardMapping = {
  name: "rp.name",
  clan: "rp.background.clan",
  family: "rp.background.family",
  school: "rp.background.school",
  region: "rp.background.region",
  upbringing: "rp.background.upbringing",
  ninjo: "rp.motivations.ninjo",
  giri: "rp.motivations.giri",
  duty: "rp.motivations.duty",
  obligation: "rp.motivations.obligation",
  distinctions: "rp.advantages_disadvantages.advantages.distinctions",
  passions: "rp.advantages_disadvantages.advantages.passions",
  adversities: "rp.advantages_disadvantages.disadvantages.adversities",
  anxieties: "rp.advantages_disadvantages.disadvantages.anxieties",
  portrait: "rp.portrait",
  bonds: "rp.bonds",
  xp: "advancement.xp",
  curriculum_xp: "advancement.curriculum.xp",
  school_rank: "advancement.curriculum.school_rank",
  advances: "advancement.advances",
  fatigue: "stats.health.fatigue",
  endurance: "stats.health.endurance",
  crit: "stats.health.crit",
  strife: "stats.sanity.strife",
  composure: "stats.sanity.composure",
  focus: "stats.derived_attributes.focus",
  vigilance: "stats.derived_attributes.vigilance",
  currentVoidPoints: "stats.voidPoints.current",
  maxVoidPoints: "stats.voidPoints.max",
  AIR: "stats.rings.air",
  EARTH: "stats.rings.earth",
  FIRE: "stats.rings.fire",
  WATER: "stats.rings.water",
  VOID: "stats.rings.void",
  techniques: "stats.techniques",
  skills: "stats.skills",
  honor: "stats.status.honor",
  glory: "stats.status.glory",
  status: "stats.status.status",
  active_title: "stats.titles.active",
  titles: "stats.titles.titles",
  money: "inventory.money",
  armor: "inventory.items.armor",
  personal_effects: "inventory.items.personal_effects",
  inventory: "inventory.items.personal_effects",
  misc: "inventory.items.personal_effects",
  weapons: "inventory.items.weapons",
  guild: "discord.guild",
  channel: "discord.channel",
};

const createDashboardCharacter = (character, message) => {
  return {
    rp: {
      name: character.name,
      background: {},
      motivations: {
        ninjo: [],
        giri: [],
        duty: character.duty,
        obligation: character.obligation,
      },
      advantages_disadvantages: {
        advantages: {
          distinctions: [],
          passions: [],
        },
        disadvantages: {
          adversities: [],
          anxieties: [],
        },
      },
      portrait: null,
      bonds: [],
    },
    advancement: {
      xp: character.xp,
      curriculum: {
        xp: character.curriculum_xp,
        school_rank: character.school_rank,
      },
      advances: [],
    },
    stats: {
      health: {
        fatigue: character.fatigue,
        endurance: character.endurance,
        crit: character.crit,
      },
      sanity: { strife: character.strife, composure: character.composure },
      derived_attributes: {
        focus: character.focus,
        vigilance: character.vigilance,
      },
      voidPoints: {
        current: character.currentVoidPoints,
        max: character.maxVoidPoints,
      },
      rings: {
        air: character.rings.AIR,
        earth: character.rings.EARTH,
        fire: character.rings.FIRE,
        water: character.rings.WATER,
        void: character.rings.VOID,
      },
      techniques: [],
      skills: [],
      status: {
        honor: character.honor,
        glory: character.glory,
        status: character.status,
      },
      titles: {
        active: character.active_title.name,
        titles: character.titles.push(character.active_title),
      },
    },

    inventory: {
      money: character.money,
      items: {
        armor: [],
        personal_effects: character.inventory,
        weapons: [],
      },
    },
    discord: {
      guild: message.guild.id,
      channel: message.channel.id,
    },
  };
};

const updateRing = (ring, value, char, onlineChar = null) => {
  char.rings[ring] = value;
};

exports.dashboardMapping = dashboardMapping;
exports.createDashboardCharacter = createDashboardCharacter;
