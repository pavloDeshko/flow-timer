import {z} from 'zod'

/// Misc ///
export type IconObject = {16:string, 32:string, 64:string} 

export type Time = {
  days?: number,
  hours: number,
  minutes: number,
  seconds: number,
  secondTenths?: number
}

export enum Mode {
  OFF = 0,
  PAUSED = 'PAUSED',
  ON = 'ON'
} 

export enum Status {
  IDLE = 0,
  WORKING = 'WORKING',
  RESTING = 'RESTING'
}

export enum AlarmType {
  WORK ="WORK",
  POM = "POM"
}
export const AlarmType_Schema = z.nativeEnum(AlarmType)

export enum UserAlertType {
  NOTIFY = 'NOTIFY',
  WARN = 'WARN'
}

/// Storage and State related ///
export const Config_Schema = z.object({
  pomTimeMins: z.number(),
  pomActive: z.boolean(),
  ratio: z.number(),
  mode: z.nativeEnum(Mode),
  dark: z.boolean().nullable()
})
/** App options */
export type Config = z.infer<typeof Config_Schema>

export const User_Alarm_Schema = z.object({
  type : AlarmType_Schema
})
/** Data of Alarm that went off */
export type UserAlarm = z.infer<typeof User_Alarm_Schema> 

export const User_Warning_Schema = z.discriminatedUnion('type',[
  z.object({type :z.literal('WARNING'), userMessage :z.string()}),
  z.object({type :z.literal('ERROR'), userMessage: z.string(), errorJson:z.string().optional()})
])
/** Warning for user - dispatched as events and stored at State*/
export type UserWarning = z.infer<typeof User_Warning_Schema>

export const Error_Info_Schema = z.object({
  errorJson : z.string(),
  userMessage : z.string().nullable()
})
/** Erro data for user - dispatched as events and stored at State*/
export type ErrorInfo = z.infer<typeof Error_Info_Schema>

export const TogglForm_Schema = z.object({
  shouldSave: z.boolean(),
  saved: z.tuple([z.number(), z.number()]).or(z.boolean()),
  desc: z.string(),
  projectId: z.number().nullable()
})
/** Form for data for time entry saved to Toggl */
export type TogglForm = z.infer<typeof TogglForm_Schema>

export const Toggl_Project_Schema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().default('#808080'),
  workspace_id: z.number(),
  active : z.boolean().optional()
})
/** Toggl user's projects data */
export type TogglProject = z.infer<typeof Toggl_Project_Schema>

export const Toggl_State_Schema = z.object({
  login: z.object({
    token:z.string(),
    workspace: z.number()
  }).nullable()
    .default(null),//update to v9 api requires relogin? yep
  projects: z.array(Toggl_Project_Schema),
  form: TogglForm_Schema,
  loaded: z.boolean().or(z.string())
})
/** Whole Toggl part of the State */
export type TogglState = z.infer<typeof Toggl_State_Schema>

export const State_Schema = z.object({
  nextRestTime: z.number(),
  workingSince: z.number().nullable(),
  restingUntil: z.number().nullable(),
  config: Config_Schema,
  toggl: Toggl_State_Schema,
  alarm: AlarmType_Schema.nullable(),
  warning: User_Warning_Schema.nullable()
})
/** App's main state */
export type State = z.infer<typeof State_Schema>
/* To update state schema use:
  key: z.preprocess(
    (raw:any)=>typeof raw == 'oldType' ? toNewType(raw) : raw,
  freshSchema)
or 
  key : z.preprocess( (raw:any)=>{
    const result = oldSchema.safeParse(raw)
    return result.success ? toNewType(result.data) : raw
  },freshSchema)
*/

/// Toggl api related ////
export const Toggl_Entry_Schema = z.object({
  start : z.string(),
  duration : z.number(),
  description : z.string(),
  created_with : z.string(),
  project_id: z.number().nullable().optional(),
  workspace_id: z.number()
})
export type Toggl_Entry = z.infer<typeof Toggl_Entry_Schema>

export type Toggl_Auth = string | {user :string, pass :string}

export const Toggl_Me_Schema = z.object({
  projects : Toggl_Project_Schema.array().default([]),
  time_entries : Toggl_Entry_Schema.partial().array().default([]),
  default_workspace_id: z.number()
})
export type Toggl_Me = z.infer<typeof Toggl_Me_Schema>

/// Used by background script to track set alarms ///  //TODO not just string for timeout?
export const AlarmId_Schema = z.string()
export type AlarmId = z.infer<typeof AlarmId_Schema>