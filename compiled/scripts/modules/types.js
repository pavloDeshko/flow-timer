"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyType = exports.UserStorageSchema = exports.Toggl_Me_Schema = exports.Toggl_Entry_Schema = exports.Toggl_Project_Schema = exports.State = exports.Mode = void 0;
var zod_1 = require("zod");
var utils_1 = require("./utils");
var settings_1 = require("../settings");
var Mode;
(function (Mode) {
    Mode[Mode["OFF"] = 0] = "OFF";
    Mode["PAUSED"] = "PAUSED";
    Mode["ON"] = "ON";
})(Mode = exports.Mode || (exports.Mode = {}));
var State = /** @class */ (function () {
    function State() {
        this.time = (0, utils_1.secondsToObject)(0);
        this.nextRest = (0, utils_1.secondsToObject)(settings_1.MIN_REST);
        this.working = null;
        this.resting = null;
        this.config = {
            pomTime: 50,
            pomActive: false,
            ratio: settings_1.DEFAULT_RATIO,
            mode: Mode.ON,
            dark: false
        }; //TODO
        this.toggl = {
            login: {
                token: null,
                error: null,
                loading: false,
                projects: []
            },
            form: {
                shouldSave: false,
                unsaved: null,
                desc: '',
                projectId: null
            }
        };
    }
    return State;
}());
exports.State = State;
//to validate
exports.Toggl_Project_Schema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string()
});
exports.Toggl_Entry_Schema = zod_1.z.object({
    start: zod_1.z.string(),
    duration: zod_1.z.number(),
    description: zod_1.z.string(),
    created_with: zod_1.z.string(),
    pid: zod_1.z.number().optional()
});
exports.Toggl_Me_Schema = zod_1.z.object({
    data: zod_1.z.object({
        projects: exports.Toggl_Project_Schema.array().default([]),
        time_entries: exports.Toggl_Entry_Schema.partial().array().default([])
    })
});
exports.UserStorageSchema = zod_1.z.object({
    config: zod_1.z.object({
        pomTime: zod_1.z.number(),
        pomActive: zod_1.z.boolean(),
        ratio: zod_1.z.number(),
        mode: zod_1.z.nativeEnum(Mode),
        dark: zod_1.z.boolean()
    }).optional(),
    toggl: zod_1.z.object({
        auth: zod_1.z.string(),
        shouldSave: zod_1.z.boolean()
    }).optional()
});
var NotifyType;
(function (NotifyType) {
    NotifyType["WORK"] = "WORK";
    NotifyType["POM"] = "POM";
})(NotifyType = exports.NotifyType || (exports.NotifyType = {}));
/* {
  timer: secondsToObject(0),
  nextRest:  secondsToObject(MIN_REST),
  working: null,
  resting: null,
  config: {ratio: DEFAULT_RATIO},
  toggl: {
    token: null,
    error: null,
    loading: false,
    form: {active: false, desc: ''},
    toggling: null
  }
} */ 
