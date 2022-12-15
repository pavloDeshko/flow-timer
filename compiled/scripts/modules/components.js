"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppFallback = exports.CopyLink = exports.TogglCollapsed = exports.TogglForm = exports.TogglLogin = exports.TogglError = exports.Options = exports.TimeAlert = exports.RestAdjust = exports.Controls = exports.Counter = exports.AccordionContainer = exports.BlockContainer = exports.AppContainer = exports.DispatchContext = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var Update_1 = __importDefault(require("@mui/icons-material/Update"));
var Save_1 = __importDefault(require("@mui/icons-material/Save"));
var Link_1 = __importDefault(require("@mui/icons-material/Link"));
var ExitToApp_1 = __importDefault(require("@mui/icons-material/ExitToApp"));
var Brightness4_1 = __importDefault(require("@mui/icons-material/Brightness4"));
var Brightness7_1 = __importDefault(require("@mui/icons-material/Brightness7"));
var Refresh_1 = __importDefault(require("@mui/icons-material/Refresh"));
var Key_1 = __importDefault(require("@mui/icons-material/Key"));
var FileCopyOutlined_1 = __importDefault(require("@mui/icons-material/FileCopyOutlined"));
var ExpandMore_1 = __importDefault(require("@mui/icons-material/ExpandMore"));
var HelpOutlineOutlined_1 = __importDefault(require("@mui/icons-material/HelpOutlineOutlined"));
var Close_1 = __importDefault(require("@mui/icons-material/Close"));
var clipboard_copy_1 = __importDefault(require("clipboard-copy"));
var types_1 = require("./types");
var utils_1 = require("./utils");
var settings_1 = require("../settings");
var service_1 = require("./service");
var TOGGL_HELP_IMAGE = "res/togglHelpImg.png";
exports.DispatchContext = react_1.default.createContext(function (a) { utils_1.log.debug('Dispached action: ', a); }); //for testing compts without provider
var AppContainer = function (_a) {
    var children = _a.children;
    return react_1.default.createElement(material_1.Box, { className: "App", sx: {
            width: "400px",
            padding: ".5rem",
            backgroundColor: "background.default",
            fontFamily: "Roboto, sans-serif"
        } },
        react_1.default.createElement(material_1.Stack, { className: "AppStack", spacing: 1 }, children));
};
exports.AppContainer = AppContainer;
/* export const AppContainer = ({children}:{children: ReactNode}) => <Box sx={{
  maxWidth: 320,
  fontFamily:'default',
  backgroundColor:'background.default',
  overflow:'auto',
  //overflowY:'scroll'
}}>{children}</Box>//TODO see into why styled doesnt check option keys
 */
