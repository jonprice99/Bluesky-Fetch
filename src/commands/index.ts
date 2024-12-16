import * as ping from "./ping";
import * as hello from "./hello";
import * as togglereposts from "./toggleReposts";
import * as setchannel from './setChannel';
import * as setusername from './setUsername';
import * as setpassword from './setPassword';
import * as setusernameandpassword from './setUsernameAndPassword';
import * as pause from './pause'
import * as unpause from './unpause'

export const commands = {
  ping, hello, togglereposts, setchannel, setusername, setpassword, setusernameandpassword, pause, unpause
};