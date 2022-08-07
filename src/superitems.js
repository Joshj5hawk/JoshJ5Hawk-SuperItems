"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const tsyringe_1 = require("../../../../node_modules/tsyringe");
let mydb;
const debug = false;
const joshj5hawkJson = __importStar(require("../db/joshj5hawk.json"));
const ConfigTypes_1 = require("../../../../Aki_data/Server/lib/models/enums/ConfigTypes");
const LogTextColor_1 = require("../../../../Aki_data/Server/lib/models/spt/logging/LogTextColor");
class SuperItems {
    constructor() {
        this.modConfig = require("../config/config.json");
        this.mod = "JoshJ5Hawk-SuperItems";
    }
    preAkiLoad(container) {
        const logger = container.resolve("WinstonLogger");
        //const modName = "JoshJ5Hawk-SuperItems";
        this.registerProfileImage(container);
        this.setupTraderUpdateTime(container);
        logger.logWithColor("HEY! The database isn't loaded yet!", LogTextColor_1.LogTextColor.red);
    }
    postDBLoad(container) {
        const modName = "JoshJ5Hawk-SuperItems";
        const db = container.resolve("DatabaseServer").getTables();
        const databaseImporter = container.resolve("DatabaseImporter");
        const JsonUtil = container.resolve("JsonUtil");
        const preAkiModLoader = container.resolve("PreAkiModLoader");
        const locales = db.locales.global;
        const logger = container.resolve("WinstonLogger");
        mydb = databaseImporter.loadRecursive(`${preAkiModLoader.getModPath(modName)}db/`);
        //Trader Things
        db.traders[joshj5hawkJson._id] =
            {
                assort: this.createAssortTable(),
                base: JsonUtil.deserialize(JsonUtil.serialize(joshj5hawkJson)),
                questassort: undefined
            };
        const traderLocales = Object.values(db.locales.global);
        for (const locale of traderLocales) {
            locale.trading[joshj5hawkJson._id] =
                {
                    FullName: joshj5hawkJson.name,
                    FirstName: "JoshJ5Hawk",
                    Nickname: joshj5hawkJson.nickname,
                    Location: joshj5hawkJson.location,
                    Description: "Welcome to the SuperItem Shoppe"
                };
        }
        //Add My Items
        for (const item in mydb.templates.items.items.templates) {
            db.templates.items[item] = mydb.templates.items.items.templates[item];
            db.templates.items[item]._props.Finallowed = false;
            db.templates.items[item]._props.FinAllowed = false;
            if (debug) {
                logger.logWithColor(item + " added", LogTextColor_1.LogTextColor.green);
            }
        }
        // Add Locales
        for (const locale in mydb.locales.en.templates) {
            locales.en.templates[locale] = mydb.locales.en.templates[locale];
            if (debug) {
                logger.logWithColor(locale + " locale added", LogTextColor_1.LogTextColor.cyan);
            }
        }
        //Add Handbook Entries (the right way now)
        for (const handbook of mydb.templates.handbook.Items) {
            if (!db.templates.handbook.Items.find(i => i.Id == handbook.Id))
                db.templates.handbook.Items.push(handbook);
            if (debug) {
                logger.logWithColor(handbook.Id + " handbook added", LogTextColor_1.LogTextColor.red);
            }
        }
        //Do loot things?
        //Medbag SMU06
        this.addToStaticLoot("5909d24f86f77466f56e6855", "superifak", 1200);
        this.addToStaticLoot("5909d24f86f77466f56e6855", "superstim", 250);
        this.addToStaticLoot("5909d24f86f77466f56e6855", "superskill", 250);
        //Medcase
        this.addToStaticLoot("5909d4c186f7746ad34e805a", "superifak", 1200);
        this.addToStaticLoot("5909d4c186f7746ad34e805a", "superstim", 250);
        this.addToStaticLoot("5909d4c186f7746ad34e805a", "superskill", 250);
        //Dead Scav
        this.addToStaticLoot("5909e4b686f7747f5b744fa4", "superifak", 1200);
        this.addToStaticLoot("5909e4b686f7747f5b744fa4", "superstim", 250);
        this.addToStaticLoot("5909e4b686f7747f5b744fa4", "superskill", 250);
        //Plastic suitcase
        this.addToStaticLoot("5c052cea86f7746b2101e8d8", "superifak", 1200);
        this.addToStaticLoot("5c052cea86f7746b2101e8d8", "superstim", 250);
        this.addToStaticLoot("5c052cea86f7746b2101e8d8", "superskill", 250);
        //Medical supply crate
        this.addToStaticLoot("5d6fe50986f77449d97f7463", "superifak", 1200);
        this.addToStaticLoot("5d6fe50986f77449d97f7463", "superstim", 250);
        this.addToStaticLoot("5d6fe50986f77449d97f7463", "superskill", 250);
        //Add Bandana to Head
        const defaultInventoryID = db.templates.items["55d7217a4bdc2d86028b456d"];
        defaultInventoryID._props.Slots[5]._props.filters[0].Filter.push("superbandana");
        defaultInventoryID._props.Slots[5]._props.filters[0].Filter.push("orangebandana");
        defaultInventoryID._props.Slots[4]._props.filters[0].Filter.push("superbandana");
        defaultInventoryID._props.Slots[4]._props.filters[0].Filter.push("orangebandana");
        logger.logWithColor("HEY!! Database has loaded, make changes now!", LogTextColor_1.LogTextColor.cyan);
        //Custom Settings
        //Super Kappa Size
        db.templates.items.superkappa._props.Grids[0]._props.cellsH = this.modConfig.kappaH;
        db.templates.items.superkappa._props.Grids[0]._props.cellsV = this.modConfig.kappaV;
        //Super Pilgrim Size
        db.templates.items.superpilgrim._props.Grids[0]._props.cellsH = this.modConfig.pilgrimH;
        db.templates.items.superpilgrim._props.Grids[0]._props.cellsV = this.modConfig.pilgrimV;
        //Do Buff Stuff
        const buffs = db.globals.config.Health.Effects.Stimulator.Buffs;
        const myBuffs = mydb.globals.config.Health.Effects.Stimulator.Buffs;
        for (const buff in myBuffs) {
            buffs[buff] = myBuffs[buff];
            logger.logWithColor(buff + " added", LogTextColor_1.LogTextColor.red);
        }
        //Create Clone Items
        const m45A1SlideOrange = "orangem45a1slide";
        db.templates.items[m45A1SlideOrange] = JsonUtil.clone(db.templates.items["5f3e7823ddc4f03b010e2045"]);
        db.templates.items[m45A1SlideOrange]._id = m45A1SlideOrange;
        db.templates.items[m45A1SlideOrange]._props.Prefab.path = "assets/content/items/mods/recievers/reciever_m1911_colt_m45a1_orange.bundle";
        db.templates.items["5f36a0e5fbf956000b716b65"]._props.Slots[2]._props.filters[0].Filter.push(m45A1SlideOrange);
        this.cloneItem("superpilgrim", "superduperpilgrim");
        db.templates.items.superduperpilgrim._props.Width = 1;
        db.templates.items.superduperpilgrim._props.Height = 1;
        db.templates.items.superduperpilgrim._props.Grids[0]._props.cellsH = 6;
        db.templates.items.superduperpilgrim._props.Grids[0]._props.cellsV = 600;
        //superpilgrim
        //superkappa
        //superscav
        //superammo
        //supernade
        //superpistol
        //supermag
        //superweaponscase
        //superthiccitemscase
    }
    cloneItem(itemtoClone, newitemID) {
        const JsonUtil = tsyringe_1.container.resolve("JsonUtil");
        const db = tsyringe_1.container.resolve("DatabaseServer").getTables();
        const logger = tsyringe_1.container.resolve("WinstonLogger");
        const itemToAdd = newitemID;
        db.templates.items[itemToAdd] = JsonUtil.clone(db.templates.items[itemtoClone]);
        db.templates.items[itemToAdd]._id = itemToAdd;
        if (debug) {
            logger.logWithColor(itemToAdd + " added", LogTextColor_1.LogTextColor.green);
        }
    }
    addToStaticLoot(containerID, itemToAdd, probablity) {
        const logger = tsyringe_1.container.resolve("WinstonLogger");
        const db = tsyringe_1.container.resolve("DatabaseServer").getTables();
        const lootContainter = db.loot.staticLoot[containerID];
        const lootDistr = lootContainter.itemDistribution;
        const newLoot = [
            {
                tpl: itemToAdd,
                relativeProbability: probablity
            }
        ];
        for (const lootItem of newLoot) {
            lootDistr.push.apply(lootDistr, [lootItem]);
        }
        lootContainter.itemDistribution = lootDistr;
        //if (debug) logger.log([lootContainter], "green");
    }
    registerProfileImage(container) {
        const preAkiModLoader = container.resolve("PreAkiModLoader");
        const imageFilepath = `./${preAkiModLoader.getModPath(this.mod)}res`;
        const imageRouter = container.resolve("ImageRouter");
        imageRouter.addRoute(joshj5hawkJson.avatar.replace(".jpg", ""), `${imageFilepath}/jj5hitems.jpg`);
    }
    setupTraderUpdateTime(container) {
        const configServer = container.resolve("ConfigServer");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const traderRefreshConfig = { traderId: joshj5hawkJson._id, seconds: 3600 };
        traderConfig.updateTime.push(traderRefreshConfig);
    }
    createAssortTable() {
        const assortTable = {
            items: [],
            barter_scheme: {},
            loyal_level_items: {}
        };
        const ROUBLE_ID = "5449016a4bdc2d6f028b456f";
        const newSuperDuperPilgrim = {
            _id: "superduperpilgrim",
            _tpl: "superduperpilgrim",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperAmmo = {
            _id: "superammo",
            _tpl: "superammo",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperDocs = {
            _id: "superdocs",
            _tpl: "superdocs",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperDog = {
            _id: "superdog",
            _tpl: "superdog",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperIfak = {
            _id: "superifak",
            _tpl: "superifak",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperKappa = {
            _id: "superkappa",
            _tpl: "superkappa",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperKeyTool = {
            _id: "superkeytool",
            _tpl: "superkeytool",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperMag = {
            _id: "supermag",
            _tpl: "supermag",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperMed = {
            _id: "supermed",
            _tpl: "supermed",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperNade = {
            _id: "supernade",
            _tpl: "supernade",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperPilgrim = {
            _id: "superpilgrim",
            _tpl: "superpilgrim",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperPistol = {
            _id: "superpistol",
            _tpl: "superpistol",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperScav = {
            _id: "superscav",
            _tpl: "superscav",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperWeaponsCase = {
            _id: "superweaponscase",
            _tpl: "superweaponscase",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperThiccItemsCase = {
            _id: "superthiccitemscase",
            _tpl: "superthiccitemscase",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperA18 = {
            _id: "supera18",
            _tpl: "supera18",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperBandana = {
            _id: "superbandana",
            _tpl: "superbandana",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperBandanaOrange = {
            _id: "orangebandana",
            _tpl: "orangebandana",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperSTim = {
            _id: "superstim",
            _tpl: "superstim",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperSkill = {
            _id: "superskill",
            _tpl: "superskill",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const neworangeM4A1Slide = {
            _id: "orangem45a1slide",
            _tpl: "orangem45a1slide",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        //assortTable.items.push(newSuperDuperPilgrim);
        assortTable.items.push(newSuperAmmo);
        assortTable.items.push(newSuperDocs);
        assortTable.items.push(newSuperDog);
        assortTable.items.push(newSuperIfak);
        assortTable.items.push(newSuperKappa);
        assortTable.items.push(newSuperKeyTool);
        assortTable.items.push(newSuperMag);
        assortTable.items.push(newSuperMed);
        assortTable.items.push(newSuperNade);
        assortTable.items.push(newSuperPilgrim);
        assortTable.items.push(newSuperPistol);
        assortTable.items.push(newSuperScav);
        assortTable.items.push(newSuperWeaponsCase);
        assortTable.items.push(newSuperThiccItemsCase);
        assortTable.items.push(newSuperA18);
        assortTable.items.push(newSuperBandana);
        assortTable.items.push(newSuperSTim);
        assortTable.items.push(newSuperSkill);
        assortTable.items.push(newSuperBandanaOrange);
        assortTable.items.push(neworangeM4A1Slide);
        assortTable.barter_scheme["superduperpilgrim"] = [
            [
                {
                    count: this.modConfig.superammoPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superammo"] = [
            [
                {
                    count: this.modConfig.superammoPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superdocs"] = [
            [
                {
                    count: this.modConfig.superdocsPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superdog"] = [
            [
                {
                    count: this.modConfig.superdogPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superifak"] = [
            [
                {
                    count: this.modConfig.superifakPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superkappa"] = [
            [
                {
                    count: this.modConfig.superkappaPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superkeytool"] = [
            [
                {
                    count: this.modConfig.superkeytoolPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["supermag"] = [
            [
                {
                    count: this.modConfig.supermagPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["supermed"] = [
            [
                {
                    count: this.modConfig.supermedPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["supernade"] = [
            [
                {
                    count: this.modConfig.supernadePrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superpilgrim"] = [
            [
                {
                    count: this.modConfig.superpilgrimPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superpistol"] = [
            [
                {
                    count: this.modConfig.superpistolPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superscav"] = [
            [
                {
                    count: this.modConfig.superscavPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superweaponscase"] = [
            [
                {
                    count: this.modConfig.superweaponscasePrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superthiccitemscase"] = [
            [
                {
                    count: this.modConfig.superthiccitemscasePrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["supera18"] = [
            [
                {
                    count: this.modConfig.supera18Price,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superbandana"] = [
            [
                {
                    count: this.modConfig.superbandanaPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superstim"] = [
            [
                {
                    count: this.modConfig.superstimPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["superskill"] = [
            [
                {
                    count: this.modConfig.superskillPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["orangebandana"] = [
            [
                {
                    count: this.modConfig.orangebandanaPrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.barter_scheme["orangem45a1slide"] = [
            [
                {
                    count: this.modConfig.orangem45a1slidePrice,
                    _tpl: ROUBLE_ID
                }
            ]
        ];
        assortTable.loyal_level_items["superduperpilgrim"] = 1;
        assortTable.loyal_level_items["superammo"] = 1;
        assortTable.loyal_level_items["superdocs"] = 1;
        assortTable.loyal_level_items["superdog"] = 1;
        assortTable.loyal_level_items["superifak"] = 1;
        assortTable.loyal_level_items["superkappa"] = 1;
        assortTable.loyal_level_items["superkeytool"] = 1;
        assortTable.loyal_level_items["supermag"] = 1;
        assortTable.loyal_level_items["supermed"] = 1;
        assortTable.loyal_level_items["supernade"] = 1;
        assortTable.loyal_level_items["superpilgrim"] = 1;
        assortTable.loyal_level_items["superpistol"] = 1;
        assortTable.loyal_level_items["superscav"] = 1;
        assortTable.loyal_level_items["superweaponscase"] = 1;
        assortTable.loyal_level_items["superthiccitemscase"] = 1;
        assortTable.loyal_level_items["supera18"] = 1;
        assortTable.loyal_level_items["superbandana"] = 1;
        assortTable.loyal_level_items["superstim"] = 1;
        assortTable.loyal_level_items["superskill"] = 1;
        assortTable.loyal_level_items["orangebandana"] = 1;
        assortTable.loyal_level_items["orangem45a1slide"] = 1;
        return assortTable;
    }
}
module.exports = { mod: new SuperItems() };