var blockStyles = {
    //position:"relative",
    padding: "1rem",
    "& .MuiDivider-root": { marginY: "0.5rem" }
};
var BlockContainer = function (_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.stacked, stacked = _c === void 0 ? false : _c, _d = _a.sx, sx = _d === void 0 ? {} : _d;
    return react_1.default.createElement(material_1.Paper, { className: className, elevation: 3, sx: __assign(__assign({}, blockStyles), sx) }, stacked ? react_1.default.createElement(material_1.Stack, { spacing: 2 }, children) : children);
};
exports.BlockContainer = BlockContainer;
/* export const BlockContainer = ({children, className}:{children: ReactNode, className?: string}) => (
  <Paper className={className} elevation={2} sx={{
    margin: 1,
    padding: 1
  }}>{children}</Paper>
) */
var AccordionContainer = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, label = _a.label, children = _a.children, _c = _a.expanded, expanded = _c === void 0 ? false : _c;
    expanded = (0, utils_1.useFreeze)(expanded);
    return (react_1.default.createElement(material_1.Accordion, { className: className, elevation: 3, defaultExpanded: expanded, sx: __assign(__assign({}, blockStyles), { boxShadow: 0, ".MuiAccordionSummary-root, .MuiAccordionDetails-root": { paddingX: 0 }, ".MuiAccordionSummary-root": { minHeight: 0 }, ".MuiAccordionSummary-content": { marginY: 0 }, ".MuiAccordionDetails-root": { padding: "1rem 0 0 0" } }), disableGutters: true },
        react_1.default.createElement(material_1.AccordionSummary, { expandIcon: react_1.default.createElement(ExpandMore_1.default, { fontSize: "small" }) }, label),
        react_1.default.createElement(material_1.AccordionDetails, null, children)));
};
exports.AccordionContainer = AccordionContainer;
var HelpPopover = function (_a) {
    var children = _a.children;
    var triggerRef = react_1.default.createRef();
    var _b = (0, react_1.useState)(false), open = _b[0], setOpen = _b[1];
    return (react_1.default.createElement("span", null,
        react_1.default.createElement(HelpOutlineOutlined_1.default, { sx: { fontSize: "inherit", cursor: "pointer" }, ref: triggerRef, onClick: function (e) { return setOpen(true); } }),
        react_1.default.createElement(material_1.Popover, { sx: { ml: "10px" }, anchorOrigin: { vertical: 'top', horizontal: 'center' }, transformOrigin: { vertical: 'bottom', horizontal: 'center' }, anchorEl: function () { return triggerRef.current; }, onClose: function () { return setOpen(false); }, open: open },
            children,
            react_1.default.createElement(material_1.IconButton, { size: "small", sx: { position: "absolute", top: '5px', right: '5px' }, onClick: function (_) { return setOpen(false); } },
                react_1.default.createElement(Close_1.default, null)))));
};
exports.Counter = (0, react_1.memo)(function (_a) {
    /*   const colors = {
        [Status.IDLE]:'text',
        [Status.WORKING]:'secondary',
        [Status.RESTING]:'primary'
      } as const
      const color = status.resting ? 'primary.main' : status.working ? 'secondary.main' : 'text.primary'
     */
    var hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
    return (react_1.default.createElement(material_1.Typography, { sx: {
            '.seconds': {
                fontSize: '2rem',
                verticalAlign: 'top',
                position: 'relative',
                top: '0.20rem'
            }
        }, variant: "h3", textAlign: "center" },
        react_1.default.createElement("span", null, (0, utils_1.padTwoZeros)(hours)),
        react_1.default.createElement("span", { className: 'delimiter' }, ":"),
        react_1.default.createElement("span", null, (0, utils_1.padTwoZeros)(minutes)),
        react_1.default.createElement("span", { className: 'delimiter' }, ":"),
        react_1.default.createElement("span", { className: 'seconds' }, (0, utils_1.padTwoZeros)(seconds))));
    /*  return(
       <Box sx={{
         padding: 1,
         textAlign:'center',
         typography:'h3',
         '.delimiter':{
           color,
           verticalAlign:'text-bottom'
         }
       }}>
         <span>{padTwoZeros(hours)}</span>
         <span className='delimiter'>:</span>
         <span>{padTwoZeros(minutes)}</span>
         <span className='delimiter'>:</span>
         <span>{padTwoZeros(seconds)}</span>
       </Box>
     ) */
});
exports.Controls = (0, react_1.memo)(function (_a) {
    var working = _a.working, resting = _a.resting;
    var dispatch = (0, react_1.useContext)(exports.DispatchContext);
    var work = function () { return dispatch({ type: 'WORK' }); };
    var rest = function () { return dispatch({ type: 'REST' }); };
    //const buttonProps = {variant:'contained',  size:'large', fullWidth:true} as const
    return (react_1.default.createElement(material_1.ButtonGroup, { sx: {
            '.MuiButton-root, .MuiButton-root:hover': { borderWidth: '2px' }
        }, fullWidth: true },
        react_1.default.createElement(material_1.Button, { variant: working ? 'contained' : 'outlined', color: "secondary", onClick: work }, working ? 'stop working' : 'work'),
        react_1.default.createElement(material_1.Button, { variant: resting ? 'contained' : 'outlined', color: "primary", onClick: rest }, resting ? 'stop resting' : 'rest')));
    /*   return (
          <Stack direction={'row'} justifyContent={'space-between'} spacing={1} sx={{
            marginY:1,
            '& .MuiButton-root': {
              padding: 0.5,
              fontWeight: 'fontWeightMedium'
            }
          }}>
            <Button {...buttonProps} color='secondary' onClick={work}>Work</Button>
            <Button {...buttonProps} color='primary' onClick={rest}>Rest</Button>
          </Stack>
      ) */
});
/* export const Legend = memo(({working, resting} :{working :boolean, resting :boolean}) => {
  return (
    <Box sx={{
      minHeight:'1.5rem',
      textAlign:'center',
      color: resting ? 'primary.main' : working ? 'secondary.main' : 'text.primary'
    }}>
      <span>{working ? 'working..' : resting ? 'resting..' : ' '}</span>
    </Box>
  )
}) */
/* export const TimeForm = memo(({hours = 0, minutes = 0, seconds = 0}:{hours :number, minutes :number, seconds :number}) => {
  const dispatch = useContext(DispatchContext)

  const hoursRef = useRef<HTMLInputElement>()
  const minutesRef = useRef<HTMLInputElement>()
  const secondsRef = useRef<HTMLInputElement>()
  
  const onChange = () => {
    hoursRef.current && minutesRef.current && dispatch({
      type: 'ADJUST',
      time: {
        hours: parse.h(hoursRef.current!.value, hours), //TODO let it throw is ok?..
        minutes: parse.m(minutesRef.current!.value, minutes),
        seconds: 0
      }
    })
  }

  return(
    <Box component="span" sx={{
      display:'inline-block',
      marginY:1,
      '& .MuiTextField-root': {
        marginX: 1/4,
        width: '3rem'
      },
      '& .MuiOutlinedInput-input': {
        textAlign: 'center'
      },
      '& .seconds':{
        width:'2rem',
        '.MuiOutlinedInput-input':{
          fontSize: '0.6rem',
          padding: 0.5,
        }
      }
    }}>
      <TextField
        label='h'
        size='small'
        value={padTwoZeros(hours)}
        inputRef={hoursRef}
        onChange={onChange}
      />
      <TextField
        label='m'
        size='small'
        value={padTwoZeros(minutes)}
        inputRef={minutesRef}
        onChange={onChange}
      />
      <TextField
        className='seconds'
        label='s'
        size='small'
        value={padTwoZeros(seconds)}
        inputRef={secondsRef}
        onChange={onChange}
    />
    </Box>
  )
}) */
exports.RestAdjust = (0, react_1.memo)(function (_a) {
    var _b = _a.nextRest, hours = _b.hours, minutes = _b.minutes, seconds = _b.seconds, mode = _a.mode;
    var dispatch = (0, react_1.useContext)(exports.DispatchContext);
    var hoursRef = (0, react_1.useRef)();
    var minutesRef = (0, react_1.useRef)();
    var secondsRef = (0, react_1.useRef)();
    var onRecalculate = function () {
        dispatch({
            type: 'ADJUST',
            time: null
        });
    };
    var onChange = function () {
        hoursRef.current && minutesRef.current && dispatch({
            type: 'ADJUST',
            time: {
                hours: utils_1.parse.h(hoursRef.current.value, hours),
                minutes: utils_1.parse.m(minutesRef.current.value, minutes),
                seconds: utils_1.parse.s(secondsRef.current.value, seconds)
            }
        });
    };
    return (react_1.default.createElement(material_1.Box, { className: "NextRestSection", sx: {
            ".legend": { display: "inline-block", paddingY: "0.5rem", mr: 0.25 },
            ".MuiTextField-root": { width: "3rem", marginX: 0.25 },
            ".MuiOutlinedInput-input": { textAlign: "center", padding: 0.75 },
            ".MuiTextField-root.seconds": {
                width: "2rem",
                ".MuiOutlinedInput-input": {
                    fontSize: "0.6rem",
                    padding: 0.5
                }
            }
        } },
        react_1.default.createElement("div", { className: "legend" }, "Next rest will be"),
        react_1.default.createElement(material_1.TextField, { size: "small", label: "h", value: (0, utils_1.padTwoZeros)(hours), inputRef: hoursRef, onChange: onChange }),
        react_1.default.createElement(material_1.TextField, { size: "small", label: "m", value: (0, utils_1.padTwoZeros)(minutes), inputRef: minutesRef, onChange: onChange }),
        react_1.default.createElement(material_1.TextField, { size: "small", label: "s", className: "seconds", value: (0, utils_1.padTwoZeros)(seconds), inputRef: secondsRef, onChange: onChange }),
        react_1.default.createElement(material_1.Tooltip, { title: "reset time", placement: "right", arrow: true },
            react_1.default.createElement("span", null,
                react_1.default.createElement(material_1.IconButton, { color: "primary", onClick: onRecalculate, disabled: mode == types_1.Mode.ON },
                    react_1.default.createElement(Update_1.default, { fontSize: "small" }))))));
    /*   return (
        <Box sx={{
          marginY:1,
        }}>
          <Typography component='div'>Next rest: <TimeForm {...nextRest}/>
            <Tooltip title="Reset rest time" arrow>
              <span><IconButton
                //size="small"
                onClick={onRecalculate}
                disabled={mode == Mode.ON}
                //sx={{"&":{display:'inline-block'}}}
              >
                <Update />
              </IconButton></span>
            </Tooltip>
          </Typography>
        </Box>
      ) */
});
var TimeAlert = function (_a) {
    var type = _a.type;
    return (react_1.default.createElement(material_1.Collapse, { in: !!type },
        react_1.default.createElement(material_1.Alert, { variant: "outlined", severity: "warning" //TODO color depends on type?
            , sx: {
                pl: "0.5rem",
                "& > *": { paddingY: "0px" }
            }, action: react_1.default.createElement(material_1.IconButton, { sx: { paddingY: "0px" }, size: "small" },
                react_1.default.createElement(Close_1.default, { fontSize: "inherit" })) }, type == types_1.NotifyType.WORK ? 'Time to work!' : 'Time to rest!')));
};
exports.TimeAlert = TimeAlert;
exports.Options = (0, react_1.memo)(function (_a) {
    var pomTime = _a.pomTime, pomActive = _a.pomActive, ratio = _a.ratio, mode = _a.mode, dark = _a.dark;
    var dispatch = (0, react_1.useContext)(exports.DispatchContext);
    var setMode = function (_, value) { return dispatch({
        type: 'CONFIG',
        config: { mode: value ? types_1.Mode.ON : types_1.Mode.OFF }
    }); };
    ratio = (0, utils_1.useFreeze)(ratio);
    var setRatio = function (_, value) { return dispatch({
        type: 'CONFIG',
        config: { ratio: 60 / Number(value) } //TODO shitty material union type for range and value slider
    }); };
    var setPomActive = function (e) { return dispatch({
        type: 'CONFIG',
        config: { pomActive: e.target.checked }
    }); };
    var setPomTime = function (_, value, reason) {
        reason == "input" && dispatch({
            type: 'CONFIG',
            config: { pomTime: utils_1.parse.twoDigit(value, pomTime) }
        });
    };
    var setDark = function () { return dispatch({
        type: 'CONFIG',
        config: { dark: !dark }
    }); };
    return (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(material_1.FormControlLabel, { control: react_1.default.createElement(material_1.Switch, { color: 'primary', checked: !!mode, onChange: setMode }), label: "Flow - adjust your rest time" }),
        react_1.default.createElement(material_1.Typography, null, "Minutes for every hour of work:"),
        react_1.default.createElement(material_1.Slider, { min: 1, max: 60, step: 1, valueLabelDisplay: "auto", valueLabelFormat: function (l) { return l + ' m'; }, defaultValue: Math.floor(60 / ratio), onChangeCommitted: setRatio }),
        react_1.default.createElement(material_1.Divider, null),
        react_1.default.createElement(material_1.FormControlLabel, { sx: { marginRight: "8px" }, control: react_1.default.createElement(material_1.Switch, { checked: pomActive, onChange: setPomActive }), label: "Pomodoro reminder every" }),
        react_1.default.createElement(material_1.Box, { className: "AutocompleteContainer", sx: {
                display: "inline-block",
                position: "relative",
                bottom: "2px",
                ".MuiAutocomplete-listbox .MuiAutocomplete-option": {
                    paddingX: "4px"
                }
            } },
            react_1.default.createElement(material_1.Autocomplete, { sx: { ".MuiAutocomplete-inputRoot .MuiAutocomplete-input": { minWidth: "20px" } }, 
                //open={true}
                freeSolo: true, disablePortal: true, disableClearable: true, options: settings_1.POM_TIMES.map(function (v) { return String(v); }), value: String(pomTime), disabled: !pomActive, onInputChange: setPomTime, renderInput: function (par) { return react_1.default.createElement(material_1.TextField, __assign({}, par, { variant: "standard", size: "small", InputProps: __assign(__assign({}, par.InputProps), { endAdornment: react_1.default.createElement(material_1.InputAdornment, { position: "end" }, "m") }) })); } })),
        react_1.default.createElement(material_1.Divider, null),
        react_1.default.createElement(material_1.Button, { sx: { color: "text.primary", textTransform: "none", fontSize: "1rem", pl: "2px" }, size: "large", startIcon: dark ? react_1.default.createElement(Brightness7_1.default, { color: "primary" }) : react_1.default.createElement(Brightness4_1.default, { color: "primary" }), onClick: setDark }, "Dark/light mode")));
    /* return (//TODO add divider
      <BlockContainer>
        <FormControlLabel label={'Adjust rest time'} control={
          <Switch
            color='primary'
            checked={!!mode}
            onChange={setMode}
          />
        }/>
        <Select<number>
            value={Math.floor(60/ratio)}
            onChange={setRatio}
          >{[
            [1,5,10,15,20,30,45,60].map(n => <MenuItem value={n} key={n}>{n+'m'}</MenuItem>)
          ]}</Select><Typography>minutes for every hour of work</Typography>
        <Divider/>
        <Box sx={{
          "& .pomodoroTime":{
            //marginX: 1/4,
            width: '3rem',
            '& .MuiOutlinedInput-input':{
              textAlign: 'center',
              padding: 0.5,
            }
          }
        }}>
          <FormControlLabel
            control={<Checkbox
              checked={pomActive}
              onChange={setPomActive}
            />}
            label='Pomodoro reminder in '
          />
          <TextField
            className='pomodoroTime'
            size='small'
            value={pomTime}
            disabled={!pomActive}
            onChange={setPomTime}
          />m
        </Box>
        <Divider/>
        <IconButton color="primary" onClick={setDark}>
          <BrightnessMedium />
        </IconButton>Dark or light mode
        </BlockContainer>
    ) */
});
exports.TogglError = (0, react_1.memo)(function (_a) {
    var error = _a.error;
    return (react_1.default.createElement(material_1.Collapse, { in: !!error },
        react_1.default.createElement(material_1.Box, { sx: { mb: "-0.5rem", mt: "0.25rem" } },
            react_1.default.createElement(material_1.Typography, { sx: { color: "error.light", fontSize: "0.75rem" } }, error))));
});
var TogglHelpCard = function () { return (react_1.default.createElement(material_1.Card, { sx: { maxWidth: "300px" } },
    react_1.default.createElement(material_1.CardMedia, { component: "img", width: "300px", alt: "Help Image", image: TOGGL_HELP_IMAGE }),
    react_1.default.createElement(material_1.CardContent, { sx: { pb: "0" } },
        react_1.default.createElement(material_1.Typography, null, "Loren Ipsun blablabla Loren Ipsun blablablaLoren Ipsun blablablaLoren Ipsun blablablaLoren Ipsun blablablaLoren Ipsun blablabla ")),
    react_1.default.createElement(material_1.CardActions, null,
        react_1.default.createElement(material_1.Button, { size: "small", href: settings_1.TOGGL_TOKEN_URL, target: "_blank" }, "Go to toggl profile")))); };
