/* eslint-disable @typescript-eslint/naming-convention */
import { container, DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
//import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod  } from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ITraderAssort, ITraderBase } from "@spt-aki/models/eft/common/tables/ITrader";
import { ITraderConfig, UpdateTime } from "@spt-aki/models/spt/config/ITraderConfig";
import { ILocaleGlobalBase } from "@spt-aki/models/spt/server/ILocaleBase";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { DatabaseImporter } from "@spt-aki/utils/DatabaseImporter";
import { LocationGenerator } from "@spt-aki/generators/LocationGenerator";

let mydb;
const debug = false;
import * as joshj5hawkJson from "../db/joshj5hawk.json";

import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { isThisTypeNode, textSpanContainsPosition } from "typescript";

class SuperItems implements IPreAkiLoadMod, IPostDBLoadMod
{
    mod: string;
    private modConfig = require("../config/config.json");
    constructor()
    {
        this.mod = "JoshJ5Hawk-SuperItems";
    }

    preAkiLoad(container: DependencyContainer): void
    {

        const logger = container.resolve<ILogger>("WinstonLogger");
        //const modName = "JoshJ5Hawk-SuperItems";

        this.registerProfileImage(container);

        this.setupTraderUpdateTime(container);

        logger.logWithColor("HEY! The database isn't loaded yet!", LogTextColor.red);
       
    }

    postDBLoad(container: DependencyContainer): void
    {
        const modName = "JoshJ5Hawk-SuperItems";
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const databaseImporter = container.resolve<DatabaseImporter>("DatabaseImporter");
        const JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const locales = db.locales.global;
        const logger = container.resolve<ILogger>("WinstonLogger");
        mydb = databaseImporter.loadRecursive(`${preAkiModLoader.getModPath(modName)}db/`);

        //Trader Things

        db.traders[joshj5hawkJson._id] =
        {
            assort: this.createAssortTable(),
            base: JsonUtil.deserialize(JsonUtil.serialize(joshj5hawkJson)) as ITraderBase,
            questassort: undefined
        };

        const traderLocales = Object.values(db.locales.global) as ILocaleGlobalBase[];
        for (const locale of traderLocales)
        {
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
        for (const item in mydb.templates.items.items.templates)
        {
            db.templates.items[item] = mydb.templates.items.items.templates[item];
            db.templates.items[item]._props.Finallowed = false;
            db.templates.items[item]._props.FinAllowed = false;
            
            if (debug)
            {
                logger.logWithColor(item + " added", LogTextColor.green);
            }
        }
        
        // Add Locales
        for (const locale in mydb.locales.en.templates)
        {
            locales.en.templates[locale] = mydb.locales.en.templates[locale];
            if (debug)
            {
                logger.logWithColor(locale + " locale added", LogTextColor.cyan);
            }
        }

        //Add Handbook Entries (the right way now)
        for (const handbook of mydb.templates.handbook.Items)
        {   
            if (!db.templates.handbook.Items.find(i => i.Id == handbook.Id))
                db.templates.handbook.Items.push(handbook);
            if (debug)
            {
                logger.logWithColor(handbook.Id + " handbook added", LogTextColor.red);
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

        logger.logWithColor("HEY!! Database has loaded, make changes now!", LogTextColor.cyan);

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
        for (const buff in myBuffs)
        {
            buffs[buff] = myBuffs[buff];
            logger.logWithColor(buff + " added", LogTextColor.red);
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

    private cloneItem(itemtoClone:string, newitemID:string)
    {
        
        const JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const logger = container.resolve<ILogger>("WinstonLogger");
        const itemToAdd = newitemID;
        db.templates.items[itemToAdd] = JsonUtil.clone(db.templates.items[itemtoClone])
        db.templates.items[itemToAdd]._id = itemToAdd;

        if (debug)
        {
            logger.logWithColor(itemToAdd + " added", LogTextColor.green);
        }
    }

    private addToStaticLoot(containerID:string, itemToAdd:string, probablity:number)
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();

        const lootContainter = db.loot.staticLoot[containerID];
        const lootDistr = lootContainter.itemDistribution;
        
        const newLoot = [
            {
                tpl: itemToAdd,
                relativeProbability: probablity
            }
        ];
        for (const lootItem of newLoot)
        {
            lootDistr.push.apply(lootDistr, [lootItem]);
        }
        lootContainter.itemDistribution = lootDistr;
        //if (debug) logger.log([lootContainter], "green");
    }

    private registerProfileImage(container: DependencyContainer): void 
    {
        const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const imageFilepath = `./${preAkiModLoader.getModPath(this.mod)}res`;

        const imageRouter = container.resolve<ImageRouter>("ImageRouter");
        imageRouter.addRoute(joshj5hawkJson.avatar.replace(".jpg", ""), `${imageFilepath}/jj5hitems.jpg`);
    }

    private setupTraderUpdateTime(container: DependencyContainer): void 
    {
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const traderRefreshConfig: UpdateTime = {traderId: joshj5hawkJson._id, seconds: 3600}
        traderConfig.updateTime.push(traderRefreshConfig);
    }

    
    private createAssortTable(): ITraderAssort
    {
        const assortTable: ITraderAssort = {
            items: [],
            barter_scheme: {},
            loyal_level_items: {}
        }

        const ROUBLE_ID = "5449016a4bdc2d6f028b456f";

        const newSuperDuperPilgrim: Item = {
            _id: "superduperpilgrim",
            _tpl: "superduperpilgrim",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperAmmo: Item = {
            _id: "superammo",
            _tpl: "superammo",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperDocs: Item = {
            _id: "superdocs",
            _tpl: "superdocs",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperDog: Item = {
            _id: "superdog",
            _tpl: "superdog",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperIfak: Item = {
            _id: "superifak",
            _tpl: "superifak",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperKappa: Item = {
            _id: "superkappa",
            _tpl: "superkappa",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperKeyTool: Item = {
            _id: "superkeytool",
            _tpl: "superkeytool",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperMag: Item = {
            _id: "supermag",
            _tpl: "supermag",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperMed: Item = {
            _id: "supermed",
            _tpl: "supermed",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperNade: Item = {
            _id: "supernade",
            _tpl: "supernade",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperPilgrim: Item = {
            _id: "superpilgrim",
            _tpl: "superpilgrim",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperPistol: Item = {
            _id: "superpistol",
            _tpl: "superpistol",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperScav: Item = {
            _id: "superscav",
            _tpl: "superscav",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperWeaponsCase: Item = {
            _id: "superweaponscase",
            _tpl: "superweaponscase",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperThiccItemsCase: Item = {
            _id: "superthiccitemscase",
            _tpl: "superthiccitemscase",
            parentId: "hideout",
            slotId: "hideout",
            upd: {
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperA18: Item = {
            _id: "supera18",
            _tpl: "supera18",
            parentId: "hideout",
            slotId: "hideout",
            upd:{
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperBandana: Item = {
            _id: "superbandana",
            _tpl: "superbandana",
            parentId: "hideout",
            slotId: "hideout",
            upd:{
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperBandanaOrange: Item = {
            _id: "orangebandana",
            _tpl: "orangebandana",
            parentId: "hideout",
            slotId: "hideout",
            upd:{
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const newSuperSTim: Item = {
            _id: "superstim",
            _tpl: "superstim",
            parentId: "hideout",
            slotId: "hideout",
            upd:{
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        
        const newSuperSkill: Item = {
            _id: "superskill",
            _tpl: "superskill",
            parentId: "hideout",
            slotId: "hideout",
            upd:{
                UnlimitedCount: true,
                StackObjectsCount: 999999999,
            }
        };
        const neworangeM4A1Slide: Item = {
            _id: "orangem45a1slide",
            _tpl: "orangem45a1slide",
            parentId: "hideout",
            slotId: "hideout",
            upd:{
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
        assortTable.loyal_level_items["orangem45a1slide"]= 1;
        
        return assortTable;
    }
}

module.exports = { mod: new SuperItems() }