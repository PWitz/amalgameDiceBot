const createDashboardCharacter = (character, name, message) => {
  return {
    family: "",
    school: "",
    region: "",
    upbringing: "",
    name: name,
    giri: [],
    ninjo: [],
    duty: character.duty,
    obligation: character.obligation,
    distinctions: [],
    passions: [],
    adversities: [],
    anxieties: [],
    portrait: null,
    bonds: [],
    xp: character.xp,
    curriculum_xp: character.curriculum_xp,
    school_rank: character.school_rank,
    advances: [],
    fatigue: character.fatigue,
    endurance: character.endurance,
    strife: character.strife,
    composure: character.composure,
    focus: character.focus,
    vigilance: character.vigilance,
    currentVoidPoints: character.currentVoidPoints,
    maxVoidPoints: character.maxVoidPoints,
    air: character.rings.AIR,
    earth: character.rings.EARTH,
    fire: character.rings.FIRE,
    water: character.rings.WATER,
    void: character.rings.VOID,
    techniques: [],
    skills: [],
    honor: character.honor,
    glory: character.glory,
    status: character.status,
    active_title: character.active_title.name,
    titles: character.other_titles.concat([character.active_title]),
    money: character.money,
    armor: [],
    personal_effects: character.inventory || [],
    weapons: [],
    guild: message.guild.id,
    channel: message.channel.id,
  };
};

exports.createDashboardCharacter = createDashboardCharacter;