exports.TogglLogin = (0, react_1.memo)(function (_a) {
    var loading = _a.loading;
    var dispatch = (0, react_1.useContext)(exports.DispatchContext);
    var _b = (0, react_1.useState)(''), token = _b[0], setToken = _b[1];
    var valid = utils_1.parse.togglToken(token).success;
    var logIn = function () {
        var parsed = utils_1.parse.togglToken(token);
        parsed.success && dispatch({
            type: 'TOGGL_IN',
            token: parsed.data
        });
    };
    return (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(material_1.TextField, { size: "small", type: "password", focused: true, InputLabelProps: { shrink: true, sx: { pointerEvents: 'auto' } }, InputProps: {
                startAdornment: react_1.default.createElement(material_1.InputAdornment, { position: "start" },
                    react_1.default.createElement(Key_1.default, null)),
                sx: { pl: "0.5rem" }
            }, label: react_1.default.createElement(material_1.Typography, { component: "span", sx: { fontSize: "inherit" } },
                "Your toggl token here",
                react_1.default.createElement(HelpPopover, null,
                    react_1.default.createElement(TogglHelpCard, null))), value: token, onChange: function (e) { return setToken(e.target.value); }, error: token !== '' && !valid }),
        react_1.default.createElement(material_1.Tooltip, { title: "Connect to save time entries in toggle", placement: "left", arrow: true },
            react_1.default.createElement("span", null,
                react_1.default.createElement(material_1.IconButton, { color: "primary", sx: { pb: "0px" }, onClick: logIn, disabled: !valid || loading },
                    react_1.default.createElement(Link_1.default, { fontSize: "large", sx: { position: "relative", bottom: "4px" } }))))));
    /* const content =
      <div>
        <TextField
          label='Toggle Token'
          placeholder='..'
          size="small"
          InputProps={{
            startAdornment: (<InputAdornment position='start'><LockOutlined/></InputAdornment>)
          }}
          helperText="your token won't be sent anywhere"
          value={token}
          onChange={ e=>setToken(e.target.value) }
          error={token!=='' && !valid}
        />
        <Tooltip title="Connect to save time entries in toggle" placement="left-start" arrow>
          <span><IconButton  color="primary" onClick={logIn} disabled={!valid}>
            <Link/>
          </IconButton></span>
        </Tooltip>
      </div>
      (
      <div>
        <Button
          variant="outlined"
          color="primary" size="small"
          endIcon={<ExitToApp />}
          onClick={logOut}
          disabled={loading}
        >logout from toggl</Button>
      </div>
    )
  
    const ifError = error ? (
      <Box sx={{
          color:'error.main'
      }}>
        {error}
      </Box>
    ): null
  
    return  (
      <BlockContainer>
        {content}
        {ifError}
      </BlockContainer>
    )*/
});
exports.TogglForm = (0, react_1.memo)(function (_a) {
    var projects = _a.projects, projectId = _a.projectId, shouldSave = _a.shouldSave, desc = _a.desc, unsaved = _a.unsaved;
    var dispatch = (0, react_1.useContext)(exports.DispatchContext);
    shouldSave = (0, utils_1.useFreeze)(shouldSave);
    var setActive = function (_, value) { return dispatch({
        type: 'TOGGL_FORM',
        form: { shouldSave: value }
    }); };
    var setDesc = function (e) { return dispatch({
        type: 'TOGGL_FORM',
        form: { desc: utils_1.parse.togglDesc(e.target.value, desc) }
    }); };
    var retroSave = function () { return dispatch({
        type: 'TOGGL_SAVE_LAST'
    }); };
    var setProject = function (e) { return dispatch({
        type: 'TOGGL_FORM',
        form: { projectId: Number(e.target.value) || null }
    }); };
    return (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(material_1.Stack, { direction: "row", spacing: 1 },
            react_1.default.createElement(material_1.FormControlLabel, { sx: {
                    mr: 0.5,
                    ".MuiFormControlLabel-label": {
                        fontSize: '0.7rem',
                        lineHeight: '0.9',
                        textAlign: 'center'
                    }
                }, label: 'Save next work', control: react_1.default.createElement(material_1.Switch, { sx: { mr: -1 }, color: 'primary', defaultChecked: shouldSave, onChange: setActive }) }),
            react_1.default.createElement(material_1.TextField, { size: "small", label: "Descritpion", focused: true, value: desc, onChange: setDesc }),
            react_1.default.createElement(material_1.Select, { size: "small", sx: { width: "7rem" }, value: projectId || '', onChange: setProject }, __spreadArray([
                react_1.default.createElement(material_1.MenuItem, { value: "", key: 0 },
                    react_1.default.createElement("em", null, "-none-"))
            ], projects.map(function (p) { return react_1.default.createElement(material_1.MenuItem, { value: p.id, key: p.id }, p.name); }), true)),
            react_1.default.createElement(material_1.Tooltip, { title: "Save previous entry", placement: "left-start", arrow: true },
                react_1.default.createElement(material_1.IconButton, { color: "primary", sx: { pl: 0, visibility: !!unsaved ? 'visible' : 'hidden' }, disabled: !unsaved, onClick: retroSave },
                    react_1.default.createElement(Save_1.default, { fontSize: "medium" }))))));
    /*   return logged ? (
        <BlockContainer>
          <Stack direction="column" spacing={1}>
            <FormControlLabel label={'Save in toggl'} control={
              <Switch
                color='primary'
                defaultChecked={shouldSave}
                onChange={setActive}
              />
            }/>
            <TextField
              label='Description'
              placeholder='..'
              InputProps={{
                startAdornment: (<InputAdornment position='start'><CreateOutlined/></InputAdornment>)
              }}
              defaultValue={desc}
              onInput={setDesc}
            />
            <Select<number>
              label={'Project'}
              defaultValue={projectId || undefined}
              onChange={setProject}
            >
              {[
                <MenuItem value={""} key={0}><em>none</em></MenuItem>,
                ...projects.map(p => <MenuItem value={p.id} key={p.id}>{p.name}</MenuItem>)
              ]}
            </Select>
            {!!unsaved && <Button
              variant="text"
              size="small"
              startIcon={<Save />}
              onClick={retroSave}
            >save prev work entry</Button>}
          </Stack>
        </BlockContainer>
      ) : null */
});
exports.TogglCollapsed = (0, react_1.memo)(function (_a) {
    var logged = _a.logged;
    var dispatch = (0, react_1.useContext)(exports.DispatchContext);
    var logOut = function () {
        dispatch({
            type: 'TOGGL_OUT'
        });
    };
    return (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(material_1.Typography, { sx: { color: "primary.main", fontSize: "0.75rem" } },
            "Toggl integration",
            logged && react_1.default.createElement(material_1.Tooltip, { title: "Exit from Toggl", placement: "left", arrow: true },
                react_1.default.createElement(material_1.IconButton, { sx: { p: 0, pl: 1 }, onClick: logOut },
                    react_1.default.createElement(ExitToApp_1.default, { sx: { fontSize: 16 } }))))));
});
var CopyLink = function (_a) {
    var value = _a.value, text = _a.text, _b = _a.loading, loading = _b === void 0 ? false : _b;
    var copy = function () { return (0, clipboard_copy_1.default)(value); };
    return react_1.default.createElement(material_1.Tooltip, { title: 'copy to clipboard', arrow: true },
        react_1.default.createElement(material_1.Button, { sx: {
                '.MuiButton-startIcon': { mr: "2px" }
            }, variant: "text", size: "small", startIcon: react_1.default.createElement(FileCopyOutlined_1.default, { fontSize: "small" }), onClick: copy, disabled: loading }, text || value));
};
exports.CopyLink = CopyLink;
var AppFallback = function (_a) {
    var error = _a.error;
    return (react_1.default.createElement(material_1.Paper, { elevation: 3, sx: { padding: "0.5rem", width: "400px" } },
        react_1.default.createElement(material_1.Typography, { component: "div", sx: { margin: "1rem" } },
            react_1.default.createElement(material_1.Typography, { variant: "h6" }, "Sorry, it seems like internals of our app crashed :-/"),
            react_1.default.createElement("p", null,
                "Please, drop us a note at ",
                react_1.default.createElement(exports.CopyLink, { value: 'SUPPORT_EMAIL' }),
                " about what happened. Click",
                react_1.default.createElement(exports.CopyLink, { value: "".concat(error.toString(), " Stack: \n  ").concat(error.stack), text: "here" }),
                "to copy geeky data and paste it into your email so we can understand what went wrong."),
            react_1.default.createElement("p", null,
                "We ",
                react_1.default.createElement("span", null, "will"),
                " try to solve the problem asap!"),
            react_1.default.createElement(material_1.Box, { sx: { textAlign: 'center' } },
                react_1.default.createElement(material_1.Button, { variant: "outlined", startIcon: react_1.default.createElement(Refresh_1.default, null), onClick: service_1.reload }, "Reload extension")))));
};
exports.AppFallback = AppFallback;
