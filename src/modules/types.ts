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

export enum AlarmType {
  WORK ="WORK",
  POM = "POM"
}

export enum AlertType {
  NOTIFY = 'NOTIFY',
  WARN = 'WARN'
}
/// State related ///
export const Config_Schema = z.object({
  pomTimeMins: z.number(),
  pomActive: z.boolean(),
  ratio: z.number(),
  mode: z.nativeEnum(Mode),
  dark: z.boolean().nullable()
})
export type Config = z.infer<typeof Config_Schema>

/// Storage related ///
export const Error_Info_Schema = z.object({ // unify it with action? notification too
  errorJson : z.string(),
  userMessage : z.string().optional()
})
export type Error_Info = z.infer<typeof Error_Info_Schema>

export const TogglForm_Schema = z.object({
  shouldSave: z.boolean(),
  saved: z.tuple([z.number(), z.number()]).or(z.boolean()),
  desc: z.string(),
  projectId: z.number().nullable()
})
export type TogglForm = z.infer<typeof TogglForm_Schema>

export const Toggl_Project_Schema = z.object({
  id: z.number(),
  name: z.string()
})
export type TogglProject = z.infer<typeof Toggl_Project_Schema>

export const Toggl_State_Schema = z.object({
  token: z.string().nullable(),
  projects: z.array(Toggl_Project_Schema),
  form: TogglForm_Schema,
  loaded: z.boolean().or(z.string())
})
export type TogglState = z.infer<typeof Toggl_State_Schema>

export const State_Schema = z.object({
  alarms: z.object({
    work: z.number().nullable(),
    pom: z.number().nullable()
  }),
  nextRestTime: z.number(),
  workingSince: z.number().nullable(),
  restingUntil: z.number().nullable(),
  config: Config_Schema,
  toggl: Toggl_State_Schema,
  notification: z.nativeEnum(AlarmType).nullable(),
  warning: Error_Info_Schema.nullable()
})
export type State = z.infer<typeof State_Schema>

/// Toggl related ////
export const Toggl_Entry_Schema = z.object({
  start : z.string(),
  duration : z.number(),
  description : z.string(),
  created_with : z.string(),
  pid : z.number().optional()
})
export type Toggl_Entry = z.infer<typeof Toggl_Entry_Schema>
export type Toggl_Entry_Params = {
  time_entry: Toggl_Entry
}

export type Toggl_Auth = string | {user :string, pass :string}

export const Toggl_Me_Schema = z.object({
  data: z.object({
    projects : Toggl_Project_Schema.array().default([]),
    time_entries : Toggl_Entry_Schema.partial().array().default([])
  })
})
export type Toggl_Me = z.infer<typeof Toggl_Me_Schema>

export const Notification_Schema = z.nativeEnum(AlarmType)

export const AlarmId_Schema = z.string()
export type AlarmId = z.infer<typeof AlarmId_Schema>
