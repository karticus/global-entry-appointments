# global-entry-appointments


### Summary
Hello lovelies!

This is a hacky script that allows you to check for Global Entry interview appointments at various locations. It's ideal use case is to leave it running and poll for appointments in the near future at your local airport. Sometimes there are no appointments available, or not until very far in the future.  However, from time-to-time, appointments pop-up -- most likely due to cancellations.

Just run it and watch for a notification(1) on your laptop.  The command will also output a message if it finds an appointment.

### Usage

```
% git clone git@github.com:karticus/global-entry-appointments.git
% cd global-entry-appointments
% npm i
% npm start

## Now follow command line instructions.
```

### Operation
- Upon start up the script will ask where you want your appt and before which date you would like to search
- It will then run an immediate check
- Then it sleeps for several minutes (you can adjust the interval at the top of `globalentry.js` if you like).  No point in checking every second, and it will probably just get us blocked.
- Then it checks again!
- Repeat ad infinitum
- `ctrl-c` to quit

### Notes
- Current it only supports SFO (because thats where I am looking) and Nogales, TX (because there are lots of appointments there and you can check the success path of the script)
- Feel free to add more locations by watching the network calls when you click the location links [here](https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=UP).  You need to grab the location id and add it to the map in `globalentry.js`
- There's no lower limit on the date range.  It's just "now" until the date you specify.  Sorry.
- Multiple locations would also be kinda neat, but no dice yet.  Sorry.
- I will deny all responsibility for this crappy script if asked.



 (1) NB: I have done zero cross-platform validation of this notification methods.  Good luck if you're not on a Mac.