import fetch from 'node-fetch';
import notifier from 'node-notifier';
import * as R from 'ramda'
import cliSelect from 'cli-select';
import prompt from "prompt"

const MINUTE = 60*1000

// kinda trying to avoid obvious scraping...
// wait for a number of milliseconds between the intervals
// before checking again
const intervalStart = 1 * MINUTE
const intervalEnd = 2 * MINUTE
const maxAppointments = 10

// the ID numbers are important.
// the readable strings are just for display and can be as descriptive as you like.
const locationMap = {
  5446: "SFO" ,
  5007: "Nogales, TX", //always seem to be appts here.  good for testing the success path
  7820: "Austin, TX",
  // find more location IDs by watching the network calls when you click the location links here:
  // https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=UP
}

console.log("Where would you like your appt?")
const selectedLocation = await cliSelect({
  values: locationMap,
});

prompt.start();
const { dateCutoff } = await prompt.get({
  properties: {
    dateCutoff: {
      description: 'Before when? (YYYY-MM-DD)',
      type: 'string',
      pattern: /^\d\d\d\d-\d\d-\d\d$/,
      message: 'Must be in format YYYY-MM-DD',
      default: '2023-01-01',
      required: true,
    }
  }
});

console.log(`Checking for appointments as ${selectedLocation.value} before ${dateCutoff}`)

async function checkForAppt(){
  const response = await fetch(`https://ttp.cbp.dhs.gov/schedulerapi/slots?orderBy=soonest&limit=${maxAppointments}&locationId=${selectedLocation.id}&minimum=1`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "authorization": "",
      "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "Referer": "https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=UP",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });


  const appointments = await response.json();

  const apptTimes = R.pipe(
    R.filter(R.propSatisfies(R.gte(dateCutoff),'startTimestamp')),
    R.pluck("startTimestamp"),
    R.sortBy(R.identity),
    R.ifElse(R.isEmpty, () => console.log("None (checked at: ", new Date(), ")"), notifyAppts)
  )(appointments)
}

function notifyAppts(apptTimes) {
  const notification = {
    title: `${apptTimes.length} appt[s] found at ${selectedLocation.value}!`,
    message: R.join("\n", apptTimes) + `\n\n Go here to book it: https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=UP`,
  }
  notifier.notify(notification);
  console.log("Holy shit!", notification.title,"\n", notification.message)
}


while(true) {
  checkForAppt();
  await new Promise(r => setTimeout(r, randomIntFromInterval(intervalStart, intervalEnd)));
}


function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
